import BackButton from './BackButton'
import AuthLayout from '../layouts/AuthLayout'

function AuthCard({
  eyebrow,
  title,
  subtitle,
  placeholder,
  value,
  onChange,
  onSubmit,
  footer,
  message,
  onBack,
}) {
  return (
    <AuthLayout>
      <div className="auth-panel">
        <BackButton onClick={onBack} />
        <div className="auth-brand">
          <span>{eyebrow}</span>
        </div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <form onSubmit={onSubmit}>
          <input
            value={value}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
          />
          <button className="primary-button" type="submit">
            <span>Next</span>
          </button>
        </form>
        {message ? <p className="inline-message">{message}</p> : null}
        <footer>{footer}</footer>
      </div>
    </AuthLayout>
  )
}

export default AuthCard


