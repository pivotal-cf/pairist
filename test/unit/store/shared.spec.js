import store from "@/store/shared"

describe("Shared Store", () => {
  describe("mutations", () => {
    describe("loading", () => {
      it("sets the loading value", () => {
        const loading = {}
          , state = {}

        store.mutations.loading(state, loading)
        expect(state.loading).toBe(loading)
      })
    })

    describe("notify", () => {
      it("sets values for message and color", () => {
        const state = {}

        store.mutations.notify(state, { message: "test", color: "fuchsia" })
        expect(state.snackbarText).toBe("test")
        expect(state.snackbarColor).toBe("fuchsia")
      })
    })
  })

  describe("getters", () => {
    describe("snackbarText", () => {
      it("returns the snackbarText value", () => {
        const snackbarText = { snackbarText: null }

        expect(store.getters.snackbarText({ snackbarText })).toBe(snackbarText)
      })
    })

    describe("snackbarColor", () => {
      it("returns the snackbarColor value", () => {
        const snackbarColor = { snackbarColor: null }

        expect(store.getters.snackbarColor({ snackbarColor })).toBe(snackbarColor)
      })
    })

    describe("loading", () => {
      it("returns the loading value", () => {
        const loading = { loading: null }

        expect(store.getters.loading({ loading })).toBe(loading)
      })
    })
  })

  describe("actions", () => {
    describe("clearNotification", () => {
      it("commits an empty notification", () => {
        const commit = jest.fn()
        store.actions.clearNotification({ commit })
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith("notify", { message: null, color: null })
      })
    })
  })
})
