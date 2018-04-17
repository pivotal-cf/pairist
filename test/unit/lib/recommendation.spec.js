import assert from 'assert'
import _ from 'lodash/fp'

import * as Recommendation from '@/lib/recommendation'
import constants from '@/lib/constants'
import fs from 'fs'
import mkdirp from 'mkdirp'
import { combination } from 'js-combinatorics'

mkdirp.sync('/tmp/pairist-fuzz-pairing/')

describe('Recommendation', () => {
  describe('allPossibleAssignments', () => {
    it('returns possible moves when nobody is assigned', () => {
      const allPossibleAssignments = Array.from(Recommendation.allPossibleAssignments({
        current: {
          entities: [
            { '.key': 'p1', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
          ],
          lanes: [],
        },
      }))

      expect(allPossibleAssignments).toEqual([[
        [['p1'], 'new-lane'],
      ]])
    })

    it('returns possible moves when nobody is assigned but there is a lane', () => {
      const allPossibleAssignments = Array.from(Recommendation.allPossibleAssignments({
        current: {
          entities: [
            { '.key': 'p1', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
          ],
          lanes: [
            { '.key': 'l1' },
          ],
        },
      }))

      expect(allPossibleAssignments).toEqual([[
        [['p1'], 'l1'],
      ]])
    })

    it('ignores locked lanes', () => {
      const allPossibleAssignments = Array.from(Recommendation.allPossibleAssignments({
        current: {
          entities: [
            { '.key': 'p1', 'type': 'person', 'location': 'l1' },
            { '.key': 'p2', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
          ],
          lanes: [
            { '.key': 'l1', 'locked': true },
          ],
        },
      }))

      expect(allPossibleAssignments).toEqual([[
        [['p2'], 'new-lane'],
      ]])
    })

    it('generates all possible assignments of unassigned people to lanes', () => {
      const allPossibleAssignments = Array.from(Recommendation.allPossibleAssignments({
        current: {
          entities: [
            { '.key': 'p1', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
            { '.key': 'p2', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
            { '.key': 'p3', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
          ],
          lanes: [
            { '.key': 'l1' },
            { '.key': 'l2' },
          ],
        },
      }))

      expect(allPossibleAssignments.map(as => as.find(a => a[1] === 'l2')).map(a => JSON.stringify(a[0].sort())).sort()).toEqual([
        '["p1","p2"]',
        '["p1","p3"]',
        '["p1"]',
        '["p2","p3"]',
        '["p2"]',
        '["p3"]',
      ])
      expect(allPossibleAssignments.map(as => as.find(a => a[1] === 'l1')).map(a => JSON.stringify(a[0].sort())).sort()).toEqual([
        '["p1","p2"]',
        '["p1","p3"]',
        '["p1"]',
        '["p2","p3"]',
        '["p2"]',
        '["p3"]',
      ])
    })

    it('generates options in unstable order', () => {
      const firstAllocations = []
      while (firstAllocations.length < 40) {
        const nextRecommendation = Recommendation.allPossibleAssignments({
          current: {
            entities: [
              { '.key': 'p1', 'type': 'person', 'location': 'l1' },
              { '.key': 'p2', 'type': 'person', 'location': 'l1' },
              { '.key': 'p3', 'type': 'person', 'location': 'l2' },
              { '.key': 'p4', 'type': 'person', 'location': 'l2' },
            ],
            lanes: [
              { '.key': 'l1' },
              { '.key': 'l2' },
            ],
          },
        })

        firstAllocations.push(nextRecommendation.next().value)
      }
      expect(_.uniq(firstAllocations.map(JSON.stringify)).sort()).toEqual([
        '[[["p1","p3"],"l1"],[["p4","p2"],"l2"]]',
        '[[["p1","p4"],"l1"],[["p3","p2"],"l2"]]',
        '[[["p2","p3"],"l1"],[["p4","p1"],"l2"]]',
        '[[["p2","p4"],"l1"],[["p3","p1"],"l2"]]',
        '[[["p3","p1"],"l2"],[["p2","p4"],"l1"]]',
        '[[["p3","p2"],"l2"],[["p1","p4"],"l1"]]',
        '[[["p4","p1"],"l2"],[["p2","p3"],"l1"]]',
        '[[["p4","p2"],"l2"],[["p1","p3"],"l1"]]',
      ])
    })

    it('generates all context-preserving rotations', () => {
      const allPossibleAssignments = Array.from(Recommendation.allPossibleAssignments({
        current: {
          entities: [
            { '.key': 'p1', 'type': 'person', 'location': 'l1' },
            { '.key': 'p2', 'type': 'person', 'location': 'l1' },
            { '.key': 'p3', 'type': 'person', 'location': 'l2' },
            { '.key': 'p4', 'type': 'person', 'location': 'l2' },
            { '.key': 'p5', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
          ],
          lanes: [
            { '.key': 'l1' },
            { '.key': 'l2' },
          ],
        },
      }))

      allPossibleAssignments.forEach(as => {
        expect(as.map(a => a[1]).sort()).toEqual(['l1', 'l2', 'new-lane'])
        expect(_.flatten(as.map(a => a[0])).sort()).toEqual(['p1', 'p2', 'p3', 'p4', 'p5'])
        const l1 = as.find(a => a[1] === 'l1')
        expect(['p1', 'p2'].some(p => l1[0].includes(p))).toEqual(true)
        const l2 = as.find(a => a[1] === 'l2')
        expect(['p3', 'p4'].some(p => l2[0].includes(p))).toEqual(true)
      })

      const entries = allPossibleAssignments.map(as => as.map(a => JSON.stringify([a[0].sort(), a[1]])).reduce((s, acc) => s + acc, ''))
      expect(_.uniq(entries).sort()).toEqual(entries.sort())
      combination(['p1', 'p2', 'p3', 'p4', 'p5'], 2).forEach(pair => {
        if (_.isEqual(pair, ['p1', 'p2'])) {
          expect(allPossibleAssignments.map(as => {
            const idx = as.findIndex(a => a[1] === 'l1')
            return as[idx]
          })).toContainEqual([pair, 'l1'])
        } else if (_.isEqual(pair, ['p3', 'p4'])) {
          expect(allPossibleAssignments.map(as => {
            const idx = as.findIndex(a => a[1] === 'l2')
            return as[idx]
          })).toContainEqual([pair, 'l2'])
        } else if (pair.includes('p1') || pair.includes('p2')) {
          expect(allPossibleAssignments.map(as => {
            const idx = as.findIndex(a => a[1] === 'l1')
            return [as[idx][0].sort(), as[idx][1]]
          })).toContainEqual([pair, 'l1'])
          expect(allPossibleAssignments.map(as => {
            const idx = as.findIndex(a => a[1] === 'new-lane')
            return [as[idx][0].sort(), as[idx][1]]
          })).toContainEqual([pair, 'new-lane'])
        } else if (pair.includes('p3') || pair.includes('p4')) {
          expect(allPossibleAssignments.map(as => {
            const idx = as.findIndex(a => a[1] === 'l2')
            return [as[idx][0].sort(), as[idx][1]]
          })).toContainEqual([pair, 'l2'])
          expect(allPossibleAssignments.map(as => {
            const idx = as.findIndex(a => a[1] === 'new-lane')
            return [as[idx][0].sort(), as[idx][1]]
          })).toContainEqual([pair, 'new-lane'])
        } else {
          expect(allPossibleAssignments.map(as => {
            const idx = as.findIndex(a => a[1] === 'l1')
            return [as[idx][0].sort(), as[idx][1]]
          })).toContainEqual([pair, 'l1'])
          expect(allPossibleAssignments.map(as => {
            const idx = as.findIndex(a => a[1] === 'l2')
            return [as[idx][0].sort(), as[idx][1]]
          })).toContainEqual([pair, 'l2'])
          expect(allPossibleAssignments.map(as => {
            const idx = as.findIndex(a => a[1] === 'new-lane')
            return [as[idx][0].sort(), as[0][1]]
          })).toContainEqual([pair, 'new-lane'])
        }
      })
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

      expect(normalizePairing(bestPairing)).toEqual([
        {
          lane: 'l2',
          entities: ['p3', 'p5'],
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

        expect(normalizePairing(bestPairing)).toEqual([
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

      it('when scores are tied, it does not always pair the same people', () => {
        const bestPairings = []
        while (bestPairings.length < 20) {
          bestPairings.push(Recommendation.calculateMovesToBestPairing({
            current: {
              entities: [
                { '.key': 'p1', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
                { '.key': 'p2', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
                { '.key': 'p3', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
              ],
              lanes: [],
            },
            history: [],
          }))
        }

        expect(_.uniq(bestPairings.map(ps => normalizePairing(ps)).map(JSON.stringify)).sort()).toEqual([
          '[{"lane":"new-lane","entities":["p1"]},{"lane":"new-lane","entities":["p2","p3"]}]',
          '[{"lane":"new-lane","entities":["p2"]},{"lane":"new-lane","entities":["p1","p3"]}]',
          '[{"lane":"new-lane","entities":["p3"]},{"lane":"new-lane","entities":["p1","p2"]}]',
        ])
      })

      it('avoids pairing people who have an affinity such that they should not be paired', () => {
        const bestPairing = Recommendation.calculateMovesToBestPairing({
          current: {
            entities: [
              { '.key': 'p1', 'type': 'person', 'location': constants.LOCATION.UNASSIGNED },
              {
                '.key': 'p2',
                'type': 'person',
                'location': constants.LOCATION.UNASSIGNED,
                'affinities': {
                  none: ['remote'],
                },
              },
              {
                '.key': 'p3',
                'type': 'person',
                'location': constants.LOCATION.UNASSIGNED,
                'tags': ['remote'],
              },
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

        expect(normalizePairing(bestPairing)).toEqual([
          {
            lane: 'new-lane',
            entities: ['p2'],
          },
          {
            lane: 'new-lane',
            entities: ['p1', 'p3'],
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

        expect(normalizePairing(bestPairing)).toEqual([
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
            lane: 'new-lane',
            entities: ['p1'],
          },
          {
            lane: 'l2',
            entities: ['p2'],
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

        expect(normalizePairing(bestPairing)).toEqual([
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

      it('fuzz 7', () => {
        const board = require('./fixtures/board-from-fuzz-7.json')
        const bestPairing = Recommendation.calculateMovesToBestPairing(board)
        expect(bestPairing).toBeTruthy()
        expect(_.flatten(bestPairing.map(p => p.entities)).length).toBeGreaterThanOrEqual(6)
      })

      it('fuzz 8', () => {
        const board = require('./fixtures/board-from-fuzz-8.json')
        const bestPairing = Recommendation.calculateMovesToBestPairing(board)
        expect(bestPairing).toBeTruthy()
        expect(_.flatten(bestPairing.map(p => p.entities)).length).toBeGreaterThanOrEqual(2)
      })

      it('fuzz 9', () => {
        const board = require('./fixtures/board-from-fuzz-9.json')
        const bestPairing = Recommendation.calculateMovesToBestPairing(board)
        expect(bestPairing).toBeTruthy()
        expect(_.flatten(bestPairing.map(p => p.entities)).length).toBeGreaterThanOrEqual(
          board.current.entities.filter(e => e.type === 'person' && e.location === constants.LOCATION.UNASSIGNED).length
        )
      })

      it('fuzz 10', () => {
        const board = require('./fixtures/board-from-fuzz-10.json')
        const bestPairing = Recommendation.calculateMovesToBestPairing(board)
        expect(bestPairing).toBeTruthy()
        expect(_.flatten(bestPairing.map(p => p.entities)).length).toBeGreaterThanOrEqual(
          board.current.entities.filter(e => e.type === 'person' && e.location === constants.LOCATION.UNASSIGNED).length
        )
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
            if (trackCount > 0 && peopleCount > 0) {
              const results = measureAllocations({ current: _.cloneDeep(board.current), history: _.cloneDeep(board.history) })
              expect(results.pairStdDev).toBeLessThan(4)
              expect(results.trackStdDev).toBeLessThan(6)
            }
            assert.ok(bestPairing, JSON.stringify({ config, current: board.current }))
            expect(bestPairing).toBeTruthy()
            expect(_.flatten(bestPairing.map(p => p.entities)).length).toBeGreaterThanOrEqual(
              board.current.entities.filter(e => e.type === 'person' && e.location === constants.LOCATION.UNASSIGNED).length
            )
            const people = board.current.entities.filter(e => e.type === 'person')
            const emptyLanes = board.current.lanes.filter(l =>
              !l.locked && !people.some(p => p.location === l['.key'])).map(l => l['.key'])
            if (emptyLanes.length > 0) {
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
    track.push(_.extend(guid('t'), { balance: true }))
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
      '.key': '' + (1000000 + i),
      'entities': generateAssignment(people, locations),
    })
  }

  return board
}

const previousScore = timeAgo => 1000000 - timeAgo
const randomInt = (max) => Math.floor(Math.random() * Math.floor(max))

const measureAllocations = ({ current, history }) => {
  const applyAssignment = (current, pairing) => {
    let newLaneCounter = 0
    return pairing.reduce((current, asst) => {
      if (asst.lane === 'new-lane') {
        current.lanes.push({ '.key': 'alloc-l-' + newLaneCounter })
        asst.lane = 'alloc-l-' + newLaneCounter
        newLaneCounter += 1
      }
      asst.entities.forEach(movingEntity => {
        const idx = current.entities.findIndex(currentEntity => currentEntity['.key'] === movingEntity)
        current.entities[idx].location = asst.lane
      })

      return current
    }, current)
  }
  let nextCurrent = applyAssignment(current, Recommendation.calculateMovesToBestPairing({
    current: current,
    history: history,
  }))
  const measuredHistory = []
  let maxHistory = 0
  if (history.length > 0) {
    maxHistory = parseInt(_.last(history)['.key'])
  }
  history.push({
    '.key': '' + (maxHistory + 1),
    'entities': _.cloneDeep(nextCurrent.entities),
  })
  measuredHistory.push(_.cloneDeep(nextCurrent.entities))

  for (let i = 2; i < 20; i++) {
    const nextAssignment = Recommendation.calculateMovesToBestPairing({
      current: nextCurrent,
      history: history,
    })
    nextCurrent = applyAssignment(nextCurrent, nextAssignment)
    history.push({
      '.key': '' + (maxHistory + i),
      'entities': _.cloneDeep(nextCurrent.entities),
    })
    measuredHistory.push(_.cloneDeep(nextCurrent.entities))
  }

  let aggregate = {}
  let pairAggregate = {}
  measuredHistory.forEach(h => {
    _.values(_.groupBy('location', h.filter(e => e.type === 'person' && e.location !== 'out'))).forEach(pairing => {
      const pair = pairing.map(p => p['.key'])

      if (pairAggregate[pair[0]] === undefined) {
        pairAggregate[pair[0]] = {}
      }
      if (pairAggregate[pair[0]][pair[1]] === undefined) {
        pairAggregate[pair[0]][pair[1]] = 0
      }
      if (pairAggregate[pair[1]] === undefined) {
        pairAggregate[pair[1]] = {}
      }
      if (pairAggregate[pair[1]][pair[0]] === undefined) {
        pairAggregate[pair[1]][pair[0]] = 0
      }
      pairAggregate[pair[0]][pair[1]] += 1
      pairAggregate[pair[1]][pair[0]] += 1
    })
    h.forEach(ent => {
      if (ent['type'] !== 'person' || ent.location === 'out') {
        return
      }
      if (aggregate[ent['.key']] === undefined) {
        aggregate[ent['.key']] = {}
      }
      if (aggregate[ent['.key']][ent.location] === undefined) {
        aggregate[ent['.key']][ent.location] = 0
      }
      aggregate[ent['.key']][ent.location] += 1
    })
  })
  let pairCounts = _.flatten(_.values(pairAggregate).map(l => _.values(l)))
  let meanPairCount = _.mean(pairCounts)
  let pairStdDev = Math.sqrt(_.mean(pairCounts.map(c => Math.pow(c - meanPairCount, 2))))

  let trackCounts = _.flatten(_.values(aggregate).map(l => _.values(l)))
  let meanTrackCount = _.mean(trackCounts)
  let trackStdDev = Math.sqrt(_.mean(trackCounts.map(c => Math.pow(c - meanTrackCount, 2))))

  return { pairAggregate, trackAggregate: aggregate, pairStdDev, trackStdDev }
}

const normalizePairing = (pairing) => {
  return pairing.map(p => {
    return {
      lane: p.lane,
      entities: p.entities.sort(),
    }
  }).sort((a, b) => a.lane < b.lane ? -1 : 1)
}
