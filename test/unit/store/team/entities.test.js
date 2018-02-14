import storeFactory from "@/store/team/entities"
import constants from "@/lib/constants"

const store = storeFactory()

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
    describe("all", () => {
      it("returns the entities from the state", () => {
        const entities = { entities: "entities" }

        expect(store.getters.all({ entities })).toBe(entities)
      })
    })

    describe("inLocation", () => {
      it("returns a function that can filter by location", () => {
        const entities = [ { location: 1 }, { location: 2 }, {} ]
          , f = store.getters.inLocation(null, { all: entities })

        expect(f(1)).toEqual([{ location: 1 }])
        expect(f(2)).toEqual([{ location: 2 }])
      })
    })

    describe("unassigned", () => {
      it("selects entities that have unassigned as their location", () => {
        const f = jest.fn()

        store.getters.unassigned(null, { inLocation: f })
        expect(f).toHaveBeenCalledWith(constants.LOCATION.UNASSIGNED)
      })

      it("returns results from the inLocation getter", () => {
        const f = jest.fn()
          , entities = { entities: "entities" }

        f.mockReturnValue(entities)
        expect(store.getters.unassigned(null, { inLocation: f })).toBe(entities)
      })
    })

    describe("out", () => {
      it("selects entities that have out as their location", () => {
        const f = jest.fn()

        store.getters.out(null, { inLocation: f })
        expect(f).toHaveBeenCalledWith(constants.LOCATION.OUT)
      })

      it("returns results from the inLocation getter", () => {
        const f = jest.fn()
          , entities = { entities: "entities" }

        f.mockReturnValue(entities)
        expect(store.getters.out(null, { inLocation: f })).toBe(entities)
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
        const entity = { ".key": "key", "something": "else" }

        const dispatch = jest.fn()
          , update = jest.fn()
          , child = jest.fn().mockReturnValue({ update })
          , state = { entities: [entity], ref: { child } }

        const key = "key", location = "location"

        store.actions.move({ dispatch, state }, { key, location })
        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(dispatch).toHaveBeenCalledWith("lanes/clearEmpty", null, { root: true })
      })
    })
  })
})
