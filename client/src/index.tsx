import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider, useMutation } from "@apollo/react-hooks";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { StripeProvider, Elements } from "react-stripe-elements";
import { Layout, Affix, Spin } from "antd";
import {
  Home,
  Listing,
  Listings,
  NotFound,
  User,
  Login,
  AppHeader,
  Stripe,
  WrappedHost
} from "./sections";
import { Viewer } from "./lib/types";
import * as serviceWorker from "./serviceWorker";
import "./styles/index.css";
import { LOGIN } from "./lib/graphql";
import {
  LoginVariables,
  Login as LoginData
} from "./lib/graphql/mutations/Login/__generated__/Login";
import { AppHeaderSkeleton, ErrorBanner } from "./lib/components";

const client = new ApolloClient({
  uri: "/api",
  request: async operation => {
    const token = sessionStorage.getItem("token");
    operation.setContext({
      headers: {
        "X-CSRF-TOKEN": token || ""
      }
    });
  }
});

const initialViewer: Viewer = {
  id: null,
  avatar: null,
  hasWallet: null,
  token: null,
  didRequest: false
};

const App = () => {
  const [viewer, setViewer] = useState<Viewer>(initialViewer);
  const [login, { error }] = useMutation<LoginData, LoginVariables>(LOGIN, {
    onCompleted: data => {
      if (data && data.login) {
        setViewer(data.login);

        if (data.login.token) {
          sessionStorage.setItem("token", data.login.token);
        } else {
          sessionStorage.removeItem("token");
        }
      }
    }
  });

  const loginRef = useRef(login);

  useEffect(() => {
    loginRef.current();
  }, []);

  // as the viewer.didRequest will only be set to true if
  // the viewer has either requested to login or has a cookie
  if (!viewer.didRequest && !error) {
    return (
      <Layout className="app-skeleton">
        <AppHeaderSkeleton />
        <div className="app-skeleton__spin-section">
          <Spin size="large" tip="Launching Tinyhouse" />
        </div>
      </Layout>
    );
  }

  const loginErrorBannerElement = error ? (
    <ErrorBanner description="We were'nt able to verify if you were logged in. Please try again later!" />
  ) : null;

  return (
    <StripeProvider apiKey={process.env.REACT_APP_S_PUBLISHABLE_KEY as string}>
      <Router>
        <Layout id="app">
          {loginErrorBannerElement}
          <Affix offsetTop={0}>
            <AppHeader viewer={viewer} setViewer={setViewer} />
          </Affix>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/host">
              <WrappedHost viewer={viewer} />
            </Route>
            <Route exact path="/listing/:id">
              <Elements>
                <Listing viewer={viewer} />
              </Elements>
              >
            </Route>
            <Route exact path="/listings/:location?">
              <Listings />
            </Route>
            <Route exact path="/login">
              <Login setViewer={setViewer} />
            </Route>
            />
            <Route exact path="/stripe">
              <Stripe viewer={viewer} setViewer={setViewer} />
            </Route>
            <Route exact path="/user/:id">
              <User viewer={viewer} setViewer={setViewer} />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </Layout>
      </Router>
    </StripeProvider>
  );
};

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
