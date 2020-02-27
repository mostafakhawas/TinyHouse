export interface Viewer {
  id: string | null;
  avatar: string | null;
  token: string | null;
  hasWallet: boolean | null;
  didRequest: boolean;
}
