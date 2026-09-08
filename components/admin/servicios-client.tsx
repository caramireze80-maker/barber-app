"use client"

import { useActionState, useState, useEffect, useTransition } from "react"
import { createServiceAction, updateServiceAction, toggleServiceActive } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Pencil, PowerOff, Power } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/utils"

type Service = { id: string; name: string; price: number; durationMinutes: number; isActive: boolean }

export function AdminServiciosClient({ services }: { services: Service[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [editService, setEditService] = useState<Service | null>(null)

  const [createState, createAction, createPending] = useActionState(createServiceAction, null)
  const [editState, editAction, editPending] = useActionState(updateServiceAction, null)

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
      await toggleServiceActive(id, !current)
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
          <h1 className="font-bold text-xl">Servicios</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex justify-end mb-4">
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Nuevo servicio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo servicio</DialogTitle>
              </DialogHeader>
              <form action={createAction} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input name="name" placeholder="Corte de pelo" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Precio ($)</Label>
                    <Input name="price" type="number" min="0" step="0.5" placeholder="15" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Duración (min)</Label>
                    <Input name="durationMinutes" type="number" min="5" step="5" placeholder="30" required />
                  </div>
                </div>
                {createState?.error && (
                  <p className="text-sm text-destructive">{createState.error}</p>
                )}
                <Button type="submit" className="w-full" disabled={createPending}>
                  {createPending ? "Guardando…" : "Crear servicio"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {services.map((svc) => (
            <Card key={svc.id} className={!svc.isActive ? "opacity-60" : ""}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold">{svc.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {svc.durationMinutes} min · {formatPrice(svc.price)}
                  </p>
                  {!svc.isActive && (
                    <span className="text-xs text-red-500 font-medium">Inactivo</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Dialog
                    open={openEdit && editService?.id === svc.id}
                    onOpenChange={(o) => {
                      setOpenEdit(o)
                      if (o) setEditService(svc)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar servicio</DialogTitle>
                      </DialogHeader>
                      <form action={editAction} className="space-y-4">
                        <input type="hidden" name="id" value={svc.id} />
                        <div className="space-y-2">
                          <Label>Nombre</Label>
                          <Input name="name" defaultValue={svc.name} required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Precio ($)</Label>
                            <Input name="price" type="number" min="0" step="0.5" defaultValue={svc.price} required />
                          </div>
                          <div className="space-y-2">
                            <Label>Duración (min)</Label>
                            <Input name="durationMinutes" type="number" min="5" step="5" defaultValue={svc.durationMinutes} required />
                          </div>
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
                    onClick={() => handleToggle(svc.id, svc.isActive)}
                    disabled={isPending}
                  >
                    {svc.isActive ? (
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
