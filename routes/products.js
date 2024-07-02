const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  pName: String,
  pPrice: Number,
  pDescription: String,
  pPhoto: {
    type: String,
    default: "",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Product", productSchema);
