import { wrapAsync } from "../utils/controllers";
import { message } from "../controllers/v1/message";

module.exports = api => {
  api.route("/v1/message").post(wrapAsync(message));
};
