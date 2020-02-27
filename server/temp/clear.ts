require("dotenv").config();

import { connectDatabase } from "../src/database";

const clear = async () => {
  try {
    console.log("[clear] : running...");
    const db = await connectDatabase();

    const bookings = await db.bookings.find({}).toArray();
    if (bookings.length > 0) {
      await db.bookings.drop();
    }

    const listings = await db.listings.find({}).toArray();
    if (listings.length > 0) {
      await db.listings.drop();
    }

    const users = await db.users.find({}).toArray();
    if (users.length > 0) {
      await db.users.drop();
    }

    console.log("[clear] : success");
    process.exit();
  } catch {
    throw new Error("failed to clear database");
  }
};

clear();
