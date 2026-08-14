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

export default LessonList
