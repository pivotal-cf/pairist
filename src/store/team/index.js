import { firebaseMutations, firebaseAction } from "vuexfire"

import { db } from "@/firebase"

import Recommendation from "@/lib/recommendation"
import constants from "@/lib/constants"
import people from "./people"
import roles from "./roles"
import tracks from "./tracks"
import lanes from "./lanes"

const HISTORY_CHUNK_DURATION = process.env.NODE_ENV === "production"
  ? 3600000 // 1 hour
  : process.env.NODE_ENV === "testing"
    ? 1000  // 1 second
    : 10000 // 10 seconds

const recommendation = new Recommendation({
  historyChunkDuration: HISTORY_CHUNK_DURATION,
})

export default {
  modules: {
    people,
    roles,
    tracks,
    lanes,
  },

  state: {
    current: null,
    history: [],
  },

  mutations: {
    setRef(state, {name, ref}) { state[`${name}Ref`] = ref },
    ...firebaseMutations,
  },

  getters: {
    current(state) {
      return state.current
    },
  },

  actions: {
    async canRead({ commit }, teamName) {
      try {
        await db.ref(`/teams/${teamName}/public`).once("value")
        return true
      } catch(error) {
        commit("notify", {
          message: "You don't have permissions to view this team.",
          color: "error",
        })
        return false
      }
    },

    async loadTeam({ commit, dispatch }, teamName)  {
      commit("loading", true)
      const currentRef = db.ref(`/teams/${teamName}/current`)
      const historyRef = db.ref(`/teams/${teamName}/history`)

      const refs = {
        current: currentRef,
        history: historyRef.orderByKey().limitToLast(100),
      }

      for (const name in refs) {
        dispatch("setRef", { name, ref: refs[name].ref })
      }

      dispatch("people/setRef",
        currentRef.child("people").orderByChild("updatedAt").ref)
      dispatch("tracks/setRef",
        currentRef.child("tracks").orderByChild("updatedAt").ref)
      dispatch("roles/setRef",
        currentRef.child("roles").orderByChild("updatedAt").ref)

      dispatch("lanes/setRef",
        currentRef.child("lanes").ref)

      await currentRef.once("value")
      commit("loading", false)
    },

    setRef: firebaseAction(({ bindFirebaseRef, commit }, { name, ref }) => {
      bindFirebaseRef(name , ref)
      commit("setRef", { name, ref })
    }),

    async move({ getters, dispatch }, { type, key, targetKey }) {
      if (type !== "people" && targetKey === constants.LOCATION.OUT) {
        targetKey = constants.LOCATION.UNASSIGNED
      }

      let location

      if (targetKey == "new-lane") {
        await dispatch("lanes/add")
        location = getters["lanes/lastAddedKey"]
      } else if (targetKey) {
        location = targetKey
      } else {
        location = constants.LOCATION.UNASSIGNED
      }

      dispatch(`${type}/move`, { key, location })
      dispatch("lanes/clearEmpty")
    },

    applyPairing({ commit, getters, dispatch }, pairsAndLanes) {
      let actionsTaken = 0
      pairsAndLanes.forEach(async ({ pair, lane }) => {
        if (lane === "new-lane") {
          await dispatch("lanes/add")
          lane = getters["lanes/lastAddedKey"]
        }

        pair.forEach(person => {
          if (person && person.location !== lane) {
            dispatch("move", {
              type: "people",
              key: person[".key"],
              targetKey: lane,
            })
            actionsTaken++
          }
        })
      })
      if (actionsTaken === 0) {
        commit("notify", {
          message: "Pairing setting is already the optimal one. No actions taken",
          color: "accent",
        })
      }
    },

    async saveHistory({ commit, state }) {
      commit("loading", true)
      const key = recommendation.scaleDate(new Date())
      try {
        const current = Object.assign({}, state.current)
        delete current[".key"]
        await state.historyRef.child(key).set(current)
        commit("notify", {
          message: "History recorded!",
          color: "success",
        })
      } catch(error) {
        commit("notify", {
          message: "Error recording history.",
          color: "error",
        })
        console.error(error)
      }
      commit("loading", false)
    },

    async recommendPairs({ commit, dispatch, state, getters}) {
      commit("loading", true)
      try {
        const bestPairing = recommendation.findBestPairing({
          history: state.history.slice(),
          current: {
            people: getters["people/all"].slice(),
            lanes: getters["lanes/all"].slice(),
          },
        })

        if (bestPairing) {
          await dispatch("applyPairing", bestPairing)
        } else {
          commit("notify", {
            message: "Cannot make a valid pairing assignment. Do you have too many lanes?",
            color: "warning",
          })
        }
      } catch(error) {
        commit("notify", {
          message: "Error finding best pair setting.",
          color: "error",
        })
        console.error(error)
      }
      commit("loading", false)
    },
  },
}
