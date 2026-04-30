import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { COMMON_MUSIC_GENRES } from '../constants/musicGenres'
import { POST_FLAG_OPTIONS } from '../constants/postFlags'

const DEFAULT_SORT = 'created_at'
const DEFAULT_FLAG = 'all'
const DEFAULT_GENRE = 'all'
const MAX_GENRE_SEARCH_LEN = 80

const ALLOWED_GENRES = new Set([DEFAULT_GENRE, ...COMMON_MUSIC_GENRES])

const ALLOWED_FLAGS = new Set([
  DEFAULT_FLAG,
  ...POST_FLAG_OPTIONS.map((o) => o.value),
])

const ALLOWED_SORTS = new Set([
  'created_at',
  'oldest',
  'upvotes_count',
  'comments_count',
])

function usePostQueryState() {
  const [searchParams, setSearchParams] = useSearchParams()

  const queryState = useMemo(() => {
    const search = searchParams.get('search') ?? ''
    const sortRaw = searchParams.get('sortBy') ?? DEFAULT_SORT
    const sortBy = ALLOWED_SORTS.has(sortRaw) ? sortRaw : DEFAULT_SORT

    const flagRaw = searchParams.get('flag') ?? DEFAULT_FLAG
    const flag = ALLOWED_FLAGS.has(flagRaw) ? flagRaw : DEFAULT_FLAG

    const genreRaw = searchParams.get('genre') ?? DEFAULT_GENRE
    const genre = ALLOWED_GENRES.has(genreRaw) ? genreRaw : DEFAULT_GENRE

    const genreSearchRaw = searchParams.get('genreSearch') ?? ''
    const genreSearch = genreSearchRaw.slice(0, MAX_GENRE_SEARCH_LEN)

    return { search, sortBy, flag, genre, genreSearch }
  }, [searchParams])

  function updateQueryState(nextState) {
    setSearchParams((currentParams) => {
      const params = new URLSearchParams(currentParams)
      const nextSearch = nextState.search?.trim() ?? ''
      const nextSortRaw = nextState.sortBy ?? DEFAULT_SORT
      const nextSortBy = ALLOWED_SORTS.has(nextSortRaw) ? nextSortRaw : DEFAULT_SORT

      const nextFlagRaw = nextState.flag ?? DEFAULT_FLAG
      const nextFlag = ALLOWED_FLAGS.has(nextFlagRaw) ? nextFlagRaw : DEFAULT_FLAG

      const nextGenreRaw = nextState.genre ?? DEFAULT_GENRE
      const nextGenre = ALLOWED_GENRES.has(nextGenreRaw) ? nextGenreRaw : DEFAULT_GENRE

      if (nextSearch) params.set('search', nextSearch)
      else params.delete('search')

      if (nextSortBy !== DEFAULT_SORT) params.set('sortBy', nextSortBy)
      else params.delete('sortBy')

      if (nextFlag !== DEFAULT_FLAG) params.set('flag', nextFlag)
      else params.delete('flag')

      if (nextGenre !== DEFAULT_GENRE) params.set('genre', nextGenre)
      else params.delete('genre')

      const nextGenreSearch = (nextState.genreSearch ?? '').trim().slice(0, MAX_GENRE_SEARCH_LEN)
      if (nextGenreSearch) params.set('genreSearch', nextGenreSearch)
      else params.delete('genreSearch')

      return params
    })
  }

  return { queryState, updateQueryState }
}

export default usePostQueryState
