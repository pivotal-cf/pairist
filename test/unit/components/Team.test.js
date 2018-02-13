import { shallow, createLocalVue } from "@vue/test-utils"
import flushPromises from "flush-promises"
import Vuex from "vuex"

const localVue = createLocalVue()

localVue.use(Vuex)

import Lists from "@/components/team/Lists"
import Sidebar from "@/components/team/Sidebar"
import LaneList from "@/components/team/LaneList"
import DraggingController from "@/components/team/DraggingController"
import Toolbar from "@/components/team/Toolbar"
import Notification from "@/components/Notification"
import Team from "@/components/team/Team"

const $route = {
  params: {
    team: "TEAM-name",
  },
}

describe("Team", () => {
  let actions
  let store
  let getters

  beforeEach(() => {
    actions = {
      remove: jest.fn(),
    }
    getters = {
      canWrite: jest.fn().mockReturnValue(true),
      user: jest.fn().mockReturnValue({}),
    }
    store = new Vuex.Store({
      state: {},
      getters,
      modules: {
        people: {
          namespaced: true,
          actions,
        },
      },
    })
  })

  it("renders with no exceptions", () => {
    shallow(Team, { localVue, store, mocks: { $route } })
  })

  it("renders a sidebar", () => {
    const wrapper = shallow(Team, { localVue, store, mocks: { $route } })
    expect(wrapper.find(Sidebar).exists()).toBeTruthy()
  })

  it("renders Lists", () => {
    const wrapper = shallow(Team, { localVue, store, mocks: { $route } })
    expect(wrapper.find(Lists).exists()).toBeTruthy()
  })

  it("renders a LaneList", () => {
    const wrapper = shallow(Team, { localVue, store, mocks: { $route } })
    expect(wrapper.find(LaneList).exists()).toBeTruthy()
  })

  it("renders a Notification", () => {
    const wrapper = shallow(Team, { localVue, store, mocks: { $route } })
    expect(wrapper.find(Notification).exists()).toBeTruthy()
  })

  it("renders a DraggingController if can write", () => {
    const wrapper = shallow(Team, { localVue, store, mocks: { $route } })
    expect(wrapper.find(DraggingController).exists()).toBeTruthy()
    expect(wrapper.find(DraggingController).vm.draggables)
      .toEqual(["person", "track", "role"])
  })

  it("skips DraggingController if cannot write", () => {
    getters.canWrite.mockReturnValue(false)
    const wrapper = shallow(Team, { localVue, store, mocks: { $route } })
    expect(wrapper.find(DraggingController).exists()).toBeFalsy()
  })

  it("renders a Toolbar", () => {
    const wrapper = shallow(Team, { localVue, store, mocks: { $route } })
    expect(wrapper.find(Toolbar).exists()).toBeTruthy()
    expect(wrapper.find(Toolbar).vm.teamName)
      .toEqual("TEAM-NAME")
  })
})
