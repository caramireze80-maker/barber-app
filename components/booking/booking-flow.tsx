"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  getAvailableSlots,
  getBarberWorkingDays,
  createAppointment,
} from "@/app/actions/public"
import {
  formatPrice,
  formatTime,
  formatDayLabel,
  getNext14Days,
  addMinutes,
  cn,
} from "@/lib/utils"
import { CheckCircle2, Clock, DollarSign, User, Calendar, Phone, ChevronRight } from "lucide-react"

type Service = { id: string; name: string; price: number; durationMinutes: number }
type Barber = { id: string; name: string }

type Props = {
  services: Service[]
  barbers: Barber[]
}

type Step = 1 | 2 | 3 | 4

interface BookingState {
  step: Step
  service: Service | null
  barber: Barber | null
  workingDays: number[]
  date: string | null
  slots: string[]
  slotsLoading: boolean
  time: string | null
  clientName: string
  clientPhone: string
  submitError: string | null
}

const STEP_LABELS = ["Servicio", "Barbero", "Fecha y hora", "Confirmar"]

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEP_LABELS.map((label, i) => {
        const step = (i + 1) as Step
        const isDone = step < current
        const isActive = step === current
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                  isDone && "bg-black text-white",
                  isActive && "bg-black text-white ring-2 ring-offset-2 ring-black",
                  !isDone && !isActive && "bg-gray-200 text-gray-500"
                )}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : step}
              </div>
              <span className={cn("text-xs mt-1 hidden sm:block", isActive ? "font-semibold" : "text-gray-400")}>
                {label}
              </span>
            </div>
            {step < 4 && <div className={cn("h-px w-8 sm:w-12 mx-1 mt-0 sm:-mt-4", step < current ? "bg-black" : "bg-gray-200")} />}
          </div>
        )
      })}
    </div>
  )
}

