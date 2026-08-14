import DashboardLayout from '../layouts/DashboardLayout'
import InstructorLessons from '../components/InstructorLessons'
import ManageStudents from '../components/ManageStudents'
import MessagesPage from '../components/MessagesPage'
import StudentLessons from '../components/StudentLessons'

export function StudentDashboardPage({
  view,
  currentUser,
  selectedStudent,
  students,
  message,
  onNavigate,
  onLogout,
  onSelectStudent,
  onSaveProfile,
  onMarkDone,
}) {
  return (
    <DashboardLayout
      active={view === 'studentMessage' ? 'message' : 'lessons'}
      role="student"
      view={view}
      currentUser={currentUser}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {view === 'studentMessage' ? (
        <MessagesPage
          role="student"
          students={students}
          selectedStudent={selectedStudent}
          onSelectStudent={onSelectStudent}
        />
      ) : (
        <StudentLessons
          student={selectedStudent}
          onSaveProfile={onSaveProfile}
          onMarkDone={onMarkDone}
        />
      )}
      {message ? <p className="dashboard-message">{message}</p> : null}
    </DashboardLayout>
  )
}

export function InstructorDashboardPage({
  view,
  currentUser,
  selectedStudent,
  students,
  message,
  isModalOpen,
  modal,
  onNavigate,
  onLogout,
  onSelectStudent,
  onAssignLesson,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onOpenMessage,
  renderModal,
}) {
  return (
    <DashboardLayout
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
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {view === 'instructorMessage' ? (
        <MessagesPage
          role="instructor"
          students={students}
          selectedStudent={selectedStudent}
          onSelectStudent={onSelectStudent}
        />
      ) : view === 'instructorLessons' ? (
        <InstructorLessons
          students={students}
          selectedStudent={selectedStudent}
          onSelectStudent={onSelectStudent}
          onAssignLesson={onAssignLesson}
        />
      ) : (
        <ManageStudents
          students={students}
          onAddStudent={onAddStudent}
          onEditStudent={onEditStudent}
          onDeleteStudent={onDeleteStudent}
          onOpenMessage={onOpenMessage}
        />
      )}
      {message ? <p className="dashboard-message">{message}</p> : null}
      {isModalOpen ? renderModal(modal) : null}
    </DashboardLayout>
  )
}
