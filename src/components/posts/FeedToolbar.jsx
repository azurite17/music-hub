import { POST_FLAG_OPTIONS } from '../../constants/postFlags'

function FeedToolbar({
  search,
  sortBy,
  flag,
  onSearchChange,
  onSortChange,
  onFlagChange,
  onReset,
}) {
  return (
    <div className="feed-toolbar">
      <h3>Explore Feed</h3>

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
          <option value="oldest">Oldest</option>
          <option value="upvotes_count">Most upvoted</option>
          <option value="comments_count">Most commented</option>
        </select>
      </label>

      <label className="toolbar-field">
        <span>Filter by flag</span>
        <select value={flag} onChange={(event) => onFlagChange(event.target.value)}>
          <option value="all">All</option>
          {POST_FLAG_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <div className="toolbar-actions">
        <button type="button" className="button-link secondary" onClick={onReset}>
          Clear all
        </button>
      </div>
    </div>
  )
}

export default FeedToolbar
