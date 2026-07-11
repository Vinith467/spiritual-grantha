import React, { useEffect } from 'react';
import { haptics } from '../utils/haptics';

function BreakModal({ onPause, onAcknowledge }) {
  useEffect(() => {
    // Automatically pause whatever is playing when this mounts
    if (onPause) {
      onPause();
    }
    haptics.notification('warning');
  }, [onPause]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
      
      <div className="relative w-full max-w-sm bg-[#141414] border border-[#FF9933]/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(255,153,51,0.15)] flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#FF9933]/10 flex items-center justify-center mb-6 border border-[#FF9933]/30">
          <svg className="w-8 h-8 text-[#FF9933]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-black text-white mb-3">Time for a Break?</h2>
        
        <p className="text-gray-300 text-sm mb-8 leading-relaxed">
          You've been watching for a long time today. It's important to rest your eyes and mind. 
          Your video has been paused.
        </p>
        
        <button 
          onClick={() => {
            haptics.selection();
            onAcknowledge();
          }}
          className="w-full py-4 bg-[#FF9933] hover:bg-[#ff8800] text-black font-black text-lg rounded-2xl shadow-[0_0_20px_rgba(255,153,51,0.4)] transition-all active:scale-95"
        >
          Done, Let Me Continue
        </button>
      </div>
    </div>
  );
}

export default BreakModal;
