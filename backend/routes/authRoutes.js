const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const protect = require("../middleware/auth");
const {
  signup,
  login,
  getMe,
  getUsers,
} = require("../controllers/authController");

router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  ],
  signup
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

router.get("/me", protect, getMe);
router.get("/users", protect, getUsers);

module.exports = router;
