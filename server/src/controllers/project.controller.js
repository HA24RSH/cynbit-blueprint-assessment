import { createProjectSchema } from "../validators/project.validator.js";

import {
  createProjectSubmission,
} from "../services/project.service.js";

export async function createProject(req, res, next) {
  try {
    const result = createProjectSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Please check your submitted project details.",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const submission = await createProjectSubmission(result.data);

    return res.status(201).json({
      success: true,
      message: "Project enquiry submitted successfully.",
      data: submission,
    });
  } catch (error) {
    next(error);
  }
}