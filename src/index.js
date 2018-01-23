import "bootstrap/dist/css/bootstrap.css"
import "bootstrap/dist/css/bootstrap-theme.css"

import React from "react"
import ReactDOM from "react-dom"
import App from "./components/App"
import { Provider } from "react-redux"
import { createStore, combineReducers, compose } from "redux"
import { reactReduxFirebase, firebaseReducer } from "react-redux-firebase"
import firebase from "firebase"
import registerServiceWorker from "./registerServiceWorker"
import firebaseConfig from "./fire"

const rrfConfig = {
  userProfile: "users",
}

firebase.initializeApp(firebaseConfig)

const createStoreWithFirebase = compose(reactReduxFirebase(firebase, rrfConfig))(createStore)

const rootReducer = combineReducers({
  firebase: firebaseReducer,
})

// Create store with reducers and initial state
const initialState = {}
const store = createStoreWithFirebase(rootReducer, initialState)

const All = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}

ReactDOM.render(<All />, document.getElementById("root"))
registerServiceWorker()
