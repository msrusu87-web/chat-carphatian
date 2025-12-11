import Link from 'next/link'
import { Header } from '@/components/layouts/Header'
import { Footer } from '@/components/layouts/Footer'

export default function FindTalentPage() {
  return (
    <>
      <Header isAuthenticated={false} />
      <main className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800">
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">Find Top Talent</h1>
            <p className="text-xl text-gray-400">AI-matched freelancers ready to bring your vision to life</p>
          </div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="text-lg font-semibold text-white mb-2">Development</h3>
              <p className="text-gray-400 text-sm">Web, mobile, and software developers</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold text-white mb-2">Design</h3>
              <p className="text-gray-400 text-sm">UI/UX, graphic, and brand designers</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
              <div className="text-4xl mb-4">✍️</div>
              <h3 className="text-lg font-semibold text-white mb-2">Writing</h3>
              <p className="text-gray-400 text-sm">Content, copywriting, and technical</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-white mb-2">Marketing</h3>
              <p className="text-gray-400 text-sm">Digital marketing and SEO experts</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-white mb-2">AI & ML</h3>
              <p className="text-gray-400 text-sm">Machine learning and AI specialists</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-semibold text-white mb-2">Mobile Apps</h3>
              <p className="text-gray-400 text-sm">iOS and Android developers</p>
            </div>
          </div>
          <div className="text-center">
            <Link href="/auth/signup?role=client" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
              Post a Job
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
