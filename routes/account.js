const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Account = require("../models/Account");
const Order = require("../models/Order");

// Create a new account
router.post("/", auth, async (req, res) => {
  try {
    const { userId, cardNumber, expirationDate, cvv } = req.body;
    const newAccount = new Account({
      userId,
      cardNumber,
      expirationDate,
      cvv,
      currentBalance: 0, // You may set an initial balance here
    });
    await newAccount.save();
    res.status(201).json(newAccount);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
// Recharge the balance of a user's account

router.post("/recharge", auth, async (req, res) => {
  try {
    const { userId, rechargeAmount, cardNumber, expirationDate, cvv } = req.body;
    const userAccount = await Account.findOne({ userId });

    if (!userAccount) {
      return res.status(404).json({ error: "Account not found" });
    }

    const orderNumber = Math.floor(100000 + Math.random() * 900000);

    const newOrder = new Order({
      userId,
      accountId: userAccount._id,
      orderNumber,
      numberOfCoins:rechargeAmount,
      totalPrice:rechargeAmount,
      
    });

    userAccount.currentBalance += rechargeAmount;

    await Promise.all([userAccount.save(), newOrder.save()]);

    res.status(200).json({ userAccount, newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// get balance
router.get("/balance", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const userAccount = await Account.findOne({ userId });

    if (!userAccount) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.status(200).json({ currentBalance: userAccount.currentBalance });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
