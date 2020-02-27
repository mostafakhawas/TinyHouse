import { google } from "googleapis";
import { Client } from "@googlemaps/google-maps-services-js";
import { AddressComponent } from "@googlemaps/google-maps-services-js/dist/common";

const auth = new google.auth.OAuth2(
  process.env.G_CLIENT_ID,
  process.env.G_CLIENT_SECRET,
  `${process.env.PUBLIC_URL}/login`
);

const maps = new Client({});

const parseAddress = (addressComponents: AddressComponent[]) => {
  let country = null;
  let admin = null;
  let city = null;

  for (const component of addressComponents) {
    if (component.types.includes("country")) {
      country = component.long_name;
    }

    if (component.types.includes("administrative_area_level_1")) {
      admin = component.long_name;
    }

    if (
      component.types.includes("locality") ||
      component.types.includes("postal_town")
    ) {
      city = component.long_name;
    }
  }

  return {
    country,
    admin,
    city
  };
};

export const Google = {
  authUrl: auth.generateAuthUrl({
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ]
  }),
  login: async (code: string) => {
    const { tokens } = await auth.getToken(code);
    auth.setCredentials(tokens);

    const { data } = await google.people({ version: "v1", auth }).people.get({
      resourceName: "people/me",
      personFields: "emailAddresses,names,photos"
    });

    return { user: data };
  },

  geocode: async (address: string) => {
    const response = await maps.geocode({
      params: {
        key: process.env.G_GEOCODE_KEY!,
        address
      }
    });

    if (response.status < 200 || response.status > 299) {
      throw new Error("failed to geocode address");
    }

    return parseAddress(response.data.results[0].address_components);
  }
};
