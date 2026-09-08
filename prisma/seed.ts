import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed...")

  // Limpiar datos existentes
  await prisma.appointment.deleteMany()
  await prisma.barberSchedule.deleteMany()
  await prisma.user.deleteMany()
  await prisma.barber.deleteMany()
  await prisma.service.deleteMany()

  const hashedPassword = await bcrypt.hash("123456", 10)

  // Barberos
  const barber1 = await prisma.barber.create({
    data: { name: "Carlos García", phone: "555-0101", isActive: true },
  })
  const barber2 = await prisma.barber.create({
    data: { name: "Miguel López", phone: "555-0202", isActive: true },
  })

  // Usuarios
  await prisma.user.create({
    data: {
      email: "admin@barber.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  })
  await prisma.user.create({
    data: {
      email: "barbero1@barber.com",
      password: hashedPassword,
      role: "BARBERO",
      barberId: barber1.id,
    },
  })

  // Servicios
  const service1 = await prisma.service.create({
    data: { name: "Corte de pelo", price: 15, durationMinutes: 30, isActive: true },
  })
  const service2 = await prisma.service.create({
    data: { name: "Barba", price: 10, durationMinutes: 20, isActive: true },
  })
  await prisma.service.create({
    data: { name: "Corte + Barba", price: 22, durationMinutes: 45, isActive: true },
  })

  // Horarios: Lunes(1) a Sábado(6), 10:00-20:00
  for (const barber of [barber1, barber2]) {
    for (let day = 1; day <= 6; day++) {
      await prisma.barberSchedule.create({
        data: {
          barberId: barber.id,
          dayOfWeek: day,
          startTime: "10:00",
          endTime: "20:00",
          isWorkingDay: true,
        },
      })
    }
  }

  // Citas de prueba para hoy
  const today = new Date().toISOString().split("T")[0]

  await prisma.appointment.create({
    data: {
      barberId: barber1.id,
      serviceId: service1.id,
      clientName: "Juan Pérez",
      clientPhone: "555-1111",
      date: today,
      startTime: "10:00",
      endTime: "10:30",
      status: "PENDING",
    },
  })
  await prisma.appointment.create({
    data: {
      barberId: barber1.id,
      serviceId: service2.id,
      clientName: "Pedro García",
      clientPhone: "555-2222",
      date: today,
      startTime: "11:00",
      endTime: "11:20",
      status: "PENDING",
    },
  })

  console.log("✅ Seed completado!")
  console.log("   admin@barber.com / 123456  → Panel Admin")
  console.log("   barbero1@barber.com / 123456 → Panel Barbero")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
