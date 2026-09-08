import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminBarberosClient } from "@/components/admin/barberos-client"

export default async function AdminBarberosPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/login")

  const barbers = await prisma.barber.findMany({ orderBy: { name: "asc" } })

  return <AdminBarberosClient barbers={barbers} />
}
