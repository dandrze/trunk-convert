import jwt from "jsonwebtoken";
import crypto from "crypto";

export const getJwtToken = ({ name, secret, uri, algorithm = "ES256" }) => {
  if (!name || !secret || !uri) {
    throw new Error("Missing required parameters for JWT token generation");
  }

  const token = jwt.sign(
    {
      iss: "cdp",
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 120,
      sub: name,
      uri,
    },
    secret,
    {
      algorithm,
      header: {
        kid: name,
        nonce: crypto.randomBytes(16).toString("hex"),
      },
    }
  );

  return token;
};
