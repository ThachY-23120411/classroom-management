const SESSION_KEY = 'classroom.session'

export function loadStoredSession() {
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

export function saveStoredSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY)
}
