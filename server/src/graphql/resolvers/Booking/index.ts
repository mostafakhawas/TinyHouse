import { IResolvers } from "apollo-server-express";
import { Request } from "express";
import { ObjectId } from "mongodb";
import { Stripe } from "../../../lib/api";
import { authorize } from "../../../lib/utils";
import {
  Booking,
  Database,
  Listing,
  User,
  BookingsIndex
} from "../../../lib/types";
import { CreateBookingArgs } from "./types";

const resolveBookingsIndex = (
  bookingsIndex: BookingsIndex,
  checkInDate: string,
  checkOutDate: string
): BookingsIndex => {
  let dateCursor = new Date(checkInDate);
  let checkOut = new Date(checkOutDate);
  const newBookingsIndex = { ...bookingsIndex };

  while (dateCursor <= checkOut) {
    const year = dateCursor.getUTCFullYear();
    const month = dateCursor.getUTCMonth();
    const day = dateCursor.getUTCDate();

    if (!newBookingsIndex[year]) {
      newBookingsIndex[year] = {};
    }

    if (!newBookingsIndex[year][month]) {
      newBookingsIndex[year][month] = {};
    }

    if (!newBookingsIndex[year][month][day]) {
      newBookingsIndex[year][month][day] = true;
    } else {
      throw new Error(
        "selected dates can't overlap dates that have already been booked"
      );
    }

    dateCursor = new Date(dateCursor.getTime() + 86400000);
  }

  return newBookingsIndex;
};

export const bookingResolvers: IResolvers = {
  Mutation: {
    createBooking: async (
      _root: undefined,
      { input }: CreateBookingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Booking> => {
      try {
        const { id, source, checkIn, checkOut } = input;

        // verify a logged in user is making the request
        const viewer = await authorize(db, req);

        if (!viewer) {
          throw new Error("viewer can't be found");
        }

        // find listing document from database
        const listing = await db.listings.findOne({ _id: new ObjectId(id) });

        if (!listing) {
          throw new Error("listing can't be found");
        }

        // check that viewer is not booking his own listing
        if (listing.host === viewer._id) {
          throw new Error("viewer can't book own listing");
        }

        // check that checkout > checkin
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkOutDate < checkInDate) {
          throw new Error("check out date can't be before check in date");
        }

        // create a new bookingsIndex for listing being booked
        const bookingsIndex = resolveBookingsIndex(
          listing.bookingsIndex,
          checkIn,
          checkOut
        );

        // get total price to charge
        const totalPrice =
          listing.price *
          ((checkOutDate.getTime() - checkInDate.getTime()) / 86400000 + 1);

        // get user document of host
        const host = await db.users.findOne({ _id: listing.host });

        if (!host || !host.walletId) {
          throw new Error(
            "the host either can't be found or isn't connected with Stripe"
          );
        }

        // create stripe charge
        await Stripe.charge(totalPrice, source, host.walletId);

        // insert new booking in db
        const insertRes = await db.bookings.insertOne({
          _id: new ObjectId(),
          listing: listing._id,
          tenant: viewer._id,
          checkIn,
          checkOut
        });

        const insertedBooking: Booking = insertRes.ops[0];

        // update host's income in db
        await db.users.updateOne(
          { _id: host._id },
          { $inc: { income: totalPrice } }
        );

        // update booking field for tenant in db
        await db.users.updateOne(
          { _id: viewer._id },
          { $push: { bookings: insertedBooking._id } }
        );

        // update booking field for listing in db
        await db.listings.updateOne(
          { _id: listing._id },
          { $set: { bookingsIndex }, $push: { bookings: insertedBooking._id } }
        );

        // return newly inserted booking
        return insertedBooking;
      } catch (error) {
        throw new Error(`Failed to create a booking: ${error}`);
      }
    }
  },
  Booking: {
    id: ({ _id }: Booking): string => _id.toString(),
    listing: async (
      { listing }: Booking,
      _args: {},
      { db }: { db: Database }
    ): Promise<Listing | null> => {
      return db.listings.findOne({ _id: listing });
    },
    tenant: async (
      { tenant }: Booking,
      _args: {},
      { db }: { db: Database }
    ): Promise<User> => {
      const user = await db.users.findOne({ _id: tenant });
      if (!user) {
        throw new Error(`could not find tenant`);
      }
      return user;
    }
  }
};
