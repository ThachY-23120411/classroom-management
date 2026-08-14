export const fallbackStudents = [
  {
    phone: '+15550000002',
    name: 'Mia Nguyen',
    email: 'student@classroom.local',
    status: 'Active',
    lessons: [
      {
        id: 'lesson-demo-1',
        title: 'React component basics',
        description: 'Build a small profile card with props and state.',
        completed: false,
        status: 'assigned',
      },
      {
        id: 'lesson-demo-2',
        title: 'Express route validation',
        description: 'Create one POST endpoint and validate request body.',
        completed: true,
        status: 'done',
      },
    ],
  },
  {
    phone: '+15550000003',
    name: 'Taylor Student',
    email: 'taylor@classroom.local',
    status: 'Active',
    lessons: [],
  },
  {
    phone: '+15550000004',
    name: 'Jordan Lee',
    email: 'jordan@classroom.local',
    status: 'Active',
    lessons: [],
  },
  {
    phone: '+15550000005',
    name: 'Casey Tran',
    email: 'casey@classroom.local',
    status: 'Active',
    lessons: [],
  },
]

export function normalizeStudent(student, index = 0) {
  return {
    phone: student.phone || student.id || `student-${index}`,
    name: student.name || `Student ${index + 1}`,
    email: student.email || 'student@classroom.local',
    status: student.status || 'Active',
    instructorPhone: student.instructorPhone || '+15550000001',
    instructorName: student.instructorName || '',
    lessons: Array.isArray(student.lessons) ? student.lessons : [],
  }
}

export function normalizeStudents(students) {
  if (!Array.isArray(students)) {
    return fallbackStudents
  }

  return students.map((student, index) => normalizeStudent(student, index))
}

export function getCompletedLessonCount(students) {
  return students.reduce((count, student) => {
    const lessons = Array.isArray(student.lessons) ? student.lessons : []
    return count + lessons.filter((lesson) => lesson.completed).length
  }, 0)
}

export function getAssignedLessonCount(students) {
  return students.reduce((count, student) => {
    const lessons = Array.isArray(student.lessons) ? student.lessons : []
    return count + lessons.length
  }, 0)
}
