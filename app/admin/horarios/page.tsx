import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminHorariosClient } from "@/components/admin/horarios-client"

export default async function AdminHorariosPage({
  searchParams,
}: {
  searchParams: Promise<{ barberId?: string }>
}) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/login")

  const { barberId } = await searchParams

  const barbers = await prisma.barber.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })

  const selectedBarberId = barberId ?? barbers[0]?.id

  const schedules = selectedBarberId
    ? await prisma.barberSchedule.findMany({
        where: { barberId: selectedBarberId },
        orderBy: { dayOfWeek: "asc" },
      })
    : []

  return (
    <AdminHorariosClient
      barbers={barbers}
      selectedBarberId={selectedBarberId ?? null}
      schedules={schedules}
    />
  )
}
