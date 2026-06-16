"use client";

export default function GeometricPrism() {
  return (
    <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 lg:bottom-12 lg:right-16 z-0 pointer-events-none">
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-28 h-28 md:w-40 md:h-40 lg:w-52 lg:h-52 animate-pulse rotate-[15deg]"
        style={{ animationDuration: '5s' }}
      >
        <defs>
          {/* Chrome/metallic gradient for main spikes */}
          <linearGradient id="chromePrism" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="25%" stopColor="#E0E8F0" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#B8C8D8" stopOpacity="0.85" />
            <stop offset="75%" stopColor="#D8E4F0" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>
          
          {/* Iridescent pink/peach tint */}
          <linearGradient id="prismPink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE4EC" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#FFD8E8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFF0E8" stopOpacity="0.6" />
          </linearGradient>
          
          {/* Warm yellow/gold refraction */}
          <linearGradient id="prismWarm" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF8D0" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFE8C0" stopOpacity="0.7" />
          </linearGradient>
          
          {/* Cool blue refraction */}
          <linearGradient id="prismCool" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E0F0FF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#E8E0FF" stopOpacity="0.7" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="prismGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Center radial glow */}
          <radialGradient id="prismCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#E8F0FF" stopOpacity="0.2" />
          </radialGradient>
        </defs>
        
        {/* Main vertical spike - top */}
        <polygon points="90,5 85,65 90,50 95,65" fill="url(#chromePrism)" filter="url(#prismGlow)" />
        <polygon points="90,5 95,65 90,50" fill="url(#prismPink)" opacity="0.6" />
        
        {/* Main vertical spike - bottom */}
        <polygon points="90,175 95,115 90,130 85,115" fill="url(#chromePrism)" filter="url(#prismGlow)" />
        <polygon points="90,175 85,115 90,130" fill="url(#prismWarm)" opacity="0.5" />
        
        {/* Main horizontal spike - right */}
        <polygon points="175,90 115,85 130,90 115,95" fill="url(#chromePrism)" filter="url(#prismGlow)" />
        <polygon points="175,90 115,95 130,90" fill="url(#prismCool)" opacity="0.6" />
        
        {/* Main horizontal spike - left */}
        <polygon points="5,90 65,95 50,90 65,85" fill="url(#chromePrism)" filter="url(#prismGlow)" />
        <polygon points="5,90 65,85 50,90" fill="url(#prismPink)" opacity="0.5" />
        
        {/* Diagonal spike - top right */}
        <polygon points="155,35 105,80 115,70 125,80" fill="url(#chromePrism)" filter="url(#prismGlow)" />
        <polygon points="155,35 125,80 115,70" fill="url(#prismWarm)" opacity="0.7" />
        
        {/* Diagonal spike - bottom right */}
        <polygon points="155,145 105,100 115,110 125,100" fill="url(#chromePrism)" filter="url(#prismGlow)" />
        <polygon points="155,145 125,100 115,110" fill="url(#prismCool)" opacity="0.6" />
        
        {/* Diagonal spike - bottom left */}
        <polygon points="25,145 75,100 65,110 55,100" fill="url(#chromePrism)" filter="url(#prismGlow)" />
        <polygon points="25,145 55,100 65,110" fill="url(#prismPink)" opacity="0.6" />
        
        {/* Diagonal spike - top left */}
        <polygon points="25,35 75,80 65,70 55,80" fill="url(#chromePrism)" filter="url(#prismGlow)" />
        <polygon points="25,35 55,80 65,70" fill="url(#prismWarm)" opacity="0.5" />
        
        {/* Secondary shorter accent spikes */}
        <polygon points="130,50 102,82 108,76 114,82" fill="url(#prismCool)" opacity="0.75" />
        <polygon points="50,50 78,82 72,76 66,82" fill="url(#prismWarm)" opacity="0.75" />
        <polygon points="130,130 102,98 108,104 114,98" fill="url(#prismPink)" opacity="0.75" />
        <polygon points="50,130 78,98 72,104 66,98" fill="url(#prismCool)" opacity="0.75" />
        
        {/* Tiny tertiary spikes */}
        <polygon points="90,25 88,55 90,48 92,55" fill="url(#prismCool)" opacity="0.6" />
        <polygon points="155,90 125,88 132,90 125,92" fill="url(#prismPink)" opacity="0.6" />
        
        {/* Center crystal core */}
        <circle cx="90" cy="90" r="16" fill="url(#prismCenter)" />
        <circle cx="90" cy="90" r="9" fill="white" opacity="0.95" />
        <circle cx="90" cy="90" r="4" fill="white" />
        
        {/* Highlight sparkles */}
        <circle cx="86" cy="86" r="1.8" fill="white" opacity="0.9" />
        <circle cx="94" cy="87" r="1.2" fill="white" opacity="0.8" />
      </svg>
    </div>
  );
}
