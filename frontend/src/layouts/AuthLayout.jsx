function AuthLayout({ children, compact }) {
  return (
    <main className="auth-page">
      <section className={`auth-shell ${compact ? 'verify-shell' : ''}`}>
        {children}
      </section>
    </main>
  )
}

export default AuthLayout
