import stripe from "stripe";

const client = new stripe(`${process.env.S_SECRET_KEY}`, {
  apiVersion: "2019-12-03"
});

export const Stripe = {
  connect: async (code: string): Promise<stripe.OAuthToken> => {
    const response = await client.oauth.token({
      grant_type: "authorization_code",
      code
    });

    if (!response) {
      throw new Error("failed to connect to stripe");
    }

    return response;
  },
  charge: async (
    amount: number,
    source: string,
    stripeAccount: string
  ): Promise<void> => {
    const res = await client.charges.create(
      {
        amount,
        currency: "usd",
        source,
        application_fee_amount: Math.round(amount * 0.05)
      },
      { stripeAccount }
    );

    if (res.status !== "succeeded") {
      throw new Error("failed to created charge with Stripe.");
    }
  },
  async disconnect(stripeUserId: string) {
    const response = await client.oauth.deauthorize({
      client_id: process.env.S_CLIENT_ID!,
      stripe_user_id: stripeUserId
    });

    return response;
  }
};
