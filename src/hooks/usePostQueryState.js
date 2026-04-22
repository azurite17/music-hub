import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { POST_FLAG_OPTIONS } from '../constants/postFlags'

const DEFAULT_SORT = 'created_at'
const DEFAULT_FLAG = 'all'

const ALLOWED_FLAGS = new Set([
  DEFAULT_FLAG,
  ...POST_FLAG_OPTIONS.map((o) => o.value),
])

function usePostQueryState() {
  const [searchParams, setSearchParams] = useSearchParams()

  const queryState = useMemo(() => {
    const search = searchParams.get('search') ?? ''
    const sortBy = searchParams.get('sortBy') ?? DEFAULT_SORT
    const flagRaw = searchParams.get('flag') ?? DEFAULT_FLAG
    const flag = ALLOWED_FLAGS.has(flagRaw) ? flagRaw : DEFAULT_FLAG
    return {
      search,
      sortBy: sortBy === 'upvotes_count' ? 'upvotes_count' : DEFAULT_SORT,
      flag,
    }
  }, [searchParams])

  function updateQueryState(nextState) {
    setSearchParams((currentParams) => {
      const params = new URLSearchParams(currentParams)
      const nextSearch = nextState.search?.trim() ?? ''
      const nextSortBy =
        nextState.sortBy === 'upvotes_count' ? 'upvotes_count' : DEFAULT_SORT
      const nextFlagRaw = nextState.flag ?? DEFAULT_FLAG
      const nextFlag = ALLOWED_FLAGS.has(nextFlagRaw) ? nextFlagRaw : DEFAULT_FLAG

      if (nextSearch) params.set('search', nextSearch)
      else params.delete('search')

      if (nextSortBy !== DEFAULT_SORT) params.set('sortBy', nextSortBy)
      else params.delete('sortBy')

      if (nextFlag !== DEFAULT_FLAG) params.set('flag', nextFlag)
      else params.delete('flag')

      return params
    })
  }

  return { queryState, updateQueryState }
}

export default usePostQueryState
