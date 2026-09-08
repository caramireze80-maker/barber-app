"use server"

import { prisma } from "@/lib/prisma"
import { generateTimeSlots } from "@/lib/utils"
import { z } from "zod"
import { revalidatePath } from "next/cache"

export async function getActiveServices() {
  return prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })
}

export async function getActiveBarbers() {
  return prisma.barber.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })
}

export async function getBarberWorkingDays(barberId: string): Promise<number[]> {
  const schedules = await prisma.barberSchedule.findMany({
    where: { barberId, isWorkingDay: true },
    select: { dayOfWeek: true },
  })
  return schedules.map((s) => s.dayOfWeek)
}

export async function getAvailableSlots(
  barberId: string,
  dateStr: string,
  durationMinutes: number
): Promise<string[]> {
  const [year, month, day] = dateStr.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  const dayOfWeek = date.getDay()

  const schedule = await prisma.barberSchedule.findFirst({
    where: { barberId, dayOfWeek, isWorkingDay: true },
  })
  if (!schedule) return []

  const appointments = await prisma.appointment.findMany({
    where: {
      barberId,
      date: dateStr,
      status: { in: ["PENDING", "COMPLETED"] },
    },
    select: { startTime: true, endTime: true },
  })

  const today = new Date().toISOString().split("T")[0]
  return generateTimeSlots(
    schedule.startTime,
    schedule.endTime,
    durationMinutes,
    appointments,
    dateStr === today
  )
}

const createAppointmentSchema = z.object({
  barberId: z.string().min(1),
  serviceId: z.string().min(1),
  clientName: z.string().min(2, "Nombre demasiado corto"),
  clientPhone: z.string().min(8, "Teléfono inválido"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>

export async function createAppointment(
  input: CreateAppointmentInput
): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
  const parsed = createAppointmentSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { barberId, date, startTime, endTime } = parsed.data

  // Verificar que el slot sigue disponible
  const conflict = await prisma.appointment.findFirst({
    where: {
      barberId,
      date,
      status: { in: ["PENDING", "COMPLETED"] },
      OR: [
        { startTime: { gte: startTime, lt: endTime } },
        { endTime: { gt: startTime, lte: endTime } },
        { startTime: { lte: startTime }, endTime: { gte: endTime } },
      ],
    },
  })

  if (conflict) {
    return { success: false, error: "El horario ya fue reservado. Por favor elige otro." }
  }

  const appointment = await prisma.appointment.create({ data: parsed.data })
  revalidatePath("/barbero")
  return { success: true, appointmentId: appointment.id }
}

export async function getAppointmentById(id: string) {
  return prisma.appointment.findUnique({
    where: { id },
    include: { barber: true, service: true },
  })
}
