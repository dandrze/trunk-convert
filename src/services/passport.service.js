import passport from "passport";
import { Strategy as BearerStrategy } from "passport-http-bearer";
import User from "../models/user.model.js";

passport.use(
  new BearerStrategy(async (token, done) => {
    try {
      // find a user in mongoDB with an apiKey that matches the bearer token
      const user = await User.findOne({ apiKey: token });

      if (user) {
        // if user found, attach to the req object and continue
        return done(null, user);
      } else {
        // if user is not found, the function below returns 401 error
        return done(null, false);
      }
    } catch (error) {
      return done(error);
    }
  })
);
