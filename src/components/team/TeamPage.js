import React from "react"
import PropTypes from "prop-types"
import People from "./People"
import { connect } from "react-redux"
import { compose } from "redux"
import { firebaseConnect, isLoaded } from "react-redux-firebase"

class TeamPage extends React.Component {
  addPerson(e) {
    e.preventDefault()
    this.props.firebase.push("people", {
      name: this._name.value,
    })
    this._name.value = ""
  }

  peopleList() {
    if (this.props.people && isLoaded(this.props.people)) {
      return Object.keys(this.props.people).map(key =>
        Object.assign({}, this.props.people[key], { id: key }),
      )
    }
    return []
  }

  render() {
    return (
      <div>
        <form onSubmit={this.addPerson.bind(this)}>
          <input type="text" ref={input => (this._name = input)} />
          <input type="submit" />
        </form>
        <People people={this.peopleList()} />
      </div>
    )
  }
}

TeamPage.propTypes = {
  firebase: PropTypes.object,
  people: PropTypes.object,
}

export default compose(
  firebaseConnect(["people"]),
  connect(state => ({
    people: state.firebase.data.people,
  })),
)(TeamPage)
