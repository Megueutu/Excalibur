import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api'

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: () => api.listProjects() })
}

export function useProject(id: string | undefined) {
  const query = useProjects()
  return { ...query, data: query.data?.projects.find((p) => p.id === id) }
}
