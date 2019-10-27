import dotenv from 'dotenv';
import { StreamChat } from 'stream-chat';

dotenv.config();

exports.message = async (req, res) => {
  try {
    const data = req.body;
    console.log(req.body);
    const userId = data["user"]["id"];
    if (data["type"] === "message.new" && userId !== 'server') {
      const apiKey = process.env.STREAM_API_KEY;
      const apiSecret = process.env.STREAM_API_SECRET;

      const client = new StreamChat(apiKey, apiSecret);
      const spacexChannel = client.channel('team', `${userId}-server`, {});
      const text = 'I was gonna get to mars but then I got high';
      const message = {
        text,
        user: { id: 'server' },
      };
      const response = await spacexChannel.sendMessage(message);
    }
    res.status(200).json({});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
