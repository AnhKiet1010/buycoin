const Token = require("../models/token.model");
const User = require("../models/user.model");
const { generateToken } = require("../utils/generateToken");

exports.authUser = async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({
    $and: [{ $or: [{ email }] }],
  });

  if (user && (await user.matchPassword(password))) {
    const accessToken = generateToken(user._id, "access");
    const refreshToken = generateToken(user._id, "refresh");

    const existingToken = await Token.findOne({ email: user.email });
    if (!existingToken) {
      await Token.create({
        email: user.email,
        token: refreshToken,
      });
    } else {
      existingToken.token = refreshToken;
      existingToken.save();
    }

    res.status(200).json({
      userInfo: {
        id: user._id,
        email: user.email,
      },
      accessToken,
      refreshToken,
    });
  } else {
    res.status(400).json({ error: "Login information is incorrect" });
  }
};

exports.register = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.create({
    email: email.toLowerCase(),
    password,
  });

  res.status(201).json({
    message: "User created",
  });
};
