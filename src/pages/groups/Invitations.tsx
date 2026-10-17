import { useState, type FormEvent } from 'react'
import {
  useAcceptInvitation,
  useAcceptInvitationByCode,
  useCancelInvitation,
  useInvitations,
} from '@/hooks/useInvitations'
import { normalizeApiError } from '@/lib/errorHandler'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { toast } from '@/lib/toast'

export function Invitations() {
  const { data: invitations, isLoading, isError } = useInvitations()
  const [code, setCode] = useState('')

  const acceptByCode = useAcceptInvitationByCode()
  const acceptById = useAcceptInvitation()
  const cancel = useCancelInvitation()

  const codeError = acceptByCode.error ? normalizeApiError(acceptByCode.error) : null

  function handleAcceptCode(e: FormEvent) {
    e.preventDefault()
    acceptByCode.mutate(code, {
      onSuccess: () => {
        setCode('')
        toast.success('Te uniste al grupo')
      },
    })
  }

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">Invitaciones</h1>

      <Card className="mb-6">
        <h2 className="mb-2 text-sm font-medium text-slate-700">Unirme con un código</h2>
        <form onSubmit={handleAcceptCode} className="flex items-end gap-2">
          <TextField
            label="Código de invitación"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            error={codeError?.fieldErrors.code}
            placeholder="ABC123"
            className="w-40 uppercase"
          />
          <Button type="submit" isLoading={acceptByCode.isPending} disabled={!code}>
            Unirme
          </Button>
        </form>
        {codeError && !codeError.isValidationError && (
          <p className="mt-2 text-sm text-red-600">{codeError.message}</p>
        )}
      </Card>

      <h2 className="mb-2 text-sm font-medium text-slate-700">Invitaciones pendientes</h2>
      {isLoading && <p className="text-sm text-slate-500">Cargando…</p>}
      {isError && <p className="text-sm text-red-600">No se pudieron cargar las invitaciones.</p>}
      {invitations && invitations.length === 0 && (
        <p className="text-sm text-slate-400">No tenés invitaciones pendientes.</p>
      )}

      <div className="flex flex-col divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {invitations?.map((inv) => (
          <div key={inv.invitation_id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium">{inv.group?.name ?? `Grupo #${inv.group_id}`}</p>
              <p className="text-xs text-slate-500">{inv.email} · código {inv.code}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  acceptById.mutate(inv.invitation_id, {
                    onSuccess: () => toast.success('Invitación aceptada'),
                  })
                }
                isLoading={acceptById.isPending}
              >
                Aceptar
              </Button>
              <Button
                variant="danger"
                onClick={() =>
                  cancel.mutate(inv.invitation_id, {
                    onSuccess: () => toast.success('Invitación cancelada'),
                  })
                }
                isLoading={cancel.isPending}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
