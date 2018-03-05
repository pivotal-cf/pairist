import constants from './constants'
import { pairs, pairings } from './combinatorics'
import _ from 'lodash'

export const matchLanes = ({ pairing, lanes }) => {
  let result = []

  Object.keys(lanes).forEach(key => {
    const lane = lanes[key]
    let entities = []
    const p = pairing.find(p => {
      if (lane.length > 0) {
        if (p.some(q => lane.includes(q))) {
          entities = p.filter(i => !lane.includes(i))
          return true
        }
        return false
      }
      entities = p
      return true
    })
    pairing = pairing.filter(i => i !== p)
    entities = entities.filter(e => e !== '<solo>')
    if (entities.length > 0) {
      result.push({ lane: key, entities })
    }
  })

  pairing.forEach(p => (
    result.push({
      lane: 'new-lane',
      entities: p.filter(Boolean),
    })
  ))

  return result
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

const key = e => e['.key']

export const calculateMovesToBestPairing = ({ current, history }) => {
  const laneKeys = current.lanes.filter(l => !l.locked).map(key)
  const people = current.entities.filter(e =>
    e.type === 'person' &&
    (e.location === constants.LOCATION.UNASSIGNED || laneKeys.includes(e.location))
  )

  if ((2 * laneKeys.length - 1) > people.length) { return null }

  const peopleKeys = people.map(key)
  if (peopleKeys.length % 2 === 1) { peopleKeys.push('<solo>') }
  const lanes = _.mapValues(_.groupBy(
    people.filter(e => laneKeys.includes(e.location)),
    'location',
  ), v => v.map(key))

  if (peopleKeys.length === 0) { return [] }

  let maxScore = 0

  if (history && history.length > 0) {
    maxScore = parseInt(_.last(history)['.key'])

    history = history.map(h => {
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
    history = []
  }

  const scores = scoreMatrix(peopleKeys, peopleKeys, history, maxScore + 1)
  // set pairing solos to lowest possible score
  const solos = _.flatten(Object.values(lanes).filter(l => l.length === 1))
    .map(p => peopleKeys.indexOf(p))
  pairs(solos).forEach(p => {
    scores[p[0]][p[1]] = -maxScore
    scores[p[1]][p[0]] = -maxScore
  })

  let highestScore = -maxScore
  let bestPairing
  pairings(_.times(peopleKeys.length)).forEach(p => {
    const score = p.reduce((sum, p) => sum + scores[p[0]][p[1]], 0)
    if (score > highestScore) {
      bestPairing = p
      highestScore = score
    }
  })

  const pairing = bestPairing.map(pair =>
    [
      peopleKeys[pair[0]],
      peopleKeys[pair[1]],
    ].filter(e => e !== '<solo>')
  )

  return matchLanes({ pairing, lanes })
}
