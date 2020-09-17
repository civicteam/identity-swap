import React from "react";
import { render } from "../testUtils";
import "@testing-library/jest-dom/extend-expect";
import App from "./App";

describe("<App>", () => {
  it("renders", async () => {
    const { findByTestId } = render(<App />);

    const appElement = await findByTestId("app");
    expect(appElement).toBeInTheDocument();
  });
});
