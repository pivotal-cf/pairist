import Vue from "vue"
import Vuex from "vuex"
import { firebaseMutations, firebaseAction } from "vuexfire"
import _ from "lodash"

import { db } from "@/firebase"

import { findMatchingLanes } from "@/lib/recommendation"


Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    roles: [],
    tracks: [],
    people: [],
    lanes: [],

    snackbar: false,
    snackbarColor: "",
    snackbarText: "",

    rolesRef: null,
  },

  mutations: {
    "set-refs": (state, refs) => {
      state.rolesRef = refs.roles
      state.tracksRef = refs.tracks
      state.peopleRef = refs.people
      state.lanesRef = refs.lanes
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
    switchToTeam: firebaseAction(({ bindFirebaseRef, commit }, teamName) => {
      const teamRef = db.ref(`/teams/${teamName}`)
      const currentRef = teamRef.child("current")
      const people = currentRef.child("people").orderByChild("updatedAt")
      const tracks = currentRef.child("tracks").orderByChild("updatedAt")
      const roles = currentRef.child("roles").orderByChild("updatedAt")
      const lanes = currentRef.child("lanes")

      commit("set-refs", {
        roles: roles.ref,
        tracks: tracks.ref,
        people: people.ref,
        lanes: lanes.ref,
      })
      bindFirebaseRef("roles", roles, { wait: true })
      bindFirebaseRef("tracks", tracks, { wait: true })
      bindFirebaseRef("people", people, { wait: true })
      bindFirebaseRef("lanes", lanes, { wait: true })
    }),

    savePerson({ state }, person) {
      if (person.name === "") {
        return
      }

      if (person[".key"]) {
        const personKey = person[".key"]
        delete person[".key"]

        state.peopleRef.child(personKey).set(person)
      } else {
        state.peopleRef.push({
          name: person.name,
          picture: person.picture || "",
          location: "unassigned",
          updatedAt: new Date().getTime(),
        })
      }
    },

    addRole({ state }, { name }) {
      if (name === "") {
        return
      }

      return state.rolesRef
        .push({
          name,
          location: "unassigned",
          updatedAt: new Date().getTime(),
        })
    },

    addTrack({ state }, { name }) {
      if (name === "") {
        return
      }

      return state.tracksRef
        .push({
          name,
          location: "unassigned",
          updatedAt: new Date().getTime(),
        })
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
          message: "Pairing setting is already the optimal one. No actoins taken",
          color: "accent",
        })
      }
    },

    toggleLockLane({ state }, lane) {
      return state.lanesRef.child(lane[".key"]).child("locked").set(!lane.locked)
    },
  },
})

export default store
