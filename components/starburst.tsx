"use client";

export default function Starburst() {
  return (
    <div className="absolute top-4 left-4 md:top-8 md:left-12 lg:top-12 lg:left-20 z-0 pointer-events-none">
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 animate-pulse"
        style={{ animationDuration: '4s' }}
      >
        <defs>
          {/* Chrome/metallic gradient for main spikes */}
          <linearGradient id="chromeMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="25%" stopColor="#E0E8F0" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#B8C8D8" stopOpacity="0.85" />
            <stop offset="75%" stopColor="#D8E4F0" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>
          
          {/* Iridescent pink/blue tint */}
          <linearGradient id="iridescentPink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE4EC" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#E8F4FF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFF0E8" stopOpacity="0.6" />
          </linearGradient>
          
          {/* Warm refraction gradient */}
          <linearGradient id="warmRefract" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF8E0" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFE8D0" stopOpacity="0.7" />
          </linearGradient>
          
          {/* Cool refraction gradient */}
          <linearGradient id="coolRefract" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E8F0FF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#F0E8FF" stopOpacity="0.7" />
          </linearGradient>
          
          {/* Shadow gradient for depth */}
          <linearGradient id="shadowGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#A0B0C0" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#808890" stopOpacity="0.2" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="crystalGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Inner glow for center */}
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E8F0FF" stopOpacity="0.3" />
          </radialGradient>
        </defs>
        
        {/* Main vertical spike - top (elongated crystal) */}
        <polygon points="100,2 94,70 100,55 106,70" fill="url(#chromeMain)" filter="url(#crystalGlow)" />
        <polygon points="100,2 106,70 100,55" fill="url(#iridescentPink)" opacity="0.6" />
        
        {/* Main vertical spike - bottom */}
        <polygon points="100,198 106,130 100,145 94,130" fill="url(#chromeMain)" filter="url(#crystalGlow)" />
        <polygon points="100,198 94,130 100,145" fill="url(#warmRefract)" opacity="0.5" />
        
        {/* Main horizontal spike - right */}
        <polygon points="198,100 130,94 145,100 130,106" fill="url(#chromeMain)" filter="url(#crystalGlow)" />
        <polygon points="198,100 130,106 145,100" fill="url(#coolRefract)" opacity="0.6" />
        
        {/* Main horizontal spike - left */}
        <polygon points="2,100 70,106 55,100 70,94" fill="url(#chromeMain)" filter="url(#crystalGlow)" />
        <polygon points="2,100 70,94 55,100" fill="url(#iridescentPink)" opacity="0.5" />
        
        {/* Diagonal spike - top right (long crystal) */}
        <polygon points="170,30 115,85 125,75 135,85" fill="url(#chromeMain)" filter="url(#crystalGlow)" />
        <polygon points="170,30 135,85 125,75" fill="url(#warmRefract)" opacity="0.7" />
        
        {/* Diagonal spike - bottom right */}
        <polygon points="170,170 115,115 125,125 135,115" fill="url(#chromeMain)" filter="url(#crystalGlow)" />
        <polygon points="170,170 135,115 125,125" fill="url(#coolRefract)" opacity="0.6" />
        
        {/* Diagonal spike - bottom left */}
        <polygon points="30,170 85,115 75,125 65,115" fill="url(#chromeMain)" filter="url(#crystalGlow)" />
        <polygon points="30,170 65,115 75,125" fill="url(#iridescentPink)" opacity="0.6" />
        
        {/* Diagonal spike - top left */}
        <polygon points="30,30 85,85 75,75 65,85" fill="url(#chromeMain)" filter="url(#crystalGlow)" />
        <polygon points="30,30 65,85 75,75" fill="url(#warmRefract)" opacity="0.5" />
        
        {/* Secondary shorter spikes for complexity */}
        {/* Top-right secondary */}
        <polygon points="145,55 112,88 118,82 124,88" fill="url(#coolRefract)" opacity="0.8" />
        
        {/* Top-left secondary */}
        <polygon points="55,55 88,88 82,82 76,88" fill="url(#warmRefract)" opacity="0.8" />
        
        {/* Bottom-right secondary */}
        <polygon points="145,145 112,112 118,118 124,112" fill="url(#iridescentPink)" opacity="0.8" />
        
        {/* Bottom-left secondary */}
        <polygon points="55,145 88,112 82,118 76,112" fill="url(#coolRefract)" opacity="0.8" />
        
        {/* Center crystal core with bright glow */}
        <circle cx="100" cy="100" r="18" fill="url(#centerGlow)" />
        <circle cx="100" cy="100" r="10" fill="white" opacity="0.95" />
        <circle cx="100" cy="100" r="5" fill="white" />
        
        {/* Small highlight sparkles */}
        <circle cx="96" cy="96" r="2" fill="white" opacity="0.9" />
        <circle cx="104" cy="97" r="1.5" fill="white" opacity="0.8" />
      </svg>
    </div>
  );
}
