process.env.NODE_ENV !== "production" && require("dotenv").config();

import express, { Application } from "express";
import compression from "compression";
import { ApolloServer } from "apollo-server-express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./database";
import { typeDefs, resolvers } from "./graphql";

const mount = async (app: Application) => {
  const db = await connectDatabase();

  app.use(
    bodyParser.json({
      limit: "2mb"
    })
  );
  // add secret to be a signed cookie
  app.use(cookieParser(process.env.SECRET));
  app.use(compression());

  app.use(express.static(`${__dirname}/client`));

  app.get("*", (_req, res) => {
    res.sendFile(`${__dirname}/client/index.html`);
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ db, req, res })
  });

  server.applyMiddleware({ app, path: "/api" });

  app.listen(process.env.PORT);

  console.log(`[app] : http://localhost:${process.env.PORT}`);
};

mount(express());
