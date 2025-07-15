import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Upload, X, Image, Link, Check } from 'lucide-react'

const ImageUpload = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [uploadMethod, setUploadMethod] = useState('file') // 'file' or 'url'
  const fileInputRef = useRef(null)
  
  // Simulate image storage (in real app, this would be uploaded to cloud storage)
  const simulateImageUpload = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        // In a real app, you'd upload to cloud storage and get back a URL
        // For demo, we'll use the data URL and simulate a cloud URL
        const timestamp = Date.now()
        const fileName = file.name.replace(/\s+/g, '-').toLowerCase()
        const simulatedUrl = `https://cdn.danpearson.com/blog-images/${timestamp}-${fileName}`
        
        // Store in localStorage for demo persistence
        const storedImages = JSON.parse(localStorage.getItem('blogImages') || '[]')
        const imageData = {
          url: simulatedUrl,
          dataUrl: e.target.result,
          fileName: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString()
        }
        storedImages.push(imageData)
        localStorage.setItem('blogImages', JSON.stringify(storedImages))
        
        resolve(simulatedUrl)
      }
      reader.readAsDataURL(file)
    })
  }
  
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }
  
  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    await handleFiles(files)
  }
  
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    await handleFiles(files)
  }
  
  const handleFiles = async (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      toast.error('Please select valid image files')
      return
    }
    
    if (imageFiles.some(file => file.size > 5 * 1024 * 1024)) {
      toast.error('Image files must be less than 5MB')
      return
    }
    
    setUploading(true)
    
    try {
      for (const file of imageFiles) {
        const imageUrl = await simulateImageUpload(file)
        onUpload(imageUrl)
      }
      toast.success(`${imageFiles.length} image(s) uploaded successfully!`)
    } catch (error) {
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }
  
  const handleUrlUpload = () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a valid image URL')
      return
    }
    
    // Basic URL validation
    try {
      new URL(urlInput)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }
    
    // Check if it's likely an image URL
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const isImageUrl = imageExtensions.some(ext => 
      urlInput.toLowerCase().includes(ext)
    ) || urlInput.includes('unsplash.com') || urlInput.includes('images.')
    
    if (!isImageUrl) {
      toast.error('URL does not appear to be an image')
      return
    }
    
    onUpload(urlInput)
    setUrlInput('')
    toast.success('Image URL added successfully!')
  }
  
  return (
    <div className="space-y-4">
      {/* Upload Method Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setUploadMethod('file')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            uploadMethod === 'file'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Upload Files
        </button>
        <button
          onClick={() => setUploadMethod('url')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            uploadMethod === 'url'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          From URL
        </button>
      </div>
      
      {uploadMethod === 'file' ? (
        /* File Upload */
        <motion.div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? 'border-cyan-400 bg-cyan-400/10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full ${
              dragActive ? 'bg-cyan-500' : 'bg-gray-700'
            }`}>
              <Upload size={32} className="text-white" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-white mb-2">
                {uploading ? 'Uploading...' : 'Drop images here or click to browse'}
              </p>
              <p className="text-sm text-gray-400">
                Supports JPG, PNG, GIF, WebP (max 5MB each)
              </p>
            </div>
            
            {uploading && (
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </motion.div>
      ) : (
        /* URL Upload */
        <div className="bg-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link size={20} className="text-cyan-400" />
            <h4 className="font-medium text-white">Add Image from URL</h4>
          </div>
          
          <div className="flex gap-3">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleUrlUpload()}
            />
            <button
              onClick={handleUrlUpload}
              disabled={!urlInput.trim()}
              className="px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check size={18} />
              Add
            </button>
          </div>
          
          <p className="text-xs text-gray-400 mt-2">
            Paste a direct link to an image file or from services like Unsplash
          </p>
        </div>
      )}
      
      {/* Upload Tips */}
      <div className="bg-gray-700/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-cyan-400 mb-2 flex items-center gap-2">
          <Image size={16} />
          Upload Tips
        </h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Recommended size: 1200x800px for featured images</li>
          <li>• Use WebP format for better compression</li>
          <li>• Optimize images before upload for faster loading</li>
          <li>• Add descriptive alt text when inserting into content</li>
        </ul>
      </div>
    </div>
  )
}

export default ImageUpload