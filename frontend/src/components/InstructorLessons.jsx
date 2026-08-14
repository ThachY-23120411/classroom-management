import { useState } from 'react'
import LessonList from './LessonList'

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

export default InstructorLessons
