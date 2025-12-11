/**
 * Privacy Policy Page
 * Built by Carphatian
 */

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: December 2024</p>
        
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p className="text-gray-400 leading-relaxed">
              We collect information you provide directly to us, including your name, email address, 
              profile information, and any content you submit to our platform. We also collect 
              information about your usage of our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Detect, investigate, and prevent fraudulent transactions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Information Sharing</h2>
            <p className="text-gray-400 leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except as described in this policy. We may share information with 
              service providers who assist in our operations, subject to confidentiality agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
            <p className="text-gray-400 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. 
              All data is encrypted in transit and at rest.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Your Rights (GDPR)</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Under the General Data Protection Regulation (GDPR), you have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>Access your personal data</li>
              <li>Rectify inaccurate personal data</li>
              <li>Request erasure of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Request restriction of processing</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Cookies</h2>
            <p className="text-gray-400 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our service 
              and hold certain information. You can instruct your browser to refuse all cookies 
              or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Contact Us</h2>
            <p className="text-gray-400 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@carphatian.ro" className="text-purple-400 hover:underline">
                privacy@carphatian.ro
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
