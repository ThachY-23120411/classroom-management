const express = require("express");
const studentController = require("./student.controller");

const router = express.Router();

router.post("/addStudent", studentController.addStudent);
router.get("/students", studentController.getStudents);
router.get("/student/:phone", studentController.getStudentByPhone);
router.put("/editStudent/:phone", studentController.editStudent);
router.delete("/student/:phone", studentController.deleteStudent);
router.post("/assignLesson", studentController.assignLesson);
router.get("/myLessons", studentController.getMyLessons);
router.post("/markLessonDone", studentController.markLessonDone);
router.put("/editProfile", studentController.editProfile);

module.exports = router;
