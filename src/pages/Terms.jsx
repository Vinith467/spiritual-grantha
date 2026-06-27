import { useNavigate } from 'react-router-dom'

function Terms() {
  const navigate = useNavigate()
  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white py-12 px-6 sm:px-8 selection:bg-[#FF9933]/30">
      <div className="max-w-3xl mx-auto bg-black/40 backdrop-blur-md border border-[#FF9933]/15 rounded-2xl p-6 sm:p-10 shadow-2xl">
        
        <div className="flex items-center gap-3 mb-6">
          <img src="/icon-192.png" alt="Grantha Logo" className="w-10 h-10 rounded-full border border-[#FF9933]/50" />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Omisha and the Inner Path</h1>
            <p className="text-[#FF9933] text-xs font-bold uppercase tracking-wider">Terms of Service</p>
          </div>
        </div>

        <p className="text-gray-400 text-xs sm:text-sm mb-6 leading-relaxed">
          Effective Date: May 18, 2026. Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Omisha and the Inner Path web application located at <span className="text-[#FF9933]">https://spiritual-grantha-ouxi.vercel.app/</span> (the "Service").
        </p>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-[#FF9933] uppercase tracking-wider">1. Acceptance of Terms</h2>
            <p>
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you do not have permission to access the Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-[#FF9933] uppercase tracking-wider">2. Google Sign-In & YouTube Integration</h2>
            <p>
              Our Service utilizes <strong>Google Sign-In</strong> to verify your subscription status to our YouTube channel in order to grant you free premium access to our catalog. 
            </p>
            <p className="mt-1">
              By logging in through Google, you authorize the Service to fetch your basic profile (name, email, avatar image) and verify your subscription. You also agree to be bound by YouTube's Terms of Service which you can read here: <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-[#FF9933] hover:underline">YouTube Terms of Service</a>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-[#FF9933] uppercase tracking-wider">3. Intellectual Property</h2>
            <p>
              All original content, designs, animations, and metadata featured on the Service are the exclusive property of Omisha and the Inner Path. Devotional media, videos, and music embedded from YouTube remain the intellectual property of their respective creators and copyright owners.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-[#FF9933] uppercase tracking-wider">4. User Account & Profile</h2>
            <p>
              Your local profile data (Name, Contact Number, and Avatar URL) is stored directly inside your device's browser local storage. You are responsible for maintaining the privacy of your local session and account status. We reserve the right to revoke access to the Service for any account found attempting to abuse our subscription verification mechanisms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-[#FF9933] uppercase tracking-wider">5. Limitation of Liability</h2>
            <p>
              In no event shall Omisha and the Inner Path, nor its team, be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to or use of the Service, including third-party API downtimes or Google OAuth service updates.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-[#FF9933] uppercase tracking-wider">6. Contact Us</h2>
            <p>
              If you have any questions or feedback regarding these Terms, please contact us at <span className="text-[#FF9933]">vinuvinith0007@gmail.com</span>.
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

export default Terms
