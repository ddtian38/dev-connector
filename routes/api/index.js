const express = require("express");
const router = express.Router()
const authRoutes = require("./auth/auth");
const postRoutes = require("./post/post");
const profileRoutes = require("./profile/profile");
const usersRoutes =  require("./users/users")

router.use("/auth", authRoutes);
router.use("/post", postRoutes);
router.use("/profile", profileRoutes);
router.use("/users", usersRoutes);

module.exports = router;