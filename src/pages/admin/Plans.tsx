import { useState } from 'react'
import {
  useAdminPlans,
  useCreateAdminPlan,
  useUpdateAdminPlan,
  useCreateAdminPlanPromotion,
  useUpdateAdminPlanPromotion,
} from '@/hooks/useAdmin'
import { useToastStore } from '@/store/toastStore'
import { confirmAction } from '@/lib/confirmAction'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import type { AdminPlan, AdminPlanPromotion } from '@/api/endpoints/admin'

const EMPTY_FORM = {
  slug: '',
  name: '',
  monthly_price_bob: '',
  annual_price_bob: '',
  tournament_limit: '0',
  members_per_group: '0',
  predictions_per_day: '0',
}

function limitLabel(value: number) {
  return value === -1 ? 'Ilimitado' : String(value)
}

function PromotionRow({ plan, promotion }: { plan: AdminPlan; promotion: AdminPlanPromotion }) {
  const updatePromotion = useUpdateAdminPlanPromotion()
  const push = useToastStore((s) => s.push)

  async function handleToggle() {
    const willDeactivate = promotion.is_active
    if (willDeactivate && !(await confirmAction(`¿Desactivar la promo "${promotion.name}"?`))) return

    await updatePromotion.mutateAsync({
      planId: plan.id,
      promotionId: promotion.id,
      payload: { is_active: !promotion.is_active },
    })
    push(willDeactivate ? 'Promo desactivada.' : 'Promo activada.', 'success')
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
      <div>
        <p className="font-medium text-slate-800">{promotion.name}</p>
        <p className="text-slate-500">
          {promotion.monthly_price_bob !== null && <>Bs {promotion.monthly_price_bob}/mes · </>}
          {promotion.starts_at ? new Date(promotion.starts_at).toLocaleDateString('es-AR') : 'sin inicio'}
          {' → '}
          {promotion.ends_at ? new Date(promotion.ends_at).toLocaleDateString('es-AR') : 'sin fin'}
        </p>
      </div>
      <Button
        variant={promotion.is_active ? 'danger' : 'secondary'}
        className="text-xs"
        isLoading={updatePromotion.isPending}
        onClick={handleToggle}
      >
        {promotion.is_active ? 'Desactivar' : 'Activar'}
      </Button>
    </div>
  )
}

function NewPromotionForm({ plan, onDone }: { plan: AdminPlan; onDone: () => void }) {
  const createPromotion = useCreateAdminPlanPromotion()
  const push = useToastStore((s) => s.push)
  const [name, setName] = useState('')
  const [monthlyBob, setMonthlyBob] = useState('')
  const [endsAt, setEndsAt] = useState('')

  async function handleSubmit() {
    if (!name) return

    try {
      await createPromotion.mutateAsync({
        planId: plan.id,
        payload: {
          name,
          monthly_price_bob: monthlyBob ? Number(monthlyBob) : undefined,
          ends_at: endsAt || undefined,
        },
      })
      push('Promo creada.', 'success')
      onDone()
    } catch {
      push('No se pudo crear la promo.', 'error')
    }
  }

  return (
    <div className="mt-2 flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-slate-200 p-3">
      <TextField label="Nombre" name="promo-name" value={name} onChange={(e) => setName(e.target.value)} className="w-40" />
      <TextField
        label="Precio Bs/mes"
        name="promo-price"
        type="number"
        value={monthlyBob}
        onChange={(e) => setMonthlyBob(e.target.value)}
        className="w-28"
      />
      <TextField
        label="Vence"
        name="promo-ends"
        type="date"
        value={endsAt}
        onChange={(e) => setEndsAt(e.target.value)}
        className="w-36"
      />
      <Button className="text-xs" isLoading={createPromotion.isPending} disabled={!name} onClick={handleSubmit}>
        Crear promo
      </Button>
    </div>
  )
}

