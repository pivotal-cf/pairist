import constants from './constants'
import { pairs, pairings } from './combinatorics'
import { cartesianProduct, combination } from 'js-combinatorics'
import munkres from 'munkres-js'
import _ from 'lodash'

export const matchLanes = ({ pairing, lanes }) => {
  if (pairing.length === 0) { return [] }

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
  const matches = combination(
    product,
    pairing.length,
  ).filter(match => {
    const laneCounts = _.countBy(match.map(m => m[1]))
    for (let key in laneCounts) {
      if (key !== 'new-lane' && laneCounts[key] > 1) {
        return false
      }
    }
    return _.uniqBy(match, e => e[0]).length === pairing.length
  })

  if (matches.length === 0) { return false }

  return matches
}

export const getMoves = ({ match, lanes }) => {
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
        bestPairing = m
        highestScore = score
      }
    }
  }

  const bestTrackAssignment = selectBestTrackAssignment({ matches: bestPairing, current: current, history: history })
  return getMoves({ match: bestTrackAssignment, lanes })
}

export const selectBestTrackAssignment = ({ matches, current, history }) => {
  const laneKeys = current.lanes.filter(l => !l.locked).map(key)
  const people = current.entities.filter(e =>
    e.type === 'person' &&
    (e.location === constants.LOCATION.UNASSIGNED || laneKeys.includes(e.location))
  )
  const tracks = current.entities.filter(e =>
    e.type === 'track' &&
    (e.location === constants.LOCATION.UNASSIGNED || laneKeys.includes(e.location))
  )

  const tracksToLanes = tracks.reduce((acc, track) => {
    acc[key(track)] = track.location
    return acc
  }, {})
  const lanesToTracks = _.invertBy(tracksToLanes)
  const scoreCalculator = {}
  people.forEach(l => {
    scoreCalculator[l['.key']] = {}
    tracks.forEach(r => {
      scoreCalculator[l['.key']][r['.key']] = 0
    })
  })

  if (history && history.length > 0) {
    history.forEach((h) => {
      const groups = _.groupBy(
        h.entities.filter(e =>
          e.location !== constants.LOCATION.UNASSIGNED && e.location !== constants.LOCATION.OUT
        ),
        'location',
      )

      Object.values(groups).forEach(entities => {
        const lane = _.groupBy(entities, 'type')
        if (lane['person'] === undefined) {
          return
        }
        if (lane['track'] === undefined) {
          return
        }

        const inPeople = lane['person'].filter(p => people.find(pers => pers['.key'] === p))
        const inTracks = lane['track'].filter(t => tracks.find(track => track['.key'] === t))
        inPeople.forEach(p => {
          inTracks.forEach((t) => {
            scoreCalculator[p['.key']][t['.key']] += 1
          })
        })
      })
    })
  }

  return _.maxBy(matches, (match) => {
    return _.sumBy(match, (assignment) => {
      const pair = assignment[0]
      const lane = assignment[1]
      if (lanesToTracks[lane] === undefined) {
        return 0
      }
      return lanesToTracks[lane].reduce((sum, t) => sum + scoreCalculator[pair[0]][t] + scoreCalculator[pair[0]][t])
    })
  })
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
