const { validationResult } = require("express-validator");
const Task = require("../models/Task");
const Project = require("../models/Project");

// @route  POST /api/tasks   (Admin only) - create + assign
exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, project, assignedTo, status, dueDate } = req.body;

    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: "Project not found" });

    const task = await Task.create({
      title,
      description: description || "",
      project,
      assignedTo: assignedTo || null,
      status: status || "To Do",
      dueDate: dueDate || null,
    });

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("project", "name");

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route  GET /api/tasks
// Admin -> all tasks  of project; Member ->only assigned tasks
exports.getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === "Admin") {
      // find admin projects
      const myProjects = await Project.find({ owner: req.user._id }).select("_id");
      const ids = myProjects.map((p) => p._id);
      tasks = await Task.find({ project: { $in: ids } })
        .populate("assignedTo", "name email")
        .populate("project", "name");
    } else {
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate("assignedTo", "name email")
        .populate("project", "name");
    }
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route  GET /api/tasks/project/:projectId
exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignedTo", "name email")
      .populate("project", "name");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route  PUT /api/tasks/:id
// Member -> can only update status of its assigned tasks
// Admin  -> can update anything
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const { title, description, assignedTo, status, dueDate } = req.body;

    if (req.user.role === "Admin") {
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (status !== undefined) task.status = status;
      if (dueDate !== undefined) task.dueDate = dueDate;
    } else {
      // Member: can only update its assgined task status
      if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You can only update your own tasks" });
      }
      if (status !== undefined) task.status = status;
    }

    await task.save();
    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("project", "name");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route  DELETE /api/tasks/:id   (Admin only)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route  GET /api/tasks/dashboard  - stats (total, by status, overdue)
exports.getDashboard = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "Admin") {
      const myProjects = await Project.find({ owner: req.user._id }).select("_id");
      const ids = myProjects.map((p) => p._id);
      filter = { project: { $in: ids } };
    } else {
      filter = { assignedTo: req.user._id };
    }

    const tasks = await Task.find(filter);
    const now = new Date();

    const stats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "To Do").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      done: tasks.filter((t) => t.status === "Done").length,
      overdue: tasks.filter(
        (t) => t.dueDate && t.status !== "Done" && new Date(t.dueDate) < now
      ).length,
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
