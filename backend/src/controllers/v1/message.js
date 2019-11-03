import dotenv from 'dotenv';
import { chat } from '../../stream';
import { getEThree } from "../../virgil";

const { struct } = require('pb-util');

const dialogflow = require('dialogflow');
const uuid = require('uuid');
const balances = {};
const sessions = {};

dotenv.config();

const maybeInitUser = (userId) => {
  if (!balances[userId]) {
    balances[userId] = {
      checking: 1000,
      savings: 500,
    };
  }

  if (!sessions[userId]) {
    sessions[userId] = uuid.v4();
  }
};

const interpretMessage = async (eThree, publicKey, data) => {
  const userId = data['user']['id'];
  const message = await eThree.decrypt(data['message']['text'], publicKey);

  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.sessionPath(process.env.GOOGLE_APPLICATION_PROJECT_ID, sessions[userId]);

  const responses = await sessionClient.detectIntent({
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'en-US',
      },
    },
  });

  return responses[0].queryResult;
};

const buildResponse = (userId, result) => {
  let text = '';

  if (result.intent.displayName === 'Check Accounts') {
    text = `Here are your balances\nChecking: $${balances[userId].checking}\nSavings: $${balances[userId].savings}`;
  } else if (result.intent.displayName === 'Transfer Money') {
    const parameters = struct.decode(result.parameters);
    const transfer = parameters.transfer;
    const amount = parameters.amount.amount;
    if (transfer === 'checking to savings') {
      balances[userId].checking -= amount;
      balances[userId].savings += amount;
      text = result.fulfillmentText;
    } else if (transfer === 'savings to checking') {
      balances[userId].checking += amount;
      balances[userId].savings -= amount;
      text = result.fulfillmentText;
    } else {
      text = 'Failed to transfer, unknown accounts';
    }
  } else {
    text = result.fulfillmentText;
  }

  return text;
};

exports.message = async (req, res) => {
  try {
    const data = req.body;
    const userId = data['user']['id'];
    if (data['type'] === 'message.new' && userId !== 'chatbot') {
      maybeInitUser(userId);

      const eThree = await getEThree();
      const publicKey = await eThree.lookupPublicKeys(userId);
      const channel = chat.channel('team', `${userId}-chatbot`, {});

      const result = await interpretMessage(eThree, publicKey, data);
      const response = await buildResponse(userId, result);

      const encryptedText = await eThree.encrypt(response, publicKey);
      const message = {
        text: encryptedText,
        user: { id: 'chatbot' },
      };

      await channel.sendMessage(message);
    }
    res.status(200).json({});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
