import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

const DEFAULT_SORT = 'created_at'

function usePostQueryState() {
  const [searchParams, setSearchParams] = useSearchParams()

  const queryState = useMemo(() => {
    const search = searchParams.get('search') ?? ''
    const sortBy = searchParams.get('sortBy') ?? DEFAULT_SORT
    return {
      search,
      sortBy: sortBy === 'upvotes_count' ? 'upvotes_count' : DEFAULT_SORT,
    }
  }, [searchParams])

  function updateQueryState(nextState) {
    setSearchParams((currentParams) => {
      const params = new URLSearchParams(currentParams)
      const nextSearch = nextState.search?.trim() ?? ''
      const nextSortBy =
        nextState.sortBy === 'upvotes_count' ? 'upvotes_count' : DEFAULT_SORT

      if (nextSearch) params.set('search', nextSearch)
      else params.delete('search')

      if (nextSortBy !== DEFAULT_SORT) params.set('sortBy', nextSortBy)
      else params.delete('sortBy')

      return params
    })
  }

  return { queryState, updateQueryState }
}

export default usePostQueryState
