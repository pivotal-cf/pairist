import React from "react";
import { shallow } from "enzyme";
import People from "./People";
import Person from "./Person";

describe("People", () => {
  it("renders without crashing", () => {
    shallow(<People people={[]} />);
  });

  it("renders multiple persons", () => {
    const people = [{ id: 1, name: "Luan" }, { id: 2, name: "Josh" }];
    const wrapper = shallow(<People people={people} />);
    expect(wrapper).toContainReact(<Person key={1} name="Luan" />);
    expect(wrapper).toContainReact(<Person key={2} name="Josh" />);
  });
});
