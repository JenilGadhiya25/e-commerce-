import { handleApiRequest } from "../../../server/apiServer.js";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  return handleApiRequest(req, res);
}

