import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import HomePage from "./home/HomePage";
import TeamPage from "./team/TeamPage";

const App = () => (
  <Router>
    <div>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/team">Team</Link>
        </li>
      </ul>

      <hr />

      <Route exact path="/" component={HomePage} />
      <Route path="/team" component={TeamPage} />
    </div>
  </Router>
);

export default App;
