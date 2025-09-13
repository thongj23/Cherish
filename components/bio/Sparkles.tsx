"use client"

import { useEffect, useMemo, useState } from "react"

type SparklesProps = {
  count?: number
  className?: string
}

export default function Sparkles({ count = 28, className = "" }: SparklesProps) {
  // Avoid SSR hydration mismatch by rendering only on client
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const dots = useMemo(() => {
    // During SSR or first client render, avoid randomness to keep markup stable
    if (!mounted) return [] as Array<any>
    const arr = Array.from({ length: Math.max(1, Math.min(120, count)) })
    return arr.map((_, i) => {
      const top = Math.random() * 100
      const left = Math.random() * 100
      const size = 3 + Math.random() * 4 // 3–7px
      const delay = (Math.random() * 4).toFixed(2)
      const duration = (3 + Math.random() * 3).toFixed(2) // 3–6s
      const driftX = (-8 + Math.random() * 16).toFixed(2)
      const driftY = (-6 + Math.random() * 12).toFixed(2)
      const hue = Math.floor(260 + Math.random() * 80) // purple-pink range
      return { i, top, left, size, delay, duration, driftX, driftY, hue }
    })
  }, [count, mounted])

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      {dots.map((d) => (
        <span
          key={d.i}
          className="sparkle"
          style={{
            top: `${d.top}%`,
            left: `${d.left}%`,
            width: d.size,
            height: d.size,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            // custom properties for drift
            // @ts-ignore
            "--dx": `${d.driftX}px`,
            // @ts-ignore
            "--dy": `${d.driftY}px`,
            // @ts-ignore
            "--glow": `hsla(${d.hue} 90% 70% / 0.9)`,
          } as any}
        />
      ))}

      <style jsx>{`
        @keyframes twinkle {
          0% { transform: translate(0,0) scale(0.8); opacity: .15 }
          50% { transform: translate(var(--dx), var(--dy)) scale(1); opacity: .9 }
          100% { transform: translate(0,0) scale(.8); opacity: .15 }
        }
        .sparkle {
          position: absolute;
          border-radius: 9999px;
          background: radial-gradient(circle at 50% 50%, var(--glow), transparent 70%);
          box-shadow: 0 0 10px var(--glow), 0 0 18px var(--glow);
          animation: twinkle linear infinite;
          will-change: transform, opacity;
          filter: saturate(1.2);
        }
      `}</style>
    </div>
  )
}