export function BookingFlow({ services, barbers }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<BookingState>({
    step: 1,
    service: null,
    barber: null,
    workingDays: [],
    date: null,
    slots: [],
    slotsLoading: false,
    time: null,
    clientName: "",
    clientPhone: "",
    submitError: null,
  })

  function selectService(service: Service) {
    setState((s) => ({ ...s, service, step: 2, barber: null, date: null, time: null, slots: [] }))
  }

  function selectBarber(barber: Barber) {
    startTransition(async () => {
      const days = await getBarberWorkingDays(barber.id)
      setState((s) => ({
        ...s,
        barber,
        workingDays: days,
        step: 3,
        date: null,
        time: null,
        slots: [],
      }))
    })
  }

  function selectDate(dateStr: string) {
    if (!state.barber || !state.service) return
    setState((s) => ({ ...s, date: dateStr, time: null, slots: [], slotsLoading: true }))
    startTransition(async () => {
      const slots = await getAvailableSlots(state.barber!.id, dateStr, state.service!.durationMinutes)
      setState((s) => ({ ...s, slots, slotsLoading: false }))
    })
  }

  function selectTime(time: string) {
    setState((s) => ({ ...s, time, step: 4 }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!state.service || !state.barber || !state.date || !state.time) return
    const endTime = addMinutes(state.time, state.service.durationMinutes)

    startTransition(async () => {
      const result = await createAppointment({
        barberId: state.barber!.id,
        serviceId: state.service!.id,
        clientName: state.clientName,
        clientPhone: state.clientPhone,
        date: state.date!,
        startTime: state.time!,
        endTime,
      })
      if (result.success && result.appointmentId) {
        router.push(`/confirmacion/${result.appointmentId}`)
      } else {
        setState((s) => ({ ...s, submitError: result.error ?? "Error al crear la cita" }))
      }
    })
  }

  const next14Days = getNext14Days()

  return (
    <div>
      <StepIndicator current={state.step} />

      {/* PASO 1: Servicio */}
      {state.step === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-4">¿Qué servicio necesitas?</h2>
          <div className="grid gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => selectService(service)}
                className="w-full text-left"
              >
                <Card className="hover:border-black transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between pt-5 pb-5">
                    <div>
                      <p className="font-semibold text-lg">{service.name}</p>
                      <div className="flex items-center gap-4 mt-1 text-muted-foreground text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {service.durationMinutes} min
                        </span>
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <DollarSign className="h-3.5 w-3.5" />
                          {formatPrice(service.price)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PASO 2: Barbero */}
      {state.step === 2 && (
        <div>
          <button
            onClick={() => setState((s) => ({ ...s, step: 1 }))}
            className="text-sm text-muted-foreground mb-4 hover:text-black flex items-center gap-1"
          >
            ← Cambiar servicio
          </button>
          <div className="bg-muted rounded-lg px-4 py-2 mb-5 text-sm">
            Servicio: <strong>{state.service?.name}</strong> · {state.service?.durationMinutes} min · {formatPrice(state.service?.price ?? 0)}
          </div>
          <h2 className="text-xl font-bold mb-4">¿Con quién quieres el turno?</h2>
          <div className="grid gap-3">
            {barbers.map((barber) => (
              <button
                key={barber.id}
                onClick={() => selectBarber(barber)}
                disabled={isPending}
                className="w-full text-left"
              >
                <Card className="hover:border-black transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between pt-5 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 rounded-full p-3">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <p className="font-semibold text-lg">{barber.name}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PASO 3: Fecha y hora */}
      {state.step === 3 && (
        <div>
          <button
            onClick={() => setState((s) => ({ ...s, step: 2, barber: null, workingDays: [] }))}
            className="text-sm text-muted-foreground mb-4 hover:text-black flex items-center gap-1"
          >
            ← Cambiar barbero
          </button>
          <div className="bg-muted rounded-lg px-4 py-2 mb-5 text-sm">
            <strong>{state.service?.name}</strong> con <strong>{state.barber?.name}</strong>
          </div>
          <h2 className="text-xl font-bold mb-4">Elige el día</h2>

          <div className="grid grid-cols-7 gap-1.5 mb-6">
            {next14Days.map((dateStr) => {
              const [y, m, d] = dateStr.split("-").map(Number)
              const dayOfWeek = new Date(y, m - 1, d).getDay()
              const isWorking = state.workingDays.includes(dayOfWeek)
              const isSelected = state.date === dateStr
              const { day, date: dayNum, month } = formatDayLabel(dateStr)

              return (
                <button
                  key={dateStr}
                  onClick={() => isWorking && selectDate(dateStr)}
                  disabled={!isWorking || isPending}
                  className={cn(
                    "flex flex-col items-center py-2.5 px-1 rounded-lg text-center transition-colors border text-xs",
                    isSelected && "bg-black text-white border-black",
                    !isSelected && isWorking && "border-gray-200 hover:border-black cursor-pointer",
                    !isWorking && "border-transparent bg-gray-50 text-gray-300 cursor-not-allowed"
                  )}
                >
                  <span className="font-medium">{day}</span>
                  <span className="text-base font-bold">{dayNum}</span>
                  <span className="opacity-70">{month}</span>
                </button>
              )
            })}
          </div>

          {state.date && (
            <div>
              <h2 className="text-xl font-bold mb-3">Elige el horario</h2>
              {state.slotsLoading ? (
                <p className="text-muted-foreground text-center py-6">Cargando horarios…</p>
              ) : state.slots.length === 0 ? (
                <p className="text-muted-foreground text-center py-6 bg-muted rounded-lg">
                  No hay turnos disponibles para este día.<br />Prueba con otro día.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {state.slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => selectTime(slot)}
                      className={cn(
                        "py-3 rounded-lg border text-sm font-medium transition-colors",
                        "border-gray-200 hover:border-black hover:bg-black hover:text-white"
                      )}
                    >
                      {formatTime(slot)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PASO 4: Confirmar */}
      {state.step === 4 && (
        <div>
          <button
            onClick={() => setState((s) => ({ ...s, step: 3, time: null }))}
            className="text-sm text-muted-foreground mb-4 hover:text-black flex items-center gap-1"
          >
            ← Cambiar horario
          </button>

          {/* Resumen */}
          <Card className="mb-6">
            <CardContent className="pt-5 space-y-3">
              <h3 className="font-semibold text-base mb-2">Resumen de tu cita</h3>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {state.date
                    ? new Date(
                        parseInt(state.date.split("-")[0]),
                        parseInt(state.date.split("-")[1]) - 1,
                        parseInt(state.date.split("-")[2])
                      ).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })
                    : ""}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {state.time ? formatTime(state.time) : ""}{" "}
                  {state.time && state.service
                    ? `– ${formatTime(addMinutes(state.time, state.service.durationMinutes))}`
                    : ""}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{state.barber?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-green-700">{state.service?.name} – {formatPrice(state.service?.price ?? 0)}</span>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-xl font-bold mb-4">Tus datos</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Tu nombre</Label>
              <Input
                id="clientName"
                placeholder="Juan Pérez"
                value={state.clientName}
                onChange={(e) => setState((s) => ({ ...s, clientName: e.target.value }))}
                required
                minLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientPhone">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  Teléfono
                </span>
              </Label>
              <Input
                id="clientPhone"
                type="tel"
                placeholder="555-1234-567"
                value={state.clientPhone}
                onChange={(e) => setState((s) => ({ ...s, clientPhone: e.target.value }))}
                required
                minLength={8}
              />
            </div>

            {state.submitError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {state.submitError}
              </p>
            )}

            <Button type="submit" className="w-full py-6 text-base" disabled={isPending}>
              {isPending ? "Confirmando…" : "Confirmar cita"}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
