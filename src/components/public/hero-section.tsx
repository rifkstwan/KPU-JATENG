

export function HeroSection() {
  return (
    <section className="w-full flex flex-col">
      {/* Image Banner Section (Moved to top) */}
      <div className="w-full max-w-[1920px] mx-auto bg-surface-container-lowest dark:bg-surface-container-low">
        <img
          src="/hero-bg.png"
          alt="Hero Banner KPU Jawa Tengah"
          className="w-full h-auto block"
        />
      </div>

      {/* Text Section (Moved below, background removed) */}
      <div className="w-full pt-10 pb-8 md:pt-16 md:pb-12 bg-surface-container-lowest dark:bg-surface">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 md:gap-16 lg:gap-24">

            {/* Left Column: Heading */}
            <div className="w-full md:w-[55%]">
              <h1 className="text-golden-energy text-sm md:text-base font-bold mb-3 uppercase tracking-widest">
                Melayani Dengan Integritas
              </h1>
              <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-extrabold leading-[1.1] text-zinc-900 dark:text-white tracking-tight">
                KPU Provinsi Jawa Tengah
              </h2>
            </div>

            {/* Right Column: Description */}
            <div className="w-full md:w-[45%] md:pt-10">
              <p className="text-base md:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                Berkomitmen menyelenggarakan Pemilu yang demokratis, transparan, dan akuntabel demi masa depan Jawa Tengah yang lebih baik.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
