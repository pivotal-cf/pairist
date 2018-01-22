import React, { Component } from 'react';
import Person from './Person';

class People extends Component {
  render() {
    return (
      <div className="people">
        {this.props.people.map(person => (
          <Person key={person.id} person={person} />
        ))}
      </div>
    );
  }
}

export default People;
