import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(price)
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":")
  const hour = parseInt(h)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${m} ${ampm}`
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function getNext14Days(): string[] {
  const days: string[] = []
  const today = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d.toISOString().split("T")[0])
  }
  return days
}

export function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number)
  const total = h * 60 + m + minutes
  const newH = Math.floor(total / 60) % 24
  const newM = total % 60
  return `${newH.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  existingAppointments: { startTime: string; endTime: string }[],
  isToday: boolean
): string[] {
  const slots: string[] = []
  const [sh, sm] = startTime.split(":").map(Number)
  const [eh, em] = endTime.split(":").map(Number)

  let current = sh * 60 + sm
  const end = eh * 60 + em

  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes() + 30

  while (current + durationMinutes <= end) {
    if (isToday && current <= nowMinutes) {
      current += durationMinutes
      continue
    }

    const slotEnd = current + durationMinutes
    const hasConflict = existingAppointments.some(({ startTime: st, endTime: et }) => {
      const [ah, am] = st.split(":").map(Number)
      const [xh, xm] = et.split(":").map(Number)
      const apptStart = ah * 60 + am
      const apptEnd = xh * 60 + xm
      return current < apptEnd && slotEnd > apptStart
    })

    if (!hasConflict) {
      const h = Math.floor(current / 60).toString().padStart(2, "0")
      const m = (current % 60).toString().padStart(2, "0")
      slots.push(`${h}:${m}`)
    }

    current += durationMinutes
  }

  return slots
}

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
]

export function formatDayLabel(dateStr: string): { day: string; date: string; month: string } {
  const [year, month, day] = dateStr.split("-").map(Number)
  const d = new Date(year, month - 1, day)
  return {
    day: DAY_NAMES[d.getDay()],
    date: day.toString(),
    month: MONTH_NAMES[month - 1],
  }
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: "Pendiente",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
    NO_SHOW: "No vino",
  }
  return map[status] ?? status
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    NO_SHOW: "bg-gray-100 text-gray-800",
  }
  return map[status] ?? "bg-gray-100 text-gray-800"
}
