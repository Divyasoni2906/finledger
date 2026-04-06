import { Outlet, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { isLoggedIn } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="ml-56 flex-1 flex flex-col min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
