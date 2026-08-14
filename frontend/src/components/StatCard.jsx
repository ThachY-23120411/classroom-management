function StatCard({ label, value, tone }) {
  return (
    <article className={`stat-card ${tone}`}>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </article>
  )
}

export default StatCard
