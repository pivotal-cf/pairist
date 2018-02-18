import { shallow, createLocalVue } from "@vue/test-utils"
import flushPromises from "flush-promises"
import Vuex from "vuex"

const localVue = createLocalVue()

localVue.use(Vuex)

import Person from "@/components/team/Person"
import Chip from "@/components/team/Chip"
import Lane from "@/components/team/Lane"

describe("Lane", () => {
  let actions
  let store
  let getters

  beforeEach(() => {
    actions = {
      setLocked: jest.fn(),
    }
    getters = {
      canWrite: jest.fn().mockReturnValue(true),
      dragging: jest.fn().mockReturnValue(false),
      dropTarget: jest.fn().mockReturnValue(null),
    }
    store = new Vuex.Store({
      state: {},
      getters,
      modules: {
        lanes: {
          namespaced: true,
          actions,
        },
      },
    })
  })

  it("renders with no exceptions", () => {
    shallow(Lane, { localVue, store, propsData: { lane: {} } })
  })

  it("can be locked and unlocked", async () => {
    const lane = { ".key": "a-key" , "locked": false }
      , wrapper = shallow(Lane, {
        store,
        localVue,
        propsData: { lane },
      })

    expect(wrapper.find(".lock-button").classes()).not.toContain("is-locked")
    expect(wrapper.find(".lock-button").attributes().color).toEqual("accent")

    wrapper.find(".lock-button").trigger("click")
    expect(actions.setLocked).toHaveBeenCalled()
    expect(actions.setLocked).toHaveBeenLastCalledWith(expect.anything(), {
      key: "a-key",
      locked: true,
    }, undefined)

    lane.locked = true
    await flushPromises()

    expect(wrapper.find(".lock-button").classes()).toContain("is-locked")
    expect(wrapper.find(".lock-button").attributes().color).toEqual("pink")

    wrapper.find(".lock-button").trigger("click")
    expect(actions.setLocked).toHaveBeenCalled()
    expect(actions.setLocked).toHaveBeenLastCalledWith(expect.anything(), {
      key: "a-key",
      locked: false,
    }, undefined)
  })

  it("cannot be locked and unlocked if cannot write", () => {
    getters.canWrite.mockReturnValue(false)

    const lane = { ".key": "a-key" , "locked": false }
      , wrapper = shallow(Lane, {
        store,
        localVue,
        propsData: { lane },
      })

    expect(wrapper.find(".lock-button").exists()).toBeFalsy()
  })

  it("shows a new lane without a lock button if new-lane is passed", async () => {
    const lane = { ".key": "new-lane" }
      , wrapper = shallow(Lane, {
        store,
        localVue,
        propsData: { lane },
      })

    expect(wrapper.find(".lock-button").exists()).toBeFalsy()
  })

  it("shows a divider if applicable", () => {
    const wrapper = shallow(Lane, {
      store,
      localVue,
      propsData: { lane: {}, divider: true },
    })

    expect(wrapper.find("v-divider").exists()).toBe(true)
  })

  it("hides the divider when it's not desired", () => {
    const wrapper = shallow(Lane, {
      store,
      localVue,
      propsData: { lane: {}, divider: false },
    })

    expect(wrapper.find("v-divider").exists()).toBe(false)
  })

  it("renders people", () => {
    const lane = {
        people: [ { ".key": "p1" }, { ".key": "p2" } ],
      }
      , wrapper = shallow(Lane, {
        store, localVue,
        propsData: { lane },
      })

    const people = wrapper.findAll(Person)
    expect(people.length).toEqual(2)
    expect(people.wrappers[0].vm.person).toEqual({ ".key": "p1" })
    expect(people.wrappers[1].vm.person).toEqual({ ".key": "p2" })
  })

  it("renders roles", () => {
    const lane = {
        roles: [ { ".key": "r1" }, { ".key": "r2" } ],
      }
      , wrapper = shallow(Lane, {
        store, localVue,
        propsData: { lane },
      })

    const roles = wrapper.findAll(Chip)
    expect(roles.length).toEqual(2)
    expect(roles.wrappers[0].vm.chip).toEqual({ ".key": "r1" })
    expect(roles.wrappers[1].vm.chip).toEqual({ ".key": "r2" })
  })

  it("renders tracks", () => {
    const lane = {
        tracks: [ { ".key": "t1" }, { ".key": "t2" } ],
      }
      , wrapper = shallow(Lane, {
        store, localVue,
        propsData: { lane },
      })

    const tracks = wrapper.findAll(Chip)
    expect(tracks.length).toEqual(2)
    expect(tracks.wrappers[0].vm.chip).toEqual({ ".key": "t1" })
    expect(tracks.wrappers[1].vm.chip).toEqual({ ".key": "t2" })
  })
})
