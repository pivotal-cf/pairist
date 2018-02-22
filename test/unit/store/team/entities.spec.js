import store from "@/store/team/entities"
import constants from "@/lib/constants"

describe("Entities Store", () => {
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
    describe("byKey", () => {
      it("finds one entity with the given key", () => {
        const a = { ".key": "a" }
          , entities = [a, { ".key": "b" }]

        expect(store.getters.byKey({ entities })("a")).toBe(a)
      })
    })

    describe("all", () => {
      it("returns the entities from the state", () => {
        const a = { type: "a" }
          , entities = [a, { type: "b" }]

        expect(store.getters.all({ entities })("a")).toEqual([a])
      })
    })

    describe("inLocation", () => {
      it("returns a function that can filter by location", () => {
        const entities = [ { location: 1 }, { location: 2 }, {} ]
          , all = jest.fn().mockReturnValue(entities)
          , f = store.getters.inLocation(null, { all })

        expect(f(1)("type")).toEqual([{ location: 1 }])
        expect(all).toHaveBeenCalledWith("type")
        expect(f(2)("other-type")).toEqual([{ location: 2 }])
        expect(all).toHaveBeenCalledWith("other-type")
      })
    })

    describe("unassigned", () => {
      it("selects entities that have unassigned as their location", () => {
        const  entities = { entities: "entities" }
          , f = jest.fn().mockReturnValue(entities)
          , inLocation = jest.fn().mockReturnValue(f)

        expect(store.getters.unassigned(null, { inLocation })("type")).toBe(entities)
        expect(inLocation).toHaveBeenCalledWith(constants.LOCATION.UNASSIGNED)
        expect(f).toHaveBeenCalledWith("type")
      })
    })

    describe("out", () => {
      it("selects entities that have out as their location", () => {
        const  entities = { entities: "entities" }
          , f = jest.fn().mockReturnValue(entities)
          , inLocation = jest.fn().mockReturnValue(f)

        expect(store.getters.out(null, { inLocation })("type")).toBe(entities)
        expect(inLocation).toHaveBeenCalledWith(constants.LOCATION.OUT)
        expect(f).toHaveBeenCalledWith("type")
      })
    })
  })

  describe("actions", () => {
    describe("save", () => {
      it("pushes a new entity into the ref", () => {
        const push = jest.fn()
          , state = { ref: { push } }

        const now = 123456789
        Date.now = jest.fn().mockReturnValue(now)

        store.actions.save({ state }, { name: "entity", picture: "picture" })
        expect(push).toHaveBeenCalledTimes(1)
        expect(push).toHaveBeenCalledWith({
          name: "entity",
          picture: "picture",
          location: constants.LOCATION.UNASSIGNED,
          updatedAt: now,
        })
      })

      it("edits an existing entity", () => {
        const existingEntity = {
            ".key": "p1",
            "name": "john",
            "picture": "",
            "updatedAt": 123,
            "location": "l1",
          }
          , update = jest.fn()
          , child = jest.fn().mockReturnValue({ update })
          , state = { entities: [existingEntity], ref: { child } }

        store.actions.save({ state }, { ".key": "p1", "name": "smith", "picture": "picture" })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith("p1")
        expect(update).toHaveBeenCalledTimes(1)
        expect(update).toHaveBeenCalledWith({
          name: "smith",
          picture: "picture",
        })
      })

      it("only submints updated fields", () => {
        const existingEntity = {
            ".key": "p2",
            "name": "john",
            "picture": "",
            "updatedAt": 123,
            "location": "l1",
          }
          , update = jest.fn()
          , child = jest.fn().mockReturnValue({ update })
          , state = { entities: [existingEntity], ref: { child } }

        store.actions.save({ state }, { ".key": "p2", "name": "smith" })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith("p2")
        expect(update).toHaveBeenCalledTimes(1)
        expect(update).toHaveBeenCalledWith({ name: "smith" })
      })

      it("doesn't do anything if name is empty", () => {
        const push = jest.fn()
          , state = { ref: { push } }

        store.actions.save({ state }, { name: "" })
        expect(push).toHaveBeenCalledTimes(0)
      })
    })

    describe("remove", () => {
      it("removes entity from ref", () => {
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
      it("moves existing entity to location", () => {
        const update = jest.fn()
          , byKey =  jest.fn().mockReturnValue({})
          , getters = { byKey }
          , child = jest.fn().mockReturnValue({ update })
          , state = { ref: { child } }

        const updatedAt = 123456789
        Date.now = jest.fn().mockReturnValue(updatedAt)

        const key = "key", location = "location"
        const payload = { location, updatedAt }

        store.actions.move({ getters, state }, { key, location })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith("key")
        expect(update).toHaveBeenCalledTimes(1)
        expect(update).toHaveBeenCalledWith(payload)
      })

      it("moves to unassigned if trying to move non-person to out", () => {
        const update = jest.fn()
          , byKey =  jest.fn().mockReturnValue({ type: "not-person" })
          , getters = { byKey }
          , child = jest.fn().mockReturnValue({ update })
          , state = { ref: { child } }

        const updatedAt = 123456789
        Date.now = jest.fn().mockReturnValue(updatedAt)

        const key = "key", location = constants.LOCATION.OUT
        const payload = { location: constants.LOCATION.UNASSIGNED, updatedAt }

        store.actions.move({ getters, state }, { key, location })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith("key")
        expect(update).toHaveBeenCalledTimes(1)
        expect(update).toHaveBeenCalledWith(payload)
      })

      it("allows person to be moved to out", () => {
        const update = jest.fn()
          , byKey =  jest.fn().mockReturnValue({ type: "person" })
          , getters = { byKey }
          , child = jest.fn().mockReturnValue({ update })
          , state = { ref: { child } }

        const updatedAt = 123456789
        Date.now = jest.fn().mockReturnValue(updatedAt)

        const key = "key", location = constants.LOCATION.OUT
        const payload = { location, updatedAt }

        store.actions.move({ getters, state }, { key, location })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith("key")
        expect(update).toHaveBeenCalledTimes(1)
        expect(update).toHaveBeenCalledWith(payload)
      })

      it("simply returns with no error when entity not found", () => {
        const byKey =  jest.fn()
          , getters = { byKey }
          , child = jest.fn()
          , state = { ref: { child } }

        const key = "key", location = constants.LOCATION.OUT

        expect(() =>
          store.actions.move({ getters, state }, { key, location })
        ).not.toThrow()
        expect(child).toHaveBeenCalledTimes(0)
      })
    })
  })
})
