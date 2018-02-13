import { shallow, createLocalVue } from "@vue/test-utils"
import flushPromises from "flush-promises"
import Vuex from "vuex"

const localVue = createLocalVue()

localVue.use(Vuex)

import ContextMenu from "@/components/ContextMenu"
import Role from "@/components/team/Role"

describe("Role", () => {
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
        roles: {
          namespaced: true,
          actions,
        },
      },
      getters,
    })
  })

  it("renders with no exceptions", () => {
    shallow(Role, { store, localVue,
      propsData: { role: { ".key": "p1", "name": "Bart" } },
    })
  })

  it("shows a roles name", () => {
    const wrapper = shallow(Role, { store, localVue,
      propsData: { role: { ".key": "p1", "name": "Lisa" } },
    })

    expect(wrapper.find("span").text()).toContain("Lisa")
  })

  it("shows a context menu on right click if can write", async () => {
    const wrapper = shallow(Role, { store, localVue,
      propsData: {
        role: { ".key": "p", "name": "Role" },
      },
    })

    const menu = wrapper.find(ContextMenu)
    const open = wrapper.vm.$refs.menu.open = jest.fn()
    expect(menu.exists()).toBeTruthy()
    wrapper.find(".role").trigger("contextmenu")
    await flushPromises()
    expect(open).toHaveBeenCalled()
  })

  it("removes role when clicking remove", () => {
    const wrapper = shallow(Role, { store, localVue,
      propsData: {
        role: { ".key": "p", "name": "Role" },
      },
    })

    wrapper.vm.remove()
    expect(actions.remove).toHaveBeenCalled()
    expect(actions.remove).toHaveBeenCalledWith(expect.anything(), "p", undefined)
  })

  it("does not show menu if cannot write", async () => {
    getters.canWrite.mockReturnValue(false)

    const wrapper = shallow(Role, { store, localVue,
      propsData: {
        role: { ".key": "p", "name": "Role" },
      },
    })

    const menu = wrapper.find(ContextMenu)
    expect(menu.exists()).toBeFalsy()
    wrapper.find(".role").trigger("contextmenu")
    await flushPromises()
  })
})
