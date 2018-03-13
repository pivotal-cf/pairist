import constants from './constants'
import { pairs, pairings } from './combinatorics'
import { cartesianProduct, combination } from 'js-combinatorics'
import munkres from 'munkres-js'
import _ from 'lodash'

export const matchLanes = ({ pairing, lanes }) => {
  if (pairing.length === 0) {
    return []
  }

  const keys = Object.keys(lanes)
  while (keys.length < pairing.length) { keys.push('new-lane') }
  const product = cartesianProduct(pairing, keys).filter(([pair, key]) =>
    key === 'new-lane' ||
      lanes[key].length === 0 ||
      lanes[key].some(p => pair.includes(p))
  )
  if (product.length < pairing.length) {
    return false
  }
  const match = combination(
    product,
    pairing.length,
  ).find(match => {
    const laneCounts = _.countBy(match.map(m => m[1]))
    for (let key in laneCounts) {
      if (key !== 'new-lane' && laneCounts[key] > 1) {
        return false
      }
    }
    return _.uniqBy(match, e => e[0]).length === pairing.length
  })

  if (!match) { return false }

  const moves = match.map(([pair, key]) => {
    return {
      lane: key,
      entities: pair.filter(p => {
        return key === 'new-lane' ||
        lanes[key].length === 0 ||
        !lanes[key].includes(p)
      }),
    }
  }).filter(p => p.entities.length)
  return moves
}

export const scoreMatrix = (left, right, history, maxScore) => {
  const scores = {}

  left.forEach(l => {
    scores[l] = {}
    right.forEach(r => {
      scores[l][r] = maxScore
    })
  })

  history.forEach(h => {
    h.lanes.forEach(lane => {
      lane.left.forEach(l => {
        lane.right.forEach(r => {
          if (scores[l] && scores[l][r] !== undefined) {
            scores[l][r] = l !== r ? h.score : -maxScore
          }
        })
      })
    })
  })

  return left.map((l, i) => right.map((r, j) => {
    return scores[l][r]
  }))
}

export const mergePairsScores = (scores, pairs) => {
  const merged = []
  pairs.forEach(pair => {
    merged.push(scores[pair[0]].map((score, i) => {
      let other = score
      if (pair[1]) { other = scores[pair[1]][i] }
      return score + other
    }))
  })
  return merged
}

const key = e => e['.key']

