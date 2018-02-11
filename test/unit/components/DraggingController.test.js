import { shallow, createLocalVue } from "@vue/test-utils"
import Vuex from "vuex"

const localVue = createLocalVue()

localVue.use(Vuex)

import DraggingController from "@/components/team/DraggingController"

describe("DraggingController", () => {
  let actions
  let store

  beforeEach(() => {
    actions = {
      move: jest.fn(),
    }
    store = new Vuex.Store({
      state: {},
      actions,
    })
  })

  it("renders with no exceptions", () => {
    shallow(DraggingController, { propsData: { draggables: ["a", "b"] } })
  })

  it("maps the move action", () => {
    const wrapper = shallow(DraggingController, {
      store,
      localVue,
      propsData: { draggables: ["a", "b"] },
    })

    const args = [1, 2, 3]
    wrapper.vm.move(args)
    expect(actions.move).toHaveBeenCalledTimes(1)
    expect(actions.move.mock.calls[0][1]).toBe(args)
  })
})
