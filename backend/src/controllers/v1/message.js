import dotenv from 'dotenv';
import { StreamChat } from 'stream-chat';
import { generator } from './virgil-credentials';
import { EThree } from '@virgilsecurity/e3kit';

const { pb } = require('pb-util');

const dialogflow = require('dialogflow');
const uuid = require('uuid');
const balances = {};

dotenv.config();

exports.message = async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const userId = data['user']['id'];
    if (data['type'] === 'message.new' && userId !== 'chatbot') {
      if (!balances[userId]) {
        balances[userId] = {
          checking: 1000,
          savings: 500,
        };
      }
      const apiKey = process.env.STREAM_API_KEY;
      const apiSecret = process.env.STREAM_API_SECRET;

      const client = new StreamChat(apiKey, apiSecret);
      const channel = client.channel('team', `${userId}-chatbot`, {});

      const chatbotToken = generator.generateToken('chatbot');
      const eThree = await EThree.initialize(() => chatbotToken);
      const publicKey = (await eThree.lookupPublicKeys([userId]))[userId];
      const userMessage = await eThree.decrypt(data['message']['text'], publicKey);

      // A unique identifier for the given session
      const sessionId = uuid.v4();

      // Create a new session
      const sessionClient = new dialogflow.SessionsClient();
      const sessionPath = sessionClient.sessionPath(process.env.GOOGLE_APPLICATION_PROJECT_ID, sessionId);

      // The text query request.
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            // The query to send to the dialogflow agent
            text: userMessage,
            // The language used by the client (en-US)
            languageCode: 'en-US',
          },
        },
      };

      // Send request and log result
      const responses = await sessionClient.detectIntent(request);
      const result = responses[0].queryResult;
      console.log("Result", result);
      let text = '';
      if (result.intent.displayName === 'Check Accounts') {
        text = `Here are your balances\nChecking: $${balances[userId].checking}\nSavings: $${balances[userId].savings}`;
      } else if (result.intent.displayName === 'Transfer Money') {
        const parameters = pb.decode(result.parameters);
        console.log('parameters', parameters);
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

      const encryptedText = await eThree.encrypt(text, publicKey);
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
