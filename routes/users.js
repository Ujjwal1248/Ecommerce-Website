const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect(
  "mongodb+srv://ujjwalagrawal1248:o3YS3wdIQalj9upg@ecommer-website.ap3ri6a.mongodb.net/?retryWrites=true&w=majority&appName=Ecommer-Website"
);

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: { type: Number, default: 1 },
});

const userSchema = new mongoose.Schema({
  fullName: String,
  username: String,
  email: String,
  password: String,
  date: {
    type: Date,
    default: Date.now,
  },
  cart: [cartItemSchema],
  totalPrice: {
    type: Number,
    default: 0,
  },
  purchasedProducts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

userSchema.plugin(plm);

module.exports = mongoose.model("User", userSchema);
