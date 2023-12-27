const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Order = require("../models/Order"); // Adjust the path as needed

// Get all orders
router.get("/:id", auth, async (req, res) => {
  try {
    const userId = req.params.id;

    const allOrders = await Order.find({ userId });

    res.status(200).json(allOrders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get completed orders
router.get("/completed/:id",auth, async (req, res) => {
  try {
    const userId = req.params.id;

    const completedOrders = await Order.find({ userId, status: "completed" });

    res.status(200).json(completedOrders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get pending orders
router.get("/pending/:id",auth,  async (req, res) => {
  try {
    const userId = req.params.id;

    const pendingOrders = await Order.find({ userId, status: "pending" });

    res.status(200).json(pendingOrders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


//Get closed orders
router.get("/closed/:id", auth, async (req, res) => {
  try {
    const userId = req.params.id;

    const closedOrders = await Order.find({ userId, status: "closed" });

    res.status(200).json(closedOrders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
