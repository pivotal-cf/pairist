import { firebaseMutations, firebaseAction } from "vuexfire"

import { db } from "@/firebase"

import Recommendation from "@/lib/recommendation"
import constants from "@/lib/constants"

const HISTORY_CHUNK_DURATION = process.env.NODE_ENV === "production"
  ? 3600000 // 1 hour
  : process.env.NODE_ENV === "testing"
    ? 1000  // 1 second
    : 10000 // 10 seconds

const recommendation = new Recommendation({
  historyChunkDuration: HISTORY_CHUNK_DURATION,
})

export default {
  state: {
    current: null,
    history: [],

    roles: [],
    tracks: [],
    people: [],
    lanes: [],

    rolesRef: null,
  },

  mutations: {
    setRef(state, {name, ref}) { state[`${name}Ref`] = ref },
    ...firebaseMutations,
  },

  getters: {
    current(state) {
      return state.current
    },

    roles(state) {
      return state.roles
    },
    unassignedRoles(_, getters) {
      return getters.rolesInLocation(constants.LOCATION.UNASSIGNED)
    },
    rolesInLocation(_, getters) {
      return location => (
        getters.roles.filter(role => role.location === location)
      )
    },

    tracks(state) {
      return state.tracks
    },
    unassignedTracks(_, getters) {
      return getters.tracksInLocation(constants.LOCATION.UNASSIGNED)
    },
    tracksInLocation(_, getters) {
      return location => (
        getters.tracks.filter(track => track.location === location)
      )
    },

    people(state) {
      return state.people
    },
    unassignedPeople(_, getters) {
      return getters.peopleInLocation(constants.LOCATION.UNASSIGNED)
    },
    outPeople(_, getters) {
      return getters.peopleInLocation(constants.LOCATION.OUT)
    },
    peopleInLocation(_, getters) {
      return location => (
        getters.people.filter(person => person.location === location)
      )
    },

    lanes(state, getters) {
      return state.lanes.map(lane => (
        Object.assign({
          people: getters.peopleInLocation(lane[".key"]),
          tracks: getters.tracksInLocation(lane[".key"]),
          roles: getters.rolesInLocation(lane[".key"]),
        }, lane)
      ))
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
        people: currentRef.child("people").orderByChild("updatedAt"),
        tracks: currentRef.child("tracks").orderByChild("updatedAt"),
        roles: currentRef.child("roles").orderByChild("updatedAt"),
        lanes: currentRef.child("lanes"),
        history: historyRef.orderByKey().limitToLast(100),
      }

      for (const name in refs) {
        dispatch("setRef", { name, ref: refs[name].ref })
      }

      await currentRef.once("value")
      commit("loading", false)
    },

    setRef: firebaseAction(({ bindFirebaseRef, commit }, { name, ref }) => {
      bindFirebaseRef(name , ref)
      commit("setRef", { name, ref })
    }),

    async savePerson({ commit, state }, person) {
      if (person.name === "") {
        return
      }

      commit("loading", true)
      if (person[".key"]) {
        const personKey = person[".key"]
        delete person[".key"]

        await state.peopleRef.child(personKey).set(person)
      } else {
        await state.peopleRef.push({
          name: person.name,
          picture: person.picture || "",
          location: constants.LOCATION.UNASSIGNED,
          updatedAt: new Date().getTime(),
        })
      }
      commit("loading", false)
    },

    async addRole({ commit, state }, { name }) {
      if (name === "") {
        return
      }

      commit("loading", true)
      await state.rolesRef
        .push({
          name,
          location: constants.LOCATION.UNASSIGNED,
          updatedAt: new Date().getTime(),
        })
      commit("loading", false)
    },

    async addTrack({ commit, state }, { name }) {
      if (name === "") {
        return
      }

      commit("loading", true)
      await state.tracksRef
        .push({
          name,
          location: constants.LOCATION.UNASSIGNED,
          updatedAt: new Date().getTime(),
        })
      commit("loading", false)
    },

    removeRole({ dispatch, state }, key ) {
      state.rolesRef.child(key).remove()
      dispatch("clearEmptylanes")
    },

    removeTrack({ dispatch, state }, key ) {
      state.tracksRef.child(key).remove()
      dispatch("clearEmptylanes")
    },

    removePerson({ dispatch, state }, key ) {
      state.peopleRef.child(key).remove()
      dispatch("clearEmptylanes")
    },

    removeLane({ state }, key ) {
      state.lanesRef.child(key).remove()
    },

    clearEmptylanes({ dispatch, getters }) {
      getters.lanes.forEach(lane => {
        if (lane.people.length === 0 && lane.tracks.length === 0 && lane.roles.length === 0) {
          dispatch("removeLane", lane[".key"])
        }
      })
    },

    newLane({ state }) {
      return state.lanesRef.push({ sortOrder: 0 })
    },

    move({ dispatch, state }, { type, key, targetKey }) {
      let ref, collection
      switch (type) {
      case "people":
        ref = state.peopleRef
        collection = state.people
        break
      case "roles":
        ref = state.rolesRef
        collection = state.roles
        break
      case "tracks":
        ref = state.tracksRef
        collection = state.tracks
        break
      default:
        return
      }

      if (type !== "people" && targetKey === constants.LOCATION.OUT) {
        targetKey = constants.LOCATION.UNASSIGNED
      }

      const thing = { ...collection.find(thing => thing[".key"] === key) }
      delete thing[".key"]

      if (targetKey == "new-lane") {
        const newLaneKey = state.lanesRef.push({ sortOrder: 0 }).key

        thing.location = newLaneKey
      } else if (targetKey) {
        thing.location = targetKey
      } else {
        thing.location = constants.LOCATION.UNASSIGNED
      }

      thing.updatedAt = new Date().getTime()

      ref.child(key).set(thing)
      dispatch("clearEmptylanes")
    },

    applyPairing({ commit, dispatch, state }, pairsAndLanes) {
      let actionsTaken = 0
      pairsAndLanes.forEach(({ pair, lane }) => {
        if (lane === "new-lane") {
          lane = state.lanesRef.push({ sortOrder: 0 }).key
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

    toggleLockLane({ state }, lane) {
      return state.lanesRef.child(lane[".key"]).child("locked").set(!lane.locked)
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

    async recommendPairs({ commit, dispatch, state }) {
      commit("loading", true)
      try {
        const bestPairing = recommendation.findBestPairing({
          history: state.history.slice(),
          current: {
            people: state.people.slice(),
            lanes: state.lanes.slice(),
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
