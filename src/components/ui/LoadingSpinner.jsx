function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="loading-block" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden />
      <span className="loading-label">{label}</span>
    </div>
  )
}

export default LoadingSpinner
