function BackButton({ onClick }) {
  return (
    <button className="back-button" type="button" onClick={onClick}>
      <span>Back</span>
    </button>
  )
}

export default BackButton
