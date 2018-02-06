import store from "@/store/team/lanes"

describe("Lanes Store", () => {
  describe("mutations", () => {
    describe("setRef", () => {
      it("sets the ref", () => {
        const ref = { ref: "ref" }
          , state = {}

        store.mutations.setRef(state, ref)
        expect(state.ref).toBe(ref)
      })
    })

    describe("laneAdded", () => {
      it("sets lastAddedKey state", () => {
        const lastAddedKey = { lastAddedKey: "lastAddedKey" }
          , state = {}

        store.mutations.laneAdded(state, lastAddedKey)
        expect(state.lastAddedKey).toBe(lastAddedKey)
      })
    })
  })

  describe("getters", () => {
    describe("all", () => {
      it("returns the lanes from the state with entities from root", () => {
        const lanes = [
            { ".key": 1 }, { ".key": 2 }, { ".key": 3 },
          ]
          , rootGetters = {
            "people/inLocation": jest.fn().mockImplementation((key) => ({ people: key })),
            "tracks/inLocation": jest.fn().mockImplementation((key) => ({ tracks: key })),
            "roles/inLocation": jest.fn().mockImplementation((key) => ({ roles: key })),
          }

        const result = store.getters.all({ lanes }, null, null, rootGetters)
        expect(result).toEqual([
          { ".key": 1, "people": { people: 1 }, "tracks": { tracks: 1 }, "roles": { roles: 1 } },
          { ".key": 2, "people": { people: 2 }, "tracks": { tracks: 2 }, "roles": { roles: 2 } },
          { ".key": 3, "people": { people: 3 }, "tracks": { tracks: 3 }, "roles": { roles: 3 } },
        ])
      })
    })

    describe("lastAddedKey", () => {
      it("returns the last added key", () => {
        const lastAddedKey = { lastAddedKey: "lastAddedKey" }

        expect(store.getters.lastAddedKey({ lastAddedKey })).toBe(lastAddedKey)
      })
    })
  })

  describe("actions", () => {
    describe("add", () => {
      it("pushes the lane into the ref", () => {
        const push = jest.fn().mockReturnValue({ key: "the-key" })
          , commit = jest.fn()
          , state = { ref: { push } }

        store.actions.add({ commit, state })
        expect(push).toHaveBeenCalledTimes(1)
        expect(push).toHaveBeenCalledWith({ sortOrder: 0 })
      })

      it("commits the lane back to added", () => {
        const push = jest.fn().mockReturnValue({ key: "the-key" })
          , commit = jest.fn()
          , state = { ref: { push } }

        store.actions.add({ commit, state }, { name: "" })
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith("laneAdded", "the-key")
      })
    })

    describe("remove", () => {
      it("removes lane from ref", () => {
        const dispatch = jest.fn()
          , remove = jest.fn()
          , child = jest.fn().mockReturnValue({ remove })
          , state = { ref: { child } }

        store.actions.remove({ dispatch, state }, "key")
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith("key")
        expect(remove).toHaveBeenCalledTimes(1)
        expect(remove).toHaveBeenCalledWith()
      })
    })

    describe("setLocked", () => {
      it("sets the locked value (false)", () => {
        const dispatch = jest.fn()
          , update = jest.fn()
          , child = jest.fn().mockReturnValue({ update })
          , state = { ref: { child } }

        store.actions.setLocked({ dispatch, state }, { key: "key", locked: false })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith("key")
        expect(update).toHaveBeenCalledTimes(1)
        expect(update).toHaveBeenCalledWith({ locked: false })
      })

      it("sets the locked value (true)", () => {
        const dispatch = jest.fn()
          , update = jest.fn()
          , child = jest.fn().mockReturnValue({ update })
          , state = { ref: { child } }

        store.actions.setLocked({ dispatch, state }, { key: "other-key", locked: true })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith("other-key")
        expect(update).toHaveBeenCalledTimes(1)
        expect(update).toHaveBeenCalledWith({ locked: true })
      })
    })

    describe("clearEmpty", () => {
      it("dispatches remove for any lanes with no entites", () => {
        const lanes = [
            { ".key": 1, "people": [], "tracks": [], "roles": [] },
            { ".key": 2, "people": [2], "tracks": [], "roles": [] },
            { ".key": 3, "people": [], "tracks": [3], "roles": [] },
            { ".key": 4, "people": [], "tracks": [], "roles": [4] },
            { ".key": 5, "people": [5], "tracks": [5], "roles": [5] },
          ]
          , dispatch = jest.fn()
          , getters = { all: lanes }

        store.actions.clearEmpty({ dispatch, getters })
        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(dispatch).toHaveBeenCalledWith("remove", 1)
      })
    })
  })
})
