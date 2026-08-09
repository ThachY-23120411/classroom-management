import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'
import {
  ArrowLeft,
  Search,
} from 'lucide-react'
import './App.css'

const API_BASE_URL = 'http://localhost:4000'

const api = axios.create({
  baseURL: API_BASE_URL,
})

const SESSION_KEY = 'classroom.session'

function loadStoredSession() {
  try {
    const rawSession = localStorage.getItem(SESSION_KEY)
    const session = rawSession ? JSON.parse(rawSession) : null

    if (!session?.currentUser?.role) {
      return null
    }

    return session
  } catch {
    return null
  }
}

function saveStoredSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY)
}

const fallbackStudents = [
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

function normalizeStudent(student, index = 0) {
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

function normalizeStudents(students) {
  if (!Array.isArray(students)) {
    return fallbackStudents
  }

  return students.map((student, index) => normalizeStudent(student, index))
}

function getCompletedLessonCount(students) {
  return students.reduce((count, student) => {
    const lessons = Array.isArray(student.lessons) ? student.lessons : []
    return count + lessons.filter((lesson) => lesson.completed).length
  }, 0)
}

function getAssignedLessonCount(students) {
  return students.reduce((count, student) => {
    const lessons = Array.isArray(student.lessons) ? student.lessons : []
    return count + lessons.length
  }, 0)
}

function BackButton({ onClick }) {
  return (
    <button className="back-button" type="button" onClick={onClick}>
      <ArrowLeft size={18} />
      <span>Back</span>
    </button>
  )
}

function AuthCard({
  eyebrow,
  title,
  subtitle,
  placeholder,
  value,
  onChange,
  onSubmit,
  footer,
  message,
  onBack,
}) {
  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-panel">
          <BackButton onClick={onBack} />
          <div className="auth-brand">
            <span>{eyebrow}</span>
          </div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <form onSubmit={onSubmit}>
            <input
              value={value}
              placeholder={placeholder}
              onChange={(event) => onChange(event.target.value)}
            />
            <button className="primary-button" type="submit">
              <span>Next</span>
            </button>
          </form>
          {message ? <p className="inline-message">{message}</p> : null}
          <footer>{footer}</footer>
        </div>
      </section>
    </main>
  )
}

function VerificationCard({
  title,
  subtitle,
  code,
  onCodeChange,
  onSubmit,
  onResend,
  onBack,
  message,
}) {
  return (
    <main className="auth-page">
      <section className="auth-shell verify-shell">
        <div className="auth-panel verify-panel">
          <BackButton onClick={onBack} />
          <div className="auth-brand">
            <span>Verification</span>
          </div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <form onSubmit={onSubmit}>
            <input
              value={code}
              placeholder="Enter 6-digit code"
              onChange={(event) => onCodeChange(event.target.value)}
            />
            <button className="primary-button" type="submit">
              <span>Submit</span>
            </button>
          </form>
          <div className="resend-line">
            <span>Code not received?</span>
            <button type="button" onClick={onResend}>
              Send again
            </button>
          </div>
          {message ? <p className="inline-message">{message}</p> : null}
        </div>
      </section>
    </main>
  )
}

function getPageMeta(view, role) {
  if (view.includes('Message')) {
    return {
      title: 'Messages',
      subtitle:
        role === 'student'
          ? 'Stay connected with your instructor.'
          : 'Follow every student conversation in one place.',
    }
  }

  if (view.includes('Lessons')) {
    return {
      title: 'Lessons',
      subtitle:
        role === 'student'
          ? 'Track assigned lessons and mark finished work.'
          : 'Assign work and monitor completion across the class.',
    }
  }

  return {
    title: 'Students',
    subtitle: 'Manage enrollment, profiles, lesson progress, and class activity.',
  }
}

function AppShell({
  active,
  role,
  view,
  children,
  currentUser,
  onNavigate,
  onLogout,
}) {
  const navItems =
    role === 'student'
      ? [
          { key: 'lessons', label: 'Lessons' },
          { key: 'message', label: 'Messages' },
        ]
      : [
          { key: 'students', label: 'Students' },
          { key: 'lessons', label: 'Lessons' },
          { key: 'message', label: 'Messages' },
        ]

  const meta = getPageMeta(view, role)
  const displayName =
    currentUser?.name || (role === 'student' ? 'Student' : 'Instructor')
  const displayRole = role === 'student' ? 'Student portal' : 'Instructor desk'

  return (
    <main className="dashboard-page">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div>
            <strong>Classroom</strong>
            <span>{displayRole}</span>
          </div>
        </div>
        <nav className="side-nav">
          {navItems.map((item) => (
            <button
              className={`nav-item ${active === item.key ? 'active' : ''}`}
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>
          <div className="topbar-actions">
            <span className="profile-chip">
              <strong>{displayName}</strong>
              <small>{role === 'student' ? 'Student' : 'Instructor'}</small>
            </span>
            <button className="logout-button" type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>
        {children}
      </section>
    </main>
  )
}

function StatCard({ label, value, tone }) {
  return (
    <article className={`stat-card ${tone}`}>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </article>
  )
}

function ManageStudents({
  students,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onOpenMessage,
}) {
  const [filter, setFilter] = useState('')
  const visibleStudents = students.filter((student) =>
    `${student.name} ${student.email} ${student.phone}`
      .toLowerCase()
      .includes(filter.toLowerCase()),
  )

  return (
    <section className="content-stack">
      <div className="stats-grid">
        <StatCard
          label="Active students"
          value={students.length}
          tone="blue"
        />
        <StatCard
          label="Assigned lessons"
          value={getAssignedLessonCount(students)}
          tone="green"
        />
        <StatCard
          label="Completed lessons"
          value={getCompletedLessonCount(students)}
          tone="amber"
        />
      </div>
      <section className="data-panel">
        <header className="panel-header">
          <div>
            <h2>Student roster</h2>
            <p>{visibleStudents.length} students shown</p>
          </div>
          <div className="panel-actions">
            <label className="search-field">
              <Search size={17} />
              <input
                value={filter}
                placeholder="Filter students"
                onChange={(event) => setFilter(event.target.value)}
              />
            </label>
            <button className="primary-action" type="button" onClick={onAddStudent}>
              <span>Add Student</span>
            </button>
          </div>
        </header>
        <table className="students-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Lessons</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleStudents.map((student) => (
              <tr key={student.phone}>
                <td>
                  <button
                    className="student-cell"
                    type="button"
                    onClick={() => onOpenMessage(student)}
                  >
                    <span>{student.name.charAt(0).toUpperCase()}</span>
                    <strong>{student.name}</strong>
                  </button>
                </td>
                <td>{student.email}</td>
                <td>{student.phone}</td>
                <td>{student.lessons?.length || 0}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="soft-button"
                      type="button"
                      onClick={() => onEditStudent(student)}
                    >
                      <span>Edit</span>
                    </button>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => onDeleteStudent(student)}
                    >
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  )
}

function StudentModal({ initialStudent, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: initialStudent?.name || '',
    phone: initialStudent?.phone || '',
    email: initialStudent?.email || '',
    role: 'student',
    address: '',
  })

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <section className="student-modal" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span className="modal-eyebrow">Student profile</span>
            <h2>{initialStudent ? 'Edit student' : 'Create student'}</h2>
          </div>
          <button className="text-close-button" type="button" onClick={onClose}>
            Close
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="modal-grid">
            <label>
              <span>Student Name</span>
              <input
                value={form.name}
                onChange={(event) => updateForm('name', event.target.value)}
              />
            </label>
            <label>
              <span>Phone Number</span>
              <input
                value={form.phone}
                disabled={Boolean(initialStudent)}
                onChange={(event) => updateForm('phone', event.target.value)}
              />
            </label>
            <label>
              <span>Email Address</span>
              <input
                value={form.email}
                onChange={(event) => updateForm('email', event.target.value)}
              />
            </label>
            <label>
              <span>Role</span>
              <input
                value={form.role}
                onChange={(event) => updateForm('role', event.target.value)}
              />
            </label>
            <label className="wide">
              <span>Address</span>
              <input
                value={form.address}
                onChange={(event) => updateForm('address', event.target.value)}
              />
            </label>
          </div>
          <footer>
            <button className="secondary-action" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-action" type="submit">
              <span>{initialStudent ? 'Save changes' : 'Create student'}</span>
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

function InstructorLessons({ students, selectedStudent, onSelectStudent, onAssignLesson }) {
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
  })
  const activeStudent = selectedStudent || students[0]

  async function handleSubmit(event) {
    event.preventDefault()

    if (!activeStudent) {
      return
    }

    await onAssignLesson({
      studentPhone: activeStudent.phone,
      title: lessonForm.title,
      description: lessonForm.description,
    })
    setLessonForm({ title: '', description: '' })
  }

  return (
    <section className="lessons-layout">
      <aside className="student-picker">
        <h2>Students</h2>
        {students.map((student) => (
          <button
            className={`picker-item ${activeStudent?.phone === student.phone ? 'active' : ''}`}
            key={student.phone}
            type="button"
            onClick={() => onSelectStudent(student)}
          >
            <span>{student.name.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{student.name}</strong>
              <p>{student.lessons?.length || 0} lessons</p>
            </div>
          </button>
        ))}
      </aside>
      <section className="lesson-workspace">
        <div className="lesson-form-panel">
          <h2>Assign lesson</h2>
          <form onSubmit={handleSubmit}>
            <label>
              <span>Title</span>
              <input
                value={lessonForm.title}
                placeholder="Lesson title"
                onChange={(event) =>
                  setLessonForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              <span>Description</span>
              <textarea
                value={lessonForm.description}
                placeholder="What should the student complete?"
                onChange={(event) =>
                  setLessonForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </label>
            <button className="primary-action" type="submit">
              <span>Assign lesson</span>
            </button>
          </form>
        </div>
        <div className="lesson-list-panel">
          <h2>{activeStudent?.name || 'Student'} lessons</h2>
          <LessonList lessons={activeStudent?.lessons || []} />
        </div>
      </section>
    </section>
  )
}

function LessonList({ lessons, onMarkDone }) {
  if (!lessons.length) {
    return (
      <div className="empty-state">
        <strong>No lessons yet</strong>
        <p>Assigned lessons will appear here.</p>
      </div>
    )
  }

  return (
    <div className="lesson-list">
      {lessons.map((lesson) => (
        <article className="lesson-item" key={lesson.id}>
          <div>
            <h3>{lesson.title}</h3>
            <p>{lesson.description}</p>
          </div>
          <div className="lesson-actions">
            <span className={lesson.completed ? 'done' : 'assigned'}>
              {lesson.completed ? 'Done' : 'Assigned'}
            </span>
            {!lesson.completed && onMarkDone ? (
              <button type="button" onClick={() => onMarkDone(lesson)}>
                Mark done
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  )
}

function StudentLessons({ student, onSaveProfile, onMarkDone }) {
  const [profile, setProfile] = useState({
    name: student?.name || '',
    email: student?.email || '',
  })

  useEffect(() => {
    setProfile({
      name: student?.name || '',
      email: student?.email || '',
    })
  }, [student])

  function handleSubmit(event) {
    event.preventDefault()
    onSaveProfile({
      phone: student.phone,
      name: profile.name,
      email: profile.email,
    })
  }

  return (
    <section className="student-lessons-layout">
      <form className="profile-panel" onSubmit={handleSubmit}>
        <h2>Profile</h2>
        <label>
          <span>Name</span>
          <input
            value={profile.name}
            onChange={(event) =>
              setProfile((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
          />
        </label>
        <label>
          <span>Email</span>
          <input
            value={profile.email}
            onChange={(event) =>
              setProfile((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
          />
        </label>
        <button className="primary-action" type="submit">
          <span>Save profile</span>
        </button>
      </form>
      <section className="lesson-list-panel">
        <h2>My lessons</h2>
        <LessonList lessons={student?.lessons || []} onMarkDone={onMarkDone} />
      </section>
    </section>
  )
}

function MessageList({
  role,
  students,
  selectedStudent,
  instructorName,
  onSelectStudent,
}) {
  const displayInstructorName =
    instructorName || selectedStudent?.instructorName || 'Instructor'
  const cards =
    role === 'student'
      ? [
          {
            phone: selectedStudent?.phone || '+15550000002',
            name: displayInstructorName,
          },
        ]
      : students

  return (
    <section className="thread-list">
      <header>
        <h2>{role === 'student' ? displayInstructorName : 'Conversations'}</h2>
        <p>{cards.length} active threads</p>
      </header>
      {cards.map((student, index) => (
        <button
          className={`thread-card ${selectedStudent?.phone === student.phone ? 'active' : ''}`}
          key={student.phone || index}
          type="button"
          onClick={() =>
            onSelectStudent(role === 'student' ? selectedStudent : student)
          }
        >
          <span>{student.name.charAt(0).toUpperCase()}</span>
          <div>
            <strong>{student.name}</strong>
          </div>
        </button>
      ))}
    </section>
  )
}

function ChatWindow({
  role,
  selectedStudent,
  instructorName,
  onResolveInstructorName,
}) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')

  const studentPhone = selectedStudent?.phone || '+15550000002'
  const displayInstructorName =
    instructorName || selectedStudent?.instructorName || 'Instructor'
  const socket = useMemo(() => io(API_BASE_URL, { autoConnect: false }), [])

  useEffect(() => {
    socket.connect()
    socket.emit('joinRoom', { studentPhone })

    socket.on('roomJoined', (payload) => {
      const roomMessages = payload.messages || []
      const instructorMessage = roomMessages.find(
        (message) => message.senderRole === 'instructor' && message.senderName,
      )

      setMessages(roomMessages)

      if (role === 'student' && instructorMessage?.senderName) {
        onResolveInstructorName(instructorMessage.senderName)
      }
    })

    socket.on('newMessage', (payload) => {
      setMessages((current) => [...current, payload.data])

      if (
        role === 'student' &&
        payload.data?.senderRole === 'instructor' &&
        payload.data?.senderName
      ) {
        onResolveInstructorName(payload.data.senderName)
      }
    })

    return () => {
      socket.emit('leaveRoom', { studentPhone })
      socket.off('roomJoined')
      socket.off('newMessage')
      socket.disconnect()
    }
  }, [onResolveInstructorName, role, socket, studentPhone])

  function handleSend(event) {
    event.preventDefault()

    if (!text.trim()) {
      return
    }

    socket.emit('sendMessage', {
      studentPhone,
      senderPhone:
        role === 'student'
          ? studentPhone
          : selectedStudent?.instructorPhone || '+15550000001',
      senderName:
        role === 'student'
          ? selectedStudent?.name || 'Student'
          : selectedStudent?.instructorName || 'Instructor',
      senderRole: role,
      text,
    })
    setText('')
  }

  return (
    <section className="chat-panel">
      <header>
        <div>
          <strong>
            {role === 'student'
              ? displayInstructorName
              : selectedStudent?.name}
          </strong>
          <p>Live chat room</p>
        </div>
      </header>
      <div className="chat-messages">
        {messages.length ? (
          messages.map((message) => (
            <div
              className={`chat-bubble ${message.senderRole === role ? 'own' : ''}`}
              key={message.id}
            >
              <p>{message.text}</p>
              <span>{message.senderName}</span>
            </div>
          ))
        ) : (
          <div className="empty-state chat-empty">
            <strong>No messages yet</strong>
            <p>Start the conversation from the reply box.</p>
          </div>
        )}
      </div>
      <form className="chat-reply" onSubmit={handleSend}>
        <input
          value={text}
          placeholder="Reply message"
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit">
          Send
        </button>
      </form>
    </section>
  )
}

function MessagesPage({ role, students, selectedStudent, onSelectStudent }) {
  const [resolvedInstructorName, setResolvedInstructorName] = useState('')

  useEffect(() => {
    setResolvedInstructorName('')
  }, [selectedStudent?.phone])

  const instructorName =
    selectedStudent?.instructorName || resolvedInstructorName || ''

  return (
    <section className="messages-layout">
      <MessageList
        role={role}
        students={students}
        selectedStudent={selectedStudent}
        instructorName={instructorName}
        onSelectStudent={onSelectStudent}
      />
      <ChatWindow
        role={role}
        selectedStudent={selectedStudent}
        instructorName={instructorName}
        onResolveInstructorName={setResolvedInstructorName}
      />
    </section>
  )
}

function App() {
  const storedSession = useMemo(() => loadStoredSession(), [])
  const [view, setView] = useState(storedSession?.view || 'phoneSignIn')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [message, setMessage] = useState('')
  const [students, setStudents] = useState(() =>
    normalizeStudents(storedSession?.students),
  )
  const [selectedStudent, setSelectedStudent] = useState(() =>
    storedSession?.selectedStudent
      ? normalizeStudent(storedSession.selectedStudent)
      : fallbackStudents[0],
  )
  const [currentUser, setCurrentUser] = useState(storedSession?.currentUser || null)
  const [modalStudent, setModalStudent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  async function loadStudents(instructorPhone) {
    try {
      const response = await api.get('/students', {
        params: instructorPhone ? { instructorPhone } : undefined,
      })
      const loadedStudents = normalizeStudents(response.data.data)
      setStudents(loadedStudents)
      setSelectedStudent((current) => {
        if (!current) {
          return loadedStudents[0]
        }

        return (
          loadedStudents.find((student) => student.phone === current.phone) ||
          loadedStudents[0]
        )
      })
    } catch {
      setStudents(fallbackStudents)
      setSelectedStudent(fallbackStudents[0])
    }
  }

  useEffect(() => {
    if (!currentUser) {
      clearStoredSession()
      return
    }

    saveStoredSession({
      currentUser,
      selectedStudent,
      students,
      view,
    })
  }, [currentUser, selectedStudent, students, view])

  useEffect(() => {
    if (!currentUser) {
      return
    }

    if (currentUser.role === 'student') {
      fetchStudentByPhone(currentUser.phone, currentUser).then(setSelectedStudent)
      return
    }

    loadStudents(currentUser.phone)
  }, [currentUser])

  async function fetchStudentByPhone(studentPhone, fallbackStudent = {}) {
    try {
      const response = await api.get(`/student/${encodeURIComponent(studentPhone)}`)
      return normalizeStudent(response.data.data)
    } catch {
      return normalizeStudent({
        ...fallbackStudent,
        phone: studentPhone,
      })
    }
  }

  async function handlePhoneSignIn(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await api.post('/createAccessCode', {
        phoneNumber: phone,
      })
      const accessCode = response.data.data?.accessCode

      if (accessCode) {
        setPhoneCode(accessCode)
        setMessage(`Development code: ${accessCode}`)
      }

      setView('phoneVerification')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Cannot create access code')
    }
  }

  async function handlePhoneVerify(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await api.post('/validateAccessCode', {
        phoneNumber: phone,
        accessCode: phoneCode,
      })
      const role = response.data.data?.role
      const user = response.data.data?.user || {}
      setCurrentUser(user)

      if (role === 'student') {
        const fullStudent = await fetchStudentByPhone(user.phone || phone, {
          ...user,
          phone,
        })

        setSelectedStudent(fullStudent)
        setView('studentMessage')
      } else {
        await loadStudents(user.phone || phone)
        setView('students')
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Invalid code')
    }
  }

  async function handleEmailSignIn(event) {
    event.preventDefault()
    setMessage('')

    try {
      await api.post('/LoginEmail', {
        email,
      })

      setEmailCode('')
      setView('emailVerification')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Cannot create access code')
    }
  }

  async function handleEmailVerify(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await api.post('/validateEmailAccessCode', {
        email,
        accessCode: emailCode,
      })
      const student = response.data.student
      const fullStudent = await fetchStudentByPhone(student.phone, student)

      setCurrentUser(student)
      setSelectedStudent(fullStudent)
      setView('studentMessage')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Invalid code')
    }
  }

  async function handleSaveStudent(form) {
    if (!form.name || !form.phone || !form.email) {
      setMessage('Student name, phone and email are required')
      return
    }

    try {
      if (modalStudent) {
        await api.put(`/editStudent/${encodeURIComponent(modalStudent.phone)}`, {
          name: form.name,
          email: form.email,
        })
      } else {
        await api.post('/addStudent', {
          name: form.name,
          phone: form.phone,
          email: form.email,
          instructorPhone: currentUser?.phone,
          instructorName: currentUser?.name,
        })
      }

      setMessage('')
      setIsModalOpen(false)
      setModalStudent(null)
      await loadStudents(currentUser?.phone)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Cannot save student')
    }
  }

  async function handleDeleteStudent(student) {
    try {
      await api.delete(`/student/${encodeURIComponent(student.phone)}`)
      setMessage('')
      await loadStudents(currentUser?.phone)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Cannot delete student')
    }
  }

  async function handleAssignLesson(payload) {
    if (!payload.title || !payload.description) {
      setMessage('Lesson title and description are required')
      return
    }

    try {
      await api.post('/assignLesson', payload)
      setMessage('')
      await loadStudents(currentUser?.phone)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Cannot assign lesson')
    }
  }

  async function handleMarkLessonDone(lesson) {
    try {
      await api.post('/markLessonDone', {
        phone: selectedStudent.phone,
        lessonId: lesson.id,
      })
      setMessage('')
      const updatedStudent = await fetchStudentByPhone(selectedStudent.phone, selectedStudent)
      setSelectedStudent(updatedStudent)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Cannot update lesson')
    }
  }

  async function handleSaveProfile(profile) {
    try {
      await api.put('/editProfile', profile)
      setMessage('')
      const updatedStudent = await fetchStudentByPhone(profile.phone, profile)

      setSelectedStudent(updatedStudent)
      setCurrentUser((current) =>
        current?.phone === updatedStudent.phone
          ? {
              ...current,
              name: updatedStudent.name,
              email: updatedStudent.email,
            }
          : current,
      )
    } catch (error) {
      setMessage(error.response?.data?.message || 'Cannot save profile')
    }
  }

  function openCreateModal() {
    setModalStudent(null)
    setIsModalOpen(true)
  }

  function openEditModal(student) {
    setModalStudent(student)
    setIsModalOpen(true)
  }

  function handleDashboardNavigate(key, role = 'instructor') {
    if (key === 'students') {
      setView('students')
      return
    }

    if (key === 'message') {
      setView(role === 'student' ? 'studentMessage' : 'instructorMessage')
      return
    }

    setView(role === 'student' ? 'studentLessons' : 'instructorLessons')
  }

  function handleLogout() {
    clearStoredSession()
    setPhone('')
    setEmail('')
    setPhoneCode('')
    setEmailCode('')
    setMessage('')
    setCurrentUser(null)
    setStudents(fallbackStudents)
    setSelectedStudent(fallbackStudents[0])
    setModalStudent(null)
    setIsModalOpen(false)
    setView('phoneSignIn')
  }

  if (view === 'phoneSignIn') {
    return (
      <AuthCard
        eyebrow="Phone access"
        title="Welcome back"
        subtitle="Sign in with the phone number registered by your classroom."
        placeholder="+15550000001"
        value={phone}
        onChange={setPhone}
        onSubmit={handlePhoneSignIn}
        onBack={() => setView('emailSignIn')}
        message={message}
        footer={
          <>
            Prefer email?{' '}
            <button type="button" onClick={() => setView('emailSignIn')}>
              Use email login
            </button>
          </>
        }
      />
    )
  }

  if (view === 'phoneVerification') {
    return (
      <VerificationCard
        title="Phone verification"
        subtitle="Enter the access code sent to your phone."
        code={phoneCode}
        onCodeChange={setPhoneCode}
        onSubmit={handlePhoneVerify}
        onResend={() => setView('phoneSignIn')}
        onBack={() => setView('phoneSignIn')}
        message={message}
      />
    )
  }

  if (view === 'emailSignIn') {
    return (
      <AuthCard
        eyebrow="Email access"
        title="Student sign in"
        subtitle="Use the email address your instructor added to the classroom."
        placeholder="student@classroom.local"
        value={email}
        onChange={setEmail}
        onSubmit={handleEmailSignIn}
        onBack={() => setView('phoneSignIn')}
        message={message}
        footer={
          <>
            Instructor?{' '}
            <button type="button" onClick={() => setView('phoneSignIn')}>
              Use phone login
            </button>
          </>
        }
      />
    )
  }

  if (view === 'emailVerification') {
    return (
      <VerificationCard
        title="Email verification"
        subtitle="Enter the access code sent to your email address."
        code={emailCode}
        onCodeChange={setEmailCode}
        onSubmit={handleEmailVerify}
        onResend={() => setView('emailSignIn')}
        onBack={() => setView('emailSignIn')}
        message={message}
      />
    )
  }

  if (view === 'studentMessage' || view === 'studentLessons') {
    return (
      <AppShell
        active={view === 'studentMessage' ? 'message' : 'lessons'}
        role="student"
        view={view}
        currentUser={currentUser}
        onNavigate={(key) => handleDashboardNavigate(key, 'student')}
        onLogout={handleLogout}
      >
        {view === 'studentMessage' ? (
          <MessagesPage
            role="student"
            students={students}
            selectedStudent={selectedStudent}
            onSelectStudent={setSelectedStudent}
          />
        ) : (
          <StudentLessons
            student={selectedStudent}
            onSaveProfile={handleSaveProfile}
            onMarkDone={handleMarkLessonDone}
          />
        )}
        {message ? <p className="dashboard-message">{message}</p> : null}
      </AppShell>
    )
  }

  return (
    <AppShell
      active={
        view === 'instructorMessage'
          ? 'message'
          : view === 'instructorLessons'
            ? 'lessons'
            : 'students'
      }
      role="instructor"
      view={view}
      currentUser={currentUser}
      onNavigate={(key) => handleDashboardNavigate(key, 'instructor')}
      onLogout={handleLogout}
    >
      {view === 'instructorMessage' ? (
        <MessagesPage
          role="instructor"
          students={students}
          selectedStudent={selectedStudent}
          onSelectStudent={setSelectedStudent}
        />
      ) : view === 'instructorLessons' ? (
        <InstructorLessons
          students={students}
          selectedStudent={selectedStudent}
          onSelectStudent={setSelectedStudent}
          onAssignLesson={handleAssignLesson}
        />
      ) : (
        <ManageStudents
          students={students}
          onAddStudent={openCreateModal}
          onEditStudent={openEditModal}
          onDeleteStudent={handleDeleteStudent}
          onOpenMessage={(student) => {
            setSelectedStudent(student)
            setView('instructorMessage')
          }}
        />
      )}
      {message ? <p className="dashboard-message">{message}</p> : null}
      {isModalOpen ? (
        <StudentModal
          initialStudent={modalStudent}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSaveStudent}
        />
      ) : null}
    </AppShell>
  )
}

export default App
