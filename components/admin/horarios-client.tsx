"use client"

import { useActionState, useTransition } from "react"
import { upsertScheduleAction } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

type Barber = { id: string; name: string }
type Schedule = {
  id: string
  barberId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isWorkingDay: boolean
}

type Props = {
  barbers: Barber[]
  selectedBarberId: string | null
  schedules: Schedule[]
}

function ScheduleRow({
  barberId,
  dayOfWeek,
  schedule,
}: {
  barberId: string
  dayOfWeek: number
  schedule?: Schedule
}) {
  const router = useRouter()
  const [state, action, isPending] = useActionState(upsertScheduleAction, null)

  return (
    <Card className={cn(!schedule?.isWorkingDay && "opacity-60")}>
      <CardContent className="py-4">
        <form
          action={async (fd) => {
            await action(fd)
            router.refresh()
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <input type="hidden" name="barberId" value={barberId} />
          <input type="hidden" name="dayOfWeek" value={dayOfWeek} />

          <div className="w-28">
            <p className="font-semibold text-sm mb-1">{DAY_NAMES[dayOfWeek]}</p>
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                name="isWorkingDay"
                value="true"
                defaultChecked={schedule?.isWorkingDay ?? true}
                className="rounded"
              />
              Trabaja
            </label>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Desde</p>
            <Input
              type="time"
              name="startTime"
              defaultValue={schedule?.startTime ?? "10:00"}
              className="w-32"
              required
            />
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Hasta</p>
            <Input
              type="time"
              name="endTime"
              defaultValue={schedule?.endTime ?? "20:00"}
              className="w-32"
              required
            />
          </div>

          <Button type="submit" size="sm" disabled={isPending} className="mb-0.5">
            {isPending ? "…" : "Guardar"}
          </Button>

          {state?.error && (
            <p className="text-xs text-destructive w-full">{state.error}</p>
          )}
          {state?.success && (
            <p className="text-xs text-green-600 w-full">Guardado ✓</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

export function AdminHorariosClient({ barbers, selectedBarberId, schedules }: Props) {
  const router = useRouter()

  function getSchedule(day: number) {
    return schedules.find((s) => s.dayOfWeek === day)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-bold text-xl">Horarios</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Selector de barbero */}
        <div className="flex flex-wrap gap-2 mb-6">
          {barbers.map((b) => (
            <button
              key={b.id}
              onClick={() => router.push(`/admin/horarios?barberId=${b.id}`)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                selectedBarberId === b.id
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:border-black"
              )}
            >
              {b.name}
            </button>
          ))}
        </div>

        {selectedBarberId ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 0].map((day) => (
              <ScheduleRow
                key={day}
                barberId={selectedBarberId}
                dayOfWeek={day}
                schedule={getSchedule(day)}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">
            No hay barberos activos.
          </p>
        )}
      </main>
    </div>
  )
}
