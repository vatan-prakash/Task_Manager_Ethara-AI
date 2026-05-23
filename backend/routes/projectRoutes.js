const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const protect = require("../middleware/auth");
const adminOnly = require("../middleware/roleCheck");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

// sab routes protected hain (login zaroori)
router.use(protect);

router
  .route("/")
  .get(getProjects)
  .post(
    adminOnly,
    [body("name").notEmpty().withMessage("Project name is required")],
    createProject
  );

router
  .route("/:id")
  .get(getProjectById)
  .put(adminOnly, updateProject)
  .delete(adminOnly, deleteProject);

module.exports = router;
