import Starburst from "@/components/starburst";
import GeometricPrism from "@/components/geometric-prism";

export default function Page() {
  return (
    <main className="relative min-h-screen h-screen w-full overflow-hidden bg-gradient-to-b from-[#FF6B8A] via-[#FF9966] to-[#FFE566]">
      {/* Decorative Elements */}
      <Starburst />
      <GeometricPrism />

      {/* Main Content - Centered */}
      <div className="flex flex-col items-center justify-center h-full px-4 py-20">
        {/* Main Title */}
        <h1 
          className="text-black text-[12vw] md:text-[10vw] lg:text-[8vw] leading-[0.9] tracking-tight text-center mb-8 md:mb-12"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          COACH-ANNA
        </h1>

        {/* Artist Lineup */}
        <div className="flex flex-col items-center gap-4 md:gap-6">
          {/* Top Row */}
          <div className="text-center">
            <p 
              className="text-black text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Basis Points{" "}
              <span className="font-normal opacity-60 text-[0.85em]">B2B</span>{" "}
              Anna Miller
            </p>
          </div>

          {/* Star Separator */}
          <span className="text-black text-xl md:text-2xl">★</span>

          {/* Second Row */}
          <div className="text-center">
            <p 
              className="text-black text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Basis Points{" "}
              <span className="mx-2 md:mx-4 opacity-70">•</span>{" "}
              Charlie Toohey{" "}
              <span className="mx-2 md:mx-4 opacity-70">•</span>{" "}
              J-Rod
            </p>
          </div>

          {/* Star Separator */}
          <span className="text-black text-xl md:text-2xl">★</span>

          {/* Third Row */}
          <div className="text-center">
            <p 
              className="text-black text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              KI/MI{" "}
              <span className="mx-2 md:mx-4 opacity-70">•</span>{" "}
              T-Murph
            </p>
          </div>

          {/* Star Separator */}
          <span className="text-black text-xl md:text-2xl">★</span>

          {/* Announcement Row */}
          <div className="text-center">
            <p 
              className="text-black text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight italic"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              International Headliner TBA
            </p>
          </div>

          {/* Star Separator */}
          <span className="text-black text-xl md:text-2xl">★</span>

          {/* Set Times Announcement */}
          <div className="text-center">
            <p 
              className="text-black text-base sm:text-lg md:text-xl lg:text-2xl tracking-wide opacity-80"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Set times to be announced July 1
            </p>
          </div>
        </div>
      </div>

      {/* Footer - Bottom Center */}
      <footer className="absolute bottom-4 left-0 right-0 text-center z-10 md:bottom-6">
        <p className="text-black text-xs md:text-sm tracking-wide opacity-80">
          Coach-Anna Festival © 2026
        </p>
      </footer>
    </main>
  );
}
