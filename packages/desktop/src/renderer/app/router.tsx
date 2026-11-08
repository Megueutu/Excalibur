import { createMemoryRouter } from 'react-router-dom'
import { HomePage } from '@/features/home/HomePage'
import { ProjectPage } from '@/features/projects/pages/ProjectPage'
import { ProfilePage } from '@/features/user-profile/pages/ProfilePage'
import { Shell } from './Shell'

/** Memory history: the title bar's back and forward buttons work without any URL. */
export const router = createMemoryRouter([
  {
    element: <Shell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/projects/:projectId', element: <ProjectPage /> },
      { path: '/projects/:projectId/repos/:repoId', element: <ProjectPage /> },
    ],
  },
])
