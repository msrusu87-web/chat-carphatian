import Link from 'next/link'
import { Header } from '@/components/layouts/Header'
import { Footer } from '@/components/layouts/Footer'

export default function FindWorkPage() {
  const benefits = [
    { icon: '🎯', title: 'AI-Matched Jobs', desc: 'Get matched with jobs that fit your skills perfectly' },
    { icon: '💰', title: 'Competitive Rates', desc: 'Set your own rates and work on your terms' },
    { icon: '🔒', title: 'Secure Payments', desc: 'Milestone-based payments with escrow protection' },
    { icon: '🌍', title: 'Work Anywhere', desc: 'Remote-first platform with clients worldwide' },
    { icon: '⭐', title: 'Build Reputation', desc: 'Grow your profile with reviews and ratings' },
    { icon: '📈', title: 'Career Growth', desc: 'Access to premium clients and long-term projects' },
  ]

  return (
    <>
      <Header isAuthenticated={false} />
      <main className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800">
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">Find Work You Love</h1>
            <p className="text-xl text-gray-400">Join thousands of freelancers getting matched with quality projects</p>
          </div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {benefits.map((item, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/auth/signup?role=freelancer" className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all">
              Join as Freelancer
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
