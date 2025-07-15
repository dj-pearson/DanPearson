import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Shield, Smartphone, Key, Copy, Check, RefreshCw, Download } from 'lucide-react'
import { useUser } from '../contexts/UserContext'
import { TwoFactorAuth } from '../utils/TwoFactorAuth'

const MFASetup = ({ user, onComplete, onCancel }) => {
  const { setupMFA, verifyMFA, disableMFA } = useUser()
  const [step, setStep] = useState(1)
  const [qrCode, setQrCode] = useState(null)
  const [secret, setSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(30)

  useEffect(() => {
    if (step === 2) {
      initializeMFA()
    }
  }, [step])

  useEffect(() => {
    if (step === 3) {
      const interval = setInterval(() => {
        setTimeRemaining(TwoFactorAuth.getTimeRemaining())
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [step])

  const initializeMFA = async () => {
    setIsLoading(true)
    try {
      const result = await setupMFA(user.id)
      if (result.success) {
        setSecret(result.secret)
        setQrCode(result.qrCode)
        setBackupCodes(TwoFactorAuth.generateBackupCodes())
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Failed to initialize MFA')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerification = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit verification code')
      return
    }

    setIsLoading(true)
    try {
      const result = await verifyMFA(user.id, verificationCode)
      if (result.success) {
        toast.success('MFA enabled successfully!')
        setStep(4)
      } else {
        toast.error(result.error || 'Invalid verification code')
        setVerificationCode('')
      }
    } catch (error) {
      toast.error('Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisableMFA = async () => {
    if (!window.confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return
    }

    setIsLoading(true)
    try {
      const result = await disableMFA(user.id)
      if (result.success) {
        toast.success('MFA disabled successfully')
        onComplete()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Failed to disable MFA')
    } finally {
      setIsLoading(false)
    }
  }

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Secret copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy secret')
    }
  }

  const downloadBackupCodes = () => {
    const content = `Two-Factor Authentication Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\nKeep these codes safe and secure. Each code can only be used once.\n\n${backupCodes.join('\n')}\n\nIf you lose access to your authenticator app, you can use these codes to regain access to your account.`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-codes-${user.email}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Backup codes downloaded')
  }

  if (user.mfaEnabled) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20">
        <div className="text-center">
          <div className="bg-green-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield size={32} className="text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Two-Factor Authentication Enabled
          </h3>
          <p className="text-gray-400 mb-6">
            Your account is protected with two-factor authentication.
          </p>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDisableMFA}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Disabling...' : 'Disable MFA'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNum ? 'bg-cyan-600 text-white' : 'bg-gray-600 text-gray-400'
            }`}>
              {stepNum}
            </div>
            {stepNum < 4 && (
              <div className={`w-12 h-0.5 mx-2 ${
                step > stepNum ? 'bg-cyan-600' : 'bg-gray-600'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Introduction */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="bg-cyan-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield size={32} className="text-cyan-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Enable Two-Factor Authentication
          </h3>
          <p className="text-gray-400 mb-6 leading-relaxed">
            Two-factor authentication adds an extra layer of security to your account. 
            You'll need an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.
          </p>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <p className="text-yellow-400 text-sm">
              <strong>Important:</strong> Make sure you have an authenticator app installed on your phone before proceeding.
            </p>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: QR Code */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="bg-cyan-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Smartphone size={32} className="text-cyan-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Scan QR Code
          </h3>
          <p className="text-gray-400 mb-6">
            Open your authenticator app and scan this QR code:
          </p>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={32} className="text-cyan-400 animate-spin" />
            </div>
          ) : qrCode ? (
            <div className="bg-white p-4 rounded-lg inline-block mb-6">
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
          ) : null}
          
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-2">Manual entry key:</p>
            <div className="flex items-center justify-center gap-2">
              <code className="bg-gray-800 px-3 py-2 rounded text-cyan-400 font-mono text-sm">
                {secret}
              </code>
              <button
                onClick={copySecret}
                className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={isLoading}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Verification */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="bg-cyan-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Key size={32} className="text-cyan-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Verify Setup
          </h3>
          <p className="text-gray-400 mb-6">
            Enter the 6-digit code from your authenticator app:
          </p>
          
          <div className="mb-6">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white text-center text-xl font-mono tracking-widest"
              maxLength={6}
            />
            <div className="mt-2 text-sm text-gray-400">
              Code refreshes in {timeRemaining}s
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleVerification}
              disabled={isLoading || verificationCode.length !== 6}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Backup Codes */}
      {step === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="bg-green-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Check size={32} className="text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">
            MFA Enabled Successfully!
          </h3>
          <p className="text-gray-400 mb-6">
            Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
          </p>
          
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {backupCodes.map((code, index) => (
                <code key={index} className="bg-gray-800 px-3 py-2 rounded text-cyan-400 font-mono text-sm">
                  {code}
                </code>
              ))}
            </div>
            <button
              onClick={downloadBackupCodes}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              Download Codes
            </button>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">
              <strong>Important:</strong> Each backup code can only be used once. Store them securely and don't share them with anyone.
            </p>
          </div>
          
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Complete Setup
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default MFASetup