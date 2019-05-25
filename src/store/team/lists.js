import { vuexfireMutations, firebaseAction } from 'vuexfire'

export default {
  namespaced: true,

  state: {
    lists: [],
  },

  mutations: {
    setRef (state, ref) { state.ref = ref },
    ...vuexfireMutations,
  },

  getters: {
    all (state) {
      return state.lists
    },
  },

  actions: {
    setRef: firebaseAction(({ bindFirebaseRef, commit }, ref) => {
      bindFirebaseRef('lists', ref.orderByChild('order'))
      commit('setRef', ref.ref)
    }),

    async saveItem ({ state }, { listKey, item }) {
      if (item['.key']) {
        const key = item['.key']
        delete item['.key']

        await state.ref.child(listKey).child('items').child(key).update(item)
      } else {
        await state.ref.child(listKey).child('items').push({
          title: item.title,
        })
      }
    },

    reorderLists ({ state }, lists) {
      lists.forEach((list, order) => {
        state.ref.child(list['.key']).update({ order })
      })
    },

    removeItem ({ state }, { listKey, key }) {
      state.ref.child(listKey).child('items').child(key).remove()
    },

    save ({ state }, list) {
      if (list['.key']) {
        const key = list['.key']
        delete list['.key']

        state.ref.child(key).update(list)
      } else {
        state.ref.push({
          title: list.title || '',
          items: [],
        })
      }
    },

    reorder ({ state }, { list, items }) {
      items.forEach((item, order) => {
        state.ref.child(list['.key']).child('items').child(item['.key']).update({ order })
      })
    },

    remove ({ state }, key) {
      state.ref.child(key).remove()
    },
  },
}
