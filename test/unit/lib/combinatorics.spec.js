import { permutations, pairs, pairings } from '@/lib/combinatorics'

describe('combinatorics', () => {
  describe('permutations', () => {
    it('returns nothing if empty', () => {
      expect(permutations([])).toEqual([])
    })

    it('can compute for size 1', () => {
      expect(permutations([1])).toEqual([[1]])
    })

    it('can compute for size 2', () => {
      expect(permutations([1, 2])).toEqual([[1, 2], [2, 1]])
    })

    it('can compute for size 3', () => {
      expect(permutations([1, 2, 3])).toEqual([
        [1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1],
      ])
    })

    it('can compute for size 4', () => {
      expect(permutations([1, 2, 3, 4])).toEqual([
        [1, 2, 3, 4], [1, 2, 4, 3], [1, 3, 2, 4], [1, 3, 4, 2], [1, 4, 2, 3],
        [1, 4, 3, 2], [2, 1, 3, 4], [2, 1, 4, 3], [2, 3, 1, 4], [2, 3, 4, 1],
        [2, 4, 1, 3], [2, 4, 3, 1], [3, 1, 2, 4], [3, 1, 4, 2], [3, 2, 1, 4],
        [3, 2, 4, 1], [3, 4, 1, 2], [3, 4, 2, 1], [4, 1, 2, 3], [4, 1, 3, 2],
        [4, 2, 1, 3], [4, 2, 3, 1], [4, 3, 1, 2], [4, 3, 2, 1],
      ])
    })
  })

  describe('pairs', () => {
    it('returns nothing if empty', () => {
      expect(pairs([])).toEqual([])
    })

    it('returns nothing if size is 1', () => {
      expect(pairs([1])).toEqual([])
    })

    it('returns only the single possibility if size is 2', () => {
      expect(pairs([1, 2])).toEqual([[1, 2]])
    })

    it('can compute pairs for size 3', () => {
      expect(pairs([1, 2, 3])).toEqual([
        [1, 2], [1, 3], [2, 3],
      ])
    })

    it('can compute pairs for size 4', () => {
      expect(pairs([1, 2, 3, 4])).toEqual([
        [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4],
      ])
    })
  })

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
