/**
 * Terms of Service Page
 * Built by Carphatian
 */

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: December 2024</p>
        
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-400 leading-relaxed">
              By accessing or using Carphatian AI Marketplace, you agree to be bound by these Terms 
              of Service. If you disagree with any part of the terms, you may not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <p className="text-gray-400 leading-relaxed">
              Carphatian is an AI-powered freelance marketplace that connects clients with talented 
              freelancers worldwide. Our platform uses artificial intelligence to enhance job 
              matching, generate professional content, and streamline the hiring process.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              When you create an account, you must provide accurate and complete information. 
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>Maintaining the security of your account and password</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. User Conduct</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>Use the service for any illegal purpose</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Submit false or misleading information</li>
              <li>Attempt to bypass any platform fees</li>
              <li>Scrape or collect user data without permission</li>
              <li>Interfere with the proper functioning of the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Payments and Fees</h2>
            <p className="text-gray-400 leading-relaxed">
              Carphatian charges a platform fee on completed transactions. All fees are clearly 
              displayed before you confirm any transaction. Payments are processed through secure 
              third-party payment providers. Refunds are handled on a case-by-case basis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
            <p className="text-gray-400 leading-relaxed">
              Work product created by freelancers becomes the property of the client upon full 
              payment, unless otherwise agreed. Freelancers retain the right to showcase work 
              in their portfolios unless explicitly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Dispute Resolution</h2>
            <p className="text-gray-400 leading-relaxed">
              In the event of a dispute between clients and freelancers, Carphatian provides 
              mediation services. Our decision in disputes is final and binding. Parties may 
              also pursue legal remedies in their respective jurisdictions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-400 leading-relaxed">
              Carphatian shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages resulting from your use of the service. Our total liability 
              shall not exceed the amount you paid us in the past twelve months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Termination</h2>
            <p className="text-gray-400 leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice, for 
              conduct that we believe violates these Terms or is harmful to other users or the 
              service. Upon termination, your right to use the service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Contact</h2>
            <p className="text-gray-400 leading-relaxed">
              For questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@carphatian.ro" className="text-purple-400 hover:underline">
                legal@carphatian.ro
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
