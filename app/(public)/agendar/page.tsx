import { getActiveServices, getActiveBarbers } from "@/app/actions/public"
import { BookingFlow } from "@/components/booking/booking-flow"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function AgendarPage() {
  const [services, barbers] = await Promise.all([getActiveServices(), getActiveBarbers()])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white px-4 py-4 flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-bold text-lg">Reservar turno</h1>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <BookingFlow services={services} barbers={barbers} />
      </main>
    </div>
  )
}
