import { IResolvers } from "apollo-server-express";
import { ObjectId } from "mongodb";
import { Request } from "express";
import {
  ListingArgs,
  ListingBookingsArgs,
  ListingBookingsData,
  ListingsArgs,
  ListingsData,
  ListingsFilter,
  ListingsQuery,
  HostListingArgs,
  HostListingInput
} from "./types";
import { Listing, Database, User, ListingType } from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import { Google, Cloudinary } from "../../../lib/api";

const verifyHostListingInput = (input: HostListingInput): void => {
  const { title, description, type, price } = input;
  if (title.length > 100) {
    throw new Error("listing title must be under 100 characters.");
  }

  if (description.length > 5000) {
    throw new Error("listing description must be under 5000 characters.");
  }

  if (type !== ListingType.Apartment && type !== ListingType.House) {
    throw new Error("Listing type must be either apartment or house.");
  }

  if (price < 0) {
    throw new Error("Price must be greater than 0.");
  }
};

export const ListingResolvers: IResolvers = {
  Query: {
    listing: async (
      _root: undefined,
      { id }: ListingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Listing> => {
      try {
        const listing = await db.listings.findOne({ _id: new ObjectId(id) });
        if (!listing) {
          throw new Error("listing can't be found");
        }
        const viewer = await authorize(db, req);
        if (viewer && viewer?._id === listing.host) {
          listing.authorized = true;
        }

        return listing;
      } catch (error) {
        throw new Error(`Failed to query listing: ${error}`);
      }
    },
    listings: async (
      _root: undefined,
      { location, filter, limit, page }: ListingsArgs,
      { db }: { db: Database }
    ): Promise<ListingsData> => {
      try {
        const query: ListingsQuery = {};

        const data: ListingsData = {
          region: null,
          total: 0,
          result: []
        };

        if (location) {
          const { country, admin, city } = await Google.geocode(location);

          if (city) query.city = city;
          if (admin) query.admin = admin;
          if (country) {
            query.country = country;
          } else {
            throw new Error("no country found");
          }
          const cityText = city ? `${city}, ` : "";
          const adminText = admin ? `${admin}, ` : "";
          data.region = `${cityText}${adminText}${country}`;
        }

        let cursor = db.listings.find(query);

        if (filter === ListingsFilter.PRICE_LOW_TO_HIGH) {
          cursor.sort({
            price: 1
          });
        }

        if (filter === ListingsFilter.PRICE_HIGH_TO_LOW) {
          cursor.sort({
            price: -1
          });
        }

        cursor.skip(page > 0 ? (page - 1) * limit : 0).limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`Failed to query listings: ${error}`);
      }
    }
  },
  Mutation: {
    hostListing: async (
      _root: undefined,
      { input }: HostListingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Listing> => {
      verifyHostListingInput(input);

      const viewer = await authorize(db, req);
      if (!viewer) {
        throw new Error("viewer can't be found.");
      }

      const { country, admin, city } = await Google.geocode(input.address);
      if (!country || !admin || !city) {
        throw new Error("invalid address input.");
      }

      const imageUrl = await Cloudinary.upload(input.image);

      const insertResult = await db.listings.insertOne({
        _id: new ObjectId(),
        ...input,
        image: imageUrl,
        bookings: [],
        bookingsIndex: {},
        country,
        admin,
        city,
        host: viewer._id
      });

      const insertedListing: Listing = insertResult.ops[0];

      await db.users.updateOne(
        { _id: viewer._id },
        {
          $push: {
            listings: insertedListing._id
          }
        }
      );

      return insertedListing;
    }
  },
  Listing: {
    id: ({ _id }: Listing): string => _id.toString(),
    host: async (
      { host }: Listing,
      _args: {},
      { db }: { db: Database }
    ): Promise<User> => {
      const user = await db.users.findOne({ _id: host });
      if (!user) {
        throw new Error("host can't be found");
      }
      return user;
    },
    bookingsIndex: ({ bookingsIndex }: Listing): string => {
      return JSON.stringify(bookingsIndex);
    },
    bookings: async (
      { authorized, bookings }: Listing,
      { limit, page }: ListingBookingsArgs,
      { db }: { db: Database }
    ): Promise<ListingBookingsData | null> => {
      try {
        if (!authorized) {
          return null;
        }

        const data: ListingBookingsData = {
          total: 0,
          result: []
        };

        let cursor = db.bookings.find({ _id: { $in: bookings } });
        cursor.skip(page > 0 ? (page - 1) * limit : 0).limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`Failed to query listing's bookings: ${error}`);
      }
    }
  }
};
