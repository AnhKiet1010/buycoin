const mongoose = require("mongoose");

// store the refresh tokens in the db
const tokenSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// delete the refresh tokens every 7 days
tokenSchema.index({ createdAt: 1 }, { expires: "7d" });

module.exports = mongoose.model("Token", tokenSchema);
