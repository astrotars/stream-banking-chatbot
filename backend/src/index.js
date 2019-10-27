import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { StreamChat } from "stream-chat";

dotenv.config();

const api = express();

api.use(cors());
api.use(compression());
api.use(helmet());
api.use(bodyParser.urlencoded({ extended: true }));
api.use(bodyParser.json());

api.listen(process.env.PORT, error => {
  if (error) {
    console.warn(error);
    process.exit(1);
  }

  // eslint-disable-next-line array-callback-return
  fs.readdirSync(path.join(__dirname, 'routes')).map(file => {
    require('./routes/' + file)(api);
  });

  const apiKey = process.env.STREAM_API_KEY;
  const apiSecret = process.env.STREAM_API_SECRET;

  const client = new StreamChat(apiKey, apiSecret);

  client.updateUsers([{
    id: "server",
    role: "admin",
    image: "https://robohash.org/server",
  }]);

  console.info(
    `Running on port ${process.env.PORT} in ${
      process.env.NODE_ENV
    } mode. 🚀`
  );
});

module.exports = api;