function PlanCard({ plan }: { plan: AdminPlan }) {
  const updatePlan = useUpdateAdminPlan()
  const push = useToastStore((s) => s.push)
  const [editing, setEditing] = useState(false)
  const [addingPromo, setAddingPromo] = useState(false)
  const [form, setForm] = useState({
    name: plan.name,
    monthly_price_bob: plan.monthly_price_bob?.toString() ?? '',
    annual_price_bob: plan.annual_price_bob?.toString() ?? '',
    tournament_limit: String(plan.tournament_limit),
    members_per_group: String(plan.members_per_group),
    predictions_per_day: String(plan.predictions_per_day),
  })

  async function handleSave() {
    try {
      await updatePlan.mutateAsync({
        planId: plan.id,
        payload: {
          name: form.name,
          monthly_price_bob: form.monthly_price_bob ? Number(form.monthly_price_bob) : null,
          annual_price_bob: form.annual_price_bob ? Number(form.annual_price_bob) : null,
          tournament_limit: Number(form.tournament_limit),
          members_per_group: Number(form.members_per_group),
          predictions_per_day: Number(form.predictions_per_day),
        },
      })
      push('Plan actualizado.', 'success')
      setEditing(false)
    } catch {
      push('No se pudo actualizar el plan.', 'error')
    }
  }

  async function handleToggleActive() {
    const willDeactivate = plan.is_active
    if (
      willDeactivate &&
      !(await confirmAction(`¿Retirar el plan "${plan.name}"?`, {
        description: 'Deja de venderse a nuevos usuarios. Los que ya lo tienen no se ven afectados.',
      }))
    ) {
      return
    }

    await updatePlan.mutateAsync({ planId: plan.id, payload: { is_active: !plan.is_active } })
    push(willDeactivate ? 'Plan retirado.' : 'Plan reactivado.', 'success')
  }

  return (
    <Card className={!plan.is_active ? 'opacity-60' : ''}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {plan.name} <span className="font-mono text-xs text-slate-400">({plan.slug})</span>
          </p>
          {!plan.is_active && (
            <span className="mt-1 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              Retirado
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="text-xs" onClick={() => setEditing((v) => !v)}>
            {editing ? 'Cancelar' : 'Editar'}
          </Button>
          {plan.slug !== 'free' && (
            <Button variant={plan.is_active ? 'danger' : 'secondary'} className="text-xs" onClick={handleToggleActive}>
              {plan.is_active ? 'Retirar' : 'Reactivar'}
            </Button>
          )}
        </div>
      </div>

      {!editing && (
        <ul className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-4">
          <li>Bs {plan.monthly_price_bob ?? '—'}/mes</li>
          <li>{limitLabel(plan.tournament_limit)} torneos</li>
          <li>{limitLabel(plan.members_per_group)} miembros/grupo</li>
          <li>{limitLabel(plan.predictions_per_day)} predicciones/día</li>
        </ul>
      )}

      {editing && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <TextField label="Nombre" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField
            label="Precio Bs/mes"
            name="monthly_price_bob"
            type="number"
            value={form.monthly_price_bob}
            onChange={(e) => setForm({ ...form, monthly_price_bob: e.target.value })}
          />
          <TextField
            label="Precio Bs/año"
            name="annual_price_bob"
            type="number"
            value={form.annual_price_bob}
            onChange={(e) => setForm({ ...form, annual_price_bob: e.target.value })}
          />
          <TextField
            label="Torneos (-1 = ilimitado)"
            name="tournament_limit"
            type="number"
            value={form.tournament_limit}
            onChange={(e) => setForm({ ...form, tournament_limit: e.target.value })}
          />
          <TextField
            label="Miembros/grupo (-1 = ilimitado)"
            name="members_per_group"
            type="number"
            value={form.members_per_group}
            onChange={(e) => setForm({ ...form, members_per_group: e.target.value })}
          />
          <TextField
            label="Predicciones/día (-1 = ilimitado)"
            name="predictions_per_day"
            type="number"
            value={form.predictions_per_day}
            onChange={(e) => setForm({ ...form, predictions_per_day: e.target.value })}
          />
          <div className="col-span-full">
            <Button isLoading={updatePlan.isPending} onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </div>
      )}

      {plan.slug !== 'free' && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Promocionales</p>
            <Button variant="secondary" className="text-xs" onClick={() => setAddingPromo((v) => !v)}>
              {addingPromo ? 'Cancelar' : '+ Nueva promo'}
            </Button>
          </div>

          <div className="space-y-2">
            {plan.promotions?.map((promo) => (
              <PromotionRow key={promo.id} plan={plan} promotion={promo} />
            ))}
            {(!plan.promotions || plan.promotions.length === 0) && !addingPromo && (
              <p className="text-xs text-slate-400">Sin promociones.</p>
            )}
          </div>

          {addingPromo && <NewPromotionForm plan={plan} onDone={() => setAddingPromo(false)} />}
        </div>
      )}
    </Card>
  )
}

