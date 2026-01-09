import express from "express";
import upload from "../middleware/multer.js";
import {
  createTeacherProfile,
  getAllTeachers,
  getTeacherById,
  manageAvailability
} from "../controllers/teacherController.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";

const Trouter = express.Router();

Trouter.post(
  "/create",
  upload.single("image"),
  createTeacherProfile
);

Trouter.get("/all", getAllTeachers);
Trouter.get("/:id", AuthMiddleware, getTeacherById);
Trouter.post("/availability", AuthMiddleware, manageAvailability);

export default Trouter;
