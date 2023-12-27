const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accountSchema = new Schema({
  userId: { type: String, required: true },
  currentBalance: { type: Number, required:true},
  cardNumber: { type: String, required: true },
  expirationDate: { type: Date, required: true },
  cvv: { type: String, required: true },
});

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
