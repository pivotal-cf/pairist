import Recommendation from "@/lib/recommendation"

export default new Recommendation({
  historyChunkDuration: parseInt(process.env.VUE_APP_HISTORY_CHUNK_DURATION || "3600000"),
})
