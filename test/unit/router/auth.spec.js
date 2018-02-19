import { Auth, RedirectToTeam } from "@/router/auth"

jest.mock("@/store", () => {
  global.store = {}
  return { store: global.store }
})

describe("Auth", () => {
  beforeEach(() => {
    Object.assign(global.store, {
      commit: jest.fn(),
      dispatch: jest.fn(),

      getters: {},
    })
  })

  it("loads the team and moves on if user is authorized", async () => {
    const to = { params: { team: "my-team" } }
      , from = {}
      , next = jest.fn()

    global.store.getters.user = {}
    global.store.getters.canRead = true

    await Auth(to, from, next)

    expect(global.store.dispatch).toHaveBeenCalledWith("authorize", "my-team")
    expect(next).toHaveBeenCalledWith()
  })

  it("loads the team and moves on if user is authorized even if not logged in", async () => {
    const to = { params: { team: "my-team" } }
      , from = {}
      , next = jest.fn()

    global.store.getters.user = undefined
    global.store.getters.canRead = true

    await Auth(to, from, next)

    expect(global.store.dispatch).toHaveBeenCalledWith("authorize", "my-team")
    expect(next).toHaveBeenCalledWith()
  })

  it("notifies and redirect if not authorized", async () => {
    const to = { params: { team: "my-team" } }
      , from = {}
      , next = jest.fn()

    global.store.getters.user = {}
    global.store.getters.canRead = false

    await Auth(to, from, next)

    expect(global.store.dispatch).toHaveBeenCalledWith("authorize", "my-team")
    expect(global.store.dispatch).not.toHaveBeenCalledWith()
    expect(global.store.commit).toHaveBeenCalledWith("notify", {
      message: "You do not have access to this team.",
      color: "error",
    })
    expect(next).toHaveBeenCalledWith("/")
  })

  it("notifies and redirect if not authenticated", async () => {
    const to = { params: { team: "my-team" } }
      , from = {}
      , next = jest.fn()

    global.store.getters.user = null
    global.store.getters.canRead = false

    await Auth(to, from, next)

    expect(global.store.dispatch).toHaveBeenCalledWith("authorize", "my-team")
    expect(global.store.commit).toHaveBeenCalledWith("notify", {
      message: "You need to be logged in to access this page.",
      color: "error",
    })
    expect(next).toHaveBeenCalledWith("/")
  })
})

describe("RedirectToTeam", () => {
  beforeEach(() => {
    Object.assign(global.store, {
      getters: {},
    })
  })

  it("redirects to the users team if authenticated", async () => {
    const to = {}
      , from = {}
      , next = jest.fn()

    global.store.getters.user = { name: "squad" }
    global.store.getters.canRead = true

    await RedirectToTeam(to, from, next)

    expect(next).toHaveBeenCalledWith({ name: "TeamCurrent", params: { team: "squad" } })
  })
})
