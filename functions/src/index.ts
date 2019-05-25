import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

class History {
  chunkDuration : number

  constructor (chunkDuration : number) {
    this.chunkDuration = chunkDuration
  }

  toDate (scaled : string) {
    return new Date(parseInt(scaled) * this.chunkDuration)
  }

  scaleDate (date : number) {
    return parseInt((date / this.chunkDuration).toFixed(0))
  }
}

const historyChunkDuration = parseInt(functions.config().pairist.history_chunk_duration)
const history = new History(historyChunkDuration)

admin.initializeApp(functions.config().firebase)

export const saveHistory = functions.database.ref('/teams/{teamName}/current').onWrite(async (change, context) => {
  if (functions.config().config.skipRecording) {
    console.log('Not recording history because config.skipRecording was set')
  }
  if (!change.after.exists()) { return }

  console.log(`| _START: Recording history for team ${context.params.teamName} (chunk duration: ${historyChunkDuration})`)
  const current = change.after.val()
  const historyKey = history.scaleDate(Date.now())
  if (!historyKey) { return }

  const parent = change.after.ref.parent

  try {
    await parent!.child('history').child(historyKey.toString()).set(current)
    console.log(`| ___SET: /teams/${context.params.teamName}/history/${historyKey}`)
  } catch (error) {
    console.error(`| ___SET: /teams/${context.params.teamName}/history/${historyKey}`, error)
  }

  try {
    await parent!.child('history').child((historyKey - 2).toString()).remove()
    console.log(`| DELETE: /teams/${context.params.teamName}/history/${historyKey - 2}`)
  } catch (_) { /* don't care if can't delete matching history */ }
  try {
    await parent!.child('history').child((historyKey - 1).toString()).remove()
    console.log(`| DELETE: /teams/${context.params.teamName}/history/${historyKey - 1}`)
  } catch (_) { /* don't care if can't delete matching history */ }

  console.log(`| FINISH: Recording history for team ${context.params.teamName}`)
})
