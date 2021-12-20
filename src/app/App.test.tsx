import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../store/store";
import App from "./App";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "../keycloak";

test("renders learn react link", () => {
  const { getByText } = render(
    <ReactKeycloakProvider authClient={keycloak}>
      <Provider store={store}>
        <App />
      </Provider>
    </ReactKeycloakProvider>
  );

  expect(getByText(/learn/i)).toBeInTheDocument();
});
