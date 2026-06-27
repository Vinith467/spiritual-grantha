import { useNavigate } from 'react-router-dom'

function Privacy() {
  const navigate = useNavigate()
  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white py-12 px-6 sm:px-8 selection:bg-[#FF9933]/30">
      <div className="max-w-3xl mx-auto bg-black/40 backdrop-blur-md border border-[#FF9933]/15 rounded-2xl p-6 sm:p-10 shadow-2xl">
        
        <div className="flex items-center gap-3 mb-6">
          <img src="/icon-192.png" alt="Grantha Logo" className="w-10 h-10 rounded-full border border-[#FF9933]/50" />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Omisha and the Inner Path</h1>
            <p className="text-[#FF9933] text-xs font-bold uppercase tracking-wider">Privacy Policy</p>
          </div>
        </div>

        <p className="text-gray-400 text-xs sm:text-sm mb-6 leading-relaxed">
          Effective Date: May 18, 2026. This Privacy Policy describes how Omisha and the Inner Path ("we", "our", or "us") collects, uses, and shares your personal information when you use our web application located at <span className="text-[#FF9933]">https://spiritual-grantha-ouxi.vercel.app/</span> (the "Service").
        </p>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-[#FF9933] uppercase tracking-wider">1. Information We Collect</h2>
            <p>
              When you authenticate with our Service using Google Sign-In, we request access to your basic Google profile and YouTube subscription data. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your Google Account email address (to verify and customize your experience).</li>
              <li>Your public Google Profile name and avatar image URL (to personalize your account view).</li>
              <li>YouTube Subscription status (specifically to verify your subscription to our channel).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-[#FF9933] uppercase tracking-wider">2. How We Use Your Information</h2>
            <p>
              We use the collected information solely to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Verify your subscription status on our YouTube channel to grant you free access to the spiritual content.</li>
              <li>Auto-populate and customize your dashboard profile (displaying your Google profile name and image).</li>
              <li>Maintain and improve the performance and security of our Service.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-[#FF9933] uppercase tracking-wider">3. Data Retention and Storage</h2>
            <p>
              Your personal profile details (Name, Contact Number, and Avatar image URL) are stored <strong>locally inside your browser's localStorage</strong> on your device. We do not transmit or store your profile image or personal details on external backend servers, ensuring complete privacy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-[#FF9933] uppercase tracking-wider">4. Third-Party Services and APIs</h2>
            <p>
              Our Service utilizes <strong>YouTube API Services</strong> to verify channel subscription status. By using our Service, you agree to be bound by the YouTube Terms of Service and acknowledge the Google Privacy Policy. You can review their policies here:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-[#FF9933] hover:underline">YouTube Terms of Service</a></li>
              <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#FF9933] hover:underline">Google Privacy Policy</a></li>
            </ul>
            <p className="mt-2">
              You can revoke our Service's access to your Google account at any time via the <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-[#FF9933] hover:underline">Google Security Settings Page</a>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-[#FF9933] uppercase tracking-wider">5. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact us at <span className="text-[#FF9933]">vinuvinith0007@gmail.com</span>.
            </p>
          </section>

        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')} className="bg-gradient-to-r from-[#FF9933] to-[#FF6600] text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition hover:scale-105 active:scale-95">
            ← Return to Previous Page
          </button>
        </div>

      </div>
    </div>
  )
}

export default Privacy
