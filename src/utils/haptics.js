export const triggerHaptic = (pattern = 50) => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern)
    } catch (e) {
      console.warn('Haptic feedback failed:', e)
    }
  }
}

export const haptics = {
  light: () => triggerHaptic(30),
  medium: () => triggerHaptic(50),
  heavy: () => triggerHaptic(100),
  success: () => triggerHaptic([30, 50, 30]),
  error: () => triggerHaptic([50, 100, 50, 100, 50]),
  selection: () => triggerHaptic(20)
}