export function Plans() {
  const { data: plans, isLoading } = useAdminPlans()
  const createPlan = useCreateAdminPlan()
  const push = useToastStore((s) => s.push)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  async function handleCreate() {
    if (!form.slug || !form.name) return

    try {
      await createPlan.mutateAsync({
        slug: form.slug,
        name: form.name,
        monthly_price_bob: form.monthly_price_bob ? Number(form.monthly_price_bob) : null,
        annual_price_bob: form.annual_price_bob ? Number(form.annual_price_bob) : null,
        tournament_limit: Number(form.tournament_limit),
        members_per_group: Number(form.members_per_group),
        predictions_per_day: Number(form.predictions_per_day),
      })
      push('Plan creado.', 'success')
      setForm(EMPTY_FORM)
      setCreating(false)
    } catch {
      push('No se pudo crear el plan — ¿el slug ya existe?', 'error')
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Planes</h1>
          <p className="text-sm text-slate-500">
            Precios, límites y promocionales. Un plan nuevo aparece para los usuarios sin necesidad de deploy.
          </p>
        </div>
        <Button onClick={() => setCreating((v) => !v)}>{creating ? 'Cancelar' : '+ Nuevo plan'}</Button>
      </div>

      {creating && (
        <Card className="mb-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <TextField label="Slug (único)" name="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <TextField label="Nombre" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField
              label="Precio Bs/mes"
              name="monthly_price_bob"
              type="number"
              value={form.monthly_price_bob}
              onChange={(e) => setForm({ ...form, monthly_price_bob: e.target.value })}
            />
            <TextField
              label="Precio Bs/año"
              name="annual_price_bob"
              type="number"
              value={form.annual_price_bob}
              onChange={(e) => setForm({ ...form, annual_price_bob: e.target.value })}
            />
            <TextField
              label="Torneos (-1 = ilimitado)"
              name="tournament_limit"
              type="number"
              value={form.tournament_limit}
              onChange={(e) => setForm({ ...form, tournament_limit: e.target.value })}
            />
            <TextField
              label="Miembros/grupo (-1 = ilimitado)"
              name="members_per_group"
              type="number"
              value={form.members_per_group}
              onChange={(e) => setForm({ ...form, members_per_group: e.target.value })}
            />
            <TextField
              label="Predicciones/día (-1 = ilimitado)"
              name="predictions_per_day"
              type="number"
              value={form.predictions_per_day}
              onChange={(e) => setForm({ ...form, predictions_per_day: e.target.value })}
            />
            <div className="col-span-full">
              <Button isLoading={createPlan.isPending} disabled={!form.slug || !form.name} onClick={handleCreate}>
                Crear plan
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isLoading && <p className="text-sm text-slate-500">Cargando…</p>}

      <div className="space-y-4">
        {plans?.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
      </div>
    </div>
  )
}
