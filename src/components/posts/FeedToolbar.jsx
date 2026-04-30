import { COMMON_MUSIC_GENRES } from '../../constants/musicGenres'
import { POST_FLAG_OPTIONS } from '../../constants/postFlags'

function FeedToolbar({
  search,
  genreSearch,
  sortBy,
  flag,
  genre,
  onSearchChange,
  onGenreSearchChange,
  onSortChange,
  onFlagChange,
  onGenreChange,
  onReset,
}) {
  return (
    <div className="feed-toolbar">
      <h3>Find posts</h3>

      <label className="toolbar-field">
        <span>Search by title</span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search posts..."
        />
      </label>

      <label className="toolbar-field">
        <span>Search by genre</span>
        <input
          value={genreSearch}
          onChange={(event) => onGenreSearchChange(event.target.value)}
          placeholder="Any tag: e.g. shoegaze, k-pop, soul…"
          maxLength={80}
        />
        <small className="field-hint toolbar-field-hint">
          Matches preset or custom tags on posts (partial words ok).
        </small>
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

      <label className="toolbar-field">
        <span>Filter by genre</span>
        <select value={genre} onChange={(event) => onGenreChange(event.target.value)}>
          <option value="all">All genres</option>
          {COMMON_MUSIC_GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
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