export const calculateMovesToBestPairing = ({ current, history }) => {
  const laneKeys = current.lanes.filter(l => !l.locked).map(key)
  let optimizedHistory = []
  const people = current.entities.filter(e =>
    e.type === 'person' &&
    (e.location === constants.LOCATION.UNASSIGNED || laneKeys.includes(e.location))
  )

  if ((2 * laneKeys.length - 1) > people.length) { return null }

  const peopleKeys = people.map(key)
  if (peopleKeys.length % 2 === 1) { peopleKeys.push('<solo>') }
  const lanes = Object.assign(
    ...laneKeys.map(key => ({ [key]: [] })),
    _.mapValues(_.groupBy(
      people.filter(e => laneKeys.includes(e.location)),
      'location',
    ), v => v.map(key)),
  )

  if (peopleKeys.length === 0) { return [] }

  let maxScore = 0

  if (history && history.length > 0) {
    maxScore = parseInt(_.last(history)['.key'])

    optimizedHistory = history.map(h => {
      const groups = _.groupBy(h.entities.filter(e =>
        e.type === 'person' &&
        e.location !== constants.LOCATION.UNASSIGNED &&
        e.location !== constants.LOCATION.OUT
      ), 'location')
      const lanes = []
      const score = maxScore - parseInt(h['.key'])

      Object.values(groups).forEach(people => {
        people = people.map(key)
        if (people.length === 1) { people.push('<solo>') }

        lanes.push({
          left: people,
          right: people,
        })
      })
      return { score, lanes }
    })
  } else {
    optimizedHistory = []
  }

  const scores = scoreMatrix(peopleKeys, peopleKeys, optimizedHistory, maxScore + 1)
  // set pairing solos to lowest possible score
  const solos = _.flatten(Object.values(lanes).filter(l => l.length === 1))
    .map(p => peopleKeys.indexOf(p))
  pairs(solos).forEach(p => {
    scores[p[0]][p[1]] = -maxScore
    scores[p[1]][p[0]] = -maxScore
  })

  let highestScore = -maxScore
  let bestPairing
  for (let pairing of pairings(_.times(peopleKeys.length))) {
    const score = pairing.reduce((sum, pair) => sum + scores[pair[0]][pair[1]], 0)
    if (score > highestScore) {
      const p = pairing.map(pair =>
        [
          peopleKeys[pair[0]],
          peopleKeys[pair[1]],
        ].filter(e => e !== '<solo>')
      )

      const m = matchLanes({ pairing: p, lanes })
      if (m) {
        bestPairing = p
        highestScore = score
      }
    }
  }

  const soloKeys = solos.map(s => peopleKeys[s])
  const solosInLanesKeys = people.filter(p =>
    laneKeys.includes(p.location) && soloKeys.includes(p['.key'])
  ).map(p => p['.key'])
  const stickingPeople = Object.values(
    _.groupBy(
      people.filter(p => p.location !== constants.LOCATION.UNASSIGNED), p => p.location)
  ).map(ps => ps.map(p => p['.key']))
  let unassignedLanes = _.clone(current.lanes)
  const moveablePartition = _.groupBy(bestPairing, pair => {
    const stickingPair = stickingPeople.find(stickingPair => _.isEqual(stickingPair.sort(), pair.sort()))
    const previousSolo = pair.find(person => solosInLanesKeys.includes(person))
    if (stickingPair || previousSolo) {
      const laneToSkip = people.find(p => p['.key'] === _.concat(previousSolo || [], stickingPair)[0]).location
      _.remove(unassignedLanes, l => l['.key'] === laneToSkip)
    }

    return !previousSolo && !stickingPair
  })
  const immoveablePairs = (moveablePartition[false] || []).filter(ps => ps.length !== 1)
  const immoveableResults = immoveablePairs.filter(pair => pair.some(person => soloKeys.includes(person))).map(pair => {
    const solo = _.groupBy(pair, p => soloKeys.includes(p))
    const locationKey = people.find(p => solo[true].includes(p['.key'])).location
    return {
      lane: locationKey,
      entities: solo[false],
    }
  }).filter(p => p.entities.length)

  const trackPlan = calculateMovesToBestTrackAssignment({ pairing: moveablePartition[true] || [], current, lanes: unassignedLanes, history })

  return immoveableResults.concat(trackPlan)
}

