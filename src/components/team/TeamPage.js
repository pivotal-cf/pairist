import React from "react";
import fire from "../../fire";
import People from "./People";

class TeamPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      people: [],
    }; // <- set up react state
  }

  componentWillMount() {
    /* Create reference to people in Firebase Database */
    let peopleRef = fire
      .database()
      .ref("people")
      .orderByKey()
      .limitToLast(100);
    peopleRef.on("child_added", snapshot => {
      /* Update React state when person is added at Firebase Database */
      let person = {
        id: snapshot.key,
        name: snapshot.val(),
      };
      this.setState({
        people: [person].concat(this.state.people),
      });
    });
  }

  addPerson(e) {
    e.preventDefault(); // <- prevent form submit from reloading the page
    /* Send the person to Firebase */
    fire
      .database()
      .ref("people")
      .push(this.inputEl.value);
    this.inputEl.value = ""; // <- clear the input
  }

  render() {
    return (
      <div>
        <form onSubmit={this.addPerson.bind(this)}>
          <input type="text" ref={el => (this.inputEl = el)} />
          <input type="submit" />
        </form>
        <People people={this.state.people} />
      </div>
    );
  }
}

export default TeamPage;
