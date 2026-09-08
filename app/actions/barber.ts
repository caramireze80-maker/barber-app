"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

async function requireBarber() {
  const session = await auth()
  if (!session) throw new Error("No autenticado")
  return session
}

const updateStatusSchema = z.object({
  appointmentId: z.string().min(1),
  status: z.enum(["COMPLETED", "CANCELLED", "NO_SHOW", "PENDING"]),
})

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "COMPLETED" | "CANCELLED" | "NO_SHOW" | "PENDING"
): Promise<{ success: boolean; error?: string }> {
  await requireBarber()
  const parsed = updateStatusSchema.safeParse({ appointmentId, status })
  if (!parsed.success) return { success: false, error: "Datos inválidos" }

  await prisma.appointment.update({
    where: { id: parsed.data.appointmentId },
    data: { status: parsed.data.status },
  })

  revalidatePath("/barbero")
  revalidatePath("/admin/citas")
  return { success: true }
}

export async function getTodayAppointments(barberId: string) {
  const today = new Date().toISOString().split("T")[0]
  return prisma.appointment.findMany({
    where: { barberId, date: today },
    include: { service: true, barber: true },
    orderBy: { startTime: "asc" },
  })
}
