/**
 * Contact Page
 * Built by Carphatian
 */

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Contact Us</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Message</label>
                <textarea
                  rows={5}
                  placeholder="Tell us more..."
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">📧 Email</h3>
              <p className="text-gray-400">support@carphatian.ro</p>
              <p className="text-gray-500 text-sm mt-1">We respond within 24 hours</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">📍 Location</h3>
              <p className="text-gray-400">Bucharest, Romania</p>
              <p className="text-gray-500 text-sm mt-1">European Union</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">💬 Social</h3>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-purple-400">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-purple-400">LinkedIn</a>
                <a href="#" className="text-gray-400 hover:text-purple-400">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
