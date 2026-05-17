import { useEffect, useRef } from 'react'

export default function TitleAnimator({ headlines = [] }) {
  const indexRef = useRef(0)
  const originalTitle = 'Monocry — Crypto News & Markets'

  useEffect(() => {
    if (!headlines.length) return

    let timer
    let charTimer
    let currentIndex = 0
    let phase = 'show' // 'show' | 'clear'
    let charPos = 0

    function showNextTitle() {
      const title = headlines[currentIndex % headlines.length]
      if (phase === 'show') {
        // Type-in effect
        charPos++
        document.title = title.slice(0, charPos) + (charPos < title.length ? '|' : '')
        if (charPos < title.length) {
          charTimer = setTimeout(showNextTitle, 40)
        } else {
          // Hold for 3s then clear
          phase = 'clear'
          timer = setTimeout(showNextTitle, 3000)
        }
      } else {
        // Clear then show original briefly, then next
        document.title = originalTitle
        phase = 'show'
        charPos = 0
        currentIndex++
        timer = setTimeout(showNextTitle, 1500)
      }
    }

    timer = setTimeout(showNextTitle, 2000)

    return () => {
      clearTimeout(timer)
      clearTimeout(charTimer)
      document.title = originalTitle
    }
  }, [headlines])

  return null
}
