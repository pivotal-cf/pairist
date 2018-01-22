import PropTypes from "prop-types";
import React, { Component } from "react";

class Person extends Component {
  render() {
    return <div className="person">{this.props.name}</div>;
  }
}

Person.propTypes = {
  id: PropTypes.number,
  name: PropTypes.string,
};

export default Person;
