// models/bargain.js
const mongoose = require("mongoose");

const bargainSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  proposedPrice: Number,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Bargain", bargainSchema);