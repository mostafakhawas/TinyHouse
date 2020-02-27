import { gql } from "apollo-boost";

export const LOGOUT = gql`
  mutation Logout {
    logout {
      id
      token
      avatar
      hasWallet
      didRequest
    }
  }
`;
