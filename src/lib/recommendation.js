import constants from './constants'
import { pairs } from './combinatorics'
import { permutation, combination } from 'js-combinatorics'
import munkres from 'munkres-js'
import bigInt from 'big-integer'
import _ from 'lodash'

export const matchLanes = ({ pairing, lanes }) => {
  if (pairing.length === 0) { return [[]] }

  const keys = Object.keys(lanes)

  if (keys.length === 0) { return [[]] }

  const product = permutation(pairing, keys.length).map((pairing) => pairing.map((pair, i) => [pair, keys[i]])).filter(pairing =>
    pairing.every(([pair, key]) =>
      lanes[key].length === 0 ||
          lanes[key].some(p => pair.includes(p))
    )
  )

  if (product.length === 0) {
    return false
  }

  return product
}

export const getMoves = ({ match, lanes }) => {
  if (match === undefined) {
    return []
  }
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
      scores[l][r] = bigInt(maxScore)
    })
  })

  history.forEach(h => {
    h.lanes.forEach(lane => {
      lane.left.forEach(l => {
        lane.right.forEach(r => {
          if (scores[l] && scores[l][r] !== undefined) {
            scores[l][r] = l !== r ? h.score : bigInt(-1)
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

export const allPossibleAssignments = ({ current }) => {
  const laneKeys = current.lanes.filter(l => !l.locked).map(key)
  const people = current.entities.filter(e =>
    e.type === 'person' &&
    (e.location === constants.LOCATION.UNASSIGNED || laneKeys.includes(e.location))
  )
  const assignments = _.map(_.mapValues(_.groupBy(people, 'location'), v => v.map(key)), (l, p) => [p, l])
  let unassigned = _.remove(assignments, as => as[0] === 'unassigned')[0]
  if (unassigned === undefined) {
    unassigned = []
  } else {
    unassigned = unassigned[1]
  }
  if (people.length % 2 === 1) {
    unassigned.push('<solo>')
  }
  const totalLanes = people.length % 2 === 1 ? (people.length + 1) / 2 : people.length / 2

  const emptyLanes = _.difference(laneKeys, people.map(p => p.location))

  const innerFindAssignments = ({ remainingAssignments, wrapUp, unassigned, remainingLaneCount }) => {
    if (remainingAssignments.length === 0) {
      if (remainingLaneCount === 0) {
        return wrapUp({ tailAssignments: [{ results: [], unassigned: unassigned }] })
      }

      const unassignedPeople = combination(unassigned, remainingLaneCount * 2)
      const uniqNewPairings = []
      unassignedPeople.forEach(unassignedGroup => {
        const combinationsOfPeople = combination(unassignedGroup, 2).map(c => c)
        const combinationTracker = combinationsOfPeople.reduce((combos, pair) => {
          if (combos[pair[0]] === undefined) {
            combos[pair[0]] = {}
          }
          combos[pair[0]][pair[1]] = false
          return combos
        }, {})
        combinationsOfPeople.forEach(c => {
          if (combinationTracker[c[0]][c[1]] === true) {
            return
          }

          const thisSet = []
          thisSet.push(c)
          combinationTracker[c[0]][c[1]] = true
          while (thisSet.length < remainingLaneCount) {
            const idx = combinationsOfPeople.findIndex(c => c.every(p => thisSet.every(pair => !pair.includes(p))))
            const next = combinationsOfPeople[idx]
            thisSet.push(next)
            combinationTracker[next[0]][next[1]] = true
          }
          uniqNewPairings.push(thisSet)
        })
      })

      const results = []
      uniqNewPairings.forEach(pairing => {
        let lanes = emptyLanes
        while (lanes.length < pairing.length) {
          lanes = _.concat(lanes, 'new-lane')
        }
        wrapUp({
          tailAssignments: [{
            results: lanes.map((l, i) => [pairing[i], l]),
            unassigned: _.difference(unassigned, _.flatten(pairing)),
          }],
        }).forEach(r => {
          results.push(r)
        })
      })
      return results
    }
    const currentAssignment = _.head(remainingAssignments)
    const results = []
    const currentLaneSettings = currentAssignment[1].map(person => [person, _.difference(currentAssignment[1], [person])])
    currentLaneSettings.forEach((setting, i) => {
      const person = setting[0]
      const newUnassigned = setting[1]
      innerFindAssignments({
        remainingAssignments: _.tail(remainingAssignments),
        unassigned: _.concat(unassigned, newUnassigned),
        remainingLaneCount: remainingLaneCount - 1,
        wrapUp: ({ tailAssignments }) => {
          const results = []
          tailAssignments.forEach(assignment => {
            assignment.unassigned.forEach(unassignedPerson => {
              if (i > 0 && currentAssignment[1].includes(unassignedPerson)) {
                return
              }
              wrapUp({ tailAssignments: [{
                results: _.concat(assignment.results, [[[person, unassignedPerson], currentAssignment[0]]]),
                unassigned: _.difference(assignment.unassigned, [unassignedPerson]),
              }] }).forEach(r => { results.push(r) })
            })
          })
          return results
        },
      }).forEach(r => { results.push(r) })
    })
    return results
  }

  let results = innerFindAssignments({
    remainingAssignments: assignments,
    unassigned,
    remainingLaneCount: totalLanes,
    wrapUp: ({ tailAssignments }) => tailAssignments.map(r => r.results.map(as => [_.pull(as[0], '<solo>'), as[1]])),
  })
  return results
}

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
    maxScore = bigInt(parseInt(_.last(history)['.key']))

    optimizedHistory = history.map(h => {
      const groups = _.groupBy(h.entities.filter(e =>
        e.type === 'person' &&
        e.location !== constants.LOCATION.UNASSIGNED &&
        e.location !== constants.LOCATION.OUT
      ), 'location')
      const lanes = []
      const score = bigInt(maxScore - parseInt(h['.key']))

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
    scores[p[0]][p[1]] = bigInt(-1)
    scores[p[1]][p[0]] = bigInt(-1)
  })

  const assts = allPossibleAssignments({ current })
  if (assts.length === 0) {
    return []
  }

  const trackScoreLedger = calculateTrackScores({ current, history })
  let bestPairing = _.head(assts)
  let highestScore = scorePairing({ pairing: bestPairing.map(a => a[0]), peopleKeys, scores }).multiply(
    trackScoreAssignments({ current, trackScoreLedger, assignments: bestPairing })
  )
  _.tail(assts).forEach((assignment) => {
    const pairing = assignment.map(a => a[0])

    const pairScore = scorePairing({ pairing, peopleKeys, scores }).multiply(
      trackScoreAssignments({ current, trackScoreLedger, assignments: assignment })
    )

    if (pairScore > highestScore) {
      bestPairing = assignment
      highestScore = pairScore
    }
  })

  return getMoves({ match: bestPairing, lanes })
}

const scorePairing = ({ pairing, peopleKeys, scores }) => {
  const pairingIndices = pairing.map(ps => ps.map(p => peopleKeys.indexOf(p)))
  return pairingIndices.reduce((sum, pair) => {
    const self = pair[0]
    let other = self
    if (pair[1] !== undefined) {
      other = pair[1]
    }
    return sum.add(scores[self][other])
  }, bigInt(0))
}

const getTracksToLanes = ({ tracks }) => {
  const tracksToLanes = tracks.reduce((acc, track) => {
    acc[key(track)] = track.location
    return acc
  }, {})
  return _.invertBy(tracksToLanes)
}

export const selectBestTrackAssignment = ({ matches, current, history }) => {
  const trackScoreLedger = calculateTrackScores({ current, history })
  return _.reduce(matches, (bestAssignment, assignments) => {
    const assignmentScore = trackScoreAssignments({ current, trackScoreLedger, assignments })
    if (assignmentScore > bestAssignment[0]) {
      return [assignmentScore, assignments]
    }
    return bestAssignment
  }, [-1, []])
}

const calculateTrackScores = ({ current, history }) => {
  const laneKeys = current.lanes.filter(l => !l.locked).map(key)
  const people = current.entities.filter(e =>
    e.type === 'person' &&
    (e.location === constants.LOCATION.UNASSIGNED || laneKeys.includes(e.location))
  )
  const tracks = current.entities.filter(e =>
    e.type === 'track' &&
    (e.location === constants.LOCATION.UNASSIGNED || laneKeys.includes(e.location))
  )

  const scoreCalculator = {}
  const maxConsidered = 10
  let maxScore = bigInt(1)
  for (let i = 1; i <= maxConsidered; i++) {
    maxScore = maxScore.add(bigInt(2).pow(i))
  }
  people.forEach(l => {
    scoreCalculator[l['.key']] = {}
    tracks.forEach(r => {
      scoreCalculator[l['.key']][r['.key']] = maxScore
    })
  })

  if (history && history.length > 0) {
    _.take(history, maxConsidered).forEach((h, i) => {
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

        const personKeys = people.map(pers => pers['.key'])
        const trackKeys = tracks.map(track => track['.key'])
        const inPeople = lane['person'].filter(p => personKeys.includes(p['.key']))
        const inTracks = lane['track'].filter(t => trackKeys.includes(t['.key']))
        inPeople.forEach(p => {
          inTracks.forEach((t) => {
            scoreCalculator[p['.key']][t['.key']] = scoreCalculator[p['.key']][t['.key']].subtract(bigInt(2).pow(maxConsidered - i))
          })
        })
      })
    })
  }

  return scoreCalculator
}

const trackScoreAssignments = ({ current, trackScoreLedger, assignments }) => {
  const laneKeys = current.lanes.filter(l => !l.locked).map(key)
  const tracks = current.entities.filter(e =>
    e.type === 'track' &&
    (e.location === constants.LOCATION.UNASSIGNED || laneKeys.includes(e.location))
  )
  const lanesToTracks = getTracksToLanes({ tracks })
  return _.sumBy(assignments, (assignment) => {
    const pair = assignment[0]
    const lane = assignment[1]
    if (lanesToTracks[lane] === undefined) {
      return bigInt(1)
    }
    const self = pair[0]
    let other = self
    if (pair[1] !== undefined) {
      other = pair[1]
    }
    return lanesToTracks[lane].reduce((sum, t) => {
      return sum.add(trackScoreLedger[self][t]).add(trackScoreLedger[other][t])
    }, bigInt(1))
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
