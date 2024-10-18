const { sign } = require("jsonwebtoken");
const { ExtractJwt, Strategy } = require("passport-jwt");
const passport = require("passport");

/** @type {import ("passport-jwt").StrategyOptionsWithoutRequest} */
let jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
  secretOrKey: process.env.JWT_SECRET,
};

/** @type {Strategy} */
let strategy = new Strategy(jwtOptions, function (jwt_payload, next) {
  // console.log('payload received', jwt_payload);

  if (jwt_payload) {
    next(null, {
      _id: jwt_payload._id,
      email: jwt_payload.email,
      isAdmin: jwt_payload.isAdmin
    });
  } else {
    next(null, false);
  }
});

passport.use(strategy);

/**
 * gets a signed token
 * @param {{_id: string, email: string, isAdmin: boolean}} tokenPayload token data payload 
 * @param {string} [expiresIn] time for token to expire 
 * @returns 
 */
const signToken = (tokenPayload, optionsExpiresIn = { expiresIn: "24h" }) => {
  const token = sign(tokenPayload, jwtOptions.secretOrKey, optionsExpiresIn);
  return token;
}

/**
 * Checks if request has user validated and if it is an Admin
 * @async
 * @param {Request} req 
 * @param {Response} res
 * @returns {{ _id: string, email: string, isAdmin: boolean }} An object with user token payload 
 */
// const getUser = (req, res, next = () => {}) => {
//   passport.authenticate("jwt", { session: false })(req, res, next);
//   return req?.user;
// };

/**
 * Checks if request has user validated and if it is an Admin
 * @async
 * @param {Request} req 
 * @param {Response} res
 * @returns {boolean} isAdmin value
 */
// const isAdmin = (req, res, next = () => {}) => {
//   passport.authenticate("jwt", { session: false })(req, res, next);
//   return req?.user?.isAdmin;
// };


const authenticateToken = (req, res, next = () => {}) => {
  passport.authenticate("jwt", { session: false })(req, res, next);
};

/**
 * Redirect user if is not admin (for use on restricted admin routes)
 * @param {import("express").Request} req 
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next 
 */
const allowAdminAccess = (req, res, next = () => {}) => {
  if (req.user.isAdmin) {
    next()
  } else {
    res.status(403).json({ message: "access not allowed" });
  };
};

/* ********** Export jwt Passport Utils ********** */
const jwtPassportUtils = {
  signToken,
  authenticateToken,
  allowAdminAccess,
  // getUser,
  // isAdmin,
};

module.exports = jwtPassportUtils;