export const calculateMovesToBestTrackAssignment = ({ pairing, current, lanes, history }) => {
  const left = 'person'
  const right = 'track'
  const leftKeys = _.flatten(pairing)
  const leftEntities = current.entities.filter(e =>
    e.type === left
  )
  let optimizedHistory = []
  let maxScore = 0
  let unlockedLaneKeys = lanes.filter(l => !l.locked).map(key)
  let rightEntities = current.entities.filter(e => e.type === right && unlockedLaneKeys.some(l => e.location === l))
  unlockedLaneKeys = unlockedLaneKeys.filter(l => !rightEntities.map(r => r.location).includes(l))
  let rightKeys = rightEntities.map(key)

  if (leftKeys.length === 0) { return [] }

  for (let i = 0; rightKeys.length < leftKeys.length; i++) {
    rightKeys = rightKeys.concat(['no-track-' + i])
    let nextLocation = _.head(unlockedLaneKeys) || 'new-lane'
    unlockedLaneKeys = _.drop(unlockedLaneKeys, 1)
    rightEntities = rightEntities.concat({ '.key': 'no-track-' + i, 'type': 'track', 'location': nextLocation })
  }

  if (history && history.length > 0) {
    maxScore = parseInt(_.last(history)['.key'])
    let historyAndCurrent = _.concat(history, { '.key': '' + (maxScore + 1), 'entities': _.concat(leftEntities, rightEntities) })

    optimizedHistory = historyAndCurrent.map(h => {
      const lanes = []
      const score = maxScore - parseInt(h['.key'])
      const groups = _.groupBy(
        h.entities.filter(e =>
          e.location !== constants.LOCATION.UNASSIGNED && e.location !== constants.LOCATION.OUT
        ),
        'location',
      )

      Object.values(groups).forEach(entities => {
        lanes.push({
          left: entities.filter(e => e.type === left).map(key),
          right: entities.filter(e => e.type === right).map(key),
        })
      })
      return { score, lanes }
    })
  }

  const scoreCalculator = {}

  leftKeys.forEach(l => {
    scoreCalculator[l] = {}
    rightKeys.forEach(r => {
      scoreCalculator[l][r] = { maxDate: 0, count: 0 }
    })
  })

  optimizedHistory.forEach(h => {
    h.lanes.forEach(lane => {
      lane.left.forEach(l => {
        lane.right.forEach(r => {
          if (scoreCalculator[l] && scoreCalculator[l][r] !== undefined) {
            scoreCalculator[l][r]['maxDate'] = h.score
            scoreCalculator[l][r]['count'] += 1
          }
        })
      })
    })
  })

  const scores = leftKeys.map((l, i) => rightKeys.map((r, j) => {
    return scoreCalculator[l][r]
  }))
  let pairs = pairing.map(p => p.map(e => leftKeys.indexOf(e)))
  let mergedScores = []
  pairs.forEach(pair => {
    mergedScores.push(scores[pair[0]].map((self, i) => {
      let other = self
      if (pair[1]) { other = scores[pair[1]][i] }

      if (self.maxDate < maxScore && other.maxDate < maxScore) { return maxScore }
      return self.count + other.count
    }))
  })

  const assignment = munkres(mergedScores).map(a =>
    [
      pairs[a[0]].map(is => leftKeys[is]),
      rightKeys[a[1]],
    ]
  )

  const results = []
  assignment.filter(as => as[1] !== 'no-track').forEach(as => {
    const lane = rightEntities.find(e => e['.key'] === as[1]).location
    let entitiesNeedingmove = as[0].filter(a => leftEntities.find(e => e['.key'] === a).location !== lane)
    if (entitiesNeedingmove.length !== 0) {
      results.push({ lane, entities: entitiesNeedingmove })
    }
  })

  return results
}

export const calculateMovesToBestAssignment = ({ left, right, current, history }) => {
  const laneKeys = current.lanes.filter(l => !l.locked).map(key)
  const leftEntities = current.entities.filter(e =>
    e.type === left && laneKeys.includes(e.location)
  )
  const rightEntities = current.entities.filter(e =>
    e.type === right &&
    (e.location === constants.LOCATION.UNASSIGNED || laneKeys.includes(e.location))
  )

  const leftKeys = leftEntities.map(key)
  const rightKeys = rightEntities.map(key)

  if (leftKeys.length === 0) { return [] }

  let maxScore = 0

  if (history && history.length > 0) {
    maxScore = parseInt(_.last(history)['.key'])

    history = history.map(h => {
      const groups = _.groupBy(h.entities.filter(e =>
        e.location !== constants.LOCATION.UNASSIGNED &&
        e.location !== constants.LOCATION.OUT
      ), 'location')
      const lanes = []
      const score = maxScore - parseInt(h['.key'])

      Object.values(groups).forEach(entities => {
        entities = entities.map(key)

        lanes.push({
          left: entities.filter(e => e.type === left),
          right: entities.filter(e => e.type === right),
        })
      })
      return { score, lanes }
    })
  } else {
    history = []
  }

  const scores = scoreMatrix(leftKeys, rightKeys, history, maxScore + 1)
  let pairs = Object.values(_.groupBy(leftEntities.filter(e => e.location !== constants.LOCATION.OUT), 'location'))
    .map(p => p.map(e => leftKeys.indexOf(key(e))))
  let mergedScores = mergePairsScores(scores, pairs)

  while (pairs.length < rightKeys.length) {
    pairs = pairs.concat(pairs)
    mergedScores = mergedScores.concat(mergedScores)
  }

  const assignment = munkres(munkres.make_cost_matrix(mergedScores))
    .map(a => [pairs[a[0]], rightKeys[a[1]]])

  const results = []
  assignment.forEach(a => {
    const lane = leftEntities.find(e => e['.key'] === leftKeys[a[0][0]]).location
    if (rightEntities.find(e => e['.key'] === a[1]).location !== lane) {
      results.push({
        lane,
        entities: [a[1]],
      })
    }
  })
  return results
}
