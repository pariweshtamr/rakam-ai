import { HeroSection } from "@/components/hero"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { featuresData, howItWorksData, statsData } from "@/data/landing-data"
import Link from "next/link"

export default function Home() {
  return (
    <div className="mt-40">
      <HeroSection />

      {/* <section className="py-20 bg-teal-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat) => (
              <div className="text-center" key={stat.label}>
                <div className="text-4xl font-bold text-teal-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage your finances
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="space-y-4 pt-4">
                  <feature.icon className="h-8 w-8 text-teal-500" />
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-teal-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksData.map((step) => (
              <div className="text-center" key={step.title}>
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="h-8 w-8 text-teal-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-center mb4">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-teal-400 mt-2 mb-8 max-w-2xl mx-auto">
            Join to manage your finances smarter
          </p>
          <Link href={"/dashboard"}>
            <Button
              size={"lg"}
              className="bg-[#14b8a6] text-white hover:bg-teal-500 animate-bounce"
            >
              Start for Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
