import React, { useEffect, useRef } from "react";
import { Redirect } from "react-router-dom";
import { useApolloClient, useMutation } from "@apollo/react-hooks";
import { Layout, Card, Typography, Spin } from "antd";
import googleLogo from "./assets/google_logo.jpg";
import { Viewer } from "../../lib/types";
import { AUTH_URL, LOGIN } from "../../lib/graphql";
import { AuthUrl } from "../../lib/graphql/queries/AuthUrl/__generated__/AuthUrl";
import { Login as LoginData } from "../../lib/graphql/mutations/Login/__generated__/Login";
import { LoginVariables } from "../../lib/graphql/mutations/Login/__generated__/Login";
import {
  displaySuccessNotification,
  displayErrorMessage
} from "../../lib/utils";
import { ErrorBanner } from "../../lib/components";
import { useScrollToTop } from "../../lib/hooks";

interface Props {
  setViewer: (viewer: Viewer) => void;
}

const { Content } = Layout;
const { Title, Text } = Typography;

export const Login = ({ setViewer }: Props) => {
  const client = useApolloClient();
  const [
    login,
    { data: loginData, loading: loginLoading, error: loginError }
  ] = useMutation<LoginData, LoginVariables>(LOGIN, {
    onCompleted: data => {
      if (data && data.login && data.login.token) {
        setViewer(data.login);
        sessionStorage.setItem("token", data.login.token);
        displaySuccessNotification("You 've successfully logged in!");
      }
    }
  });

  const loginRef = useRef(login);

  useScrollToTop();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    if (code) {
      loginRef.current({ variables: { input: { code } } });
    }
  }, []);

  const handleAuthorize = async () => {
    try {
      const { data } = await client.query<AuthUrl>({ query: AUTH_URL });
      window.location.href = data.authUrl;
    } catch {
      displayErrorMessage(
        "Sorry! We weren't able to log you in. Please try again later!"
      );
    }
  };

  if (loginLoading) {
    return (
      <Content className="log-in">
        <Spin size="large" tip="Logging you in..." />
      </Content>
    );
  }

  if (loginData && loginData.login) {
    const { id: viewerId } = loginData.login;
    return <Redirect to={`/user/${viewerId}`} />;
  }

  const loginErrorBannerElemet = loginError ? (
    <ErrorBanner description="Sorry! We weren't able to log you in. Please try again later!" />
  ) : null;

  return (
    <Content className="log-in">
      {loginErrorBannerElemet}
      <Card className="log-in-card">
        <div className="log-in-card__intro">
          <Title level={3} className="log-in-card__intro-title">
            <span role="img" aria-label="wave">
              👋
            </span>
          </Title>
          <Title level={3} className="log-in-card__intro-title">
            Log in to TinyHouse!
          </Title>
          <Text>Sign in with Google to start booking available rentals!</Text>
        </div>
        <button
          className="log-in-card__google-button"
          onClick={handleAuthorize}
        >
          <img
            src={googleLogo}
            alt="Google Logo"
            className="log-in-card__google-button-logo"
          />
          <span className="log-in-card__google-button-text">
            Sign in with Google
          </span>
        </button>
        <Text type="secondary">
          Note: By signing in, you 'll be redirected to the Google consent form
          to sign in with your Google account.
        </Text>
      </Card>
    </Content>
  );
};
