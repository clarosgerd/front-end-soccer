import { useQuery } from '@tanstack/react-query'
import { countriesApi } from '@/api/endpoints/countries'

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: countriesApi.list,
    staleTime: Infinity,
  })
}
