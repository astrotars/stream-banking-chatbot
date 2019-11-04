import dotenv from "dotenv";
import { EThree } from "@virgilsecurity/e3kit";

const { JwtGenerator } = require('virgil-sdk');
const { VirgilCrypto, VirgilAccessTokenSigner } = require('virgil-crypto');

dotenv.config();

const virgilCrypto = new VirgilCrypto();

const generator = new JwtGenerator({
  appId: process.env.VIRGIL_APP_ID,
  apiKeyId: process.env.VIRGIL_KEY_ID,
  apiKey: virgilCrypto.importPrivateKey(process.env.VIRGIL_PRIVATE_KEY),
  accessTokenSigner: new VirgilAccessTokenSigner(virgilCrypto)
});

exports.virgilToken = (user) => generator.generateToken(user);
exports.getEThree = async () => {
  const chatbotToken = generator.generateToken('chatbot');
  return await EThree.initialize(() => chatbotToken);
};

