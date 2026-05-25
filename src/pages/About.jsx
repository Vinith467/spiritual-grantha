import BottomNavbar from '../components/BottomNavbar'
import Navbar from '../components/Navbar'

function About() {
  return (
    <div className="bg-[#141414] min-h-screen text-white pb-28">
      {/* Top Navbar */}
      <Navbar />

      <div className="px-4 sm:px-6 pt-24 max-w-2xl mx-auto space-y-6">
        
        {/* Main Content Card */}
        <div className="bg-black/40 backdrop-blur-md border border-[#FF9933]/15 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          
          <span className="bg-[#FF9933]/15 border border-[#FF9933]/20 px-3 py-1 rounded-full text-[10px] font-bold text-[#FF9933] uppercase tracking-widest inline-block mb-6">
            About Sanatan Dharma TV
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
            Our Divine <span className="text-[#FF9933]">Journey & Vision</span>
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-6 font-semibold">
            Serving eternal wisdom through modern technology to every household.
          </p>

          <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
            
            {/* Section 1: Who We Are */}
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-[#FF9933] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#FF9933] rounded-full inline-block" />
                Who We Are
              </h3>
              <p className="pl-3 border-l border-white/10">
                We are a dedicated group of seekers, tech enthusiasts, and devotees bound by a shared love for our ancient culture. <strong>Sanatan Dharma Television</strong> is born from our collective aspiration to create a premium, ad-free digital sanctuary for sacred epics, chants, teachings, and spiritual literature.
              </p>
            </div>

            {/* Section 2: Our Mission */}
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-[#FF9933] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#FF9933] rounded-full inline-block" />
                Our Mission
              </h3>
              <p className="pl-3 border-l border-white/10">
                Our mission is to bring the timeless teachings, shlokas, scriptures, and divine music of our ancestors into the hands of the modern generation in a highly accessible and stunning visual format. We aim to revive the regular contemplation of scriptures, bringing peace, alignment, and dharmic awareness to every life.
              </p>
            </div>

            {/* Section 3: Why We Do This */}
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-[#FF9933] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#FF9933] rounded-full inline-block" />
                Why We Do This
              </h3>
              <p className="pl-3 border-l border-white/10">
                In this fast-paced world, staying anchored to our roots is more important than ever. We believe that technology should be an instrument of Dharma. By providing structured access to epics (like the Ramayana, Mahabharata, and Gita) and devotional media, we help spiritual seekers find daily inspiration and divine connectivity with ease.
              </p>
            </div>

          </div>

          {/* Spiritual Quote at the bottom */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Eternal Truth</p>
            <p className="text-base sm:text-lg font-black text-[#FF9933] italic drop-shadow-md">
              "सत्यमेव जयते नानृतं"
            </p>
            <p className="text-[10px] text-gray-400 mt-1">Truth alone triumphs, not untruth</p>
          </div>

          {/* Legal Compliance Links */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-4 text-[11px] text-gray-500 font-semibold tracking-wider uppercase">
            <a href="/privacy" className="hover:text-[#FF9933] hover:underline transition">Privacy Policy</a>
            <span className="text-gray-700">•</span>
            <a href="/terms" className="hover:text-[#FF9933] hover:underline transition">Terms of Service</a>
          </div>

        </div>
      </div>

      {/* Floating Bottom Navbar */}
      <BottomNavbar />
    </div>
  )
}

export default About
