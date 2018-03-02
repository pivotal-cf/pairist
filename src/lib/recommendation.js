import { pairings } from './combinatorics'
import { cartesianProduct, permutation } from 'js-combinatorics'
import _ from 'lodash/fp'
import constants from './constants'
import { Map, Set } from 'immutable'

class Recommendation {
  constructor ({ historyChunkDuration }) {
    this.historyChunkDuration = historyChunkDuration
  }

  toDate (scaled) {
    return new Date(parseInt(scaled) * this.historyChunkDuration)
  }

  scaleDate (date) {
    return parseInt((date / this.historyChunkDuration).toFixed(0))
  }

  isPairingValid ({ pairing, solos }) {
    const soloKeys = _.map(_.prop('.key'))(solos)
    return !_.any(_.every(_.includes(_, soloKeys)))(pairing)
  }

  _findMatchingLanes ({ pairing, lanes, people }) {
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

  scoresForProduct (left, right, score) {
    if (left.length === 0 || right.length === 0) { return Map() }

    return Map(
      Set(
        cartesianProduct(left, right).map(Set)
      ).map(pair => [pair, score])
    )
  }

  calculateScores ({ current, history, leftType, rightType }) {
    const maxScore = _.flow(
      _.head,
      _.prop('.key'),
      _.defaultTo('1'),
      parseInt,
      _.subtract(_, 1),
    )(history)

    const leftPredicate = _.matchesProperty('type', leftType)
    const rightPredicate = _.matchesProperty('type', rightType)

    const leftEntities = _.flow(
      _.filter(leftPredicate),
      _.map(_.prop('.key')),
    )(current.entities)
    const rightEntities = _.flow(
      _.filter(rightPredicate),
      _.map(_.prop('.key')),
    )(current.entities)

    const inLane = e =>
      e.location !== constants.LOCATION.OUT &&
      e.location !== constants.LOCATION.UNASSIGNED

    const isCurrent = roster => e =>
      _.any(_.matchesProperty('.key', e['.key']))(roster)

    return _.flow(
      _.map(state => {
        const epoch = parseInt(state['.key'])
        const group = _.flow(
          _.filter(_.allPass([
            inLane,
            isCurrent(current.entities),
          ])),
          _.groupBy('location')
        )(state.entities)

        return _.flow(
          _.keys,
          _.map(location => {
            const leftKeys = _.flow(
              _.filter(leftPredicate),
              _.map(_.prop('.key')),
            )(group[location])

            const rightKeys = _.flow(
              _.filter(rightPredicate),
              _.map(_.prop('.key')),
            )(group[location])

            return this.scoresForProduct(leftKeys, rightKeys, epoch)
          }),
          _.reduce((merged, m) => merged.merge(m), Map()),
        )(group)
      }),
      _.reduce((merged, m) => merged.merge(m), Map()),
      m => this.scoresForProduct(leftEntities, rightEntities, maxScore).merge(m),
    )(history)
  }

  calculateMovesToBestPairing ({ history, current }) {
    const lanes = _.filter(_.negate(_.prop('locked')), current.lanes)
    const laneKeys = _.map(_.prop('.key'), lanes)
    const availablePeople = _.filter(_.allPass([
      _.matchesProperty('type', 'person'),
      ({ location }) => (
        location === constants.LOCATION.UNASSIGNED ||
        _.includes(location, laneKeys)
      ),
    ]), current.entities)
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

    const lastPairings = this.calculateScores({ current, history, leftType: 'person', rightType: 'person' })

    let bestCost = Infinity
    let bestPairing

    const possiblePairings = pairings(_.map(person => person['.key'], availablePeople))

    _.forEach(pairing => {
      pairing = _.chunk(2, pairing)
      const cost = _.sum(_.map(pair =>
        lastPairings.get(Set(_.compact([pair[0], pair[1]]))),
      )(pairing))

      if (this.isPairingValid({ pairing, solos }) && cost < bestCost) {
        const pairingWithLanes = this._findMatchingLanes({
          pairing: pairing,
          lanes,
          people: availablePeople,
        })

        if (pairingWithLanes) {
          bestCost = cost
          bestPairing = pairingWithLanes
        }
      }
    }, _.shuffle(possiblePairings))

    if (!bestPairing) {
      return null
    }

    return bestPairing
  }

  calculateMovesToBestRoleAssignment ({ history, current }) {
    return []
  }
}

export default Recommendation
