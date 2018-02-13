import { shallow, createLocalVue } from "@vue/test-utils"
import flushPromises from "flush-promises"
import Vuex from "vuex"

const localVue = createLocalVue()

localVue.use(Vuex)

import ContextMenu from "@/components/ContextMenu"
import Track from "@/components/team/Track"

describe("Track", () => {
  let actions
  let store
  let getters

  beforeEach(() => {
    actions = {
      remove: jest.fn(),
    }
    getters = {
      canWrite: jest.fn().mockReturnValue(true),
    }
    store = new Vuex.Store({
      state: {},
      modules: {
        tracks: {
          namespaced: true,
          actions,
        },
      },
      getters,
    })
  })

  it("renders with no exceptions", () => {
    shallow(Track, { store, localVue,
      propsData: { track: { ".key": "p1", "name": "Bart" } },
    })
  })

  it("shows a tracks name", () => {
    const wrapper = shallow(Track, { store, localVue,
      propsData: { track: { ".key": "p1", "name": "Lisa" } },
    })

    expect(wrapper.find("span").text()).toContain("Lisa")
  })

  it("shows a context menu on right click if can write", async () => {
    const wrapper = shallow(Track, { store, localVue,
      propsData: {
        track: { ".key": "p", "name": "Track" },
      },
    })

    const menu = wrapper.find(ContextMenu)
    const open = wrapper.vm.$refs.menu.open = jest.fn()
    expect(menu.exists()).toBeTruthy()
    wrapper.find(".track").trigger("contextmenu")
    await flushPromises()
    expect(open).toHaveBeenCalled()
  })

  it("removes track when clicking remove", () => {
    const wrapper = shallow(Track, { store, localVue,
      propsData: {
        track: { ".key": "p", "name": "Track" },
      },
    })

    wrapper.vm.remove()
    expect(actions.remove).toHaveBeenCalled()
    expect(actions.remove).toHaveBeenCalledWith(expect.anything(), "p", undefined)
  })

  it("does not show menu if cannot write", async () => {
    getters.canWrite.mockReturnValue(false)

    const wrapper = shallow(Track, { store, localVue,
      propsData: {
        track: { ".key": "p", "name": "Track" },
      },
    })

    const menu = wrapper.find(ContextMenu)
    expect(menu.exists()).toBeFalsy()
    wrapper.find(".track").trigger("contextmenu")
    await flushPromises()
  })
})
