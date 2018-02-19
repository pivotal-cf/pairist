import store from "@/store/team/history"

describe("History Store", () => {
  describe("mutations", () => {
    describe("setRef", () => {
      it("sets the ref", () => {
        const ref = { ref: "ref" }
          , state = {}

        store.mutations.setRef(state, ref)
        expect(state.ref).toBe(ref)
      })
    })
  })

  describe("getters", () => {
    describe("all", () => {
      it("returns the history from the state", () => {
        const history = { history: "history" }

        expect(store.getters.all({ history })).toBe(history)
      })
    })
  })

  describe("actions", () => {
    describe("save", () => {
      it("pushes 'current' from the root state into the ref", async () => {
        const set = jest.fn()
          , commit = jest.fn()
          , child = jest.fn().mockReturnValue({ set })
          , current = { ".key": "akey", "some": ["unique", "properties" ] }
          , state = { ref: { child } }
          , rootGetters = { current }

        const now = 11111111
        Date.now = jest.fn().mockReturnValue(now)

        const savePromise = store.actions.save({ commit, state, rootGetters })
        await savePromise
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith(11111)
        expect(set).toHaveBeenCalledTimes(1)
        expect(set).toHaveBeenCalledWith({ some: ["unique", "properties" ] })
      })

      it("notifies history recording success", async () => {
        const set = jest.fn()
          , commit = jest.fn()
          , child = jest.fn().mockReturnValue({ set })
          , current = {}
          , state = { ref: { child } }
          , rootGetters = { current }

        const savePromise = store.actions.save({ commit, state, rootGetters })
        expect(commit).toHaveBeenCalledTimes(1) // 1 for loading
        await savePromise
        expect(commit).toHaveBeenCalledTimes(3) // 2 for loading
        expect(commit).toHaveBeenCalledWith("notify", {
          message: "History recorded!",
          color: "success",
        }, { root: true })
      })

      it("toggles loading", async () => {
        const set = jest.fn()
          , commit = jest.fn()
          , child = jest.fn().mockReturnValue({ set })
          , current = {}
          , state = { ref: { child } }
          , rootGetters = { current }

        const savePromise = store.actions.save({ commit, state, rootGetters })
        expect(commit).toHaveBeenCalledTimes(1) // 1 for loading
        expect(commit).toHaveBeenCalledWith("loading", true, { root: true })
        await savePromise
        expect(commit).toHaveBeenCalledTimes(3) // 2 for loading
        expect(commit).toHaveBeenCalledWith("loading", false, { root: true })
      })
    })
  })
})
