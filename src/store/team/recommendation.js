import Recommendation from "@/lib/recommendation"

const HISTORY_CHUNK_DURATION = process.env.NODE_ENV === "production"
  ? 3600000 // 1 hour
  : process.env.NODE_ENV === "testing"
    ? 1000  // 1 second
    : 10000 // 10 seconds

export default new Recommendation({
  historyChunkDuration: HISTORY_CHUNK_DURATION,
})
