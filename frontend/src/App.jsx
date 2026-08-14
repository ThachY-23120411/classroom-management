import { useEffect, useState } from 'react'
import {
  requestEmailAccessCode,
  requestPhoneAccessCode,
  validateEmailAccessCode,
  validatePhoneAccessCode,
} from './api/authApi'
import {
  createStudent,
  deleteStudentByPhone,
  getStudent,
  getStudents,
  updateStudent,
  updateStudentProfile,
} from './api/studentApi'
import { assignLesson, markLessonDone } from './api/lessonApi'
import { getApiErrorMessage } from './api/httpClient'
import StudentModal from './components/StudentModal'
import {
  EmailSignInPage,
  EmailVerificationPage,
  PhoneSignInPage,
  PhoneVerificationPage,
} from './pages/AuthPages'
import {
  InstructorDashboardPage,
  StudentDashboardPage,
} from './pages/DashboardPages'
import { useStoredSession } from './hooks/useStoredSession'
import {
  fallbackStudents,
  normalizeStudent,
  normalizeStudents,
} from './utils/studentUtils'
import {
  clearStoredSession,
  saveStoredSession,
} from './utils/session'
import './App.css'

function App() {
  const storedSession = useStoredSession()
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
      const response = await getStudents(instructorPhone)
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

  async function fetchStudentByPhone(studentPhone, fallbackStudent = {}) {
    try {
      const response = await getStudent(studentPhone)
      return normalizeStudent(response.data.data)
    } catch {
      return normalizeStudent({
        ...fallbackStudent,
        phone: studentPhone,
      })
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

  async function handlePhoneSignIn(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await requestPhoneAccessCode(phone)
      const accessCode = response.data.data?.accessCode

      if (accessCode) {
        setPhoneCode(accessCode)
        setMessage(`Development code: ${accessCode}`)
      }

      setView('phoneVerification')
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Cannot create access code'))
    }
  }

  async function handlePhoneVerify(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await validatePhoneAccessCode(phone, phoneCode)
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
      setMessage(getApiErrorMessage(error, 'Invalid code'))
    }
  }

  async function handleEmailSignIn(event) {
    event.preventDefault()
    setMessage('')

    try {
      await requestEmailAccessCode(email)
      setEmailCode('')
      setView('emailVerification')
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Cannot create access code'))
    }
  }

  async function handleEmailVerify(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await validateEmailAccessCode(email, emailCode)
      const student = response.data.student
      const fullStudent = await fetchStudentByPhone(student.phone, student)

      setCurrentUser(student)
      setSelectedStudent(fullStudent)
      setView('studentMessage')
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Invalid code'))
    }
  }

  async function handleSaveStudent(form) {
    if (!form.name || !form.phone || !form.email) {
      setMessage('Student name, phone and email are required')
      return
    }

    try {
      if (modalStudent) {
        await updateStudent(modalStudent.phone, {
          name: form.name,
          email: form.email,
        })
      } else {
        await createStudent({
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
      setMessage(getApiErrorMessage(error, 'Cannot save student'))
    }
  }

  async function handleDeleteStudent(student) {
    try {
      await deleteStudentByPhone(student.phone)
      setMessage('')
      await loadStudents(currentUser?.phone)
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Cannot delete student'))
    }
  }

  async function handleAssignLesson(payload) {
    if (!payload.title || !payload.description) {
      setMessage('Lesson title and description are required')
      return
    }

    try {
      await assignLesson(payload)
      setMessage('')
      await loadStudents(currentUser?.phone)
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Cannot assign lesson'))
    }
  }

  async function handleMarkLessonDone(lesson) {
    try {
      await markLessonDone(selectedStudent.phone, lesson.id)
      setMessage('')

      const updatedStudent = await fetchStudentByPhone(
        selectedStudent.phone,
        selectedStudent,
      )
      setSelectedStudent(updatedStudent)
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Cannot update lesson'))
    }
  }

  async function handleSaveProfile(profile) {
    try {
      await updateStudentProfile(profile)
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
      setMessage(getApiErrorMessage(error, 'Cannot save profile'))
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
      <PhoneSignInPage
        phone={phone}
        setPhone={setPhone}
        message={message}
        onSubmit={handlePhoneSignIn}
        onBack={() => setView('emailSignIn')}
        onUseEmail={() => setView('emailSignIn')}
      />
    )
  }

  if (view === 'phoneVerification') {
    return (
      <PhoneVerificationPage
        phoneCode={phoneCode}
        setPhoneCode={setPhoneCode}
        message={message}
        onSubmit={handlePhoneVerify}
        onResend={() => setView('phoneSignIn')}
        onBack={() => setView('phoneSignIn')}
      />
    )
  }

  if (view === 'emailSignIn') {
    return (
      <EmailSignInPage
        email={email}
        setEmail={setEmail}
        message={message}
        onSubmit={handleEmailSignIn}
        onBack={() => setView('phoneSignIn')}
        onUsePhone={() => setView('phoneSignIn')}
      />
    )
  }

  if (view === 'emailVerification') {
    return (
      <EmailVerificationPage
        emailCode={emailCode}
        setEmailCode={setEmailCode}
        message={message}
        onSubmit={handleEmailVerify}
        onResend={() => setView('emailSignIn')}
        onBack={() => setView('emailSignIn')}
      />
    )
  }

  if (view === 'studentMessage' || view === 'studentLessons') {
    return (
      <StudentDashboardPage
        view={view}
        currentUser={currentUser}
        selectedStudent={selectedStudent}
        students={students}
        message={message}
        onNavigate={(key) => handleDashboardNavigate(key, 'student')}
        onLogout={handleLogout}
        onSelectStudent={setSelectedStudent}
        onSaveProfile={handleSaveProfile}
        onMarkDone={handleMarkLessonDone}
      />
    )
  }

  return (
    <InstructorDashboardPage
      view={view}
      currentUser={currentUser}
      selectedStudent={selectedStudent}
      students={students}
      message={message}
      isModalOpen={isModalOpen}
      modal={modalStudent}
      onNavigate={(key) => handleDashboardNavigate(key, 'instructor')}
      onLogout={handleLogout}
      onSelectStudent={setSelectedStudent}
      onAssignLesson={handleAssignLesson}
      onAddStudent={openCreateModal}
      onEditStudent={openEditModal}
      onDeleteStudent={handleDeleteStudent}
      onOpenMessage={(student) => {
        setSelectedStudent(student)
        setView('instructorMessage')
      }}
      renderModal={(student) => (
        <StudentModal
          initialStudent={student}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSaveStudent}
        />
      )}
    />
  )
}

export default App
