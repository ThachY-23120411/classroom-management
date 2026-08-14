import BackButton from './BackButton'
import AuthLayout from '../layouts/AuthLayout'

function VerificationCard({
  title,
  subtitle,
  code,
  onCodeChange,
  onSubmit,
  onResend,
  onBack,
  message,
}) {
  return (
    <AuthLayout compact>
      <div className="auth-panel verify-panel">
        <BackButton onClick={onBack} />
        <div className="auth-brand">
          <span>Verification</span>
        </div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <form onSubmit={onSubmit}>
          <input
            value={code}
            placeholder="Enter 6-digit code"
            onChange={(event) => onCodeChange(event.target.value)}
          />
          <button className="primary-button" type="submit">
            <span>Submit</span>
          </button>
        </form>
        <div className="resend-line">
          <span>Code not received?</span>
          <button type="button" onClick={onResend}>
            Send again
          </button>
        </div>
        {message ? <p className="inline-message">{message}</p> : null}
      </div>
    </AuthLayout>
  )
}

export default VerificationCard
