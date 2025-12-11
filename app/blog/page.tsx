/**
 * Blog Page
 * Built by Carphatian
 */

import Link from 'next/link'

export const metadata = {
  title: 'Blog | Carphatian AI Marketplace',
  description: 'Insights, updates, and stories from the Carphatian AI Marketplace.',
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            <span className="text-gradient">Blog</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Insights, updates, and stories from the future of work
          </p>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-12 text-center">
            <span className="text-6xl mb-6 block">📝</span>
            <h2 className="text-3xl font-bold text-white mb-4">Coming Soon</h2>
            <p className="text-gray-300 text-lg mb-8">
              We're working on bringing you insightful articles about AI, freelancing, 
              and the future of work. Stay tuned!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/"
                className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to Home
              </Link>
              <Link 
                href="/contact"
                className="px-8 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Placeholder Topics */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-2">AI in Hiring</h3>
              <p className="text-gray-400">
                How artificial intelligence is transforming talent acquisition and recruitment
              </p>
            </div>
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-2">Freelancer Success</h3>
              <p className="text-gray-400">
                Tips and strategies for building a thriving freelance career
              </p>
            </div>
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-2">Platform Updates</h3>
              <p className="text-gray-400">
                Latest features, improvements, and roadmap insights
              </p>
            </div>
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-2">Industry Trends</h3>
              <p className="text-gray-400">
                Analysis of remote work, gig economy, and future of employment
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
