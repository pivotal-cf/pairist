import React, { Component } from "react";
import Person from "./Person";
import PropTypes from "prop-types";

class People extends Component {
  render() {
    return (
      <div className="people">
        {this.props.people.map(person => <Person key={person.id} name={person.name} />)}
      </div>
    );
  }
}

People.propTypes = {
  people: PropTypes.array,
};

export default People;
