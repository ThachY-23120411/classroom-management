const studentService = require("./student.service");

function sendError(res, error) {
  res.status(400).json({
    success: false,
    message: error.message,
  });
}

async function addStudent(req, res) {
  try {
    const { name, phone, email, instructorPhone, instructorName } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "name, phone and email are required",
      });
    }

    const student = await studentService.addStudent({
      name,
      phone,
      email,
      instructorPhone,
      instructorName,
    });

    res.status(201).json({
      success: true,
      data: student,
    });
  } catch (error) {
    sendError(res, error);
  }
}

async function getStudents(req, res) {
  try {
    const { instructorPhone } = req.query;
    const students = await studentService.getStudents({ instructorPhone });

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    sendError(res, error);
  }
}

async function getStudentByPhone(req, res) {
  try {
    const { phone } = req.params;
    const student = await studentService.getStudentByPhone(phone);

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    sendError(res, error);
  }
}

async function editStudent(req, res) {
  try {
    const { phone } = req.params;
    const { name, email } = req.body;

    if (name === undefined && email === undefined) {
      return res.status(400).json({
        success: false,
        message: "name or email is required",
      });
    }

    const student = await studentService.editStudent(phone, { name, email });

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    sendError(res, error);
  }
}

async function deleteStudent(req, res) {
  try {
    const { phone } = req.params;

    await studentService.deleteStudent(phone);

    res.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    sendError(res, error);
  }
}

async function assignLesson(req, res) {
  try {
    const { studentPhone, title, description } = req.body;

    if (!studentPhone || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "studentPhone, title and description are required",
      });
    }

    const lesson = await studentService.assignLesson({
      studentPhone,
      title,
      description,
    });

    res.status(201).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    sendError(res, error);
  }
}

async function getMyLessons(req, res) {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "phone is required",
      });
    }

    const lessons = await studentService.getMyLessons(phone);

    res.json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    sendError(res, error);
  }
}

async function markLessonDone(req, res) {
  try {
    const { phone, lessonId } = req.body;

    if (!phone || !lessonId) {
      return res.status(400).json({
        success: false,
        message: "phone and lessonId are required",
      });
    }

    const lesson = await studentService.markLessonDone({ phone, lessonId });

    res.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    sendError(res, error);
  }
}

async function editProfile(req, res) {
  try {
    const { phone, name, email } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "phone is required",
      });
    }

    if (name === undefined && email === undefined) {
      return res.status(400).json({
        success: false,
        message: "name or email is required",
      });
    }

    const student = await studentService.editProfile({ phone, name, email });

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    sendError(res, error);
  }
}

module.exports = {
  addStudent,
  getStudents,
  getStudentByPhone,
  editStudent,
  deleteStudent,
  assignLesson,
  getMyLessons,
  markLessonDone,
  editProfile,
};
