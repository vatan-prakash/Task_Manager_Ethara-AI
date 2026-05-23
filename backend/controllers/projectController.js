const { validationResult } = require("express-validator");
const Project = require("../models/Project");
const Task = require("../models/Task");

// @route  POST /api/projects   (Admin only)
exports.createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, members } = req.body;

    const project = await Project.create({
      name,
      description: description || "",
      owner: req.user._id,
      members: members || [],
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route  GET /api/projects
// Admin -> apne banaye projects ; Member -> jisme wo member hai
exports.getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === "Admin") {
      projects = await Project.find({ owner: req.user._id })
        .populate("members", "name email role")
        .populate("owner", "name email");
    } else {
      projects = await Project.find({ members: req.user._id })
        .populate("members", "name email role")
        .populate("owner", "name email");
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route  GET /api/projects/:id
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members", "name email role")
      .populate("owner", "name email");

    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route  PUT /api/projects/:id   (Admin only) - update + members manage
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const { name, description, members } = req.body;
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (members !== undefined) project.members = members;

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route  DELETE /api/projects/:id   (Admin only)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // project ke saare tasks bhi delete karo
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
