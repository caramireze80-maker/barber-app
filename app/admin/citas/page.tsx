import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminCitasClient } from "@/components/admin/citas-client"

export default async function AdminCitasPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; barberId?: string }>
}) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/login")

  const { date, barberId } = await searchParams
  const today = new Date().toISOString().split("T")[0]
  const filterDate = date ?? today

  const [appointments, barbers] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        ...(filterDate ? { date: filterDate } : {}),
        ...(barberId ? { barberId } : {}),
      },
      include: { barber: true, service: true },
      orderBy: [{ date: "desc" }, { startTime: "asc" }],
    }),
    prisma.barber.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ])

  return (
    <AdminCitasClient
      appointments={appointments}
      barbers={barbers}
      filterDate={filterDate}
      filterBarberId={barberId ?? ""}
    />
  )
}
