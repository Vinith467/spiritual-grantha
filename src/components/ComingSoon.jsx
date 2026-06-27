import React from 'react'

export default function ComingSoon({ language = 'Kannada' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center animate-in fade-in duration-700">
      <div className="w-20 h-20 bg-gradient-to-br from-[#FF9933]/20 to-[#FF6600]/5 rounded-full flex items-center justify-center mb-6 border border-[#FF9933]/30 shadow-[0_0_30px_rgba(255,153,51,0.15)]">
        <svg className="w-10 h-10 text-[#FF9933]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 tracking-wide">
        {language} Content Coming Soon
      </h2>
      <p className="text-gray-400 text-sm sm:text-base max-w-md leading-relaxed font-medium">
        We are working meticulously to bring you divine and authentic {language} content. 
        Please stay tuned as we expand our sacred library.
      </p>
      
      <div className="mt-10 px-6 py-3 bg-white/5 border border-white/10 rounded-full">
        <span className="text-[#FF9933] text-xs font-bold uppercase tracking-widest">Omisha and the Inner Path</span>
      </div>
    </div>
  )
}
