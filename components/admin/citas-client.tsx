"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { cancelAppointmentAdmin } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Phone, Clock } from "lucide-react"
import Link from "next/link"
import { formatTime, getStatusLabel, getStatusColor, cn } from "@/lib/utils"

type Appointment = {
  id: string
  clientName: string
  clientPhone: string
  date: string
  startTime: string
  endTime: string
  status: string
  barber: { name: string }
  service: { name: string; durationMinutes: number }
}

type Barber = { id: string; name: string }

type Props = {
  appointments: Appointment[]
  barbers: Barber[]
  filterDate: string
  filterBarberId: string
}

export function AdminCitasClient({ appointments, barbers, filterDate, filterBarberId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function applyFilter(date: string, barberId: string) {
    const params = new URLSearchParams()
    if (date) params.set("date", date)
    if (barberId) params.set("barberId", barberId)
    router.push(`/admin/citas?${params.toString()}`)
  }

  function handleCancel(id: string) {
    if (!confirm("¿Cancelar esta cita?")) return
    startTransition(async () => {
      await cancelAppointmentAdmin(id)
      router.refresh()
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-bold text-xl">Citas</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => applyFilter(e.target.value, filterBarberId)}
            className="w-44"
          />
          <select
            value={filterBarberId}
            onChange={(e) => applyFilter(filterDate, e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">Todos los barberos</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Sin citas para los filtros seleccionados.
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <Card key={appt.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-lg">{appt.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {appt.barber.name} · {appt.service.name}
                      </p>
                    </div>
                    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", getStatusColor(appt.status))}>
                      {getStatusLabel(appt.status)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {appt.date} · {formatTime(appt.startTime)}–{formatTime(appt.endTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {appt.clientPhone}
                    </span>
                  </div>

                  {appt.status === "PENDING" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancel(appt.id)}
                      disabled={isPending}
                    >
                      Cancelar cita
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
