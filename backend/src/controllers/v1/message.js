import dotenv from 'dotenv';
import { StreamChat } from 'stream-chat';
import { generator, publicKeys } from './virgil-credentials';
import { EThree } from '@virgilsecurity/e3kit';

dotenv.config();

exports.message = async (req, res) => {
  try {
    const data = req.body;
    const userId = data["user"]["id"];
    if (data["type"] === "message.new" && userId !== 'chatbot') {
      const apiKey = process.env.STREAM_API_KEY;
      const apiSecret = process.env.STREAM_API_SECRET;

      const client = new StreamChat(apiKey, apiSecret);
      const channel = client.channel('team', `${userId}-chatbot`, {});

      const chatbotToken = generator.generateToken('chatbot');
      const eThree = await EThree.initialize(() => chatbotToken);
      const text = await eThree.encrypt('I was gonna get something', publicKeys[userId]);
      const message = {
        text,
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
