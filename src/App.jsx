import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AdminProvider } from './contexts/AdminContext'
import { UserProvider } from './contexts/UserContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AdminRoute from './components/AdminRoute'
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import News from './pages/News'
import Connect from './pages/Connect'
import AITools from './pages/AITools'
import BlogPost from './pages/BlogPost'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import BlogManager from './pages/admin/BlogManager'
import BlogEditor from './pages/admin/BlogEditor'
import SecuritySettings from './pages/admin/SecuritySettings'
import AdminSettings from './pages/admin/AdminSettings'
import AdminUsers from './pages/admin/AdminUsers'
import PasswordReset from './components/PasswordReset'
import UserManager from './components/admin/UserManager'

function App() {
  return (
    <UserProvider>
      <AdminProvider>
        <Router>
          <div className="min-h-screen bg-gray-900 text-white">
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/reset-password" element={<PasswordReset />} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/blog" element={<AdminRoute><BlogManager /></AdminRoute>} />
              <Route path="/admin/blog/new" element={<AdminRoute><BlogEditor /></AdminRoute>} />
              <Route path="/admin/blog/edit/:id" element={<AdminRoute><BlogEditor /></AdminRoute>} />
              <Route path="/admin/security" element={<AdminRoute><SecuritySettings /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="users" element={<UserManager />} />

              {/* Public Routes */}
              <Route path="/*" element={
                <>
                  <Navbar />
                  <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/news" element={<News />} />
                      <Route path="/news/:slug" element={<BlogPost />} />
                      <Route path="/connect" element={<Connect />} />
                      <Route path="/ai-tools" element={<AITools />} />
                    </Routes>
                  </motion.main>
                  <Footer />
                </>
              } />
            </Routes>
          </div>
        </Router>
      </AdminProvider>
    </UserProvider>
  )
}

export default App