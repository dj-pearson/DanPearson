import { motion } from 'framer-motion'
import { Mail, Linkedin, Twitter, Github, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  const socialLinks = [
    { icon: Mail, href: 'mailto:Dan@DanPearson.net', label: 'Email' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/pearsonmedia/', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://x.com/DjPearson_', label: 'X (Twitter)' }
  ]

  return (
    <footer className="bg-gray-900 border-t border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
              Dan Pearson
            </h3>
            <p className="text-gray-400 mb-4">
              Sales Leader • NFT Developer • AI Enthusiast
            </p>
            <p className="text-gray-400 text-sm">
              Driving innovation through technology and building lasting client relationships.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['About Me', 'Projects', 'News', 'AI Tools', 'Connect'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/admin/login"
                  className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                >
                  <Shield size={14} />
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">Connect</h4>
            <div className="flex space-x-4 mb-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-gray-700 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              Ready to collaborate? Let's build something amazing together.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Dan Pearson. All rights reserved. Built with passion for innovation.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer