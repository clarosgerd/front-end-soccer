import { useCallback, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { toast } from '@/lib/toast'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/api/client'

interface ParsedStage {
  name: string
  stage_order: number
  is_knockout: boolean
}

interface ParsedTeam {
  name: string
  country: string
  country_code: string
  league: string
  logo_url: string
  flag_url: string
}

interface ParsedMatch {
  stage_name: string
  home_team: string
  away_team: string
  match_date: string
}

interface ParseResult {
  stages: ParsedStage[]
  teams: ParsedTeam[]
  matches: ParsedMatch[]
}

function parseWorkbook(wb: XLSX.WorkBook): ParseResult {
  const result: ParseResult = { stages: [], teams: [], matches: [] }

  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name]
    // header: 1 hace que sheet_to_json devuelva filas como arrays
    // posicionales (unknown[][]), no objetos — el generic tiene que
    // reflejar eso para no necesitar casts riesgosos más abajo.
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 })
    if (rows.length < 2) continue

    const headers = rows[0].map((h) => String(h ?? '').toLowerCase().trim())
    const data = rows.slice(1).filter((r) => r.some((c) => c != null && c !== ''))

    const norm = data.map((row) => {
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => {
        obj[h] = String(row[i] ?? '').trim()
      })
      return obj
    })

    const sheetLower = name.toLowerCase()

    if (sheetLower.includes('fase') || sheetLower.includes('stage')) {
      result.stages = norm.map((r, i) => ({
        name: r.nombre || r.name || r.fase || '',
        stage_order: parseInt(r.orden || r.order || r.stage_order || String(i + 1), 10) || i + 1,
        is_knockout: (r.eliminatoria || r.knockout || '').toLowerCase() === 'si' || (r.eliminatoria || r.knockout || '') === '1',
      }))
    } else if (sheetLower.includes('equip') || sheetLower.includes('team')) {
      result.teams = norm.map((r) => ({
        name: r.nombre || r.name || r.equipo || '',
        country: r.pais || r.country || '',
        country_code: r.codigo || r.country_code || r.pais_codigo || '',
        league: r.liga || r.league || '',
        logo_url: r.logo || r.logo_url || r.escudo || '',
        flag_url: r.bandera || r.flag || r.flag_url || '',
      }))
    } else if (sheetLower.includes('partido') || sheetLower.includes('match') || sheetLower.includes('fixture')) {
      result.matches = norm.map((r) => ({
        stage_name: r.fase || r.stage || r.stage_name || '',
        home_team: r.local || r.home || r.equipo_local || r.home_team || '',
        away_team: r.visitante || r.away || r.equipo_visitante || r.away_team || '',
        match_date: r.fecha || r.date || r.match_date || '',
      }))
    }
  }

  return result
}

