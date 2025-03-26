import type React from "react"
import HomeButtons from "@/components/home-buttons"

const Home: React.FC = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-black text-white">
      <HomeButtons />
    </main>
  )
}

export default Home

