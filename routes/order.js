const express = require("express");
const router = express.Router();
const admin = require("../middleware/admin");
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


// Route to fetch all orders sorted by placedDate
router.get("/",auth,admin, async (req, res) => {
  try {
    // Fetch all orders and sort by placedDate in descending order (newest first)
    const orders = await Order.find().sort({ placedDate: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/update-status/:orderId", auth,admin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { newStatus } = req.body; // Assuming you send the new status in the request body

    // Validate that the newStatus is one of the allowed values (cancel, complete, pending)
    const allowedStatusValues = ["canceled", "completed", "pending"];
    if (!allowedStatusValues.includes(newStatus)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Update the order status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: newStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});



module.exports = router;
