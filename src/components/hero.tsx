"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import Image from "next/image"
import { useEffect, useRef } from "react"

export const HeroSection = () => {
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const imageElement = imageRef.current

    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const scrollThreshold = 100
      if (scrollPosition > scrollThreshold) {
        imageElement?.classList.add("scrolled")
      } else {
        imageElement?.classList.remove("scrolled")
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="pb-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-7xl lg:text-[105px] pb-6 gradient-title">
          Control Your Money - <br /> the Smart Way
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          An AI-powered app that keeps an eye on your spending, breaks it down
          into easy visuals, and helps you make better financial choices in real
          time.
        </p>
        <div className="">
          <Link href="/dashboard">
            <Button size={"lg"} variant={"outline"} className="px-8">
              Get Started
            </Button>
          </Link>
        </div>
        <div className="hero-image-wrapper">
          <div className="hero-image" ref={imageRef}>
            <Image
              src={"/banner.webp"}
              width={1280}
              height={720}
              alt="banner"
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
