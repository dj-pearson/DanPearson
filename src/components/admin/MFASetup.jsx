import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Shield, Smartphone, Key, Copy, Check, AlertCircle, QrCode, RefreshCw } from 'lucide-react'

const MFASetup = ({ user, onSave, onClose }) => {
  const [step, setStep] = useState(1)
  const [qrCode, setQrCode] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    generateMFASecret()
  }, [])

  const generateMFASecret = () => {
    // Generate a random secret key (32 characters)
    const secret = Array.from({ length: 32 }, () => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]
    ).join('')
    
    setSecretKey(secret)
    
    // Generate QR code URL (in production, use actual QR code library)
    const issuer = 'Dan Pearson Portfolio'
    const accountName = user.email
    const qrUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`
    
    // For demo purposes, we'll use a QR code generator service
    setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`)
  }

  const generateBackupCodes = () => {
    const codes = []
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substr(2, 8).toUpperCase()
      codes.push(code)
    }
    setBackupCodes(codes)
  }

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Simulate verification (in production, verify against TOTP algorithm)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo, accept any 6-digit code
      if (!/^\d{6}$/.test(verificationCode)) {
        throw new Error('Invalid verification code format')
      }

      generateBackupCodes()
      setStep(3)
    } catch (err) {
      setError('Invalid verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    
    try {
      await onSave(user.id, {
        mfaEnabled: true,
        mfaSecret: secretKey,
        backupCodes: backupCodes,
        mfaSetupDate: new Date().toISOString()
      })
      
      onClose()
    } catch (error) {
      setError('Failed to enable MFA. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const renderStep1 = () => (
    <div className="text-center">
      <div className="bg-blue-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <Shield className="text-blue-400" size={32} />
      </div>
      <h3 className="text-xl font-semibold text-white mb-4">Enable Two-Factor Authentication</h3>
      <p className="text-gray-400 mb-6 leading-relaxed">
        Two-factor authentication adds an extra layer of security to your account. 
        You'll need an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.
      </p>
      
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-white mb-2">Recommended Apps:</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <Smartphone className="text-green-400 mx-auto mb-1" size={20} />
            <span className="text-gray-300">Google Authenticator</span>
          </div>
          <div className="text-center">
            <Smartphone className="text-blue-400 mx-auto mb-1" size={20} />
            <span className="text-gray-300">Authy</span>
          </div>
          <div className="text-center">
            <Smartphone className="text-purple-400 mx-auto mb-1" size={20} />
            <span className="text-gray-300">Microsoft Authenticator</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => setStep(2)}
        className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
      >
        Continue Setup
      </button>
    </div>
  )

  const renderStep2 = () => (
    <div>
      <h3 className="text-xl font-semibold text-white mb-6 text-center">Scan QR Code</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="text-center">
          <div className="bg-white p-4 rounded-lg inline-block mb-4">
            {qrCode ? (
              <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                <QrCode className="text-gray-400" size={48} />
              </div>
            )}
          </div>
          <p className="text-sm text-gray-400">Scan this QR code with your authenticator app</p>
        </div>
        
        <div>
          <h4 className="font-medium text-white mb-3">Manual Setup</h4>
          <p className="text-sm text-gray-400 mb-3">
            If you can't scan the QR code, enter this secret key manually:
          </p>
          
          <div className="bg-gray-700 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <code className="text-cyan-400 text-sm font-mono break-all">{secretKey}</code>
              <button
                onClick={() => copyToClipboard(secretKey)}
                className="ml-2 p-1 text-gray-400 hover:text-white transition-colors"
                title="Copy secret key"
              >
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-gray-400">
            <p><strong>Account:</strong> {user.email}</p>
            <p><strong>Issuer:</strong> Dan Pearson Portfolio</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h4 className="font-medium text-white mb-3">Enter Verification Code</h4>
        <p className="text-sm text-gray-400 mb-4">
          After adding the account to your authenticator app, enter the 6-digit code:
        </p>
        
        <div className="flex gap-4">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6)
              setVerificationCode(value)
              setError('')
            }}
            placeholder="000000"
            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-lg font-mono focus:border-cyan-500 focus:outline-none"
            maxLength={6}
          />
          <button
            onClick={handleVerifyCode}
            disabled={isLoading || verificationCode.length !== 6}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              'Verify'
            )}
          </button>
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
            <AlertCircle size={14} />
            {error}
          </p>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div>
      <div className="text-center mb-6">
        <div className="bg-green-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <Check className="text-green-400" size={32} />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">MFA Successfully Configured!</h3>
        <p className="text-gray-400">Save these backup codes in a secure location</p>
      </div>
      
      <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-400 mt-0.5" size={20} />
          <div>
            <h4 className="font-medium text-yellow-400 mb-1">Important: Save Your Backup Codes</h4>
            <p className="text-sm text-gray-300">
              These codes can be used to access your account if you lose your authenticator device. 
              Each code can only be used once.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-white">Backup Codes</h4>
          <button
            onClick={() => copyToClipboard(backupCodes.join('\n'))}
            className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 text-sm"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            Copy All
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {backupCodes.map((code, index) => (
            <div key={index} className="bg-gray-800 rounded px-3 py-2">
              <code className="text-cyan-400 font-mono text-sm">{code}</code>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={handleComplete}
          disabled={isLoading}
          className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Shield size={16} />
          )}
          Complete Setup
        </button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-cyan-400">Two-Factor Authentication</h2>
            <span className="text-sm text-gray-400">Step {step} of 3</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNum <= step
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-600 text-gray-400'
                }`}
              >
                {stepNum < step ? <Check size={16} /> : stepNum}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer */}
        {step > 1 && step < 3 && (
          <div className="flex justify-between pt-6 border-t border-gray-700">
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              Back
            </button>
            
            <button
              onClick={() => generateMFASecret()}
              className="px-6 py-3 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Generate New Code
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default MFASetup