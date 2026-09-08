import { getAppointmentById } from "@/app/actions/public"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Calendar, Clock, User, Scissors, Phone, Home } from "lucide-react"
import { formatTime, formatDate, formatPrice } from "@/lib/utils"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ConfirmacionPage({ params }: Props) {
  const { id } = await params
  const appointment = await getAppointmentById(id)
  if (!appointment) notFound()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Icono de éxito */}
        <div className="text-center mb-6">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-3" />
          <h1 className="text-3xl font-bold">¡Cita confirmada!</h1>
          <p className="text-muted-foreground mt-1">Te esperamos en la barbería</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Scissors className="h-5 w-5" />
              Detalles de tu cita
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="font-medium">{formatDate(appointment.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Horario</p>
                <p className="font-medium">
                  {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
                  <span className="text-muted-foreground text-sm ml-2">
                    ({appointment.service.durationMinutes} min)
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Barbero</p>
                <p className="font-medium">{appointment.barber.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Scissors className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Servicio</p>
                <p className="font-medium">
                  {appointment.service.name}{" "}
                  <span className="text-green-600 font-bold">
                    {formatPrice(appointment.service.price)}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Tu teléfono</p>
                <p className="font-medium">{appointment.clientPhone}</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mt-2">
              <p className="text-sm text-amber-800">
                <strong>Recuerda:</strong> Si no puedes asistir, comunícate con nosotros con anticipación.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col gap-3">
          <Link href="/agendar">
            <Button variant="outline" className="w-full">
              Reservar otra cita
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-full gap-2">
              <Home className="h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
