import assert from 'assert'
import _ from 'lodash/fp'
import { Map, Set } from 'immutable'

import Recommendation from '@/lib/recommendation'
import constants from '@/lib/constants'

describe('Recommendation', () => {
  describe('isPairingValid', () => {
    it('is always valid without solos', () => {
      expect(Recommendation.isPairingValid({ pairing: [], solos: [] })).toBeTruthy()
    })

    it('is invalid if pairing two solos but not together', () => {
      expect(Recommendation.isPairingValid({
        pairing: [[1, 3], [2, 4]],
        solos: [{ '.key': 1 }, { '.key': 2 }],
      })).toBeTruthy()
    })

    it('is invalid if pairing two solos together', () => {
      expect(Recommendation.isPairingValid({
        pairing: [[1, 2]],
        solos: [{ '.key': 1 }, { '.key': 2 }],
      })).toBeFalsy()
    })
  })

  describe('calculateScores', () => {
    const roster = Set(['p1', 'p2', 'p3'])
    const pairs = Recommendation.computePairs(roster)

    it('allows solos to be filtered out', () => {
      const scores = Recommendation.calculateScores({
        pairs,
        roster,
        history: [
          {
            '.key': '1',
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l2' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
            ],
          },
          {
            '.key': '11',
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
            ],
          },
          {
            '.key': '12',
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
            ],
          },
          {
            '.key': '13',
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
            ],
          },
        ],
        allowSolos: false,
      })

      expect(scores).toEqual(Map([
        [Set(['p1', 'p2']), 0],
        [Set(['p1', 'p3']), 13],
        [Set(['p2', 'p3']), 12],
      ]))
    })

    it('defaults to a maxium score halving solos', () => {
      const scores = Recommendation.calculateScores({
        pairs,
        roster,
        history: [
          {
            '.key': '1',
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
            ],
          },
          {
            '.key': '2',
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
            ],
          },
          {
            '.key': '3',
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
            ],
          },
        ],
        allowSolos: true,
      })

      expect(scores).toEqual(Map([
        [Set(['p1']), 1.5],
        [Set(['p1', 'p2']), 0],
        [Set(['p1', 'p3']), 3],
        [Set(['p2']), 1.5],
        [Set(['p2', 'p3']), 3],
        [Set(['p3']), 0],
      ]))
    })
  })

  describe('calculateMovesToBestPairing', () => {
    it('does not blow up if history is not set', () => {
      const bestPairing = Recommendation.calculateMovesToBestPairing({
        current: {
          entities: [{ '.key': 'p1', 'type': 'person', 'location': 'l1' }],
          lanes: [{ '.key': 'l1' }],
        },
      })

      expect(bestPairing).toEqual([])
    })

    it("returns the single possibility if there's only one", () => {
      const bestPairing = Recommendation.calculateMovesToBestPairing({
        current: {
          entities: [
            { '.key': 'p1', 'type': 'person', 'location': 'l1' },
            { '.key': 'p2', 'type': 'person', 'location': 'l1' },
          ],
          lanes: [{ '.key': 'l1' }],
        },
        history: [],
      })

      expect(bestPairing).toEqual([])
    })

    describe('with 3 people', () => {
      it("pairs the two that haven't paired together the longest", () => {
        const bestPairing = Recommendation.calculateMovesToBestPairing({
          current: {
            entities: [
              { '.key': 'p1', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
              { '.key': 'p2', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
              { '.key': 'p3', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
            ],
            lanes: [{ '.key': 'l1' }],
          },
          history: [
            {
              '.key': '' + previousScore(3),
              'entities': [],
            },
            {
              '.key': '' + previousScore(2),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l2' },
                { '.key': 'p3', 'type': 'person', 'location': 'l1' },
              ],
            },
            {
              '.key': '' + previousScore(1),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l1' },
                { '.key': 'p3', 'type': 'person', 'location': 'l2' },
              ],
            },
          ],
        })

        expect(bestPairing).toEqual([
          {
            lane: 'l1',
            entities: ['p1'],
          },
          {
            lane: 'new-lane',
            entities: ['p2', 'p3'],
          },
        ])
      })
    })

    describe('with people out', () => {
      it("pairs the two that haven't paired together the longest", () => {
        const bestPairing = Recommendation.calculateMovesToBestPairing({
          current: {
            entities: [
              { '.key': 'p1', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
              { '.key': 'p2', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
              { '.key': 'p3', 'type': 'person', 'location': constants.LOCATION.OUT },
            ],
            lanes: [],
          },
          history: [
            {
              '.key': '' + previousScore(2),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l1' },
                { '.key': 'p3', 'type': 'person', 'location': 'l2' },
              ],
            },
            {
              '.key': '' + previousScore(1),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l2' },
                { '.key': 'p3', 'type': 'person', 'location': 'l1' },
              ],
            },
          ],
        })

        expect(bestPairing).toEqual([
          {
            lane: 'new-lane',
            entities: ['p1', 'p2'],
          },
        ])
      })
    })

    describe('with locked lanes', () => {
      it('ignores locked lanes completely', () => {
        const bestPairing = Recommendation.calculateMovesToBestPairing({
          current: {
            entities: [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
            ],
            lanes: [
              { '.key': 'l1', 'locked': true },
              { '.key': 'l2', 'locked': false },
            ],
          },
          history: [
            {
              '.key': '' + previousScore(2),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l2' },
                { '.key': 'p3', 'type': 'person', 'location': 'l1' },
              ],
            },
            {
              '.key': '' + previousScore(1),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l1' },
                { '.key': 'p3', 'type': 'person', 'location': 'l2' },
              ],
            },
          ],
        })

        expect(bestPairing).toEqual([])
      })

      it("even when they're empty", () => {
        const bestPairing = Recommendation.calculateMovesToBestPairing({
          current: {
            entities: [
              { '.key': 'p1', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
              { '.key': 'p2', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
            ],
            lanes: [
              { '.key': 'l1', 'locked': true },
              { '.key': 'l2', 'locked': false },
            ],
          },
          history: [
            {
              '.key': '' + previousScore(2),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l2' },
                { '.key': 'p3', 'type': 'person', 'location': 'l1' },
              ],
            },
            {
              '.key': '' + previousScore(1),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l1' },
                { '.key': 'p3', 'type': 'person', 'location': 'l2' },
              ],
            },
          ],
        })

        expect(bestPairing).toEqual([
          {
            lane: 'l2',
            entities: ['p2'],
          },
          {
            lane: 'new-lane',
            entities: ['p1'],
          },
        ])
      })
    })

    describe('fuzz', () => {
      for (let i = 0; i < 200; i++) {
        it(`fuzz #${i}`, () => {
          const peopleCount = randomInt(10)
          const outCount = randomInt(4)
          const lanesCount = randomInt(5)
          const historyCount = randomInt(200)
          const config = {
            peopleCount,
            outCount,
            lanesCount,
            historyCount,
          }
          const board = generateBoard(config)

          const bestPairing = Recommendation.calculateMovesToBestPairing(board)
          if (lanesCount * 2 - 1 > peopleCount || peopleCount === 0) {
            // too many lanes
            assert.equal(bestPairing, undefined, JSON.stringify({ config, current: board.current }))
          } else {
            assert.ok(bestPairing, JSON.stringify({ config, current: board.current }))
            expect(bestPairing).toBeTruthy()
          }
        })
      }
    })
  })
})

