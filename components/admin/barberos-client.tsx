"use client"

import { useActionState, useState, useEffect, useTransition } from "react"
import { createBarberAction, updateBarberAction, toggleBarberActive } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Pencil, PowerOff, Power } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Barber = { id: string; name: string; phone: string; isActive: boolean }

export function AdminBarberosClient({ barbers }: { barbers: Barber[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [editBarber, setEditBarber] = useState<Barber | null>(null)

  const [createState, createAction, createPending] = useActionState(createBarberAction, null)
  const [editState, editAction, editPending] = useActionState(updateBarberAction, null)

  useEffect(() => {
    if (createState?.success) {
      setOpenCreate(false)
      router.refresh()
    }
  }, [createState, router])

  useEffect(() => {
    if (editState?.success) {
      setOpenEdit(false)
      router.refresh()
    }
  }, [editState, router])

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await toggleBarberActive(id, !current)
      router.refresh()
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-bold text-xl">Barberos</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex justify-end mb-4">
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Nuevo barbero
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo barbero</DialogTitle>
              </DialogHeader>
              <form action={createAction} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input name="name" placeholder="Carlos García" required />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input name="phone" placeholder="555-0101" required />
                </div>
                {createState?.error && (
                  <p className="text-sm text-destructive">{createState.error}</p>
                )}
                <Button type="submit" className="w-full" disabled={createPending}>
                  {createPending ? "Guardando…" : "Crear barbero"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {barbers.map((barber) => (
            <Card key={barber.id} className={!barber.isActive ? "opacity-60" : ""}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold">{barber.name}</p>
                  <p className="text-sm text-muted-foreground">{barber.phone}</p>
                  {!barber.isActive && (
                    <span className="text-xs text-red-500 font-medium">Inactivo</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Dialog
                    open={openEdit && editBarber?.id === barber.id}
                    onOpenChange={(o) => {
                      setOpenEdit(o)
                      if (o) setEditBarber(barber)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar barbero</DialogTitle>
                      </DialogHeader>
                      <form action={editAction} className="space-y-4">
                        <input type="hidden" name="id" value={barber.id} />
                        <div className="space-y-2">
                          <Label>Nombre</Label>
                          <Input name="name" defaultValue={barber.name} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Teléfono</Label>
                          <Input name="phone" defaultValue={barber.phone} required />
                        </div>
                        {editState?.error && (
                          <p className="text-sm text-destructive">{editState.error}</p>
                        )}
                        <Button type="submit" className="w-full" disabled={editPending}>
                          {editPending ? "Guardando…" : "Guardar cambios"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleToggle(barber.id, barber.isActive)}
                    disabled={isPending}
                    title={barber.isActive ? "Desactivar" : "Activar"}
                  >
                    {barber.isActive ? (
                      <PowerOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Power className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
