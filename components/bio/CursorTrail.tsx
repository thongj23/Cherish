"use client"

import { useEffect, useRef } from "react"

export default function CursorTrail() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const lastTime = useRef(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      const now = performance.now()
      if (now - lastTime.current < 45) return // throttle ~22fps
      lastTime.current = now

      const x = e.clientX
      const y = e.clientY
      const s = 5 + Math.random() * 6 // px
      const hue = 260 + Math.random() * 100 // purple-pink range
      const node = document.createElement("span")
      node.className = "trail"
      node.style.left = x + "px"
      node.style.top = y + "px"
      node.style.width = s + "px"
      node.style.height = s + "px"
      node.style.setProperty("--glow", `hsla(${hue} 90% 70% / .9)`)
      node.style.setProperty("--dx", (Math.random() * 24 - 12).toFixed(1) + "px")
      node.style.setProperty("--dy", (Math.random() * -28 - 8).toFixed(1) + "px")
      el.appendChild(node)

      // cap nodes to avoid DOM bloat
      const max = 28
      while (el.childElementCount > max) el.firstElementChild?.remove()

      // auto-remove after animation
      setTimeout(() => node.remove(), 900)
    }

    window.addEventListener("pointermove", onMove)
    return () => window.removeEventListener("pointermove", onMove)
  }, [])

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-40" aria-hidden>
      <style jsx>{`
        @keyframes trail {
          0% { transform: translate(0,0) scale(.9); opacity: .9 }
          70% { opacity: .4 }
          100% { transform: translate(var(--dx), var(--dy)) scale(.4); opacity: 0 }
        }
        .trail {
          position: absolute;
          border-radius: 9999px;
          background: radial-gradient(circle at 50% 50%, var(--glow), transparent 70%);
          box-shadow: 0 0 10px var(--glow), 0 0 18px var(--glow);
          animation: trail .9s ease-out forwards;
          will-change: transform, opacity;
          filter: blur(.2px) saturate(1.2);
        }
        @media (prefers-reduced-motion: reduce) {
          .trail { display: none }
        }
      `}</style>
    </div>
  )
}

