import React from "react";
import { shallow } from "enzyme";
import Person from "./Person";

describe("Person", () => {
  it("renders without crashing", () => {
    shallow(<Person key={1} name="Luan" />);
  });

  it("renders the persons name", () => {
    const person = shallow(<Person key={1} name="Luan" />);
    expect(person.find("div").text()).toContain("Luan");
  });
});
