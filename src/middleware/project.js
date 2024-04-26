import { validateProject } from "../models/projects/projectsModel.js";

function validateProjectInput(req, res, next) {
  const { error } = validateProject(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

export { validateProjectInput };
