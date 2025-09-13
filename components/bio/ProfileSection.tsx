"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import Sparkles from "@/components/bio/Sparkles"

export default function ProfileSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.35 }}
      className="text-center mb-6 sm:mb-8 mt-20"
    >
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white shadow-xl"
      >
        {/* pulsing glow ring */}
        <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-purple-400/40 to-pink-400/40 blur-xl animate-pulse" />
        <Image
          src="/images/logo.jpg"
          alt="Profile"
          width={112}
          height={112}
          className="object-cover"
          priority
        />
        {/* fairy sparkles overlay */}
        <Sparkles count={24} />
      </motion.div>
      <h1 className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#7c3aed,#ec4899,#f59e0b,#7c3aed)] bg-[length:200%_100%] drop-shadow text-lg sm:text-xl lg:text-2xl font-semibold mb-4 px-2" style={{ animation: 'gradientMove 6s linear infinite' }}>
        Tiệm dép Cherish 🧚🏻‍♀️
      </h1>
      <style jsx>{`
        @keyframes gradientMove { 0% { background-position: 0% 50% } 100% { background-position: 200% 50% } }
      `}</style>
    </motion.div>
  )
}
