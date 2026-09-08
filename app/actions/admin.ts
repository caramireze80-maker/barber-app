"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { redirect } from "next/navigation"

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }
  return session
}

// ─── BARBEROS ────────────────────────────────────────────────────────────────

const barberSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto"),
  phone: z.string().min(8, "Teléfono inválido"),
})

export type BarberFormState = { error?: string; success?: boolean } | null

export async function createBarberAction(
  _prev: BarberFormState,
  formData: FormData
): Promise<BarberFormState> {
  await requireAdmin()
  const parsed = barberSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  await prisma.barber.create({ data: { ...parsed.data, isActive: true } })
  revalidatePath("/admin/barberos")
  return { success: true }
}

export async function updateBarberAction(
  _prev: BarberFormState,
  formData: FormData
): Promise<BarberFormState> {
  await requireAdmin()
  const id = formData.get("id") as string
  const parsed = barberSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  await prisma.barber.update({ where: { id }, data: parsed.data })
  revalidatePath("/admin/barberos")
  return { success: true }
}

export async function toggleBarberActive(id: string, isActive: boolean) {
  await requireAdmin()
  await prisma.barber.update({ where: { id }, data: { isActive } })
  revalidatePath("/admin/barberos")
}

// ─── SERVICIOS ────────────────────────────────────────────────────────────────

const serviceSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto"),
  price: z.coerce.number().min(0, "Precio inválido"),
  durationMinutes: z.coerce.number().min(5, "Duración mínima 5 min"),
})

export type ServiceFormState = { error?: string; success?: boolean } | null

export async function createServiceAction(
  _prev: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  await requireAdmin()
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    durationMinutes: formData.get("durationMinutes"),
  })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  await prisma.service.create({ data: { ...parsed.data, isActive: true } })
  revalidatePath("/admin/servicios")
  return { success: true }
}

export async function updateServiceAction(
  _prev: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  await requireAdmin()
  const id = formData.get("id") as string
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    durationMinutes: formData.get("durationMinutes"),
  })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  await prisma.service.update({ where: { id }, data: parsed.data })
  revalidatePath("/admin/servicios")
  return { success: true }
}

export async function toggleServiceActive(id: string, isActive: boolean) {
  await requireAdmin()
  await prisma.service.update({ where: { id }, data: { isActive } })
  revalidatePath("/admin/servicios")
}

// ─── HORARIOS ────────────────────────────────────────────────────────────────

const scheduleSchema = z.object({
  barberId: z.string().min(1),
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isWorkingDay: z.coerce.boolean(),
})

export type ScheduleFormState = { error?: string; success?: boolean } | null

export async function upsertScheduleAction(
  _prev: ScheduleFormState,
  formData: FormData
): Promise<ScheduleFormState> {
  await requireAdmin()
  const parsed = scheduleSchema.safeParse({
    barberId: formData.get("barberId"),
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    isWorkingDay: formData.get("isWorkingDay") === "true",
  })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  await prisma.barberSchedule.upsert({
    where: {
      barberId_dayOfWeek: {
        barberId: parsed.data.barberId,
        dayOfWeek: parsed.data.dayOfWeek,
      },
    },
    create: parsed.data,
    update: {
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      isWorkingDay: parsed.data.isWorkingDay,
    },
  })
  revalidatePath("/admin/horarios")
  return { success: true }
}

export async function getBarberSchedules(barberId: string) {
  return prisma.barberSchedule.findMany({
    where: { barberId },
    orderBy: { dayOfWeek: "asc" },
  })
}

// ─── CITAS ────────────────────────────────────────────────────────────────────

export async function getAppointments(filters?: {
  date?: string
  barberId?: string
}) {
  await requireAdmin()
  return prisma.appointment.findMany({
    where: {
      ...(filters?.date ? { date: filters.date } : {}),
      ...(filters?.barberId ? { barberId: filters.barberId } : {}),
    },
    include: { barber: true, service: true },
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
  })
}

export async function cancelAppointmentAdmin(id: string) {
  await requireAdmin()
  await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
  })
  revalidatePath("/admin/citas")
  revalidatePath("/barbero")
}
