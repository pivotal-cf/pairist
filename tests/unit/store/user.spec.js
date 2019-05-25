import store from '@/store/user'

jest.mock('@/firebase', () => {
  const firebasemock = require('firebase-mock')

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

jest.mock('vuexfire', () => {
  return {
    firebaseAction: (action) => {
      return (stuff, args) => {
        return action(stuff, args)
      }
    },
    firebaseMutations: {},
  }
})

jest.mock('@/router', () => {
  global.router = {
    push: jest.fn(),
  }
  return global.router
})

describe('Users Store', () => {
  describe('mutations', () => {
    describe('setUser', () => {
      it('sets the user', () => {
        const user = { user: 'user' }
        const state = {}

        store.mutations.setUser(state, user)
        expect(state.user).toBe(user)
      })
    })
  })

  describe('getters', () => {
    describe('user', () => {
      it('gets the user', () => {
        const user = jest.fn()
        const state = { user: user }

        expect(store.getters.user(state)).toEqual(user)
      })
    })
  })

  describe('actions', () => {
    describe('autoLogin', () => {
      it('logs in with a lowercase name', () => {
        const commit = jest.fn()
        const payload = {
          email: 'FOO@pair.ist',
          uid: 1,
        }

        store.actions.autoLogin({ commit }, payload)
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith(
          'setUser',
          {
            uid: 1,
            name: 'foo',
          },
        )
      })

      it('logs in with a name stripping @pair.ist', () => {
        const commit = jest.fn()
        const payload = {
          email: 'foo@pair.ist',
          uid: 1,
        }

        store.actions.autoLogin({ commit }, payload)
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith(
          'setUser',
          {
            uid: 1,
            name: 'foo',
          },
        )
      })
    })

    describe('signup', () => {
      it.skip('signs up with given name and password', async () => {
        // skipped temporarily since firebase-mock has a bug: https://github.com/soumak77/firebase-mock/pull/138
        const commit = jest.fn()
        const dispatch = jest.fn()
        const payload = {
          name: 'MY-NAME',
          password: 'my-password',
        }

        global.db.ref('/teams/my-name/ownerUID').autoFlush()

        const prom = store.actions.signup({ commit, dispatch }, payload)
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith('loading', true)

        global.auth.flush()

        const user = await global.auth.getUserByEmail('my-name@pair.ist')
        expect(user.email).toEqual('my-name@pair.ist')
        expect(user.password).toEqual('my-password')

        await prom

        expect(commit).toHaveBeenCalledTimes(2)
        expect(commit).toHaveBeenCalledWith('loading', false)

        const ownerUID = (await global.db.ref('/teams/my-name/ownerUID').once('value')).val()
        expect(ownerUID).toEqual(user.uid)
        expect(global.router.push).toHaveBeenCalledWith({ name: 'TeamCurrent', params: { team: 'my-name' } })
      })

      it('notifies user when signup fails', async () => {
        const commit = jest.fn()
        const dispatch = jest.fn()
        const payload = {
          name: 'team1',
          password: 'password1',
        }

        global.auth.failNext('createUserWithEmailAndPassword', new Error('email address signup fail'))

        const prom = store.actions.signup({ commit, dispatch }, payload)
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith('loading', true)

        global.auth.flush()

        await prom

        expect(commit).toHaveBeenCalledTimes(3)

        expect(commit).toHaveBeenCalledWith('notify', {
          message: 'name signup fail',
          color: 'error',
        })

        expect(commit).toHaveBeenCalledWith('loading', false)
      })

      it('notifies user when creating team fails', async () => {
        const commit = jest.fn()
        const dispatch = jest.fn()
        const payload = {
          name: 'team2',
          password: 'password1',
        }

        global.db.ref('/teams/team2/ownerUID').failNext('set', new Error('failed creating team'))
        global.db.ref('/teams/team2/ownerUID').autoFlush()

        const prom = store.actions.signup({ commit, dispatch }, payload)
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith('loading', true)

        global.auth.flush()

        await prom

        expect(commit).toHaveBeenCalledTimes(3)

        expect(commit).toHaveBeenCalledWith('notify', {
          message: "You don't have permissions to view this team.",
          color: 'error',
        })

        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(dispatch).toHaveBeenCalledWith('logout')
        expect(commit).toHaveBeenCalledWith('loading', false)
      })
    })

    describe('signin', () => {
      it('signs in with given name and password', async () => {
        const commit = jest.fn()
        const dispatch = jest.fn()
        const payload = {
          name: 'SIGNIN-TEST-NAME',
          password: 'my-password',
        }

        global.auth.autoFlush()

        const prom = store.actions.signin({ commit, dispatch }, payload)
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith('loading', true)

        const user = await global.auth.getAuth()
        expect(user.email).toEqual('signin-test-name@pair.ist')

        await prom

        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(dispatch).toHaveBeenCalledWith('autoLogin', user)

        expect(global.router.push).toHaveBeenCalledWith({ name: 'TeamCurrent', params: { team: 'signin-test-name' } })
      })

      it('notifies user of failed auth', async () => {
        const commit = jest.fn()
        const dispatch = jest.fn()
        const payload = {
          name: 'SIGNIN-TEST-NAME2',
          password: 'my-password',
        }

        global.auth.failNext('signInWithEmailAndPassword', new Error('email address signin fail'))
        global.auth.autoFlush()

        const prom = store.actions.signin({ commit, dispatch }, payload)
        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith('loading', true)

        await prom

        expect(commit).toHaveBeenCalledTimes(3)
        expect(commit).toHaveBeenCalledWith('loading', false)
        expect(commit).toHaveBeenCalledWith('notify', {
          message: 'name signin fail',
          color: 'error',
        })
      })
    })

    describe('logout', () => {
      it('signs out', async () => {
        const commit = jest.fn()

        global.auth.signInWithEmailAndPassword('me@pairist.ist', 'password')
        global.auth.autoFlush()

        store.actions.logout({ commit })

        const user = await global.auth.getAuth()
        expect(user).toBeFalsy()

        expect(commit).toHaveBeenCalledTimes(3)
        expect(commit).toHaveBeenCalledWith('loading', true)
        expect(commit).toHaveBeenCalledWith('setUser', null)
        expect(commit).toHaveBeenCalledWith('loading', false)
        expect(global.router.push).toHaveBeenCalledWith({ name: 'Home' })
      })
    })
  })
})
