import AuthCard from '../components/AuthCard'
import VerificationCard from '../components/VerificationCard'

export function PhoneSignInPage({
  phone,
  setPhone,
  message,
  onSubmit,
  onBack,
  onUseEmail,
}) {
  return (
    <AuthCard
      eyebrow="Phone access"
      title="Welcome back"
      subtitle="Sign in with the phone number registered by your classroom."
      placeholder="+15550000001"
      value={phone}
      onChange={setPhone}
      onSubmit={onSubmit}
      onBack={onBack}
      message={message}
      footer={
        <>
          Prefer email?{' '}
          <button type="button" onClick={onUseEmail}>
            Use email login
          </button>
        </>
      }
    />
  )
}

export function PhoneVerificationPage({
  phoneCode,
  setPhoneCode,
  message,
  onSubmit,
  onBack,
  onResend,
}) {
  return (
    <VerificationCard
      title="Phone verification"
      subtitle="Enter the access code sent to your phone."
      code={phoneCode}
      onCodeChange={setPhoneCode}
      onSubmit={onSubmit}
      onResend={onResend}
      onBack={onBack}
      message={message}
    />
  )
}

export function EmailSignInPage({
  email,
  setEmail,
  message,
  onSubmit,
  onBack,
  onUsePhone,
}) {
  return (
    <AuthCard
      eyebrow="Email access"
      title="Student sign in"
      subtitle="Use the email address your instructor added to the classroom."
      placeholder="student@classroom.local"
      value={email}
      onChange={setEmail}
      onSubmit={onSubmit}
      onBack={onBack}
      message={message}
      footer={
        <>
          Instructor?{' '}
          <button type="button" onClick={onUsePhone}>
            Use phone login
          </button>
        </>
      }
    />
  )
}

export function EmailVerificationPage({
  emailCode,
  setEmailCode,
  message,
  onSubmit,
  onBack,
  onResend,
}) {
  return (
    <VerificationCard
      title="Email verification"
      subtitle="Enter the access code sent to your email address."
      code={emailCode}
      onCodeChange={setEmailCode}
      onSubmit={onSubmit}
      onResend={onResend}
      onBack={onBack}
      message={message}
    />
  )
}
