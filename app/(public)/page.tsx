import Link from "next/link"
import { getActiveServices, getActiveBarbers } from "@/app/actions/public"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scissors, Clock, DollarSign, User, Star } from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default async function LandingPage() {
  const [services, barbers] = await Promise.all([getActiveServices(), getActiveBarbers()])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <header className="relative overflow-hidden px-6 pt-16 pb-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-4">
              <Scissors className="h-10 w-10 text-black" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-3">BarberApp</h1>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            Reserva tu turno online en segundos. Sin esperas, sin llamadas.
          </p>
          <Link href="/agendar">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 font-bold px-10 py-6 text-lg rounded-full">
              Reservar ahora
            </Button>
          </Link>
        </div>
      </header>

      {/* Servicios */}
      <section className="px-6 py-14 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Nuestros servicios</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="bg-gray-900 border-gray-800 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{service.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{service.durationMinutes} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-xl font-bold text-green-400">{formatPrice(service.price)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Barberos */}
      <section className="px-6 py-14 bg-gray-950 max-w-full">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Nuestro equipo</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {barbers.map((barber) => (
              <Card key={barber.id} className="bg-gray-900 border-gray-800 text-white">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="bg-gray-700 rounded-full p-4">
                    <User className="h-8 w-8 text-gray-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{barber.name}</p>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      Barbero profesional
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">¿Listo para el cambio?</h2>
        <p className="text-gray-400 mb-8">Elige el horario que más te convenga</p>
        <Link href="/agendar">
          <Button size="lg" className="bg-white text-black hover:bg-gray-100 font-bold px-10 py-6 text-lg rounded-full">
            Reservar mi turno
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-6 text-center text-gray-500 text-sm">
        <p>Lun – Sáb · 10:00 AM – 8:00 PM</p>
        <p className="mt-1">
          Staff:{" "}
          <Link href="/login" className="hover:text-gray-300 underline">
            Acceder
          </Link>
        </p>
      </footer>
    </div>
  )
}
