import Link from 'next/link'
import { Header } from '@/components/layouts/Header'
import { Footer } from '@/components/layouts/Footer'

export default function HowItWorksPage() {
  const steps = [
    { num: '01', title: 'Post Your Project', desc: 'Describe your needs and let our AI understand exactly what you are looking for.' },
    { num: '02', title: 'AI Matches Talent', desc: 'Our AI analyzes thousands of profiles to find the perfect matches for your project.' },
    { num: '03', title: 'Review & Hire', desc: 'Review AI-curated candidates, chat with them, and hire with confidence.' },
    { num: '04', title: 'Collaborate & Pay', desc: 'Work together seamlessly with built-in tools and secure milestone payments.' },
  ]

  return (
    <>
      <Header isAuthenticated={false} />
      <main className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800">
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">How It Works</h1>
            <p className="text-xl text-gray-400">Get started in minutes with our AI-powered platform</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-8">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-6 items-start bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                <div className="w-16 h-16 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{step.num}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/auth/signup" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
              Get Started Free
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
