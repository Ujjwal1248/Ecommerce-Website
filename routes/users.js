const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect(
<<<<<<< HEAD
  "mongodb://localhost:27017/Ecommer-Website"
=======
  "mongodb+srv://ujjwalagrawal1248:o3YS3wdIQalj9upg@ecommer-website.ap3ri6a.mongodb.net/?retryWrites=true&w=majority&appName=Ecommer-Website"
>>>>>>> 220806751d1eb537ad2fdaabbd0da0803e3ae830
);

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: { type: Number, default: 1 },
<<<<<<< HEAD
  bargainedPrice: { type: Number }, // <-- Add this line
});


=======
});

>>>>>>> 220806751d1eb537ad2fdaabbd0da0803e3ae830
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
<<<<<<< HEAD
  wallet: {
    type: Number,
    default: 0,
  },
=======
>>>>>>> 220806751d1eb537ad2fdaabbd0da0803e3ae830
  purchasedProducts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

<<<<<<< HEAD

=======
>>>>>>> 220806751d1eb537ad2fdaabbd0da0803e3ae830
userSchema.plugin(plm);

module.exports = mongoose.model("User", userSchema);
