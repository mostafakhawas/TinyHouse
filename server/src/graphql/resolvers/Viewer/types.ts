export interface LoginArgs {
  input: {
    code: string;
  } | null;
}

export interface ConnectStripeArgs {
  input: {
    code: string;
  };
}
