import PropTypes from "prop-types"
import React from "react"

const Person = ({ name }) => <div className="person">{name}</div>

Person.propTypes = {
  name: PropTypes.string,
}

export default Person
