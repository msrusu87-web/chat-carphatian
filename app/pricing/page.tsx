import Link from 'next/link'
import { Header } from '@/components/layouts/Header'
import { Footer } from '@/components/layouts/Footer'

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      desc: 'Perfect for getting started',
      features: ['Post up to 3 jobs/month', 'Basic AI matching', 'Standard support', 'Secure payments'],
      cta: 'Get Started',
      highlight: false,
    },
    {
      name: 'Professional',
      price: '$49',
      period: '/month',
      desc: 'For growing businesses',
      features: ['Unlimited job posts', 'Advanced AI matching', 'Priority support', 'Analytics dashboard', 'Team collaboration', 'Verified badge'],
      cta: 'Start Free Trial',
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      desc: 'For large organizations',
      features: ['Everything in Pro', 'Dedicated account manager', 'Custom integrations', 'SLA guarantees', 'Volume discounts', 'White-label options'],
      cta: 'Contact Sales',
      highlight: false,
    },
  ]

  return (
    <>
      <Header isAuthenticated={false} />
      <main className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800">
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">Simple, Transparent Pricing</h1>
            <p className="text-xl text-gray-400">Choose the plan that fits your needs. No hidden fees.</p>
          </div>
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan, i) => (
              <div key={i} className={`rounded-2xl p-8 ${plan.highlight ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' : 'bg-gray-800/50 border border-gray-700'}`}>
                <h3 className={`text-xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-white'}`}>{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className={plan.highlight ? 'text-blue-200' : 'text-gray-400'}>{plan.period}</span>}
                </div>
                <p className={`mb-6 ${plan.highlight ? 'text-blue-100' : 'text-gray-400'}`}>{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-white' : 'text-gray-300'}`}>
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className={`block text-center py-3 rounded-lg font-semibold transition-all ${plan.highlight ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-400 text-sm">All plans include 15% platform fee on successful projects. Freelancers are free to join.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
