import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminServiciosClient } from "@/components/admin/servicios-client"

export default async function AdminServiciosPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/login")

  const services = await prisma.service.findMany({ orderBy: { name: "asc" } })

  return <AdminServiciosClient services={services} />
}
