import { useState } from 'react'

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

export default StudentModal