const guid = () => {
  const s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4()
}

const generateBoard = ({
  peopleCount,
  outCount,
  lanesCount,
  historyCount,
}) => {
  let board = {
    current: {
      entities: [],
      lanes: [],
    },
    history: [],
  }

  let locations = [constants.LOCATION.UNASSIGNED]
  for (let i = 0; i < lanesCount; i++) {
    const id = guid()
    locations.push(id)
    board.current.lanes.push({ '.key': id })
  }

  let people = []
  for (let i = 0; i < peopleCount; i++) {
    people.push(guid())
  }

  for (let i = 0; i < outCount; i++) {
    people.push(guid())
  }

  const generateAssignment = (people, locations) => {
    let assignment = []
    people = _.shuffle(people)
    for (let i = 0; i < people.length - outCount; i++) {
      let location = locations[randomInt(locations.length)]

      assignment.push({
        '.key': people[i],
        'type': 'person',
        'location': location,
      })
    }

    for (let i = 0; i < outCount; i++) {
      assignment.push({
        '.key': people[people.length - outCount + i],
        'type': 'person',
        'location': constants.LOCATION.OUT,
      })
    }

    return assignment
  }

  board.current.entities = generateAssignment(people, locations)

  for (let i = 0; i < historyCount; i++) {
    board.history.push({
      '.key': '' + 1000000 + i,
      'entities': generateAssignment(people, locations),
    })
  }

  return board
}

const previousScore = timeAgo => 1000000 - timeAgo
const randomInt = (max) => Math.floor(Math.random() * Math.floor(max))
