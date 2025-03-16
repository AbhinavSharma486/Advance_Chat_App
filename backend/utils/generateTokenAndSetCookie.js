import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {

  const token = jwt.sign(
    { id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    maxAge: 24 * 60 * 60 * 1000
  });

  return token;
};