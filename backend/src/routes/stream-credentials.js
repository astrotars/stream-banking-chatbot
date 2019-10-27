import { wrapAsync } from "../utils/controllers";
import { requireAuthHeader } from "../controllers/v1/authenticate";
import { streamCredentials } from "../controllers/v1/stream-credentials";

module.exports = api => {
  api.route("/v1/stream-credentials").post(requireAuthHeader, wrapAsync(streamCredentials));
};
