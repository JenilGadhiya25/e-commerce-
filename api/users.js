import { handleApiRequest } from "../server/apiServer.js";

export default async function handler(req, res) {
  return handleApiRequest(req, res);
}

