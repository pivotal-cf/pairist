import React, { Component } from 'react';

class Person extends Component {
  render() {
    const id = 'person_' + this.props.id;
    return (
      <div id={id} className="person">
        {this.props.person.name}
      </div>
    );
  }
}

export default Person;
