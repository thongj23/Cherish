"use client"

import Image from "next/image"

export default function ProfileSection() {
  return (
    <div className="text-center mb-6 sm:mb-8 mt-20">
      <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white shadow-xl">
        <Image
          src="/images/logo.jpg"
          alt="Profile"
          width={112}
          height={112}
          className="object-cover"
          priority
        />
      </div>
      <h1 className="text-gray-800 text-lg sm:text-xl lg:text-2xl font-semibold mb-4 px-2">
        Tiệm dép Cherish 🧚🏻‍♀️
      </h1>
    </div>
  )
}
