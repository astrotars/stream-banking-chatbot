# Stream Encrypted Chat w/ Virgil and DialogFlow Boilerplate API

> **_This API is not meant for production as there is no auth in place. Please
> use carefully in testing and development environments only!_**

## Getting Started

Create account an account and project with Stream, Virgil and DialogFlow. With Virgil you need to create
a new Application and create new App Keys within that Application. For DialogFlow follow this [project](https://github.com/googleapis/nodejs-dialogflow)

Create a `.env` file within the main directory with the following environment
variables found on https://getstream.io/dashboard,
https://dashboard.virgilsecurity.com/apps/<your_virgil_app_id>/keys, and the
credentials from Google, following the previously mentioned project setup:

```
NODE_ENV=production
PORT=8080

STREAM_API_KEY=<YOUR_API_KEY>
STREAM_API_SECRET=<YOUR_API_SECRET>
VIRGIL_APP_ID=<YOUR_VIRGIL_APP_ID>
VIRGIL_KEY_ID=<YOUR_VIRGIL_KEY_ID>
VIRGIL_PRIVATE_KEY=<YOUR_VIRGIL_PRIVATE_KEY>
GOOGLE_APPLICATION_PROJECT_ID=<YOUR_GOOGLE_APPLICATION_PROJECT_ID>
GOOGLE_APPLICATION_CREDENTIALS=<YOUR_GOOGLE_APPLICATION_CREDENTIALS>
```

> Note: You can reference `.env.example`.

To spin this up, clone it and run `yarn install` within the `backend` directory,
then run `yarn start`.

