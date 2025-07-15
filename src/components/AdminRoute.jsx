import { Navigate } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'
import AdminLayout from './AdminLayout'

const AdminRoute = ({ children }) => {
  const { isAuthenticated } = useAdmin()

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <AdminLayout>{children}</AdminLayout>
}

export default AdminRoute