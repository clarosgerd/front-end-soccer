import type { AiPrediction } from '@/api/types'

function probColor(prob: number): string {
  if (prob >= 0.5) return 'text-emerald-600'
  if (prob >= 0.3) return 'text-amber-600'
  return 'text-slate-400'
}

const RESULT_LABELS: Record<string, string> = {
  home_win: 'Local',
  draw: 'Empate',
  away_win: 'Visitante',
}

export function AiPredictionBadge({ prediction }: { prediction: AiPrediction }) {
  const topProb = Math.max(prediction.home_win_prob, prediction.draw_prob, prediction.away_win_prob)
  const confidenceLabel = prediction.confidence >= 0.5 ? 'Alta' : prediction.confidence >= 0.2 ? 'Media' : 'Baja'

  return (
    <div className="rounded-md border border-violet-200 bg-violet-50 p-2 text-xs">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="rounded bg-violet-200 px-1 py-0.5 text-[10px] font-semibold text-violet-700">
          AI
        </span>
        <span className="font-medium text-violet-800">
          {prediction.predicted_home_score}–{prediction.predicted_away_score}
        </span>
        <span className="text-violet-500">·</span>
        <span className="text-violet-600">{RESULT_LABELS[prediction.predicted_result]}</span>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-violet-500">
        <span>
          L:{' '}
          <span className={probColor(prediction.home_win_prob)}>
            {(prediction.home_win_prob * 100).toFixed(0)}%
          </span>
        </span>
        <span>
          E:{' '}
          <span className={probColor(prediction.draw_prob)}>
            {(prediction.draw_prob * 100).toFixed(0)}%
          </span>
        </span>
        <span>
          V:{' '}
          <span className={probColor(prediction.away_win_prob)}>
            {(prediction.away_win_prob * 100).toFixed(0)}%
          </span>
        </span>
        <span className="ml-auto text-violet-400">Conf: {confidenceLabel}</span>
      </div>
    </div>
  )
}
