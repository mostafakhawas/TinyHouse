/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LoginInput } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: Login
// ====================================================

export interface Login_login {
  __typename: "Viewer";
  id: string | null;
  token: string | null;
  avatar: string | null;
  hasWallet: boolean | null;
  didRequest: boolean;
}

export interface Login {
  login: Login_login;
}

export interface LoginVariables {
  input?: LoginInput | null;
}
