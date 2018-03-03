import { pairings } from './combinatorics'
import { cartesianProduct, permutation } from 'js-combinatorics'
import _ from 'lodash/fp'
import constants from './constants'
import { Map, Set } from 'immutable'

const typePredicate = (type) => { return _.matchesProperty('type', type) }

const keysToInt = _.map(_.flow(
  _.prop('.key'),
  _.defaultTo('0'),
  parseInt,
))

const keys = _.map(_.prop('.key'))
const isPairingValid = ({ pairing, solos }) => {
  const soloKeys = keys(solos)
  return !_.any(_.every(_.includes(_, soloKeys)))(pairing)
}

const findMatchingLanes = ({ pairing, lanes, people }) => {
  const matching = _.map(
    _.map(key =>
      _.find(_.matchesProperty('.key', key), people),
    )
  )(pairing)

  const laneKeysWithPeople = _.flow(
    _.map(({ location }) => location),
    _.filter(location =>
      location !== constants.LOCATION.OUT && location !== constants.LOCATION.UNASSIGNED
    ),
    _.uniq,
  )(people)
  const emptyLaneKeys = _.difference(
    _.map(_.prop('.key'), lanes),
    laneKeysWithPeople,
  )
  const match = permutation(matching).find(pairing =>
    _.every(i =>
      pairing[i]
        ? _.any(_.allPass([
          _.identity, _.matchesProperty('location', laneKeysWithPeople[i]),
        ]))(pairing[i])
        : false
    )(_.keys(laneKeysWithPeople))
  )

  if (!match) {
    return null
  }

  const laneKeys = laneKeysWithPeople.concat(emptyLaneKeys)

  return _.flow(
    _.map(pair => {
      const lane = laneKeys.shift() || 'new-lane'
      return {
        entities: _.flow(
          _.map(person =>
            person && person.location !== lane && person['.key']
          ),
          _.compact,
        )(pair),
        lane,
      }
    }),
    _.filter(({ entities }) => entities.length > 0)
  )(match)
}

const computePairs = (left, right) => {
  if (!right) { right = left }
  if (left.toJS) { left = left.toJS() }
  if (right.toJS) { right = right.toJS() }
  if (left.length === 0 || right.length === 0) { return Set() }

  return Set(cartesianProduct(left, right).map(Set))
}

const scoresForProduct = (pairs, score, rejectSolos) => {
  return Map(
    pairs
      .filterNot(pair => rejectSolos && pair.size === 1)
      .map(pair => [pair, (score / (pair.size === 1 ? 2 : 1))])
  )
}

const calculateScores = ({ pairs, roster, history, allowSolos }) => {
  const inLane = e =>
    e.location !== constants.LOCATION.OUT &&
    e.location !== constants.LOCATION.UNASSIGNED

  const inRoster = e => roster.has(e['.key'])

  const historyKeys = keysToInt(history)
  const currentDate = _.last(historyKeys)
  const maxScore = _.flow(
    _.head,
    _.subtract(currentDate),
    _.add(1),
  )(historyKeys)

  return _.flow(
    _.map(state => {
      const score = currentDate - parseInt(state['.key'])
      const group = _.flow(
        _.filter(_.allPass([inLane, inRoster])),
        _.groupBy('location'),
      )(state.entities)

      return _.flow(
        _.keys,
        _.map(location => {
          const leftKeys = keys(group[location])
          const rightKeys = keys(group[location])

          const rejectSolos = !allowSolos || leftKeys.length > 1
          return scoresForProduct(
            computePairs(leftKeys, rightKeys),
            score,
            rejectSolos,
          )
        }),
        _.reduce((merged, m) => merged.merge(m), Map()),
      )(group)
    }),
    _.reduce((merged, m) => merged.merge(m), Map()),
    m => scoresForProduct(pairs, maxScore, !allowSolos).merge(m),
  )(history)
}

export const calculateMovesToBestPairing = ({ history, current }) => {
  const lanes = _.filter(_.negate(_.prop('locked')), current.lanes)
  const laneKeys = _.map(_.prop('.key'), lanes)
  const availablePeople = _.filter(_.allPass([
    _.matchesProperty('type', 'person'),
    ({ location }) => (
      location === constants.LOCATION.UNASSIGNED ||
        _.includes(location, laneKeys)
    ),
  ]))(current.entities)
  const peopleInLanes = _.filter(
    ({ location }) => location !== constants.LOCATION.UNASSIGNED,
    availablePeople,
  )
  const solos = _.flow(
    _.groupBy('location'),
    _.values,
    _.filter(_.matchesProperty('length', 1)),
    _.flatten,
  )(peopleInLanes)

  if ((2 * lanes.length - 1) > availablePeople.length) {
    return
  }

  const people = _.flow(
    _.filter(typePredicate('person')),
    keys,
  )(current.entities)

  const roster = Set(keys(current.entities))
  const pairs = computePairs(people)

  const scores = calculateScores({ pairs, roster, history, allowSolos: true })

  let bestScore = -1
  let bestPairing

  const possiblePairings = pairings(_.map(person => person['.key'], availablePeople))

  _.forEach(pairing => {
    pairing = _.chunk(2, pairing)
    const score = _.sum(_.map(pair =>
      scores.get(Set(_.compact([pair[0], pair[1]]))),
    )(pairing))

    if (isPairingValid({ pairing, solos }) && score > bestScore) {
      const pairingWithLanes = findMatchingLanes({
        pairing: pairing,
        lanes,
        people: availablePeople,
      })

      if (pairingWithLanes) {
        bestScore = score
        bestPairing = pairingWithLanes
      }
    }
  }, _.shuffle(possiblePairings))

  if (!bestPairing) {
    return null
  }

  return bestPairing
}

export const calculateMovesToBestRoleAssignment = ({ history, current }) => {
  return []
}

export default {
  isPairingValid,
  calculateScores,
  computePairs,
  calculateMovesToBestPairing,
  calculateMovesToBestRoleAssignment,
}
