/**
 * About Us Page
 * Built by Carphatian
 */

import Link from 'next/link'

export const metadata = {
  title: 'About Us | Carphatian AI Marketplace',
  description: 'Learn about Carphatian AI Marketplace - the AI-powered platform connecting exceptional talent with visionary clients.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About <span className="text-gradient">Carphatian</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            AI-powered freelance marketplace connecting exceptional talent with visionary clients
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              We're building the future of work by leveraging artificial intelligence to create perfect matches 
              between talented freelancers and innovative clients. Our platform removes the friction from hiring 
              and finding work, letting professionals focus on what they do best.
            </p>
          </div>

          {/* What We Do */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-white mb-6">What We Do</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-3xl">🤖</span>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Matching</h3>
                  <p className="text-gray-300">
                    Our semantic search technology understands context and skill nuances to connect 
                    the right talent with the right opportunities instantly.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-3xl">💼</span>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Streamlined Workflow</h3>
                  <p className="text-gray-300">
                    From job posting to payment, we've automated and simplified every step of the 
                    freelance workflow with intelligent assistants.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-3xl">🔒</span>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Trust & Security</h3>
                  <p className="text-gray-300">
                    Escrow-protected payments, verified profiles, and transparent reviews create 
                    a safe environment for collaboration.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">Built by Carphatian</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Carphatian is a technology innovation company focused on building tools that empower 
              professionals and businesses. We combine cutting-edge AI with thoughtful design to 
              solve real-world problems.
            </p>
            <Link 
              href="https://carphatian.ro" 
              target="_blank"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Visit carphatian.ro →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Join Our Platform</h2>
            <p className="text-white/90 text-lg mb-8">
              Whether you're hiring talent or looking for your next opportunity, we're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signup?role=client"
                className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Post a Job
              </Link>
              <Link 
                href="/signup?role=freelancer"
                className="px-8 py-3 bg-indigo-700 text-white font-semibold rounded-lg hover:bg-indigo-800 transition-colors border border-white/20"
              >
                Find Work
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
