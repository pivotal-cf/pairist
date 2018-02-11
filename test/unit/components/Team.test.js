import { shallow } from "@vue/test-utils"
import Team from "@/components/team/Team"

const $route = {
  params: {
    team: "TEAM-name",
  },
}

describe("Team", () => {
  it("renders with no exceptions", () => {
    shallow(Team, { mocks: { $route } })
  })

  it("lowercases team name in state", () => {
    const wrapper = shallow(Team, { mocks: { $route } })
    expect(wrapper.vm.teamName).toEqual("team-name")
  })
})
