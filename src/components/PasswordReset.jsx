import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle, ArrowLeft, Home } from 'lucide-react'
import { SecurityUtils } from '../utils/SecurityUtils'
import { EmailService } from '../utils/EmailService'

const PasswordReset = () => {
  const [step, setStep] = useState(1) // 1: Request, 2: Reset
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(null)
  const [tokenValid, setTokenValid] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm()
  const newPassword = watch('newPassword')

  useEffect(() => {
    if (token) {
      validateToken()
    }
  }, [token])

  useEffect(() => {
    if (newPassword) {
      const strength = SecurityUtils.calculatePasswordStrength(newPassword)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(null)
    }
  }, [newPassword])

  const validateToken = async () => {
    try {
      const result = EmailService.validateResetToken(token)
      if (result.valid) {
        setTokenValid(true)
        setUserEmail(result.email)
        setStep(2)
      } else {
        toast.error(result.error)
        setStep(1)
      }
    } catch (error) {
      toast.error('Invalid or expired reset token')
      setStep(1)
    }
  }

  const onSubmitRequest = async (data) => {
    setIsSubmitting(true)
    try {
      const result = await EmailService.sendPasswordResetEmail(data.email)
      if (result.success) {
        toast.success('Password reset email sent! Check your inbox.')
        // For demo purposes, show the reset link
        if (result.resetLink) {
          toast.success(`Demo: Reset link - ${result.resetLink}`, { duration: 10000 })
        }
        reset()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Failed to send reset email')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmitReset = async (data) => {
    const validation = SecurityUtils.validatePassword(data.newPassword)
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error))
      return
    }

    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      // Hash the new password
      const hashedPassword = await SecurityUtils.hashPassword(data.newPassword)
      
      // Update user password in storage
      const users = JSON.parse(localStorage.getItem('system-users') || '[]')
      const updatedUsers = users.map(user => 
        user.email === userEmail 
          ? { ...user, password: hashedPassword, updatedAt: new Date().toISOString() }
          : user
      )
      localStorage.setItem('system-users', JSON.stringify(updatedUsers))
      
      // Mark token as used
      EmailService.markTokenAsUsed(token)
      
      // Send confirmation email
      await EmailService.sendNotificationEmail(
        userEmail,
        'Password Changed Successfully',
        'Your password has been changed successfully. If you did not make this change, please contact support immediately.',
        'password_changed'
      )
      
      toast.success('Password reset successfully!')
      setTimeout(() => {
        navigate('/admin/login')
      }, 2000)
    } catch (error) {
      toast.error('Failed to reset password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-blue-900/20" />
      
      {/* Navigation Back */}
      <div className="absolute top-6 left-6">
        <Link
          to="/admin/login"
          className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Login</span>
        </Link>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-md w-full bg-gray-800 rounded-2xl p-8 border border-cyan-500/20 shadow-2xl"
      >
        {/* Step 1: Request Reset */}
        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Lock size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Reset Password
              </h1>
              <p className="text-gray-400 mt-2">Enter your email to receive reset instructions</p>
            </div>

            <form onSubmit={handleSubmit(onSubmitRequest)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 py-3 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Email'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/admin/login"
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
              >
                Remember your password? Sign in
              </Link>
            </div>
          </>
        )}

        {/* Step 2: Reset Password */}
        {step === 2 && tokenValid && (
          <>
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-green-500 to-cyan-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent">
                Set New Password
              </h1>
              <p className="text-gray-400 mt-2">Enter your new password for {userEmail}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmitReset)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('newPassword', { 
                      required: 'New password is required',
                      minLength: {
                        value: 12,
                        message: 'Password must be at least 12 characters'
                      }
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white pr-12"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.newPassword.message}</p>
                )}
                
                {passwordStrength && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Strength:</span>
                      <span className={`font-medium ${
                        passwordStrength.score >= 4 ? 'text-green-400' :
                        passwordStrength.score >= 2 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {passwordStrength.level}
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 4 ? 'bg-green-500' :
                          passwordStrength.score >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${passwordStrength.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password'
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white pr-12"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-cyan-600 py-3 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        {/* Invalid Token */}
        {step === 2 && !tokenValid && (
          <>
            <div className="text-center mb-8">
              <div className="bg-red-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle size={32} className="text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-red-400">
                Invalid Reset Link
              </h1>
              <p className="text-gray-400 mt-2">This reset link is invalid or has expired</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setStep(1)}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 py-3 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
              >
                Request New Reset Link
              </button>
              
              <Link
                to="/admin/login"
                className="block w-full text-center py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default PasswordReset