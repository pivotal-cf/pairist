import store from "@/store/team/roles"
import constants from "@/lib/constants"

describe("Roles Store", () => {
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
      it("returns the roles from the state", () => {
        const roles = { roles: "roles" }

        expect(store.getters.all({ roles })).toBe(roles)
      })
    })

    describe("inLocation", () => {
      it("returns a function that can filter by location", () => {
        const roles = [ { location: 1 }, { location: 2 }, {} ]
          , f = store.getters.inLocation(null, { all: roles })

        expect(f(1)).toEqual([{ location: 1 }])
        expect(f(2)).toEqual([{ location: 2 }])
      })
    })

    describe("unassigned", () => {
      it("selects roles that have unassigned as their location", () => {
        const f = jest.fn()

        store.getters.unassigned(null, { inLocation: f })
        expect(f).toHaveBeenCalledWith(constants.LOCATION.UNASSIGNED)
      })

      it("returns results from the inLocation getter", () => {
        const f = jest.fn()
          , roles = { roles: "roles" }

        f.mockReturnValue(roles)
        expect(store.getters.unassigned(null, { inLocation: f })).toBe(roles)
      })
    })
  })

  describe("actions", () => {
    describe("add", () => {
      it("pushes the role into the ref", () => {
        const push = jest.fn()
          , state = { ref: { push } }

        const now = 123456789
        Date.now = jest.fn().mockReturnValue(now)

        store.actions.add({ state }, { name: "role" })
        expect(push).toHaveBeenCalledTimes(1)
        expect(push).toHaveBeenCalledWith({
          name: "role",
          location: constants.LOCATION.UNASSIGNED,
          updatedAt: now,
        })
      })

      it("doesn't do anything if name is empty", () => {
        const push = jest.fn()
          , state = { ref: { push } }

        store.actions.add({ state }, { name: "" })
        expect(push).toHaveBeenCalledTimes(0)
      })
    })

    describe("remove", () => {
      it("removes role from ref", () => {
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

      it("dispatches a clear lanes action", () => {
        const dispatch = jest.fn()
          , remove = jest.fn()
          , child = jest.fn().mockReturnValue({ remove })
          , state = { ref: { child } }

        store.actions.remove({ dispatch, state }, "key")
        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(dispatch).toHaveBeenCalledWith("lanes/clearEmpty", null, { root: true })
      })
    })

    describe("move", () => {
      it("moves existing role to location", () => {
        const dispatch = jest.fn()
          , update = jest.fn()
          , child = jest.fn().mockReturnValue({ update })
          , state = { ref: { child } }

        const updatedAt = 123456789
        Date.now = jest.fn().mockReturnValue(updatedAt)

        const key = "key", location = "location"
        const payload = { location, updatedAt }

        store.actions.move({ dispatch, state }, { key, location })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith("key")
        expect(update).toHaveBeenCalledTimes(1)
        expect(update).toHaveBeenCalledWith(payload)
      })

      it("dispatches a clear lanes action", () => {
        const dispatch = jest.fn()
          , update = jest.fn()
          , child = jest.fn().mockReturnValue({ update })
          , state = { ref: { child } }

        const key = "key", location = "location"

        store.actions.move({ dispatch, state }, { key, location })
        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(dispatch).toHaveBeenCalledWith("lanes/clearEmpty", null, { root: true })
      })
    })
  })
})
