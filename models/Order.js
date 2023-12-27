const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  userId: { type: String, required: true },
  accountId: { type: String, required: true },
  placedDate: { type: Date, default: Date.now },
  orderNumber: { type: String, unique: true, required: true },
  numberOfCoins: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["active", "pending", "completed", "closed"],
    default: "pending",
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
