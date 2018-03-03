import History from '@/lib/history'

export default new History(
  parseInt(process.env.VUE_APP_HISTORY_CHUNK_DURATION || '3600000'),
)
