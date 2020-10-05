import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";

import { store, persistor } from "./app/store";

import "./index.css";
import { isDev } from "./utils/env";

const render = () => {
  // Load the app dynamically, which allows for hot-reloading in development mode.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const App = require("./app/App").default;

  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Router>
            <App />
          </Router>
        </PersistGate>
      </Provider>
    </React.StrictMode>,
    document.getElementById("root")
  );
};

render();

// Allow the hot-reloading of the App in development mode
if (isDev && module.hot) {
  module.hot.accept("./app/App", render);
}
