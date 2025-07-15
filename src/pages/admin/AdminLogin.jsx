
import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAdmin } from '../../contexts/AdminContext'
import { Lock, User, Eye, EyeOff, Shield, ArrowLeft, Home } from 'lucide-react'

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [sendingReset, setSendingReset] = useState(false)
  const { login, isAuthenticated, sendPasswordResetEmail, loading } = useAdmin()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const handleForgotPassword = async (e) => {
    e.preventDefault()

    if (!resetEmail) {
      toast.error('Please enter your email address')
      return
    }

    setSendingReset(true)
    try {
      const result = await sendPasswordResetEmail(resetEmail)
      if (result.success) {
        toast.success('Password reset email sent! Check your inbox.')
        // For demo purposes, show the reset link
        if (result.resetLink) {
          toast.success(`Demo Reset Link: ${result.resetLink}`, { duration: 15000 })
        }
        setShowForgotPassword(false)
        setResetEmail('')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Failed to send reset email')
    } finally {
      setSendingReset(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const onSubmit = async (data) => {
    try {
      const result = await login(data)
      if (result.success) {
        toast.success('Login successful!')
        navigate('/admin')
      } else {
        toast.error(result.error || 'Login failed')
      }
    } catch (error) {
      toast.error('An error occurred during login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-blue-900/20" />

      {/* Navigation Back to Main Site */}
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <Home size={20} />
          <span>Back to Site</span>
        </Link>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 border border-cyan-500/20"
          >
            <h2 className="text-xl font-bold text-white mb-4">Forgot Password</h2>
            <p className="text-gray-400 mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetEmail('')
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingReset}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50"
                >
                  {sendingReset ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-md w-full bg-gray-800 rounded-2xl p-8 border border-cyan-500/20 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Admin Access
          </h1>
          <p className="text-gray-400 mt-2">Secure login to dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                placeholder="Enter email address"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: 'Password is required' })}
                className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 py-3 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              Forgot your password?
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
          <p className="text-xs text-gray-400 text-center">
            Demo Credentials: Dan@DanPearson.net / Infomax1!
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminLogin
