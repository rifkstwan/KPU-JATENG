import { HeroSection } from "@/components/public/hero-section"
import { QuickLinks } from "@/components/public/quick-links"
import { NewsSection } from "@/components/public/news-section"
import { PublicationsSection } from "@/components/public/publications-section"
import { OpinionSection } from "@/components/public/opinion-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <QuickLinks />
      
      <div className="max-w-7xl mx-auto px-8 w-full flex flex-col gap-8 pb-16">
        <NewsSection />
        <PublicationsSection />
        <OpinionSection />
      </div>
    </>
  )
}
