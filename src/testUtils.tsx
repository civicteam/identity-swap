// render function that wraps providers
// see https://testing-library.com/docs/react-testing-library/setup

import React, { ComponentType, ReactElement, ReactNode } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./app/store";

type Props = {
  children?: ReactNode;
};
const WrapProviders: ComponentType<Props> = ({ children }: Props) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>{children}</Router>
      </PersistGate>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "queries">
): RenderResult => render(ui, { wrapper: WrapProviders, ...options });

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
