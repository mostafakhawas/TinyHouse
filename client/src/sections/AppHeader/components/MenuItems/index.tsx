import React from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/react-hooks";
import { Button, Icon, Menu, Avatar } from "antd";
import { LOGOUT } from "../../../../lib/graphql";
import { Viewer } from "../../../../lib/types";
import {
  displaySuccessNotification,
  displayErrorMessage
} from "../../../../lib/utils";
import { Logout as LogoutData } from "../../../../lib/graphql/mutations/Logout/__generated__/Logout";

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

const { Item, SubMenu } = Menu;

export const MenuItems = ({ viewer, setViewer }: Props) => {
  const [logout] = useMutation<LogoutData>(LOGOUT, {
    onCompleted: data => {
      if (data && data.logout) {
        setViewer(data.logout);
        sessionStorage.removeItem("token");
        displaySuccessNotification("You 've successfully logged out!");
      }
    },
    onError: () => {
      displayErrorMessage(
        "Sorry we were'nt able to log you out. Please try again later!"
      );
    }
  });

  const handleLogout = () => {
    logout();
  };

  const subMenuLogin =
    viewer.id && viewer.avatar ? (
      <SubMenu title={<Avatar src={viewer.avatar} />}>
        <Item key="/user">
          <Link to={`/user/${viewer.id}`}>
            <Icon type="user" />
            Profile
          </Link>
        </Item>
        <Item key="/logout">
          <div onClick={handleLogout}>
            <Icon type="logout" /> Log out
          </div>
        </Item>
      </SubMenu>
    ) : (
      <Item>
        <Link to="/login">
          <Button type="primary">Sign In</Button>
        </Link>
      </Item>
    );

  return (
    <Menu mode="horizontal" selectable={false} className="menu">
      <Item key="/host">
        <Link to="/host">
          <Icon type="home" />
          Host
        </Link>
      </Item>
      {subMenuLogin}
    </Menu>
  );
};
