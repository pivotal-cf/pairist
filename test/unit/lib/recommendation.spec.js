import assert from 'assert'
import _ from 'lodash/fp'

import * as Recommendation from '@/lib/recommendation'
import constants from '@/lib/constants'
import fs from 'fs'
import mkdirp from 'mkdirp'
mkdirp.sync('/tmp/pairist-fuzz-pairing/')

describe('Recommendation', () => {
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

    it('assigns people with context to the right lanes', () => {
      const bestPairing = Recommendation.calculateMovesToBestPairing({
        current: {
          entities: [
            { '.key': 'p1', 'type': 'person', 'location': 'l1' },
            { '.key': 'p2', 'type': 'person', 'location': 'l1' },
            { '.key': 'p3', 'type': 'person', 'location': 'l2' },
            { '.key': 'p4', 'type': 'person', 'location': 'l2' },
            { '.key': 'p5', 'type': 'person', 'location': 'l3' },
          ],
          lanes: [{ '.key': 'l1' }, { '.key': 'l2' }, { '.key': 'l3' }],
        },
        history: [
          {
            '.key': '' + previousScore(3),
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l3' },
              { '.key': 'p3', 'type': 'person', 'location': 'l1' },
              { '.key': 'p4', 'type': 'person', 'location': 'l2' },
              { '.key': 'p5', 'type': 'person', 'location': 'l2' },
            ],
          },
          {
            '.key': '' + previousScore(2),
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l2' },
              { '.key': 'p3', 'type': 'person', 'location': 'l3' },
              { '.key': 'p4', 'type': 'person', 'location': 'l1' },
              { '.key': 'p5', 'type': 'person', 'location': 'l2' },
            ],
          },
          {
            '.key': '' + previousScore(1),
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
              { '.key': 'p4', 'type': 'person', 'location': 'l2' },
              { '.key': 'p5', 'type': 'person', 'location': 'l3' },
            ],
          },
        ],
      })

      expect(bestPairing).toEqual([
        {
          lane: 'l1',
          entities: ['p3'],
        },
        {
          lane: 'l3',
          entities: ['p1'],
        },
      ])
    })

    it('fills in empty lanes first', () => {
      const bestPairing = Recommendation.calculateMovesToBestPairing({
        current: {
          entities: [
            { '.key': 'p1', 'type': 'person', 'location': 'l1' },
            { '.key': 'p2', 'type': 'person', 'location': 'l1' },
            { '.key': 'p3', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
            { '.key': 'p4', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
            { '.key': 'p5', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
          ],
          lanes: [{ '.key': 'l1' }, { '.key': 'l2' }],
        },
        history: [
          {
            '.key': '' + previousScore(3),
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l3' },
              { '.key': 'p3', 'type': 'person', 'location': 'l1' },
              { '.key': 'p4', 'type': 'person', 'location': 'l2' },
              { '.key': 'p5', 'type': 'person', 'location': 'l2' },
            ],
          },
          {
            '.key': '' + previousScore(2),
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l2' },
              { '.key': 'p3', 'type': 'person', 'location': 'l3' },
              { '.key': 'p4', 'type': 'person', 'location': 'l1' },
              { '.key': 'p5', 'type': 'person', 'location': 'l2' },
            ],
          },
          {
            '.key': '' + previousScore(1),
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
              { '.key': 'p4', 'type': 'person', 'location': 'l2' },
              { '.key': 'p5', 'type': 'person', 'location': 'l3' },
            ],
          },
        ],
      })

      expect(bestPairing).toEqual([
        {
          lane: 'l1',
          entities: ['p5'],
        },
        {
          lane: 'l2',
          entities: ['p2', 'p3'],
        },
        {
          lane: 'new-lane',
          entities: ['p4'],
        },
      ])
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
            lanes: [],
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
            lane: 'new-lane',
            entities: ['p1'],
          },
          {
            lane: 'new-lane',
            entities: ['p2', 'p3'],
          },
        ])
      })

      it('assigns people with context to the right lanes', () => {
        const bestPairing = Recommendation.calculateMovesToBestPairing({
          current: {
            entities: [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
              { '.key': 'p4', 'type': 'person', 'location': 'l2' },
              { '.key': 'p5', 'type': 'person', 'location': 'l3' },
            ],
            lanes: [{ '.key': 'l1' }, { '.key': 'l2' }, { '.key': 'l3' }],
          },
          history: [
            {
              '.key': '' + previousScore(3),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l3' },
                { '.key': 'p3', 'type': 'person', 'location': 'l1' },
                { '.key': 'p4', 'type': 'person', 'location': 'l2' },
                { '.key': 'p5', 'type': 'person', 'location': 'l2' },
              ],
            },
            {
              '.key': '' + previousScore(2),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l2' },
                { '.key': 'p3', 'type': 'person', 'location': 'l3' },
                { '.key': 'p4', 'type': 'person', 'location': 'l1' },
                { '.key': 'p5', 'type': 'person', 'location': 'l2' },
              ],
            },
            {
              '.key': '' + previousScore(1),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l1' },
                { '.key': 'p3', 'type': 'person', 'location': 'l2' },
                { '.key': 'p4', 'type': 'person', 'location': 'l2' },
                { '.key': 'p5', 'type': 'person', 'location': 'l3' },
              ],
            },
          ],
        })

        expect(bestPairing).toEqual([
          {
            lane: 'l1',
            entities: ['p3'],
          },
          {
            lane: 'l3',
            entities: ['p1'],
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

    describe('multiple solos', () => {
      it('does not pair them together', () => {
        const bestPairing = Recommendation.calculateMovesToBestPairing({
          current: {
            entities: [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l2' },
              { '.key': 'p3', 'type': 'person', 'location': 'l3' },
              { '.key': 'p4', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
              { '.key': 'p5', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
              { '.key': 'p6', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
              { '.key': 'role', 'type': 'role', 'location': constants.LOCATION.UNASSIGNED },
            ],
            lanes: [{ '.key': 'l1' }, { '.key': 'l2' }, { '.key': 'l3' }],
          },
          history: [
            {
              '.key': '' + previousScore(3),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l2' },
                { '.key': 'p3', 'type': 'person', 'location': 'l3' },
                { '.key': 'p4', 'type': 'person', 'location': 'l3' },
                { '.key': 'p5', 'type': 'person', 'location': 'l1' },
                { '.key': 'p6', 'type': 'person', 'location': 'l2' },
              ],
            },
            {
              '.key': '' + previousScore(2),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l2' },
                { '.key': 'p3', 'type': 'person', 'location': 'l3' },
                { '.key': 'p4', 'type': 'person', 'location': 'l1' },
                { '.key': 'p5', 'type': 'person', 'location': 'l2' },
                { '.key': 'p6', 'type': 'person', 'location': 'l3' },
              ],
            },
            {
              '.key': '' + previousScore(1),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l2' },
                { '.key': 'p3', 'type': 'person', 'location': 'l3' },
                { '.key': 'p4', 'type': 'person', 'location': 'l2' },
                { '.key': 'p5', 'type': 'person', 'location': 'l3' },
                { '.key': 'p6', 'type': 'person', 'location': 'l1' },
              ],
            },
          ],
        })

        expect(bestPairing).toEqual([
          {
            lane: 'l1',
            entities: ['p5'],
          },
          {
            lane: 'l2',
            entities: ['p6'],
          },
          {
            lane: 'l3',
            entities: ['p4'],
          },
        ])
      })
    })

    describe('fuzz pairing static (repro from interesting failures)', () => {
      it('fuzz 1', () => {
        const board = require('./fixtures/board-from-fuzz-1.json')
        const bestPairing = Recommendation.calculateMovesToBestPairing(board)
        expect(bestPairing).toBeTruthy()
      })

      it('fuzz 2', () => {
        const board = require('./fixtures/board-from-fuzz-2.json')
        const bestPairing = Recommendation.calculateMovesToBestPairing(board)
        expect(bestPairing).toBeTruthy()
      })

      it('fuzz 3', () => {
        const board = require('./fixtures/board-from-fuzz-3.json')
        const bestPairing = Recommendation.calculateMovesToBestPairing(board)
        expect(bestPairing).toBeTruthy()
      })

      it('fuzz 4', () => {
        const board = require('./fixtures/board-from-fuzz-4.json')
        const bestPairing = Recommendation.calculateMovesToBestPairing(board)
        expect(bestPairing).toBeTruthy()
      })

      it('fuzz 5', () => {
        const board = require('./fixtures/board-from-fuzz-5.json')
        const bestPairing = Recommendation.calculateMovesToBestPairing(board)
        expect(bestPairing).toBeTruthy()
        const people = board.current.entities.filter(e => e.type === 'person')
        const emptyLanes = board.current.lanes.filter(l =>
          !l.locked && !people.some(p => p.location === l['.key'])).map(l => l['.key'])
        expect(bestPairing.some(move => emptyLanes.includes(move.lane))).toBeTruthy()
      })

      it('fuzz 6', () => {
        const board = require('./fixtures/board-from-fuzz-6.json')
        const bestPairing = Recommendation.calculateMovesToBestPairing(board)
        expect(bestPairing).toBeTruthy()
        const people = board.current.entities.filter(e => e.type === 'person')
        const emptyLanes = board.current.lanes.filter(l =>
          !l.locked && !people.some(p => p.location === l['.key'])).map(l => l['.key'])
        expect(bestPairing.some(move => emptyLanes.includes(move.lane)) || bestPairing.length === 0).toBeTruthy()
      })
    })

    describe('fuzz pairing', () => {
      for (let i = 0; i < 500; i++) {
        it(`fuzz #${i}`, () => {
          const peopleCount = randomInt(10)
          const outCount = randomInt(4)
          const lanesCount = randomInt(5)
          const trackCount = randomInt(6)
          const historyCount = randomInt(200)
          const config = {
            peopleCount,
            outCount,
            lanesCount,
            trackCount,
            historyCount,
          }
          const board = generateBoard(config)

          fs.writeFileSync(`/tmp/pairist-fuzz-pairing/board-${i}.json`, JSON.stringify(board), 'utf-8')
          const bestPairing = Recommendation.calculateMovesToBestPairing(board)
          if (lanesCount * 2 - 1 > peopleCount) {
            // too many lanes
            assert.equal(bestPairing, undefined, JSON.stringify({ config, current: board.current }))
          } else {
            assert.ok(bestPairing, JSON.stringify({ config, current: board.current }))
            expect(bestPairing).toBeTruthy()
            const people = board.current.entities.filter(e => e.type === 'person')
            const emptyLanes = board.current.lanes.filter(l =>
              !l.locked && !people.some(p => p.location === l['.key'])).map(l => l['.key'])
            if (emptyLanes.length > 0 && bestPairing.length > 0) {
              expect(bestPairing.some(move => emptyLanes.includes(move.lane))).toBeTruthy()
            }

            bestPairing.forEach(move => {
              expect(move.entities).toBeTruthy()
              if (move.entities.length > 1 && move.lane !== 'new-lane') {
                const entities = board.current.entities.filter(e => e.location === move.lane)
                const people = entities.filter(e => e.type === 'person')
                expect(people.length).toEqual(0)
              }
            })
          }
        })
      }
    })
  })

  describe('getMoves', () => {
    it('does not blow up if given an undefined pairing', () => {
      expect(Recommendation.getMoves({ pairing: undefined, lanes: [] })).toEqual([])
    })
  })

  describe('track rotation', () => {
    it("rotates people onto tracks they haven't worked on much", () => {
      const bestPairing1 = Recommendation.calculateMovesToBestPairing({
        current: {
          entities: [
            { '.key': 'p1', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
            { '.key': 'p2', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
            { '.key': 'p3', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
            { '.key': 'p4', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
            { '.key': 't1', 'type': 'track', 'location': 'l1' },
            { '.key': 't3', 'type': 'track', 'location': 'l1' },
            { '.key': 't2', 'type': 'track', 'location': 'l2' },
          ],
          lanes: [
            { '.key': 'l1' },
            { '.key': 'l2' },
          ],
        },
        history: [
          {
            '.key': '' + previousScore(4),
            'entities': [],
          },
          {
            '.key': '' + previousScore(3),
            'entities': [
              { '.key': 't1', 'type': 'track', 'location': 'l1' },
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 't2', 'type': 'track', 'location': 'l2' },
              { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 't3', 'type': 'track', 'location': 'l3' },
              { '.key': 'p3', 'type': 'person', 'location': 'l3' },
            ],
          },
        ],
      })

      expect(bestPairing1).toEqual([
        {
          lane: 'l1',
          entities: ['p2', 'p4'],
        },
        {
          lane: 'l2',
          entities: ['p1', 'p3'],
        },
      ])
    })

    it('weights recent context more heavily', () => {
      const bestPairing1 = Recommendation.calculateMovesToBestPairing({
        current: {
          entities: [
            { '.key': 'p1', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
            { '.key': 'p2', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
            { '.key': 'p3', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
            { '.key': 't1', 'type': 'track', 'location': 'l1' },
            { '.key': 't2', 'type': 'track', 'location': 'l2' },
          ],
          lanes: [
            { '.key': 'l1' },
            { '.key': 'l2' },
          ],
        },
        history: [
          {
            '.key': '' + previousScore(1),
            'entities': [
              { '.key': 't2', 'type': 'track', 'location': 'l2' },
              { '.key': 'p1', 'type': 'person', 'location': 'l2' },
            ],
          },
          {
            '.key': '' + previousScore(2),
            'entities': [
              { '.key': 't1', 'type': 'track', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l1' },
            ],
          },
          {
            '.key': '' + previousScore(3),
            'entities': [
              { '.key': 't1', 'type': 'track', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l1' },
            ],
          },
        ],
      })

      expect(bestPairing1).toEqual([
        {
          lane: 'l1',
          entities: ['p1', 'p2'],
        },
        {
          lane: 'l2',
          entities: ['p3'],
        },
      ])
    })

    it('recommends individuals who are unassigned', () => {
      const bestPairing = Recommendation.calculateMovesToBestPairing({
        current: {
          entities: [
            { '.key': 'p1', 'type': 'person', 'location': 'l1' },
            { '.key': 'p2', 'type': 'person', 'location': 'l2' },
            { '.key': 'p4', 'type': 'person', 'location': 'l2' },
            { '.key': 'p3', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
            { '.key': 't2', 'type': 'track', 'location': 'l2' },
          ],
          lanes: [
            { '.key': 'l1' },
            { '.key': 'l2' },
          ],
        },
        history: [
          {
            '.key': '' + previousScore(5),
            'entities': [],
          },
          {
            '.key': '' + previousScore(4),
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' }, { '.key': 'p3', 'type': 'person', 'location': 'l1' },
              { '.key': 't2', 'type': 'track', 'location': 'l2' },
              { '.key': 'p2', 'type': 'person', 'location': 'l2' },
            ],
          },
          {
            '.key': '' + previousScore(3),
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' }, { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 't2', 'type': 'track', 'location': 'l2' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
            ],
          },
          {
            '.key': '' + previousScore(2),
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' }, { '.key': 'p3', 'type': 'person', 'location': 'l1' },
              { '.key': 't2', 'type': 'track', 'location': 'l2' },
              { '.key': 'p2', 'type': 'person', 'location': 'l2' },
            ],
          },
          {
            '.key': '' + previousScore(1),
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' }, { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 't2', 'type': 'track', 'location': 'l2' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
            ],
          },
        ],
      })

      expect(bestPairing).toEqual([
        {
          entities: [
            'p4',
          ],
          lane: 'l1',
        },
        {
          entities: [
            'p3',
          ],
          lane: 'l2',
        },
      ])
    })

    it('returns an empty array when already optimal', () => {
      const bestPairing = Recommendation.calculateMovesToBestPairing({
        current: {
          entities: [
            { '.key': 'p1', 'type': 'person', 'location': 'l1' },
            { '.key': 'p3', 'type': 'person', 'location': 'l1' },
            { '.key': 'p2', 'type': 'person', 'location': 'l2' },
            { '.key': 't2', 'type': 'track', 'location': 'l2' },
          ],
          lanes: [
            { '.key': 'l1' },
            { '.key': 'l2' },
          ],
        },
        history: [
          {
            '.key': '' + previousScore(5),
            'entities': [],
          },
          {
            '.key': '' + previousScore(4),
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
              { '.key': 't2', 'type': 'track', 'location': 'l2' },
              { '.key': 'p2', 'type': 'person', 'location': 'l2' },
            ],
          },
          {
            '.key': '' + previousScore(3),
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' }, { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 't2', 'type': 'track', 'location': 'l2' },
              { '.key': 'p2', 'type': 'person', 'location': 'l2' },
            ],
          },
          {
            '.key': '' + previousScore(2),
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' }, { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 't2', 'type': 'track', 'location': 'l2' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
            ],
          },
          {
            '.key': '' + previousScore(1),
            'entities': [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' }, { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 't2', 'type': 'track', 'location': 'l2' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
            ],
          },
        ],
      })

      expect(bestPairing).toEqual([])
    })
  })

  describe('calculateMovesToBestAssignment', () => {
    it('does not blow up if history is not set', () => {
      const best = Recommendation.calculateMovesToBestAssignment({
        current: {
          entities: [{ '.key': 'p1', 'type': 'person', 'location': 'l1' }],
          lanes: [{ '.key': 'l1' }],
        },
      })

      expect(best).toEqual([])
    })

    it("returns the single possibility if there's only one", () => {
      const best = Recommendation.calculateMovesToBestAssignment({
        left: 'person',
        right: 'potato',
        current: {
          entities: [
            { '.key': 'p1', 'type': 'person', 'location': 'l1' },
            { '.key': 'p2', 'type': 'person', 'location': 'l1' },
            { '.key': 'spud', 'type': 'potato', 'location': constants.LOCATION.UNASSIGNED },
          ],
          lanes: [{ '.key': 'l1' }],
        },
        history: [],
      })

      expect(best).toEqual([{
        lane: 'l1',
        entities: ['spud'],
      }])
    })

    describe('with 3 people', () => {
      it("assigns roles to pairs that haven't had them for longer", () => {
        const best = Recommendation.calculateMovesToBestAssignment({
          left: 'person',
          right: 'role',
          current: {
            entities: [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
              { '.key': 'r1', 'type': 'role', 'location': constants.LOCATION.UNASSIGNED },
              { '.key': 'r2', 'type': 'role', 'location': constants.LOCATION.UNASSIGNED },
            ],
            lanes: [{ '.key': 'l1' }, { '.key': 'l2' }],
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
                { '.key': 'r1', 'type': 'role', 'location': 'l1' },
                { '.key': 'r2', 'type': 'role', 'location': 'l2' },
              ],
            },
            {
              '.key': '' + previousScore(1),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l1' },
                { '.key': 'p3', 'type': 'person', 'location': 'l2' },
                { '.key': 'r1', 'type': 'role', 'location': 'l1' },
                { '.key': 'r2', 'type': 'role', 'location': 'l2' },
              ],
            },
          ],
        })

        expect(best).toEqual([
          {
            lane: 'l1',
            entities: ['r1'],
          },
          {
            lane: 'l2',
            entities: ['r2'],
          },
        ])
      })
    })

    describe('with locked lanes', () => {
      it('ignores locked lanes completely', () => {
        const best = Recommendation.calculateMovesToBestAssignment({
          left: 'person',
          right: 'role',
          current: {
            entities: [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
              { '.key': 'r1', 'type': 'role', 'location': 'l1' },
              { '.key': 'r2', 'type': 'role', 'location': 'l2' },
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
                { '.key': 'r1', 'type': 'role', 'location': 'l1' },
                { '.key': 'r2', 'type': 'role', 'location': 'l1' },
              ],
            },
          ],
        })

        expect(best).toEqual([])
      })

      it("even when they're empty", () => {
        const best = Recommendation.calculateMovesToBestAssignment({
          left: 'person',
          right: 'role',
          current: {
            entities: [
              { '.key': 'p1', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
              { '.key': 'p2', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
              { '.key': 'r1', 'type': 'role', 'location': 'l1' },
              { '.key': 'r2', 'type': 'role', 'location': 'l2' },
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
                { '.key': 'r1', 'type': 'role', 'location': 'l1' },
                { '.key': 'r2', 'type': 'role', 'location': 'l2' },
              ],
            },
            {
              '.key': '' + previousScore(1),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l1' },
                { '.key': 'p3', 'type': 'person', 'location': 'l2' },
                { '.key': 'r1', 'type': 'role', 'location': 'l1' },
                { '.key': 'r2', 'type': 'role', 'location': 'l2' },
              ],
            },
          ],
        })

        expect(best).toEqual([])
      })
    })

    describe('less right than lanes', () => {
      it('puts multiple on the same lane', () => {
        const best = Recommendation.calculateMovesToBestAssignment({
          left: 'person',
          right: 'role',
          current: {
            entities: [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
              { '.key': 'p4', 'type': 'person', 'location': 'l2' },
              { '.key': 'r1', 'type': 'role', 'location': constants.LOCATION.UNASSIGNED },
              { '.key': 'r2', 'type': 'role', 'location': constants.LOCATION.UNASSIGNED },
              { '.key': 'r3', 'type': 'role', 'location': constants.LOCATION.UNASSIGNED },
            ],
            lanes: [{ '.key': 'l1' }, { '.key': 'l2' }],
          },
          history: [
            {
              '.key': '' + previousScore(3),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l2' },
                { '.key': 'p3', 'type': 'person', 'location': 'l3' },
                { '.key': 'p4', 'type': 'person', 'location': 'l3' },
                { '.key': 'r1', 'type': 'role', 'location': 'l3' },
                { '.key': 'r2', 'type': 'role', 'location': 'l2' },
                { '.key': 'r3', 'type': 'role', 'location': 'l1' },
              ],
            },
            {
              '.key': '' + previousScore(2),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l2' },
                { '.key': 'p3', 'type': 'person', 'location': 'l3' },
                { '.key': 'p4', 'type': 'person', 'location': 'l1' },
                { '.key': 'r1', 'type': 'role', 'location': 'l1' },
                { '.key': 'r2', 'type': 'role', 'location': 'l3' },
                { '.key': 'r3', 'type': 'role', 'location': 'l2' },
              ],
            },
            {
              '.key': '' + previousScore(1),
              'entities': [
                { '.key': 'p1', 'type': 'person', 'location': 'l1' },
                { '.key': 'p2', 'type': 'person', 'location': 'l2' },
                { '.key': 'p3', 'type': 'person', 'location': 'l3' },
                { '.key': 'p4', 'type': 'person', 'location': 'l2' },
                { '.key': 'r1', 'type': 'role', 'location': 'l2' },
                { '.key': 'r2', 'type': 'role', 'location': 'l1' },
                { '.key': 'r3', 'type': 'role', 'location': 'l3' },
              ],
            },
          ],
        })

        expect(best).toEqual([
          {
            lane: 'l1',
            entities: ['r1'],
          },
          {
            lane: 'l2',
            entities: ['r2'],
          },
          {
            lane: 'l1',
            entities: ['r3'],
          },
        ])
      })
    })

    describe('fuzz assignment', () => {
      for (let i = 0; i < 200; i++) {
        it(`fuzz #${i}`, () => {
          const peopleCount = randomInt(10)
          const outCount = randomInt(4)
          const lanesCount = randomInt(5)
          const thingCount = randomInt(5)
          const trackCount = randomInt(6)
          const historyCount = randomInt(200)
          const config = {
            peopleCount,
            outCount,
            thingCount,
            lanesCount,
            trackCount,
            historyCount,
          }
          const board = generateBoard(config)

          const best = Recommendation.calculateMovesToBestAssignment({ left: 'person', right: 'thing', ...board })
          assert.ok(best, JSON.stringify({ config, current: board.current }))
          expect(best).toBeTruthy()
        })
      }
    })
  })
})

let gid = 0

const guid = (prefix) => {
  return `${prefix}-${gid++}`
}

const generateBoard = ({
  peopleCount,
  outCount,
  lanesCount,
  thingCount,
  trackCount,
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
    const id = guid('l')
    locations.push(id)
    board.current.lanes.push({ '.key': id })
  }

  let people = []
  for (let i = 0; i < peopleCount; i++) {
    people.push(guid('p'))
  }

  for (let i = 0; i < outCount; i++) {
    people.push(guid('p'))
  }

  let thing = []
  for (let i = 0; i < thingCount; i++) {
    thing.push(guid('r'))
  }

  let track = []
  for (let i = 0; i < trackCount; i++) {
    track.push(guid('t'))
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

    for (let i = 0; i < thing.length; i++) {
      let location = locations[randomInt(locations.length)]

      assignment.push({
        '.key': thing[i],
        'type': 'thing',
        'location': location,
      })
    }

    for (let i = 0; i < track.length; i++) {
      let location = locations[randomInt(locations.length)]

      assignment.push({
        '.key': track[i],
        'type': 'track',
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
