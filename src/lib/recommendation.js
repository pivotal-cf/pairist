import { pairs, pairings } from './combinatorics'
import { permutation } from 'js-combinatorics'
import _ from 'lodash/fp'
import constants from './constants'

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

  _calculateScores (availablePeople, history) {
    if (!history) {
      history = []
    }

    let lastPairings = {}
    const maxScore = history.length > 0
      ? parseInt(history[0]['.key']) - 1
      : 0

    _.forEach(left => {
      lastPairings[left['.key']] = {}
      lastPairings[left['.key']][null] = maxScore

      _.forEach(right => {
        lastPairings[left['.key']][right['.key']] = maxScore
      }, availablePeople)
    }, availablePeople)

    _.forEach(state => {
      const epoch = parseInt(state['.key'])
      const people = _.filter(_.allPass([
        _.matchesProperty('type', 'person'),
        person => (
          person.location !== constants.LOCATION.OUT &&
          person.location !== constants.LOCATION.UNASSIGNED &&
          _.some(currentPerson => person['.key'] === currentPerson['.key'], availablePeople)
        ),
      ]), state.entities)
      const groups = _.groupBy('location', people)

      _.forEach(group => {
        const personKeys = _.map(_.prop('.key'), group)
        // solos are 'null' in the map of last pairings.
        // this allows us to not have to special case it on the cost computation below
        if (personKeys.length === 1) {
          lastPairings[personKeys[0]][null] = epoch
          return
        }
        _.forEach(pair => {
          if (
            lastPairings[pair[0]] === null ||
              lastPairings[pair[1]] === null
          ) {
            return
          }
          if (lastPairings[pair[0]][pair[1]] < epoch) {
            lastPairings[pair[0]][pair[1]] = epoch
            lastPairings[pair[1]][pair[0]] = epoch
          }
        }, pairs(personKeys))
      }, _.values(groups))
    }, history)

    return lastPairings
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

    const lastPairings = this._calculateScores(availablePeople, history)

    let bestCost = Infinity
    let bestPairing

    const possiblePairings = pairings(_.map(person => person['.key'], availablePeople))

    _.forEach(pairing => {
      pairing = _.chunk(2, pairing)
      const cost = _.sum(_.map(pair =>
        lastPairings[pair[0]][pair[1]]
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
