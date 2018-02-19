import { pairs, pairings, permutations } from "./combinatorics"
import _ from "lodash"
import constants from "./constants"

class Recommendation {
  constructor({ historyChunkDuration }) {
    this.historyChunkDuration = historyChunkDuration
  }

  toDate(scaled) {
    return new Date(parseInt(scaled) * this.historyChunkDuration)
  }

  scaleDate(date) {
    return parseInt((date / this.historyChunkDuration).toFixed(0))
  }

  _isPairingValid({pairing, solos}) {
    const soloKeys = solos.map(person => person[".key"])
    return !pairing
      .some(pair => pair
        .every(personKey => soloKeys
          .includes(personKey)
        )
      )
  }

  _findMatchingLanes({pairing, lanes, people}) {
    pairing = pairing
      .map(pair => pair
        .map(key => people
          .find(person => person[".key"] === key)
        )
      )

    const laneKeysWithPeople = _.uniq(people
      .map(({ location }) => location)
      .filter(location =>
        location !== constants.LOCATION.OUT && location !== constants.LOCATION.UNASSIGNED
      )
    )
    const emptyLaneKeys = _.difference(lanes.map(lane => lane[".key"]), laneKeysWithPeople)
    const orders = permutations(pairing)
    const match = orders.find(pairing =>
      laneKeysWithPeople.every((laneKey, i) => {
        if (!pairing[i]) { return false }
        return pairing[i]
          .some(person => person && person.location === laneKey)
      })
    )
    if (!match) {
      return null
    }

    const laneKeys = laneKeysWithPeople.concat(emptyLaneKeys)

    return match.map((pair) => {
      const lane = laneKeys.shift() || "new-lane"
      return {
        pair: pair.map(person =>
          person && person.location != lane && person[".key"]
        ).filter(Boolean),
        lane,
      }
    }).filter(({ pair }) => pair.length > 0)
  }

  _calculateScores(availablePeople, history) {
    if (!history) {
      history = []
    }

    let lastPairings = {}
    const maxScore = history.length > 0
      ? parseInt(history[0][".key"]) - 1
      : 0

    availablePeople.forEach(left => {
      lastPairings[left[".key"]] = {}
      lastPairings[left[".key"]][null] = maxScore

      availablePeople.forEach(right => {
        lastPairings[left[".key"]][right[".key"]] = maxScore
      })
    })

    history.forEach(state => {
      const epoch = parseInt(state[".key"])
      const people = Object.keys(state.people || {}).map(key =>
        Object.assign({".key": key}, state.people[key])
      ).filter(person =>
        person.location != constants.LOCATION.OUT && person.location != constants.LOCATION.UNASSIGNED &&
      availablePeople.some(currentPerson => person[".key"] == currentPerson[".key"])
      )
      const groups = _.groupBy(people, "location")

      Object.values(groups).forEach(group => {
        const personKeys = group.map(person => person[".key"])
        // solos are 'null' in the map of last pairings.
        // this allows us to not have to special case it on the cost computation below
        if (personKeys.length === 1) {
          lastPairings[personKeys[0]][null] = epoch
          return
        }
        pairs(personKeys).forEach(pair => {
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
        })
      })
    })

    return lastPairings
  }

  calculateMovesToBestPairing({ history, current }) {
    const lanes = current.lanes
      .filter(({ locked }) => !locked)
    const laneKeys = lanes.map(lane => lane[".key"])
    const availablePeople = current.people
      .filter(({ location }) =>
        location === constants.LOCATION.UNASSIGNED ||
        laneKeys.includes(location))
    const peopleInLanes = availablePeople.filter(({ location }) =>  location !== constants.LOCATION.UNASSIGNED)
    const solos = _.flatten(
      Object.values(_.groupBy(peopleInLanes, "location"))
        .filter(group => group.length === 1)
    )

    if ((2 * lanes.length - 1) > availablePeople.length) {
      return
    }

    const lastPairings = this._calculateScores(availablePeople, history)

    let bestCost = Infinity
    let bestPairing

    const possiblePairings = pairings(availablePeople.map(person => person[".key"]))
    _.shuffle(possiblePairings).forEach(pairing => {
      pairing = _.chunk(pairing, 2)
      const cost = _.sum(_.map(pairing, pair =>
        lastPairings[pair[0]][pair[1]]
      ))

      if (this._isPairingValid({pairing, solos}) && cost < bestCost) {
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
    })

    if (!bestPairing) {
      return null
    }

    return bestPairing
  }
}

export default Recommendation
