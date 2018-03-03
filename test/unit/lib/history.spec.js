import History from '@/lib/history'

describe('History', () => {
  const recommendation = new History(1000)

  describe('scaleDate', () => {
    it('converts milliseconds to the specified history chunk', () => {
      expect(recommendation.scaleDate(1000)).toEqual(1)
    })

    it('rounds decimals (down)', () => {
      expect(recommendation.scaleDate(1400)).toEqual(1)
    })

    it('rounds decimals (up)', () => {
      expect(recommendation.scaleDate(1500)).toEqual(2)
    })

    it('works with other numbers', () => {
      expect(recommendation.scaleDate(3721931)).toEqual(3722)
    })

    it('converts date objets to time if not already a number', () => {
      const date = new Date('December 18, 1992 18:30:00')
      expect(recommendation.scaleDate(date.getTime())).toEqual(724732200)
      expect(recommendation.scaleDate(date)).toEqual(724732200)
    })
  })
})
