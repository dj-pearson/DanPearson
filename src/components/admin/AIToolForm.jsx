import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm, useFieldArray } from 'react-hook-form'
import { 
  Bot, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Link, 
  Github, 
  Image, 
  Tag,
  Zap,
  Info
} from 'lucide-react'

const AIToolForm = ({ tool, onSubmit, onCancel }) => {
  const [imagePreview, setImagePreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: tool?.title || '',
      category: tool?.category || 'agents',
      description: tool?.description || '',
      image_url: tool?.image_url || '',
      features: tool?.features || [''],
      status: tool?.status || 'Active',
      complexity: tool?.complexity || 'Intermediate',
      pricing: tool?.pricing || 'Free',
      link: tool?.link || '',
      github_link: tool?.github_link || '',
      tags: tool?.tags || [''],
      metrics: {
        metric1_label: tool?.metrics ? Object.keys(tool.metrics)[0] || '' : '',
        metric1_value: tool?.metrics ? Object.values(tool.metrics)[0] || '' : '',
        metric2_label: tool?.metrics ? Object.keys(tool.metrics)[1] || '' : '',
        metric2_value: tool?.metrics ? Object.values(tool.metrics)[1] || '' : ''
      }
    }
  })

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control,
    name: 'features'
  })

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: 'tags'
  })

  const watchImageUrl = watch('image_url')

  useEffect(() => {
    if (watchImageUrl) {
      setImagePreview(watchImageUrl)
    }
  }, [watchImageUrl])

  const categories = [
    { value: 'agents', label: 'AI Agents' },
    { value: 'mcp', label: 'MCP Servers' },
    { value: 'emerging', label: 'Emerging Tech' },
    { value: 'development', label: 'Dev Tools' }
  ]

  const statuses = [
    { value: 'Active', label: 'Active' },
    { value: 'Beta', label: 'Beta' },
    { value: 'Research', label: 'Research' },
    { value: 'Emerging', label: 'Emerging' }
  ]

  const complexities = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' }
  ]

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // Process metrics
      const metrics = {}
      if (data.metrics.metric1_label && data.metrics.metric1_value) {
        metrics[data.metrics.metric1_label] = data.metrics.metric1_value
      }
      if (data.metrics.metric2_label && data.metrics.metric2_value) {
        metrics[data.metrics.metric2_label] = data.metrics.metric2_value
      }

      // Clean up arrays (remove empty values)
      const cleanFeatures = data.features.filter(f => f.trim() !== '')
      const cleanTags = data.tags.filter(t => t.trim() !== '')

      const processedData = {
        ...data,
        features: cleanFeatures,
        tags: cleanTags,
        metrics
      }

      delete processedData.metrics // Remove the form metrics object

      await onSubmit(processedData)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bot className="text-cyan-400" size={32} />
            {tool ? 'Edit AI Tool' : 'Add New AI Tool'}
          </h1>
          <p className="text-gray-400 mt-2">
            {tool ? 'Update the AI tool information' : 'Create a new AI tool entry'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium text-white transition-colors flex items-center gap-2"
        >
          <X size={20} />
          Cancel
        </button>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-8"
      >
        {/* Basic Information */}
        <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20">
          <h2 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
            <Info size={20} />
            Basic Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tool Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                placeholder="Enter tool title"
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Complexity
              </label>
              <select
                {...register('complexity')}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              >
                {complexities.map(complexity => (
                  <option key={complexity.value} value={complexity.value}>{complexity.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pricing
              </label>
              <input
                type="text"
                {...register('pricing')}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                placeholder="e.g., Free, Freemium, $10/month"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              placeholder="Describe the AI tool and its capabilities"
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Image and Links */}
        <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20">
          <h2 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
            <Image size={20} />
            Image & Links
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                {...register('image_url')}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                placeholder="https://example.com/image.jpg"
              />
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-600"
                    onError={() => setImagePreview('')}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Link size={16} className="inline mr-1" />
                  Website/Demo Link
                </label>
                <input
                  type="url"
                  {...register('link')}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Github size={16} className="inline mr-1" />
                  GitHub Repository
                </label>
                <input
                  type="url"
                  {...register('github_link')}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                  placeholder="https://github.com/user/repo"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2">
              <Zap size={20} />
              Key Features
            </h2>
            <button
              type="button"
              onClick={() => appendFeature('')}
              className="bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              <Plus size={16} />
              Add Feature
            </button>
          </div>
          
          <div className="space-y-3">
            {featureFields.map((field, index) => (
              <div key={field.id} className="flex gap-3">
                <input
                  {...register(`features.${index}`)}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                  placeholder="Enter a key feature"
                />
                {featureFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2">
              <Tag size={20} />
              Tags
            </h2>
            <button
              type="button"
              onClick={() => appendTag('')}
              className="bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              <Plus size={16} />
              Add Tag
            </button>
          </div>
          
          <div className="space-y-3">
            {tagFields.map((field, index) => (
              <div key={field.id} className="flex gap-3">
                <input
                  {...register(`tags.${index}`)}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                  placeholder="Enter a tag"
                />
                {tagFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20">
          <h2 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
            <Info size={20} />
            Metrics (Optional)
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Metric 1</h3>
              <div className="space-y-3">
                <input
                  {...register('metrics.metric1_label')}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                  placeholder="Metric label (e.g., Users, Accuracy)"
                />
                <input
                  {...register('metrics.metric1_value')}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                  placeholder="Metric value (e.g., 100K+, 95%)"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Metric 2</h3>
              <div className="space-y-3">
                <input
                  {...register('metrics.metric2_label')}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                  placeholder="Metric label (e.g., Projects, Speed)"
                />
                <input
                  {...register('metrics.metric2_value')}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                  placeholder="Metric value (e.g., 500+, 2x faster)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-medium text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {isSubmitting ? 'Saving...' : (tool ? 'Update Tool' : 'Create Tool')}
          </button>
        </div>
      </motion.form>
    </div>
  )
}

export default AIToolForm