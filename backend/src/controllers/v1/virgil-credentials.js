import { virgilToken } from '../../virgil';

exports.virgilCredentials = (req, res) => {
  const virgilJwtToken = virgilToken(req.user.sender);

  res.json({ token: virgilJwtToken.toString() });
};