export function ExcelImport() {
  const { tournamentId } = useParams<{ tournamentId: string }>()
  const id = Number(tournamentId)
  const fileRef = useRef<HTMLInputElement>(null)
  const [parsed, setParsed] = useState<ParseResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const result = parseWorkbook(wb)
        setParsed(result)
        toast.success(
          `Detectado: ${result.stages.length} fases, ${result.teams.length} equipos, ${result.matches.length} partidos`,
        )
      } catch {
        toast.error('Error al leer el archivo Excel')
      }
    }
    reader.readAsArrayBuffer(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleImport = async () => {
    if (!parsed) return
    setImporting(true)

    try {
      if (parsed.stages.length > 0) {
        const stagePayload = parsed.stages.map((s) => ({
          tournament_id: id,
          name: s.name,
          stage_order: String(s.stage_order),
          is_knockout: s.is_knockout ? '1' : '0',
        }))
        await apiClient.post('/stage/bulk', stagePayload)
        toast.success(`${parsed.stages.length} fases importadas`)
      }

      if (parsed.teams.length > 0) {
        const teamPayload = parsed.teams.map((t) => ({
          name: t.name,
          country: t.country || 'N/A',
          country_code: t.country_code || 'XX',
          league: t.league || 'N/A',
          logo_url: t.logo_url || 'https://via.placeholder.com/100',
          flag_url: t.flag_url || 'https://via.placeholder.com/50x30',
          active: '1',
        }))
        await apiClient.post('/team/bulk', teamPayload)
        toast.success(`${parsed.teams.length} equipos importados`)
      }

      if (parsed.matches.length > 0) {
        const stageResponse = await apiClient.get('/stage', { params: { 'tournament_id[eq]': id } })
        const stages = stageResponse.data.data ?? []
        const stageMap = new Map<string, number>()
        for (const s of stages) {
          stageMap.set(s.name.toLowerCase(), s.stage_id)
        }

        const teamsResponse = await apiClient.get('/team', { params: { per_page: 500 } })
        const teams = teamsResponse.data.data ?? []
        const teamMap = new Map<string, number>()
        for (const t of teams) {
          teamMap.set(t.name.toLowerCase(), t.team_id)
        }

        const matchPayload = parsed.matches
          .map((m) => {
            const stageId = stageMap.get(m.stage_name.toLowerCase())
            const homeId = teamMap.get(m.home_team.toLowerCase())
            const awayId = teamMap.get(m.away_team.toLowerCase())
            if (!stageId || !homeId || !awayId) return null
            return {
              tournament_id: id,
              stage_id: stageId,
              home_team_id: homeId,
              away_team_id: awayId,
              match_date: m.match_date || new Date().toISOString().slice(0, 19),
              status: 'scheduled',
              home_score: 0,
              away_score: 0,
            }
          })
          .filter(Boolean)

        if (matchPayload.length > 0) {
          await apiClient.post('/match/bulk', matchPayload)
          toast.success(`${matchPayload.length} partidos importados`)
        }

        const skipped = parsed.matches.length - matchPayload.length
        if (skipped > 0) {
          toast.error(`${skipped} partidos omitidos (equipo o fase no encontrado)`)
        }
      }

      setParsed(null)
    } catch {
      toast.error('Error durante la importación')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
        }`}
      >
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg">
          📄
        </div>
        <p className="text-sm font-medium text-slate-700">
          Arrastrá un archivo Excel o hacé clic para seleccionar
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Formatos: .xlsx, .xls, .csv
        </p>
      </div>

      {parsed && (
        <Card className="mt-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Vista previa</h3>

          {parsed.stages.length > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-xs font-medium text-slate-500">Fases ({parsed.stages.length})</p>
              <div className="max-h-32 overflow-y-auto rounded border border-slate-100">
                {parsed.stages.map((s, i) => (
                  <div key={i} className="border-b border-slate-50 px-2 py-1 text-xs text-slate-600">
                    {s.name} — Orden {s.stage_order} — {s.is_knockout ? 'Eliminatoria' : 'Grupos'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {parsed.teams.length > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-xs font-medium text-slate-500">Equipos ({parsed.teams.length})</p>
              <div className="max-h-32 overflow-y-auto rounded border border-slate-100">
                {parsed.teams.map((t, i) => (
                  <div key={i} className="border-b border-slate-50 px-2 py-1 text-xs text-slate-600">
                    {t.name} — {t.country}
                  </div>
                ))}
              </div>
            </div>
          )}

          {parsed.matches.length > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-xs font-medium text-slate-500">Partidos ({parsed.matches.length})</p>
              <div className="max-h-32 overflow-y-auto rounded border border-slate-100">
                {parsed.matches.slice(0, 10).map((m, i) => (
                  <div key={i} className="border-b border-slate-50 px-2 py-1 text-xs text-slate-600">
                    {m.home_team} vs {m.away_team} — {m.stage_name} — {m.match_date}
                  </div>
                ))}
                {parsed.matches.length > 10 && (
                  <div className="px-2 py-1 text-xs text-slate-400">
                    ... y {parsed.matches.length - 10} más
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleImport} disabled={importing}>
              {importing ? 'Importando...' : 'Importar todo'}
            </Button>
            <button
              type="button"
              onClick={() => setParsed(null)}
              className="rounded border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </Card>
      )}

      <Card className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">Formato del Excel</h3>
        <p className="mb-3 text-xs text-slate-500">
          Creá un archivo Excel con hasta 3 hojas. Los nombres de las hojas deben contener:
        </p>
        <div className="grid gap-3 text-xs sm:grid-cols-3">
          <div className="rounded border border-slate-100 p-3">
            <p className="mb-1 font-semibold text-slate-700">Hoja "Fases"</p>
            <p className="text-slate-400">nombre, orden, eliminatoria</p>
          </div>
          <div className="rounded border border-slate-100 p-3">
            <p className="mb-1 font-semibold text-slate-700">Hoja "Equipos"</p>
            <p className="text-slate-400">nombre, pais, codigo, liga, logo, bandera</p>
          </div>
          <div className="rounded border border-slate-100 p-3">
            <p className="mb-1 font-semibold text-slate-700">Hoja "Partidos"</p>
            <p className="text-slate-400">fase, local, visitante, fecha</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
