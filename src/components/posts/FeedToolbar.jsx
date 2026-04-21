function FeedToolbar({ search, sortBy, onSearchChange, onSortChange, onReset }) {
  return (
    <div className="feed-toolbar">
      <label className="toolbar-field">
        <span>Search by title</span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search posts..."
        />
      </label>

      <label className="toolbar-field">
        <span>Sort by</span>
        <select value={sortBy} onChange={(event) => onSortChange(event.target.value)}>
          <option value="created_at">Newest</option>
          <option value="upvotes_count">Most upvoted</option>
        </select>
      </label>

      <div className="toolbar-actions">
        <button type="button" className="button-link secondary" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  )
}

export default FeedToolbar
