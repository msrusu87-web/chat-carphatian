/**
 * Cookie Policy Page
 * Built by Carphatian
 */

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Cookie Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: December 2024</p>
        
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">What Are Cookies?</h2>
            <p className="text-gray-400 leading-relaxed">
              Cookies are small text files that are stored on your device when you visit a website. 
              They help websites remember information about your visit, making it easier to return 
              to the site and making it more useful to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Cookies</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Carphatian uses cookies for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li><strong className="text-white">Essential Cookies:</strong> Required for the operation of our platform (authentication, security)</li>
              <li><strong className="text-white">Analytics Cookies:</strong> Help us understand how visitors interact with our platform</li>
              <li><strong className="text-white">Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong className="text-white">Marketing Cookies:</strong> Track visitors across websites to display relevant advertisements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Types of Cookies We Use</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-700/30 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2">Session Cookies</h3>
                <p className="text-gray-400 text-sm">
                  Temporary cookies that expire when you close your browser. Used to maintain your 
                  session while you navigate our platform.
                </p>
              </div>
              
              <div className="bg-gray-700/30 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2">Persistent Cookies</h3>
                <p className="text-gray-400 text-sm">
                  Remain on your device for a set period. Used to remember your preferences and 
                  improve your experience on return visits.
                </p>
              </div>
              
              <div className="bg-gray-700/30 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2">Third-Party Cookies</h3>
                <p className="text-gray-400 text-sm">
                  Set by third-party services we use (analytics, payment processors). Subject to 
                  their respective privacy policies.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Managing Cookies</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>Most browsers allow you to refuse or delete cookies through settings</li>
              <li>You can set your browser to notify you when cookies are sent</li>
              <li>You can use private/incognito mode for sessions without persistent cookies</li>
            </ul>
            <p className="text-gray-500 text-sm mt-4">
              Note: Disabling cookies may affect your ability to use certain features of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Your Consent</h2>
            <p className="text-gray-400 leading-relaxed">
              By continuing to use our website, you consent to our use of cookies as described 
              in this policy. You can withdraw your consent at any time by adjusting your 
              browser settings or contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-gray-400 leading-relaxed">
              If you have questions about our use of cookies, please contact us at{' '}
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
