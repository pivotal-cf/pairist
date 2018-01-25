import { shallow } from "@vue/test-utils"

import Navigation from "@/components/Navigation"

describe("Navigation", () => {
  it("renders a form to go to a team", () => {
    const wrapper = shallow(Navigation)
    const form = wrapper.find("nav .navbar-item:nth-child(2)")
    expect(form.exists()).toBe(true)
    expect(form.find("b-field").exists()).toBe(true)
    expect(form.find("button").exists()).toBe(true)
  })

  describe("go to team", () => {
    let routeDestination
    const $router = {
      push: path => {
        routeDestination = path
      },
    }
    const wrapper = shallow(Navigation, {
      mocks: {
        $router,
      },
    })

    beforeEach(() => {
      routeDestination = undefined
    })

    const gotoPage = team => {
      const form = wrapper.find("nav .navbar-item:nth-child(2)")
      wrapper.setData({ team: team })
      form.find("button").trigger("click")
    }

    it("navigates to the teams page", () => {
      gotoPage("test")
      expect(routeDestination).toEqual({
        name: "Team",
        params: { team: "test" },
      })
    })

    it("doesn't change route if team is empty", () => {
      gotoPage("")
      expect(routeDestination).toBeUndefined()
    })
  })
})
