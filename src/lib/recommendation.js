import { pairs, permutations } from "@/lib/combinatorics"
import _ from "lodash"

const TIME_SCALE_DIVISOR = process.env.NODE_ENV === "production" ? 3600000 : 360

function findBestPairingSync({history, people, solos, lanes}) {
  if (2 * lanes.length > people.length) {
    return
  }

  let lastPairings = {}
  const today = new Date()

  people.forEach(left => {
    lastPairings[left[".key"]] = {}
    lastPairings[left[".key"]][undefined] = scaleDate(new Date().setDate(today.getDate()-31))

    people.forEach(right => {
      lastPairings[left[".key"]][right[".key"]] = scaleDate(new Date().setDate(today.getDate()-31))
    })
  })

  history.forEach(state => {
    const epoch = parseInt(state[".key"])
    const people = Object.keys(state.people).map(key =>
      Object.assign({".key": key}, state.people[key])
    ).filter(person =>
      person.location != "out" && person.location != "available"
    )
    const groups = _.groupBy(people, "location")

    Object.values(groups).forEach(group => {
      const personKeys = group.map(person => person[".key"])
      // solos are 'undefined' in the map of last pairings.  this allows us to
      // not have to special case it on the cost computation below
      if (personKeys.length === 1) {
        lastPairings[personKeys[0]][undefined] = epoch
        return
      }
      pairs(personKeys).forEach(pair => {
        if (
          lastPairings[pair[0]] === undefined ||
              lastPairings[pair[1]] === undefined
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

  let bestCost = Infinity
  let bestPairing

  const possiblePairings = permutations(people.map(person => person[".key"]))
  _.shuffle(possiblePairings).forEach(pairing => {
    pairing = _.chunk(pairing, 2)
    const cost = _.sum(_.map(pairing, pair =>
      lastPairings[pair[0]][pair[1]]
    ))

    if (isPairingValid({pairing, solos}) && cost < bestCost) {
      bestCost = cost
      bestPairing = pairing
    }
  })

  return bestPairing
}

export function findBestPairing(...args) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(findBestPairingSync(...args))
    }, 100)
  })
}

export function scaleDate(date) {
  return parseInt((date / TIME_SCALE_DIVISOR).toFixed(0))
}

export function findMatchingLanes({pairing, lanes, people}) {
  pairing = pairing.map(pair => pair.map(key => people.find(person => person[".key"] === key)))
  const laneKeys = lanes.filter(lane => lane.people.length > 0).map(lane => lane[".key"])
  const orders = permutations(pairing)
  const match = orders.find(pairing =>
    laneKeys.every((laneKey, i) => {
      if (!pairing[i]) { return false }
      return pairing[i].some(person => person.location === laneKey)
    })
  )
  if (!match) {
    return
  }

  return match.map((pair, i) => {
    return { pair: pair, lane: laneKeys[i] }
  })
}

function isPairingValid({pairing, solos}) {
  const soloKeys = solos.map(person => person[".key"])
  return !pairing.some(pair => pair.every(personKey => soloKeys.includes(personKey)))
}
