jest.mock("@/firebase", () => {
  const firebasemock = require("firebase-mock")

  const mockdatabase = new firebasemock.MockFirebase()
  const mockauth = new firebasemock.MockFirebase()
  const mocksdk = new firebasemock.MockFirebaseSdk(path => {
    return path ? mockdatabase.child(path) : mockdatabase
  }, () => {
    return mockauth
  })

  const firebaseApp = mocksdk.initializeApp() // can take a path arg to database url
  const db = firebaseApp.database()

  global.db = db

  return { firebaseApp, db }
})

jest.mock("vuexfire", () => {
  return {
    firebaseAction: (action) => {
      return (stuff, args) => {
        return action(stuff, args)
      }
    },
    firebaseMutations: {},
  }
})

jest.mock("@/store/team/recommendation", () => {
  global.calculateMovesToBestPairing = jest.fn()
  return {
    calculateMovesToBestPairing: global.calculateMovesToBestPairing,
    toDate(date) { return new Date(date) },
  }
})

import store from "@/store/team/index"
import constants from "@/lib/constants"

describe("Team Store", () => {
  describe("mutations", () => {
    describe("authorize", () => {
      it("sets both read and write states", () => {
        const read = { read: null }, write = { write: null }
          , payload = { read, write }
          , state = {}

        store.mutations.authorize(state, payload)
        expect(state.canRead).toBe(read)
        expect(state.canWrite).toBe(write)
      })
    })
  })

  describe("getters", () => {
    describe("current", () => {
      it("returns the current state", () => {
        const current = { current: null }

        expect(store.getters.current({ current })).toBe(current)
      })
    })

    describe("canRead", () => {
      it("returns the canRead state", () => {
        const canRead = { canRead: null }

        expect(store.getters.canRead({ canRead })).toBe(canRead)
      })
    })

    describe("canWrite", () => {
      it("returns the canWrite state", () => {
        const canWrite = { canWrite: null }

        expect(store.getters.canWrite({ canWrite })).toBe(canWrite)
      })
    })
  })

  describe("actions", () => {
    describe("loadTeamRefs", () => {
      it("binds current ref", () => {
        const commit = jest.fn()
          , dispatch = jest.fn()
          , bindFirebaseRef = jest.fn()

        store.actions.loadTeamRefs({ bindFirebaseRef, commit, dispatch, state: {} }, global.db.ref("/teams/my-team/current"))

        expect(bindFirebaseRef).toHaveBeenCalledTimes(1)
        expect(bindFirebaseRef)
          .toHaveBeenCalledWith("current", global.db.ref("/teams/my-team/current"))
      })

      it("dispatches ref for child stores", () => {
        const commit = jest.fn()
          , dispatch = jest.fn()
          , bindFirebaseRef = jest.fn()
          , state = {}

        store.actions.loadTeamRefs({ bindFirebaseRef, commit, dispatch, state }, global.db.ref("/teams/my-team/current"))

        expect(dispatch)
          .toHaveBeenCalledWith(
            "people/setRef",
            global.db.ref("/teams/my-team/current/people").orderByChild("updatedAt"),
          )

        expect(dispatch)
          .toHaveBeenCalledWith(
            "tracks/setRef",
            global.db.ref("/teams/my-team/current/tracks").orderByChild("updatedAt"),
          )

        expect(dispatch)
          .toHaveBeenCalledWith(
            "roles/setRef",
            global.db.ref("/teams/my-team/current/roles").orderByChild("updatedAt"),
          )

        expect(dispatch)
          .toHaveBeenCalledWith(
            "lanes/setRef",
            global.db.ref("/teams/my-team/current/lanes"),
          )
      })
    })

    describe("loadTeam", () => {
      it("loads refs for team history and public", () => {
        const commit = jest.fn()
          , dispatch = jest.fn()
          , bindFirebaseRef = jest.fn()
          , state = {}

        store.actions.loadTeam({ bindFirebaseRef, commit, dispatch, state }, "my-team")
        expect(dispatch)
          .toHaveBeenCalledWith(
            "loadTeamRefs",
            global.db.ref("/teams/my-team/current"),
          )

        expect(dispatch)
          .toHaveBeenCalledWith(
            "history/setRef",
            global.db.ref("/teams/my-team/history").orderByKey().limitToLast(100),
          )

        expect(bindFirebaseRef)
          .toHaveBeenCalledWith("public", global.db.ref("/teams/my-team/public"))
      })
    })

    fdescribe("loadState", () => {
      it("loads current state back if offset is 0", () => {
        const commit = jest.fn()
          , dispatch = jest.fn()
          , state = { teamName: "my-team" }
          , getters = {
            "history/all": [ { ".key": "123" } ],
          }

        store.actions.loadState({ commit, dispatch, state, getters }, 0)
        expect(dispatch)
          .toHaveBeenCalledWith(
            "loadTeamRefs",
            global.db.ref("/teams/my-team/current"),
          )

        expect(state.showingDate).toBeNull()
      })

      it("loads in ref from history when offset is negative", () => {
        const commit = jest.fn()
          , dispatch = jest.fn()
          , state = { teamName: "my-team" }
          , getters = {
            "history/all": [ { ".key": "123" } ],
          }

        store.actions.loadState({ commit, dispatch, state, getters }, -1)
        expect(dispatch)
          .toHaveBeenCalledWith(
            "loadTeamRefs",
            global.db.ref("/teams/my-team/history/123"),
          )

        expect(state.showingDate).toEqual("Fri Jan 01 0123 at 00:00:00 GMT-0800 (PST)")
      })
    })

    describe("authorize", () => {
      it("authorizes users with read and write permissions", async () => {
        const commit = jest.fn()
        const prom = store.actions.authorize({ commit }, "tubers")
        global.db.ref("/teams/tubers/writecheck").flush()
        await prom

        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith("authorize", { read: true, write: true})
      })

      it("handles someone being unable to write but able to read", async () => {
        const commit = jest.fn()
        global.db.ref("/teams/pika/writecheck").failNext("set", new Error("foo"))
        global.db.ref("/teams/pika/public").autoFlush()
        global.db.ref("/teams/pika/writecheck").autoFlush()

        const prom = store.actions.authorize({ commit }, "pika")
        await prom

        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith("authorize", { read: true, write: false })
      })

      it("handles users who have neither read nor write permissions", async () => {
        const commit = jest.fn()
        global.db.ref("/teams/chu/writecheck").failNext("set", new Error("write"))
        global.db.ref("/teams/chu/public").failNext("once", new Error("read"))
        global.db.ref("/teams/chu/writecheck").autoFlush()
        global.db.ref("/teams/chu/public").autoFlush()

        const prom = store.actions.authorize({ commit }, "chu")
        await prom

        expect(commit).toHaveBeenCalledTimes(2)
        expect(commit).toHaveBeenCalledWith("authorize", { read: false, write: false })
        expect(commit).toHaveBeenCalledWith("notify", {
          message: "You don't have permissions to view this team.",
          color: "error",
        })
      })
    })
  })

  describe("move", () => {
    it("moves the entity to the passed location", () => {
      const key = "entity-key"
        , targetKey = "target-key"
        , getters = jest.fn()
        , dispatch = jest.fn()

      store.actions.move({ getters, dispatch }, { type: "banana", key, targetKey })

      expect(dispatch).toHaveBeenCalledTimes(2)
      expect(dispatch).toHaveBeenCalledWith("banana/move", { key, location: targetKey })
      expect(dispatch).toHaveBeenCalledWith("lanes/clearEmpty")
    })

    it("moves a non-person to unassigned when trying to move to out", () => {
      const key = "entity-key"
        , targetKey = constants.LOCATION.OUT
        , getters = jest.fn()
        , dispatch = jest.fn()

      store.actions.move({ getters, dispatch }, { type: "banana", key, targetKey })

      expect(dispatch).toHaveBeenCalledTimes(2)
      expect(dispatch).toHaveBeenCalledWith("banana/move", { key, location: constants.LOCATION.UNASSIGNED })
      expect(dispatch).toHaveBeenCalledWith("lanes/clearEmpty")
    })

    it("moves a person to out", () => {
      const key = "person"
        , targetKey = constants.LOCATION.OUT
        , getters = jest.fn()
        , dispatch = jest.fn()

      store.actions.move({ getters, dispatch }, { type: "people", key, targetKey })

      expect(dispatch).toHaveBeenCalledTimes(2)
      expect(dispatch).toHaveBeenCalledWith("people/move", { key, location: constants.LOCATION.OUT })
      expect(dispatch).toHaveBeenCalledWith("lanes/clearEmpty")
    })

    it("moves entity to unassigned if target is falsy", () => {
      const key = "carrot"
        , targetKey = null
        , getters = jest.fn()
        , dispatch = jest.fn()

      store.actions.move({ getters, dispatch }, { type: "vegetables", key, targetKey })

      expect(dispatch).toHaveBeenCalledTimes(2)
      expect(dispatch).toHaveBeenCalledWith("vegetables/move", { key, location: constants.LOCATION.UNASSIGNED })
      expect(dispatch).toHaveBeenCalledWith("lanes/clearEmpty")
    })

    it("creates and moves entity to new-lane if requested", async () => {
      const key = "chicken"
        , targetKey = "new-lane"
        , newLaneKey = "my-favorite-lane"
        , getters = { "lanes/lastAddedKey": newLaneKey }
        , dispatch = jest.fn()


      const prom = store.actions.move({ getters, dispatch }, { type: "animals", key, targetKey })
      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(dispatch).toHaveBeenCalledWith("lanes/add")

      await prom

      expect(dispatch).toHaveBeenCalledTimes(3)
      expect(dispatch).toHaveBeenCalledWith("animals/move", { key, location: newLaneKey })
      expect(dispatch).toHaveBeenCalledWith("lanes/clearEmpty")
    })

    describe("applyPairing", () => {
      it("does nothing and notifies when no actions are needed", () => {
        const dispatch = jest.fn()
          , commit = jest.fn()
          , getters = {}
          , pairsAndLanes = []

        store.actions.applyPairing({ commit, dispatch, getters }, pairsAndLanes)
        expect(dispatch).toHaveBeenCalledTimes(0)
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith("notify", {
          message: "Pairing setting is already the optimal one. No actions taken",
          color: "accent",
        })
      })

      it("dispatches moves for each person to their assigned lanes", () => {
        const dispatch = jest.fn()
          , commit = jest.fn()
          , getters = {}
          , pairsAndLanes = [
            { pair: ["p1", "p2"], lane: "l1" },
            { pair: ["p3", "p4"], lane: "l2" },
            { pair: ["p5"], lane: "l3" },
          ]

        store.actions.applyPairing({ commit, dispatch, getters }, pairsAndLanes)
        expect(dispatch).toHaveBeenCalledTimes(5)
        expect(dispatch).toHaveBeenCalledWith("move", {
          type: "people",
          key: "p1",
          targetKey: "l1",
        })
        expect(dispatch).toHaveBeenCalledWith("move", {
          type: "people",
          key: "p2",
          targetKey: "l1",
        })
        expect(dispatch).toHaveBeenCalledWith("move", {
          type: "people",
          key: "p3",
          targetKey: "l2",
        })
        expect(dispatch).toHaveBeenCalledWith("move", {
          type: "people",
          key: "p4",
          targetKey: "l2",
        })
        expect(dispatch).toHaveBeenCalledWith("move", {
          type: "people",
          key: "p5",
          targetKey: "l3",
        })
      })

      it("creates a new lane and moves if necessary", async () => {
        const dispatch = jest.fn()
          , commit = jest.fn()
          , getters = { "lanes/lastAddedKey": "superlane" }
          , pairsAndLanes = [
            { pair: ["p1", "p2"], lane: "new-lane" },
          ]

        await store.actions.applyPairing({ commit, dispatch, getters }, pairsAndLanes)
        expect(dispatch).toHaveBeenCalledTimes(3)
        expect(dispatch).toHaveBeenCalledWith("lanes/add")
        expect(dispatch).toHaveBeenCalledWith("move", {
          type: "people",
          key: "p1",
          targetKey: "superlane",
        })
        expect(dispatch).toHaveBeenCalledWith("move", {
          type: "people",
          key: "p2",
          targetKey: "superlane",
        })
      })
    })

    describe("recommendPairs", () => {
      it("dispatches applyPairing with recommended moves", () => {
        const dispatch = jest.fn()
          , commit = jest.fn()
          , getters = {
            "history/all": [1, 2, 3],
            "people/all": [4, 5, 6],
            "lanes/all": [7, 8, 9],
          }
          , moves = { moves: null }

        global.calculateMovesToBestPairing.mockReturnValue(moves)

        store.actions.recommendPairs({ commit, dispatch, getters })

        expect(global.calculateMovesToBestPairing).toHaveBeenCalledTimes(1)
        expect(global.calculateMovesToBestPairing).toHaveBeenCalledWith({
          history: [1, 2, 3],
          current: {
            people: [4, 5, 6],
            lanes: [7, 8, 9],
          },
        })
        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledTimes(0)
      })

      it("notifies no pairing assignment can be made", () => {
        const dispatch = jest.fn()
          , commit = jest.fn()
          , getters = { "history/all": [], "people/all": [], "lanes/all": [] }
          , moves = null

        global.calculateMovesToBestPairing.mockReturnValue(moves)

        store.actions.recommendPairs({ commit, dispatch, getters })

        expect(global.calculateMovesToBestPairing)
          .toHaveBeenCalledWith({ history: [], current: { people: [], lanes: [] } })
        expect(dispatch).toHaveBeenCalledTimes(0)
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith("notify", {
          message: "Cannot make a valid pairing assignment. Do you have too many lanes?",
          color: "warning",
        })
      })

      it("catches errors and notifies", () => {
        const dispatch = jest.fn()
          , commit = jest.fn()
          , getters = { "history/all": [], "people/all": [], "lanes/all": [] }

        global.calculateMovesToBestPairing.mockImplementation(() => { throw new Error("recommend") })

        store.actions.recommendPairs({ commit, dispatch, getters })

        expect(global.calculateMovesToBestPairing)
          .toHaveBeenCalledWith({ history: [], current: { people: [], lanes: [] } })
        expect(dispatch).toHaveBeenCalledTimes(0)
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith("notify", {
          message: "Error finding best pair setting.",
          color: "error",
        })
      })
    })
  })
})
