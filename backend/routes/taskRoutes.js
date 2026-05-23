const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const protect = require("../middleware/auth");
const adminOnly = require("../middleware/roleCheck");
const {
  createTask,
  getTasks,
  getTasksByProject,
  updateTask,
  deleteTask,
  getDashboard,
} = require("../controllers/taskController");

router.use(protect);

// dashboard stats
router.get("/dashboard", getDashboard);

// tasks by project
router.get("/project/:projectId", getTasksByProject);

router
  .route("/")
  .get(getTasks)
  .post(
    adminOnly,
    [
      body("title").notEmpty().withMessage("Task title is required"),
      body("project").notEmpty().withMessage("Project is required"),
    ],
    createTask
  );

router
  .route("/:id")
  .put(updateTask) // member status update + admin full update (logic controller me)
  .delete(adminOnly, deleteTask);

module.exports = router;
