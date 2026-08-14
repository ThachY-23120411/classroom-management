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

function DashboardLayout({
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

export default DashboardLayout
