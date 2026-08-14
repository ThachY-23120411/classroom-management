import { useEffect, useState } from 'react'
import LessonList from './LessonList'

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

export default StudentLessons
