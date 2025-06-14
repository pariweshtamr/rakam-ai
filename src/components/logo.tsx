"use client"
import { useState, useEffect } from "react"

const Logo = ({ className = "", style = {}, ...props }) => {
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    // Set initial width
    setWindowWidth(window.innerWidth)

    // Handle resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Determine variant and size based on window width
  const getResponsiveConfig = () => {
    if (windowWidth < 640) {
      // Mobile
      return {
        variant: "compact",
        height: 60,
        viewBox: "0 0 250 80",
        showText: true,
        showTagline: false,
        fontSize: 24,
        taglineFontSize: 10,
      }
    } else if (windowWidth < 768) {
      // Tablet
      return {
        variant: "compact",
        height: 64,
        viewBox: "0 0 250 80",
        showText: true,
        showTagline: false,
        fontSize: 24,
        taglineFontSize: 10,
      }
    } else if (windowWidth < 1024) {
      // Desktop
      return {
        variant: "full",
        height: 52,
        viewBox: "0 0 300 80",
        showText: true,
        showTagline: true,
        fontSize: 24,
        taglineFontSize: 10,
      }
    } else {
      // Large Desktop
      return {
        variant: "full",
        height: 56,
        viewBox: "0 0 300 80",
        showText: true,
        showTagline: true,
        fontSize: 26,
        taglineFontSize: 12,
      }
    }
  }

  // Return null during SSR to avoid hydration mismatch
  if (windowWidth === 0) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 300 80"
        style={{ height: "48px", width: "auto", ...style }}
        className={className}
        {...props}
      >
        {/* Default fallback content */}
        <circle
          cx={40}
          cy={40}
          r={35}
          fill="#3b82f6"
          stroke="#1e40af"
          strokeWidth={2}
        />
        <rect
          x={25}
          y={20}
          width={20}
          height={28}
          rx={2}
          fill="white"
          stroke="#e5e7eb"
          strokeWidth={1}
        />
        <line
          x1={28}
          y1={26}
          x2={42}
          y2={26}
          stroke="#6b7280"
          strokeWidth={1}
        />
        <line
          x1={28}
          y1={30}
          x2={39}
          y2={30}
          stroke="#6b7280"
          strokeWidth={1}
        />
        <line
          x1={28}
          y1={34}
          x2={41}
          y2={34}
          stroke="#6b7280"
          strokeWidth={1}
        />
        <line
          x1={28}
          y1={38}
          x2={36}
          y2={38}
          stroke="#6b7280"
          strokeWidth={1}
        />
        <line
          x1={48}
          y1={25}
          x2={55}
          y2={25}
          stroke="#10b981"
          strokeWidth={2}
          opacity={0.8}
        />
        <line
          x1={48}
          y1={30}
          x2={57}
          y2={30}
          stroke="#10b981"
          strokeWidth={2}
          opacity={0.6}
        />
        <line
          x1={48}
          y1={35}
          x2={53}
          y2={35}
          stroke="#10b981"
          strokeWidth={2}
          opacity={0.8}
        />
        <line
          x1={48}
          y1={40}
          x2={56}
          y2={40}
          stroke="#10b981"
          strokeWidth={2}
          opacity={0.6}
        />
        <rect x={28} y={52} width={3} height={8} fill="#f59e0b" rx={1} />
        <rect x={32} y={48} width={3} height={12} fill="#ef4444" rx={1} />
        <rect x={36} y={50} width={3} height={10} fill="#10b981" rx={1} />
        <rect x={40} y={46} width={3} height={14} fill="#8b5cf6" rx={1} />
        <rect x={44} y={54} width={3} height={6} fill="#f59e0b" rx={1} />
        <text
          x={85}
          y={45}
          fontFamily="Arial, sans-serif"
          fontSize={24}
          fontWeight="bold"
          fill="#1e293b"
        >
          Kharcha<tspan fill="#3b82f6">Track</tspan>
        </text>
        <text
          x={85}
          y={60}
          fontFamily="Arial, sans-serif"
          fontSize={10}
          fill="#64748b"
        >
          AI-Powered Expense Management
        </text>
      </svg>
    )
  }

  const config = getResponsiveConfig()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={config.viewBox}
      style={{
        height: `${config.height}px`,
        width: "auto",
        transition: "all 0.2s ease-in-out",
        ...style,
      }}
      className={className}
      {...props}
    >
      {/* Background rectangle for icon */}
      {/* <circle
        cx={40}
        cy={40}
        r={35}
        fill="#3b82f6"
        stroke="#1e40af"
        strokeWidth={2}
      /> */}
      <rect
        x={10}
        y={10}
        rx={20}
        width={70}
        height={70}
        fill="#3b82f6"
        // stroke="#1e40af"
        // strokeWidth={2}
      />

      {/* Receipt icon */}
      <rect
        x={25}
        y={20}
        width={20}
        height={28}
        rx={4}
        fill="white"
        stroke="#e5e7eb"
        strokeWidth={1}
      />

      {/* Receipt content lines */}
      <line x1={28} y1={26} x2={42} y2={26} stroke="#6b7280" strokeWidth={1} />
      <line x1={28} y1={30} x2={39} y2={30} stroke="#6b7280" strokeWidth={1} />
      <line x1={28} y1={34} x2={41} y2={34} stroke="#6b7280" strokeWidth={1} />
      <line x1={28} y1={38} x2={36} y2={38} stroke="#6b7280" strokeWidth={1} />

      {/* AI scanning lines */}
      <line
        x1={48}
        y1={25}
        x2={55}
        y2={25}
        stroke="#10b981"
        strokeWidth={2}
        opacity={0.8}
      />
      <line
        x1={48}
        y1={30}
        x2={57}
        y2={30}
        stroke="#10b981"
        strokeWidth={2}
        opacity={0.6}
      />
      <line
        x1={48}
        y1={35}
        x2={53}
        y2={35}
        stroke="#10b981"
        strokeWidth={2}
        opacity={0.8}
      />
      <line
        x1={48}
        y1={40}
        x2={56}
        y2={40}
        stroke="#10b981"
        strokeWidth={2}
        opacity={0.6}
      />

      {/* Chart bars */}
      <rect x={28} y={52} width={3} height={8} fill="#f59e0b" rx={1} />
      <rect x={32} y={48} width={3} height={12} fill="#ef4444" rx={1} />
      <rect x={36} y={50} width={3} height={10} fill="#10b981" rx={1} />
      <rect x={40} y={46} width={3} height={14} fill="#8b5cf6" rx={1} />
      <rect x={44} y={54} width={3} height={6} fill="#f59e0b" rx={1} />

      {/* Brand text - conditionally rendered */}
      {config.showText && (
        <text
          x={85}
          y={45}
          fontFamily="Arial, sans-serif"
          fontSize={config.fontSize}
          fontWeight="bold"
          fill="#1e293b"
        >
          Kharcha
          <tspan fill="#3b82f6">Track</tspan>
        </text>
      )}

      {/* Tagline - conditionally rendered */}

      <text
        x={85}
        y={60}
        fontFamily="Arial, sans-serif"
        fontSize={config.taglineFontSize}
        fill="#64748b"
      >
        AI-Powered Expense Management
      </text>

      {/* Decorative elements - only show in full variant */}
      {config.showTagline && (
        <>
          <circle cx={270} cy={20} r={2} fill="#10b981" opacity={0.6} />
          <circle cx={280} cy={25} r={1.5} fill="#3b82f6" opacity={0.4} />
          <circle cx={275} cy={15} r={1} fill="#f59e0b" opacity={0.5} />
        </>
      )}
    </svg>
  )
}

export default Logo
