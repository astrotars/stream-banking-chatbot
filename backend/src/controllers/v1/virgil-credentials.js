import { virgilToken } from '../../virgil';

exports.virgilCredentials = async (req, res) => {
  const virgilJwtToken = virgilToken(req.user.sender);

  res.json({ token: virgilJwtToken.toString() });
};
