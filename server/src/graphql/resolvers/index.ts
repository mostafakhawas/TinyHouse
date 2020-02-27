import merge from "lodash.merge";
import { viewerResolvers } from "./Viewer";
import { userResolvers } from "./User";
import { ListingResolvers } from "./Listing";
import { bookingResolvers } from "./Booking";

export const resolvers = merge(
  bookingResolvers,
  ListingResolvers,
  userResolvers,
  viewerResolvers
);
