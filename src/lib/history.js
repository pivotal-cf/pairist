export default class History {
  constructor (chunkDuration) {
    this.chunkDuration = chunkDuration
  }

  toDate (scaled) {
    return new Date(parseInt(scaled) * this.chunkDuration)
  }

  scaleDate (date) {
    return parseInt((date / this.chunkDuration).toFixed(0))
  }
}
