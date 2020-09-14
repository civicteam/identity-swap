import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import store from "./app/store";

import "./index.css";

const render = () => {
  // Load the app dynamically, which allows for hot-reloading in development mode.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const App = require("./app/App").default;

  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
    document.getElementById("root")
  );
};

render();

// Allow the hot-reloading of the App in development mode
if (process.env.NODE_ENV === "development" && module.hot) {
  module.hot.accept("./app/App", render);
}
