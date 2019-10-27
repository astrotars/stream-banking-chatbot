import { requireAuthHeader } from "../controllers/v1/authenticate";

import { wrapAsync } from "../utils/controllers";
import { virgilCredentials } from "../controllers/v1/virgil-credentials";

module.exports = api => {
  api.route("/v1/virgil-credentials").post(requireAuthHeader, wrapAsync(virgilCredentials));
};
