import store from "@/store/team/people"
import constants from "@/lib/constants"

describe("People Store", () => {
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
      it("returns the people from the state", () => {
        const people = { people: "people" }

        expect(store.getters.all({ people })).toBe(people)
      })
    })

    describe("inLocation", () => {
      it("returns a function that can filter by location", () => {
        const people = [ { location: 1 }, { location: 2 }, {} ]
          , f = store.getters.inLocation(null, { all: people })

        expect(f(1)).toEqual([{ location: 1 }])
        expect(f(2)).toEqual([{ location: 2 }])
      })
    })

    describe("unassigned", () => {
      it("selects people that have unassigned as their location", () => {
        const f = jest.fn()

        store.getters.unassigned(null, { inLocation: f })
        expect(f).toHaveBeenCalledWith(constants.LOCATION.UNASSIGNED)
      })

      it("returns results from the inLocation getter", () => {
        const f = jest.fn()
          , people = { people: "people" }

        f.mockReturnValue(people)
        expect(store.getters.unassigned(null, { inLocation: f })).toBe(people)
      })
    })

    describe("out", () => {
      it("selects people that have out as their location", () => {
        const f = jest.fn()

        store.getters.out(null, { inLocation: f })
        expect(f).toHaveBeenCalledWith(constants.LOCATION.OUT)
      })

      it("returns results from the inLocation getter", () => {
        const f = jest.fn()
          , people = { people: "people" }

        f.mockReturnValue(people)
        expect(store.getters.out(null, { inLocation: f })).toBe(people)
      })
    })
  })

  describe("actions", () => {
    describe("save", () => {
      it("pushes a new person into the ref", () => {
        const push = jest.fn()
          , state = { ref: { push } }

        const now = 123456789
        Date.now = jest.fn().mockReturnValue(now)

        store.actions.save({ state }, { name: "person", picture: "picture" })
        expect(push).toHaveBeenCalledTimes(1)
        expect(push).toHaveBeenCalledWith({
          name: "person",
          picture: "picture",
          location: constants.LOCATION.UNASSIGNED,
          updatedAt: now,
        })
      })

      it("edits an existing person", () => {
        const existingPerson = {
            ".key": "p1",
            "name": "john",
            "picture": "",
            "updatedAt": 123,
            "location": "l1",
          }
          , set = jest.fn()
          , child = jest.fn().mockReturnValue({ set })
          , state = { people: [existingPerson], ref: { child } }

        store.actions.save({ state }, { ".key": "p1", "name": "smith", "picture": "picture" })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith("p1")
        expect(set).toHaveBeenCalledTimes(1)
        expect(set).toHaveBeenCalledWith({
          name: "smith",
          picture: "picture",
        })
      })

      it("doesn't do anything if name is empty", () => {
        const push = jest.fn()
          , state = { ref: { push } }

        store.actions.save({ state }, { name: "" })
        expect(push).toHaveBeenCalledTimes(0)
      })
    })

    describe("remove", () => {
      it("removes person from ref", () => {
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
      it("moves existing person to location", () => {
        const person = { ".key": "key", "location": "old", "updatedAt": 123, "something": "else" }
          , otherPerson = { ".key": "otherKey" }

        const dispatch = jest.fn()
          , set = jest.fn()
          , child = jest.fn().mockReturnValue({ set })
          , state = { people: [person, otherPerson], ref: { child } }

        const updatedAt = 123456789
        Date.now = jest.fn().mockReturnValue(updatedAt)

        const key = "key", location = "location"
        const expectedPerson = { ...person, location, updatedAt }
        delete expectedPerson[".key"]

        store.actions.move({ dispatch, state }, { key, location })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith("key")
        expect(set).toHaveBeenCalledTimes(1)
        expect(set).toHaveBeenCalledWith(expectedPerson)
      })

      it("dispatches a clear lanes action", () => {
        const person = { ".key": "key", "something": "else" }

        const dispatch = jest.fn()
          , set = jest.fn()
          , child = jest.fn().mockReturnValue({ set })
          , state = { people: [person], ref: { child } }

        const key = "key", location = "location"

        store.actions.move({ dispatch, state }, { key, location })
        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(dispatch).toHaveBeenCalledWith("lanes/clearEmpty", null, { root: true })
      })

      it("skips actions if it can't find the person", () => {
        const dispatch = jest.fn()
          , set = jest.fn()
          , child = jest.fn().mockReturnValue({ set })
          , state = { people: [], ref: { child } }

        const key = "key", location = "location"

        store.actions.move({ dispatch, state }, { key, location })
        expect(child).toHaveBeenCalledTimes(0)
        expect(set).toHaveBeenCalledTimes(0)
        expect(dispatch).toHaveBeenCalledTimes(0)
      })
    })
  })
})
