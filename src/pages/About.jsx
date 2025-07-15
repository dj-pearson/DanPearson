import { motion } from 'framer-motion'

const About = () => {
  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6">About Me</h1>
          <p className="text-xl text-gray-400">Hello! I'm Dan Pearson</p>
        </motion.div>

        <div className="space-y-12">
          <motion.section
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800/50 border border-blue-500/20 rounded-xl p-8"
          >
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">My Background</h2>
            <p className="text-gray-300 leading-relaxed">
              I am a passionate sales leader with over 15 years of experience, including a strong 
              background in the fitness industry and expertise in NFT development, design, and 
              go-to-market projects. My journey combines traditional business acumen with 
              cutting-edge technology innovation.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800/50 border border-blue-500/20 rounded-xl p-8"
          >
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">My Work</h2>
            <p className="text-gray-300 leading-relaxed">
              I drive growth and build strong client relationships by providing practical, daily 
              solutions. I leverage cutting-edge technologies like OpenAI, Auto-GPT, Hugging Face, 
              and Stable Diffusion to create unique products and innovative use cases for NFTs and 
              enhance productivity through design.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800/50 border border-blue-500/20 rounded-xl p-8"
          >
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">My Skills</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              As a business owner, I excel in leading teams to exceed company objectives and deliver 
              cost-effective, long-lasting results. My diverse background enables me to optimize 
              efficiency using best-practice strategies while maintaining high standards in account 
              management and client retention.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'Sales Leadership', 'NFT Development', 'AI Integration',
                'Team Management', 'Client Relations', 'Strategic Planning'
              ].map((skill, index) => (
                <div key={index} className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
                  <span className="text-blue-400 font-medium">{skill}</span>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800/50 border border-blue-500/20 rounded-xl p-8"
          >
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">My Goals</h2>
            <p className="text-gray-300 leading-relaxed">
              I am committed to fostering an engaged environment focused on client satisfaction and 
              revenue growth. My approach prioritizes hands-on leadership, excels at cross-departmental 
              coordination, and involves close collaboration with executive leaders to drive meaningful 
              business outcomes.
            </p>
          </motion.section>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-400 mb-6">
            Interested in learning more about my work or discussing potential projects?
          </p>
          <a
            href="/connect"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
          >
            Contact Me
          </a>
        </motion.div>
      </div>
    </div>
  )
}

export default About