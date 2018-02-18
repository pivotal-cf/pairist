import store from "@/store/team/lists"
import constants from "@/lib/constants"

describe("Lists Store", () => {
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
      it("returns the lists from the state", () => {
        const lists = { lists: "lists" }

        expect(store.getters.all({ lists })).toBe(lists)
      })
    })
  })

  describe("actions", () => {
    describe("save", () => {
      it("pushes a new list into the ref", () => {
        const push = jest.fn()
          , state = { ref: { push } }

        store.actions.save({ state }, { title: "list" })
        expect(push).toHaveBeenCalledTimes(1)
        expect(push).toHaveBeenCalledWith({
          title: "list",
          items: [],
        })
      })

      it("edits an existing list", () => {
        const existingList = {
            ".key": "p1",
            "title": "john",
          }
          , update = jest.fn()
          , child = jest.fn().mockReturnValue({ update })
          , state = { lists: [existingList], ref: { child } }

        store.actions.save({ state }, { ".key": "p1", "title": "smith" })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith("p1")
        expect(update).toHaveBeenCalledTimes(1)
        expect(update).toHaveBeenCalledWith({
          title: "smith",
        })
      })

      it("only submints updated fields", () => {
        const existingList = {
            ".key": "p2",
            "title": "john",
          }
          , update = jest.fn()
          , child = jest.fn().mockReturnValue({ update })
          , state = { lists: [existingList], ref: { child } }

        store.actions.save({ state }, { ".key": "p2", "title": "smith" })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith("p2")
        expect(update).toHaveBeenCalledTimes(1)
        expect(update).toHaveBeenCalledWith({ title: "smith" })
      })
    })

    describe("remove", () => {
      it("removes list from ref", () => {
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

    describe("saveItem", () => {
      it("pushes a new item into the list", () => {
        const  push = jest.fn()
          , items = jest.fn().mockReturnValue({ push })
          , child = jest.fn().mockReturnValue({ child: items })
          , state = { ref: { child } }
          , list = { ".key": "list-key" }

        store.actions.saveItem({ state }, { list, item: { title: "item" }})
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith("list-key")
        expect(items).toHaveBeenCalledTimes(1)
        expect(items).toHaveBeenCalledWith("items")
        expect(push).toHaveBeenCalledTimes(1)
        expect(push).toHaveBeenCalledWith({
          title: "item",
        })
      })

      it("edits an existing item", () => {
        const update = jest.fn()
          , item = jest.fn().mockReturnValue({ update })
          , items = jest.fn().mockReturnValue({ child: item })
          , child = jest.fn().mockReturnValue({ child: items })
          , state = { ref: { child } }
          , list = { ".key": "list-key" }

        store.actions.saveItem({ state }, { list, item: { ".key": "p1", "title": "smith" }})
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith("list-key")
        expect(items).toHaveBeenCalledTimes(1)
        expect(items).toHaveBeenCalledWith("items")
        expect(item).toHaveBeenCalledTimes(1)
        expect(item).toHaveBeenCalledWith("p1")
        expect(update).toHaveBeenCalledTimes(1)
        expect(update).toHaveBeenCalledWith({
          title: "smith",
        })
      })
    })

    describe("removeItem", () => {
      it("removes an item from a list", () => {
        const dispatch = jest.fn()
          , remove = jest.fn()
          , item = jest.fn().mockReturnValue({ remove })
          , items = jest.fn().mockReturnValue({ child: item })
          , child = jest.fn().mockReturnValue({ child: items })
          , state = { ref: { child } }
          , list = { ".key": "list-key" }

        store.actions.removeItem({ dispatch, state }, { list, key: "key" })
        expect(child).toHaveBeenCalledTimes(1)
        expect(child).toHaveBeenCalledWith("list-key")
        expect(items).toHaveBeenCalledTimes(1)
        expect(items).toHaveBeenCalledWith("items")
        expect(item).toHaveBeenCalledTimes(1)
        expect(item).toHaveBeenCalledWith("key")
        expect(remove).toHaveBeenCalledTimes(1)
        expect(remove).toHaveBeenCalledWith()
      })
    })
  })
})
