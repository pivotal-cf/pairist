import store from "@/store/user"
import constants from "@/lib/constants"

jest.mock("@/firebase", () => {
  const firebasemock = require("firebase-mock")

  const mockdatabase = new firebasemock.MockFirebase()
  const mockauth = new firebasemock.MockFirebase()
  const mocksdk = new firebasemock.MockFirebaseSdk(path => {
    return path ? mockdatabase.child(path) : mockdatabase
  }, () => {
    return mockauth
  })

  const firebaseApp = mocksdk.initializeApp() // can take a path arg to database url
  const db = firebaseApp.database()

  global.db = db
  global.auth = mockauth

  return { firebaseApp, db }
})

jest.mock("vuexfire", () => {
  return {
    firebaseAction: (action) => {
      return (stuff, args) => {
        return action(stuff, args)
      }
    },
    firebaseMutations: {},
  }
})

jest.mock("@/router", () => {
})

describe("Users Store", () => {
  describe("mutations", () => {
    describe("setUser", () => {
      it("sets the user", () => {
        const user = { user: "user" }
          , state = {}

        store.mutations.setUser(state, user)
        expect(state.user).toBe(user)
      })
    })
  })

  describe("getters", () => {
    describe("user", () => {
      it("gets the user", () => {
        const user = jest.fn()
        const state = { user : user }

        expect(store.getters.user(state)).toEqual(user)
      })
    })
  })

  describe("actions", () => {
    describe("autoLogin", () => {
      it("logs in with an email address", () => {
        const commit = jest.fn()
        const payload = {
          email : "foo@foo.com",
          uid : 1,
        }
        store.actions.autoLogin({ commit }, payload)
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith(
          "setUser",
          {
            uid: payload.uid,
            name: payload.email,
          },
        )
      })

      it("logs in with a lowercase email address", () => {
        const commit = jest.fn()
        const payload = {
          email : "FOO@foo.com",
          uid : 1,
        }
        store.actions.autoLogin({ commit }, payload)
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith(
          "setUser",
          {
            uid: payload.uid,
            name: payload.email.toLowerCase(),
          },
        )
      })

      it("logs in with a name stripping @pair.ist", () => {
        const commit = jest.fn()
        const payload = {
          email : "foo@pair.ist",
          uid : 1,
        }
        store.actions.autoLogin({ commit }, payload)
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith(
          "setUser",
          {
            uid: payload.uid,
            name: payload.email.replace("@pair.ist", ""),
          },
        )
      })
    })
  })
})
