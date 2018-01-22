import React from "react";
import Person from "./Person";
import PropTypes from "prop-types";

const People = ({ people }) => (
  <div className="people">
    {people.map(person => <Person key={person.id} name={person.name} />)}
  </div>
);

People.propTypes = {
  people: PropTypes.array,
};

export default People;
