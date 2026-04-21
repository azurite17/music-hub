function PostSummaryCard({
  summary,
  isGenerating,
  onGenerate,
  error,
  hasContentToSummarize,
}) {
  return (
    <section className="summary-card">
      <div className="summary-card-header">
        <h3>AI Post Summary</h3>
        <button
          type="button"
          className="button-link secondary"
          onClick={onGenerate}
          disabled={isGenerating || !hasContentToSummarize}
        >
          {isGenerating ? 'Generating...' : 'Generate Summary'}
        </button>
      </div>

      {!hasContentToSummarize ? (
        <p className="status-text">
          Add some post text or comments first, then generate a summary.
        </p>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}
      {summary ? <p className="summary-text">{summary}</p> : null}
      {!summary && !error && hasContentToSummarize ? (
        <p className="status-text">No summary generated yet.</p>
      ) : null}
    </section>
  )
}

export default PostSummaryCard
