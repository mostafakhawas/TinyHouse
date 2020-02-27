import { IResolvers } from "apollo-server-express";
import { Request } from "express";
import { authorize } from "../../../lib/utils";
import { Database, User, Booking } from "../../../lib/types";
import {
  UserArgs,
  UserBookingsArgs,
  UserBookingsData,
  UserListingsArgs,
  UserListingsData
} from "./types";

export const userResolvers: IResolvers = {
  Query: {
    user: async (
      _root: undefined,
      { id }: UserArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<User> => {
      try {
        const user = await db.users.findOne({ _id: id });

        if (!user) {
          throw new Error("user can't be found");
        }

        const viewer = await authorize(db, req);

        if (viewer && viewer._id === user._id) {
          user.authorized = true;
        }

        return user;
      } catch (error) {
        throw new Error(`Failed to query user: ${error}`);
      }
    }
  },
  User: {
    id: ({ _id }: User): string => _id,
    hasWallet: ({ walletId }: User): boolean => Boolean(walletId),
    income: ({ authorized, income }: User): number | null =>
      authorized ? income : null,
    bookings: async (
      { authorized, bookings }: User,
      { limit, page }: UserBookingsArgs,
      { db }: { db: Database }
    ): Promise<UserBookingsData | null> => {
      try {
        if (!authorized) {
          return null;
        }
        const data: UserBookingsData = {
          total: 0,
          result: []
        };

        let cursor = await db.bookings.find({ _id: { $in: bookings } });

        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0).limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();
        return data;
      } catch (error) {
        throw new Error(`Failed to query user bookings: ${error}`);
      }
    },
    listings: async (
      { listings }: User,
      { limit, page }: UserListingsArgs,
      { db }: { db: Database }
    ): Promise<UserListingsData> => {
      try {
        const data: UserListingsData = {
          total: 0,
          result: []
        };

        let cursor = await db.listings.find({ _id: { $in: listings } });
        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0).limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();
        return data;
      } catch (error) {
        throw new Error(`Failed to query user listings: ${error}`);
      }
    }
  }
};
