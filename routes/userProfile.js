const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const router = express.Router();
const User = require("../models/User"); // Adjust the path as needed


// Get my details
router.get("/user/me", auth, async (req, res) => {
  console.log(req.user.id);

  try {

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({msg: "No User"});
    }

    res.json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/user/:id", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update user information
router.patch("/user/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, updates, { new: true });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete user by ID
router.delete("/users/:id", auth, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get user by ID
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send();
    }
    console.log("in find user route");
    res.json(user);
  } catch (error) {
    res.status(500).send(error);
  }
});


// Get all users as JSON
router.get("/users",auth, admin, async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
