import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { chat } from './stream';
import { getEThree } from "./virgil";
import { IdentityAlreadyExistsError } from "@virgilsecurity/e3kit";

dotenv.config();

const api = express();

api.use(cors());
api.use(compression());
api.use(helmet());
api.use(bodyParser.urlencoded({ extended: true }));
api.use(bodyParser.json());

api.listen(process.env.PORT, async error => {
  if (error) {
    console.warn(error);
    process.exit(1);
  }

  // eslint-disable-next-line array-callback-return
  fs.readdirSync(path.join(__dirname, 'routes')).map(file => {
    require('./routes/' + file)(api);
  });

  chat.updateUsers([{
    id: "chatbot",
    role: "admin",
    image: "https://robohash.org/server",
  }]);

  const eThree = await getEThree();
  try {
    await eThree.register();
  } catch (err) {
    if (err instanceof IdentityAlreadyExistsError) {
      // already registered, ignore
    } else {
      throw err;
    }
  }

  console.info(
    `Running on port ${process.env.PORT} in ${
      process.env.NODE_ENV
    } mode. 🚀`
  );
});

module.exports = api;
