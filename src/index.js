import "bootstrap/dist/css/bootstrap.css"
import "bootstrap/dist/css/bootstrap-theme.css"

import React from "react"
import ReactDOM from "react-dom"
import App from "./components/App"
import { Provider } from "react-redux"
import registerServiceWorker from "./registerServiceWorker"
import configureStore from "./store/configureStore"

const store = configureStore()

const All = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}

ReactDOM.render(<All />, document.getElementById("root"))
registerServiceWorker()
