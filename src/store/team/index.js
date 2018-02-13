import { firebaseMutations, firebaseAction } from "vuexfire"

import { db } from "@/firebase"

import constants from "@/lib/constants"
import people from "./people"
import roles from "./roles"
import tracks from "./tracks"
import lanes from "./lanes"
import history from "./history"
import lists from "./lists"

import recommendation from "./recommendation"

export default {
  modules: {
    people,
    roles,
    tracks,
    lanes,
    history,

    lists,
  },

  state: {
    current: null,
    canRead: false,
    canWrite: false,
  },

  mutations: {
    authorize(state, { read, write }) {
      state.canRead = read
      state.canWrite = write
    },

    ...firebaseMutations,
  },

  getters: {
    current(state) {
      return state.current
    },
    canRead(state) {
      return state.canRead
    },
    canWrite(state) {
      return state.canWrite
    },
  },

  actions: {
    loadTeam: firebaseAction(async ({ bindFirebaseRef, commit, dispatch }, teamName) => {
      commit("loading", true)
      const currentRef = db.ref(`/teams/${teamName}/current`)
      const historyRef = db.ref(`/teams/${teamName}/history`)

      bindFirebaseRef("current" , currentRef)

      dispatch("people/setRef",
        currentRef.child("people").orderByChild("updatedAt"))
      dispatch("tracks/setRef",
        currentRef.child("tracks").orderByChild("updatedAt"))
      dispatch("roles/setRef",
        currentRef.child("roles").orderByChild("updatedAt"))

      dispatch("lanes/setRef",
        currentRef.child("lanes"))

      dispatch("history/setRef",
        historyRef.orderByKey().limitToLast(100))

      dispatch("lists/setRef",
        db.ref(`/teams/${teamName}/lists`))

      await currentRef.once("value")
      commit("loading", false)
    }),

    async authorize({ commit }, teamName) {
      try {
        await db.ref(`/teams/${teamName}/writecheck`).set(0)
        commit("authorize", { read: true, write: true })
        return
      } catch(error) {
        try {
          await db.ref(`/teams/${teamName}/public`).once("value")
          commit("authorize", { read: true, write: false })
        } catch(error) {
          commit("authorize", { read: false, write: false })
          commit("notify", {
            message: "You don't have permissions to view this team.",
            color: "error",
          })
        }
      }
    },

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

        pair.forEach(personKey => {
          dispatch("move", {
            type: "people",
            key: personKey,
            targetKey: lane,
          })
          actionsTaken++
        })
      })
      if (actionsTaken === 0) {
        commit("notify", {
          message: "Pairing setting is already the optimal one. No actions taken",
          color: "accent",
        })
      }
    },

    recommendPairs({ commit, dispatch, getters}) {
      try {
        const moves = recommendation.calculateMovesToBestPairing({
          history: getters["history/all"].slice(),
          current: {
            people: getters["people/all"].slice(),
            lanes: getters["lanes/all"].slice(),
          },
        })

        if (moves) {
          dispatch("applyPairing", moves)
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
      }
    },
  },
}
