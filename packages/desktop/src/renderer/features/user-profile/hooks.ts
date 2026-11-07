import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api'

export function useProfile() {
  return useQuery({ queryKey: ['profile'], queryFn: () => api.getProfile() })
}
