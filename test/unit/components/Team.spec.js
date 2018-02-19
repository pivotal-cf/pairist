import { shallow, createLocalVue } from "@vue/test-utils"
import Vuex from "vuex"

const localVue = createLocalVue()

localVue.use(Vuex)

import DraggingController from "@/components/team/DraggingController"
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
      showingDate: jest.fn().mockReturnValue(null),
    }
    store = new Vuex.Store({
      state: {},
      getters,
      modules: {
        people: {
          namespaced: true,
          actions,
        },
        history: {
          namespaced: true,
          getters: {
            all: jest.fn().mockReturnValue([]),
          },
        },
      },
    })
  })

  it("renders with no exceptions", () => {
    shallow(Team, { localVue, store, mocks: { $route } })
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
})
