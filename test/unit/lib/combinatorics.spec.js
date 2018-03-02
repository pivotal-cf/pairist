import { pairings } from '@/lib/combinatorics'

describe('combinatorics', () => {
  describe('pairings', () => {
    it('returns nothing if empty', () => {
      expect(pairings([])).toEqual([])
    })

    it('puts a single pairing with null to signify solo', () => {
      expect(pairings([1])).toEqual([[1, null]])
    })

    it('returns only the single possibility if size is 2', () => {
      expect(pairings([1, 2])).toEqual([[1, 2]])
    })

    it('can compute pairings for size 3', () => {
      expect(pairings([1, 2, 3])).toEqual([
        [1, 2, 3, null], [1, 3, 2, null], [1, null, 2, 3],
      ])
    })

    it('can compute pairings for size 4', () => {
      expect(pairings([1, 2, 3, 4])).toEqual([
        [1, 2, 3, 4], [1, 3, 2, 4], [1, 4, 2, 3],
      ])
    })
  })
})
