import store from "@/store/team/tracks"
import constants from "@/lib/constants"

describe("Tracks Store", () => {
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
      it("returns the tracks from the state", () => {
        const tracks = { tracks: "tracks" }

        expect(store.getters.all({ tracks })).toBe(tracks)
      })
    })

    describe("inLocation", () => {
      it("returns a function that can filter by location", () => {
        const tracks = [ { location: 1 }, { location: 2 }, {} ]
          , f = store.getters.inLocation(null, { all: tracks })

        expect(f(1)).toEqual([{ location: 1 }])
        expect(f(2)).toEqual([{ location: 2 }])
      })
    })

    describe("unassigned", () => {
      it("selects tracks that have unassigned as their location", () => {
        const f = jest.fn()

        store.getters.unassigned(null, { inLocation: f })
        expect(f).toHaveBeenCalledWith(constants.LOCATION.UNASSIGNED)
      })

      it("returns results from the inLocation getter", () => {
        const f = jest.fn()
          , tracks = { tracks: "tracks" }

        f.mockReturnValue(tracks)
        expect(store.getters.unassigned(null, { inLocation: f })).toBe(tracks)
      })
    })
  })

  describe("actions", () => {
    describe("add", () => {
      it("pushes the track into the ref", () => {
        const push = jest.fn()
          , state = { ref: { push } }

        const now = 123456789
        Date.now = jest.fn().mockReturnValue(now)

        store.actions.add({ state }, { name: "track" })
        expect(push).toHaveBeenCalledTimes(1)
        expect(push).toHaveBeenCalledWith({
          name: "track",
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
      it("removes track from ref", () => {
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
      it("moves existing track to location", () => {
        const track = { ".key": "key", "location": "old", "updatedAt": 123, "something": "else" }
          , otherTrack = { ".key": "otherKey" }

        const dispatch = jest.fn()
          , set = jest.fn()
          , child = jest.fn().mockReturnValue({ set })
          , state = { tracks: [track, otherTrack], ref: { child } }

        const updatedAt = 123456789
        Date.now = jest.fn().mockReturnValue(updatedAt)

        const key = "key", location = "location"
        const expectedTrack = { ...track, location, updatedAt }
        delete expectedTrack[".key"]

        store.actions.move({ dispatch, state }, { key, location })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith("key")
        expect(set).toHaveBeenCalledTimes(1)
        expect(set).toHaveBeenCalledWith(expectedTrack)
      })

      it("dispatches a clear lanes action", () => {
        const track = { ".key": "key", "something": "else" }

        const dispatch = jest.fn()
          , set = jest.fn()
          , child = jest.fn().mockReturnValue({ set })
          , state = { tracks: [track], ref: { child } }

        const key = "key", location = "location"

        store.actions.move({ dispatch, state }, { key, location })
        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(dispatch).toHaveBeenCalledWith("lanes/clearEmpty", null, { root: true })
      })

      it("skips actions if it can't find the track", () => {
        const dispatch = jest.fn()
          , set = jest.fn()
          , child = jest.fn().mockReturnValue({ set })
          , state = { tracks: [], ref: { child } }

        const key = "key", location = "location"

        store.actions.move({ dispatch, state }, { key, location })
        expect(child).toHaveBeenCalledTimes(0)
        expect(set).toHaveBeenCalledTimes(0)
        expect(dispatch).toHaveBeenCalledTimes(0)
      })
    })
  })
})
