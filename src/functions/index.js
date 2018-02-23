import 'babel-polyfill'

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import Recommendation from './lib/recommendation'
const historyChunkDuration = parseInt(functions.config().pairist.history_chunk_duration)
const recommendation = new Recommendation({ historyChunkDuration })

admin.initializeApp(functions.config().firebase)

export const saveHistory = functions.database.ref('/teams/{teamName}/current').onWrite(async (event) => {
  if (functions.config().config.skipRecording) {
    console.log('Not recording history because config.skipRecording was set')
  }

  console.log(`| _START: Recording history for team ${event.params.teamName} (chunk duration: ${historyChunkDuration})`)
  const current = (await event.data.ref.once('value')).val()
  const historyKey = recommendation.scaleDate(Date.now())

  try {
    await event.data.ref.parent.child('history').child(historyKey).set(current)
    console.log(`| ___SET: /teams/${event.params.teamName}/history/${historyKey}`)
  } catch (error) {
    console.error(`| ___SET: /teams/${event.params.teamName}/history/${historyKey}`, error)
  }

  try {
    await event.data.ref.parent.child('history').child(historyKey - 2).remove()
    console.log(`| DELETE: /teams/${event.params.teamName}/history/${historyKey - 2}`)
  } catch (_) { /* don't care if can't delete matching history */ }
  try {
    await event.data.ref.parent.child('history').child(historyKey - 1).remove()
    console.log(`| DELETE: /teams/${event.params.teamName}/history/${historyKey - 1}`)
  } catch (_) { /* don't care if can't delete matching history */ }

  console.log(`| FINISH: Recording history for team ${event.params.teamName}`)
})
