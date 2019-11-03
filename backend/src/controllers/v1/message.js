import dotenv from 'dotenv';
import { StreamChat } from 'stream-chat';
import { generator } from './virgil-credentials';
import { EThree } from '@virgilsecurity/e3kit';

const dialogflow = require('dialogflow');
const uuid = require('uuid');


dotenv.config();

exports.message = async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const userId = data["user"]["id"];
    if (data["type"] === "message.new" && userId !== 'chatbot') {
      const apiKey = process.env.STREAM_API_KEY;
      const apiSecret = process.env.STREAM_API_SECRET;

      const client = new StreamChat(apiKey, apiSecret);
      const channel = client.channel('team', `${userId}-chatbot`, {});

      const chatbotToken = generator.generateToken('chatbot');
      const eThree = await EThree.initialize(() => chatbotToken);
      const publicKeys = await eThree.lookupPublicKeys([userId]);

      // A unique identifier for the given session
      const sessionId = uuid.v4();

      // Create a new session
      const sessionClient = new dialogflow.SessionsClient();
      const sessionPath = sessionClient.sessionPath('test-udklyf', sessionId);

      // The text query request.
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            // The query to send to the dialogflow agent
            text: 'hello',
            // The language used by the client (en-US)
            languageCode: 'en-US',
          },
        },
      };

      // Send request and log result
      const responses = await sessionClient.detectIntent(request);
      const result = responses[0].queryResult;
      console.log("Intent", result.intent);
      let text = '';
      if (result.intent) {
        text = `Intent: ${result.intent.displayName}`;
      } else {
        text = "I didn't understand that";
      }

      const encryptedText = await eThree.encrypt(text, publicKeys[userId]);
      const message = {
        text: encryptedText,
        user: { id: 'chatbot' },
      };
      console.log('text', text);
      console.log('publicKeys', publicKeys);
      console.log('encryptedText', encryptedText);

      await channel.sendMessage(message);
    }
    res.status(200).json({});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
