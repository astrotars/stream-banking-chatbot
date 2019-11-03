import { chat } from '../../stream';

exports.streamCredentials = async (req, res) => {
  try {
    const data = req.body;

    const user = Object.assign({}, data, {
      id: req.user.sender,
      role: 'user',
      image: `https://robohash.org/${req.user.sender}`,
    });

    const token = chat.createToken(user.id);
    await chat.updateUsers([user]);

    res.status(200).json({ user, token, apiKey: process.env.STREAM_API_KEY });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
