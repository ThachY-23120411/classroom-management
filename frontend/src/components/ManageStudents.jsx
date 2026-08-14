import { useState } from 'react'
import StatCard from './StatCard'
import {
  getAssignedLessonCount,
  getCompletedLessonCount,
} from '../utils/studentUtils'

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

export default ManageStudents
