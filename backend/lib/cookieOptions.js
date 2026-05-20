const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
  ...(isProduction
    ? { secure: true, sameSite: "none" }
    : { secure: false, sameSite: "lax" }),
};

module.exports = { cookieOptions };
