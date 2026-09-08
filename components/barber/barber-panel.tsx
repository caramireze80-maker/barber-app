"use client"

import { useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateAppointmentStatus } from "@/app/actions/barber"
import { logoutAction } from "@/app/actions/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Scissors, Phone, Clock, LogOut, RefreshCw, ShieldCheck } from "lucide-react"
import { formatTime, getStatusLabel, getStatusColor, cn } from "@/lib/utils"
import Link from "next/link"

type Appointment = {
  id: string
  clientName: string
  clientPhone: string
  startTime: string
  endTime: string
  status: string
  service: { name: string; durationMinutes: number }
  barber: { name: string }
}

type Props = {
  appointments: Appointment[]
  barberName: string
  isAdmin: boolean
}

export function BarberPanel({ appointments, barberName, isAdmin }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Polling automático cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 30_000)
    return () => clearInterval(interval)
  }, [router])

  function handleStatus(
    appointmentId: string,
    status: "COMPLETED" | "CANCELLED" | "NO_SHOW"
  ) {
    startTransition(async () => {
      await updateAppointmentStatus(appointmentId, status)
      router.refresh()
    })
  }

  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const pending = appointments.filter((a) => a.status === "PENDING")
  const done = appointments.filter((a) => a.status !== "PENDING")

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-2">
              <Scissors className="h-5 w-5 text-black" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">{barberName}</h1>
              <p className="text-gray-400 text-xs capitalize">{today}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="border-gray-700 text-white hover:bg-gray-800 gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.refresh()}
              className="text-gray-400 hover:text-white gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
            <form action={logoutAction}>
              <Button variant="ghost" size="icon" type="submit" className="text-gray-400 hover:text-white">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Resumen del día */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{appointments.length}</p>
            <p className="text-xs text-gray-400 mt-1">Total hoy</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-400">{pending.length}</p>
            <p className="text-xs text-gray-400 mt-1">Pendientes</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">
              {appointments.filter((a) => a.status === "COMPLETED").length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Completadas</p>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Scissors className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg">Sin citas para hoy</p>
            <p className="text-sm mt-1">Las nuevas reservas aparecerán automáticamente</p>
          </div>
        ) : (
          <>
            {/* Citas pendientes */}
            {pending.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Pendientes
                </h2>
                <div className="space-y-3">
                  {pending.map((appt) => (
                    <AppointmentCard
                      key={appt.id}
                      appointment={appt}
                      onStatus={handleStatus}
                      isPending={isPending}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Citas finalizadas */}
            {done.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Finalizadas
                </h2>
                <div className="space-y-3 opacity-70">
                  {done.map((appt) => (
                    <AppointmentCard
                      key={appt.id}
                      appointment={appt}
                      onStatus={handleStatus}
                      isPending={isPending}
                      readonly
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <p className="text-center text-xs text-gray-600 mt-8">
          Se actualiza automáticamente cada 30 segundos
        </p>
      </main>
    </div>
  )
}

function AppointmentCard({
  appointment,
  onStatus,
  isPending,
  readonly = false,
}: {
  appointment: Appointment
  onStatus: (id: string, status: "COMPLETED" | "CANCELLED" | "NO_SHOW") => void
  isPending: boolean
  readonly?: boolean
}) {
  return (
    <Card className="bg-gray-900 border-gray-800 text-white">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-black rounded-lg px-3 py-2 text-center min-w-[60px]">
              <p className="text-xl font-bold leading-none">{formatTime(appointment.startTime)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{formatTime(appointment.endTime)}</p>
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">{appointment.clientName}</p>
              <p className="text-sm text-gray-300">{appointment.service.name}</p>
            </div>
          </div>
          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", getStatusColor(appointment.status))}>
            {getStatusLabel(appointment.status)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" />
            {appointment.clientPhone}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {appointment.service.durationMinutes} min
          </span>
        </div>

        {!readonly && (
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
              onClick={() => onStatus(appointment.id, "COMPLETED")}
              disabled={isPending}
            >
              ✓ Completada
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 flex-1"
              onClick={() => onStatus(appointment.id, "NO_SHOW")}
              disabled={isPending}
            >
              ✗ No vino
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={() => onStatus(appointment.id, "CANCELLED")}
              disabled={isPending}
            >
              Cancelar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
