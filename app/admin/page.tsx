import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import {
  Users,
  Scissors,
  Calendar,
  CalendarDays,
  LogOut,
  ChevronRight,
} from "lucide-react"

export default async function AdminPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/login")

  const today = new Date().toISOString().split("T")[0]

  const [barberCount, serviceCount, todayCount, pendingCount] = await Promise.all([
    prisma.barber.count({ where: { isActive: true } }),
    prisma.service.count({ where: { isActive: true } }),
    prisma.appointment.count({ where: { date: today } }),
    prisma.appointment.count({ where: { date: today, status: "PENDING" } }),
  ])

  const navItems = [
    { href: "/admin/barberos", icon: Users, label: "Barberos", desc: `${barberCount} activos` },
    { href: "/admin/servicios", icon: Scissors, label: "Servicios", desc: `${serviceCount} activos` },
    { href: "/admin/horarios", icon: Calendar, label: "Horarios", desc: "Por barbero y día" },
    { href: "/admin/citas", icon: CalendarDays, label: "Citas", desc: `${todayCount} hoy (${pendingCount} pendientes)` },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-xl">Panel Admin</h1>
            <p className="text-gray-400 text-sm">{session.user.email}</p>
          </div>
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" type="submit" className="text-gray-400 hover:text-white gap-1">
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </form>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Card>
            <CardContent className="pt-5">
              <p className="text-3xl font-bold">{todayCount}</p>
              <p className="text-sm text-muted-foreground">Citas hoy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pendientes hoy</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          {navItems.map(({ href, icon: Icon, label, desc }) => (
            <Link key={href} href={href}>
              <Card className="hover:border-black transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 py-5">
                  <div className="bg-black rounded-lg p-2.5">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{label}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
