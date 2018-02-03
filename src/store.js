import Vue from "vue"
import Vuex from "vuex"
import { firebaseMutations, firebaseAction } from "vuexfire"
import _ from "lodash"

import { db } from "@/firebase"

import { findBestPairing, findMatchingLanes, scaleDate } from "@/lib/recommendation"

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    current: null,
    history: [],

    roles: [],
    tracks: [],
    people: [],
    lanes: [],

    snackbar: false,
    snackbarColor: "",
    snackbarText: "",

    loading: false,

    rolesRef: null,
  },

  mutations: {
    "set-ref": (state, {name, ref}) => {
      state[`${name}Ref`] = ref
    },

    "loading": (state, value) => {
      state.loading = value
    },

    "set-snackbar": (state, value) => {
      state.snackbar = value
    },

    "notify": (state, { message, color }) => {
      state.snackbarText = message
      state.snackbarColor = color
      state.snackbar = true
    },

    ...firebaseMutations,
  },

  getters: {
    roles(state) {
      return state.roles
    },
    unassignedRoles(_, getters) {
      return getters.rolesInLocation("unassigned")
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
      return getters.tracksInLocation("unassigned")
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
      return getters.peopleInLocation("unassigned")
    },
    outPeople(_, getters) {
      return getters.peopleInLocation("out")
    },
    availablePeople(_, getters) {
      const people = getters.people.filter(person => person.location !== "out")
      return people.filter(person => (
        !getters.lanes.some(lane => lane[".key"] === person.location && lane.locked)
      ))
    },
    peopleInLocation(_, getters) {
      return location => (
        getters.people.filter(person => person.location === location)
      )
    },

    solos(__, getters) {
      const people = getters.availablePeople.filter(person =>  person.location !== "unassigned")
      return _.flatten(
        Object.values(_.groupBy(people, "location"))
          .filter(group => group.length === 1)
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
    switchToTeam: async ({ commit, dispatch }, teamName) => {
      commit("loading", true)
      const currentRef = db.ref(`/teams/${teamName}/current`)
      const historyRef = db.ref(`/teams/${teamName}/history`)

      const refs = {
        current: currentRef,
        people: currentRef.child("people").orderByChild("updatedAt"),
        tracks: currentRef.child("tracks").orderByChild("updatedAt"),
        roles: currentRef.child("roles").orderByChild("updatedAt"),
        lanes: currentRef.child("lanes"),
        history: historyRef.orderByKey().limitToLast(30),
      }

      for (const name in refs) {
        dispatch("setRef", { name, ref: refs[name].ref })
      }

      await currentRef.once("value")
      commit("loading", false)
    },

    setRef: firebaseAction(({ bindFirebaseRef, commit }, { name, ref }) => {
      bindFirebaseRef(name , ref, { wait: true })
      commit("set-ref", { name, ref })
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
          location: "unassigned",
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
          location: "unassigned",
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
          location: "unassigned",
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

    removeLane({ dispatch, state }, key ) {
      state.lanesRef.child(key).remove()
      dispatch("clearEmptylanes")
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

      if (type !== "people" && targetKey === "out") {
        targetKey = "unassigned"
      }

      const thing = { ...collection.find(thing => thing[".key"] === key) }
      delete thing[".key"]

      if (targetKey == "new-lane") {
        const newLaneKey = state.lanesRef.push({ sortOrder: 0 }).key

        thing.location = newLaneKey
      } else if (targetKey) {
        thing.location = targetKey
      } else {
        thing.location = "unassigned"
      }

      thing.updatedAt = new Date().getTime()

      ref.child(key).set(thing)
      dispatch("clearEmptylanes")
    },

    applyPairing({ commit, dispatch, state, getters }, pairing) {
      const pairsAndLanes = findMatchingLanes({
        pairing,
        lanes: getters.lanes.filter(({ locked }) => !locked),
        people: getters.availablePeople,
      })

      let getNextLane = () => {
        const emptyLane = getters.lanes.find(lane => !lane.locked && lane.people.length === 0)
        if (emptyLane) {
          return emptyLane[".key"]
        }
        return state.lanesRef.push({ sortOrder: 0 }).key
      }

      let actionsTaken = 0
      pairsAndLanes.forEach(({ pair, lane }) => {
        lane = lane || getNextLane()
        pair.forEach(person => {
          if (person.location !== lane) {
            dispatch("move", { type: "people", key: person[".key"], targetKey: lane })
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
      const key = scaleDate(new Date().getTime())
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

    async recommendPairs({ commit, dispatch, state, getters }) {
      commit("loading", true)
      try {
        const bestPairing = await findBestPairing({
          history: state.history,
          people: getters.availablePeople,
          lanes: getters.lanes.filter(({ locked }) => !locked),
          solos: getters.solos,
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
})

export default store
