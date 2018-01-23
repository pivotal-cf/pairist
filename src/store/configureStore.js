import { createStore, combineReducers, compose } from "redux"
import { reactReduxFirebase, firebaseReducer } from "react-redux-firebase"
import firebase from "firebase"
import firebaseConfig from "../fire"

const rrfConfig = {
  userProfile: "users",
}

firebase.initializeApp(firebaseConfig)

const createStoreWithFirebase = compose(reactReduxFirebase(firebase, rrfConfig))(createStore)

const rootReducer = combineReducers({
  firebase: firebaseReducer,
})

export default initialState => createStoreWithFirebase(rootReducer, initialState)
