import React from "react";
import { useMutation } from "@apollo/react-hooks";
import { Card, Typography, Avatar, Divider, Button, Tag } from "antd";
import {
  formatListingPrice,
  displaySuccessNotification,
  displayErrorMessage
} from "../../../../lib/utils";
import { DISCONNECT_STRIPE } from "../../../../lib/graphql";
import { User as UserData } from "../../../../lib/graphql/queries/User/__generated__/User";
import { DisconnectStripe as DisconnectStripeData } from "../../../../lib/graphql/mutations/DisconnectStripe/__generated__/disconnectStripe";
import { Viewer } from "../../../../lib/types";

interface Props {
  user: UserData["user"];
  viewer: Viewer;
  viewerIsUser: boolean;
  setViewer: (viewer: Viewer) => void;
}

const stripeAuthUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.REACT_APP_S_CLIENT_ID}&scope=read_write`;
const { Paragraph, Text, Title } = Typography;

export const UserProfile = ({
  user,
  viewer,
  viewerIsUser,
  setViewer
}: Props) => {
  const [disconnectStripe, { loading }] = useMutation<DisconnectStripeData>(
    DISCONNECT_STRIPE,
    {
      onCompleted: data => {
        if (data && data.disconnectStripe) {
          setViewer({
            ...viewer,
            hasWallet: data.disconnectStripe.hasWallet
          });
          displaySuccessNotification(
            "You've successfully disconnected from Stripe!",
            "You'll have to reconnect with Stripe to continue to create listings."
          );
        }
      },
      onError: () => {
        displayErrorMessage(
          "Sorry! We were'nt able to disconnect you from Stripe. Please try again later!"
        );
      }
    }
  );

  const redirectToStripe = () => (window.location.href = stripeAuthUrl);

  const additionalDetails = viewer.hasWallet ? (
    <>
      <Paragraph>
        <Tag color="green">Stripe Registered</Tag>
      </Paragraph>
      <Paragraph>
        Icome Earned:{" "}
        <Text strong>
          {user.income ? formatListingPrice(user.income) : "0$"}
        </Text>
      </Paragraph>
      <Button
        type="danger"
        className="user-profile__details-cta"
        loading={loading}
        onClick={() => disconnectStripe()}
      >
        Disconnect Stripe
      </Button>
      <Paragraph type="secondary">
        By disconnecting, you won't be able to recieve{" "}
        <Text strong>any further payments</Text>. This will prevent users from
        booking listings that you might have already created.
      </Paragraph>
    </>
  ) : (
    <>
      <Paragraph>
        Interested in becoming a TinyHouse host? Register with your Stripe
        account!
      </Paragraph>
      <Button
        type="primary"
        className="user-profile__details-cta"
        onClick={redirectToStripe}
      >
        Connect with Stripe
      </Button>
      <Paragraph type="secondary">
        TinyHouse uses{" "}
        <a
          href="https://stripe.com/en-US/connect"
          target="_blank"
          rel="noopener noreferrer"
        >
          Stripe
        </a>{" "}
        to help transfer your earnings in a secure and trusted manner.
      </Paragraph>
    </>
  );

  const additionalDetailsSection = viewerIsUser ? (
    <>
      <Divider />
      <div className="user-profile__details">
        {" "}
        <Title level={4}>Additional Details</Title>
        {additionalDetails}
      </div>
    </>
  ) : null;

  return (
    <div className="user-profile">
      <Card className="user-profile__card">
        <div className="user-profile__avatar">
          <Avatar src={user.avatar} size={100} />
        </div>
        <Divider />
        <div className="user-profile__details">
          <Title level={4}>Details</Title>
          <Paragraph>
            Name: <Text strong>{user.name}</Text>
            <Paragraph>
              Contact: <Text strong>{user.contact}</Text>
            </Paragraph>
          </Paragraph>
        </div>
        {additionalDetailsSection}
      </Card>
    </div>
  );
};
