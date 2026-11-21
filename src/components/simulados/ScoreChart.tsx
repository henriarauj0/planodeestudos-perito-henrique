import { useMemo, useRef, useState } from 'react';
import { DISCURSIVA_MIN, OBJECTIVE_MIN, PROFILE, TOTAL_MAX } from '../../data/editalData';
import { addDays, fmtDate, parseISODate, planWeeks } from '../../lib/dates';
import { simuladoScores } from '../../lib/metrics';
import { cn, fmtNum } from '../../lib/utils';
import type { Simulado } from '../../types';

const W = 720;
const H = 260;
const M = { top: 16, right: 16, bottom: 30, left: 36 };

/** Evolução da nota total (/200) ao longo das 9 semanas. Série única: sem legenda, o título a nomeia. */
export function ScoreChart({ simulados }: { simulados: Simulado[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const weeks = useMemo(() => planWeeks(), []);
  const x0 = weeks[0].monday.getTime();
  const x1 = addDays(parseISODate(PROFILE.examDate), 1).getTime();
  const iw = W - M.left - M.right;
  const ih = H - M.top - M.bottom;
  const sx = (t: number) => M.left + ((t - x0) / (x1 - x0)) * iw;
  const sy = (v: number) => M.top + ih - (v / TOTAL_MAX) * ih;

  const pts = simulados
    .map((s) => ({ s, t: parseISODate(s.date).getTime(), ...simuladoScores(s) }))
    .filter((p) => p.t >= x0 && p.t <= x1)
    .sort((a, b) => a.t - b.t);
  const outOfRange = simulados.length - pts.length;
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.t).toFixed(1)},${sy(p.total).toFixed(1)}`).join(' ');
  const minLine = OBJECTIVE_MIN + DISCURSIVA_MIN;
  const h = hover !== null ? pts[hover] : null;

  return (
    <div ref={wrap} className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Gráfico da nota total dos simulados por data">
        {/* grade horizontal */}
        {[0, 50, 100, 150, 200].map((v) => (
          <g key={v}>
            <line x1={M.left} x2={W - M.right} y1={sy(v)} y2={sy(v)} className="stroke-line" strokeWidth={1} />
            <text x={M.left - 8} y={sy(v)} dy="0.32em" textAnchor="end" className="fill-ink-dim text-[11px] font-mono tabular-nums">
              {v}
            </text>
          </g>
        ))}
        {/* semanas */}
        {weeks.map((w) => (
          <text key={w.index} x={sx(w.monday.getTime() + 3.5 * 86_400_000)} y={H - 8} textAnchor="middle" className="fill-ink-dim text-[11px]">
            S{w.index}
          </text>
        ))}
        {/* linha de referência: mínimo para aprovação (80 objetiva + 20 discursiva) */}
        <line x1={M.left} x2={W - M.right} y1={sy(minLine)} y2={sy(minLine)} className="stroke-ink-faint" strokeWidth={1} strokeDasharray="4 4" />
        <text x={W - M.right} y={sy(minLine) - 6} textAnchor="end" className="fill-ink-dim text-[11px]">
          mínimo eliminatório ({minLine})
        </text>
        {/* dia da prova */}
        <line
          x1={sx(parseISODate(PROFILE.examDate).getTime())}
          x2={sx(parseISODate(PROFILE.examDate).getTime())}
          y1={M.top}
          y2={M.top + ih}
          className="stroke-bad"
          strokeWidth={1}
          strokeDasharray="2 3"
        />
        {/* crosshair */}
        {h && <line x1={sx(h.t)} x2={sx(h.t)} y1={M.top} y2={M.top + ih} className="stroke-ink-faint" strokeWidth={1} />}
        {/* série */}
        {pts.length > 1 && <path d={path} className="fill-none stroke-ink" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
        {pts.map((p, i) => (
          <g key={p.s.id}>
            <circle cx={sx(p.t)} cy={sy(p.total)} r={hover === i ? 6 : 4.5} className="fill-ink stroke-surface" strokeWidth={2} />
            {/* rótulo direto apenas no último ponto */}
            {i === pts.length - 1 && (
              <text x={sx(p.t)} y={sy(p.total) - 12} textAnchor="middle" className="fill-ink text-[12px] font-semibold font-mono tabular-nums">
                {fmtNum(p.total, 1)}
              </text>
            )}
            {/* área de captura maior que a marca */}
            <circle
              cx={sx(p.t)}
              cy={sy(p.total)}
              r={16}
              className="cursor-pointer fill-transparent outline-none"
              tabIndex={0}
              aria-label={`${p.s.name}: ${fmtNum(p.total, 1)} de 200`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
            />
          </g>
        ))}
      </svg>

      {h && (
        <div
          className={cn(
            'pointer-events-none absolute z-10 w-48 -translate-x-1/2 rounded-sm border border-line-strong bg-surface-2 p-2.5 text-xs',
            sy(h.total) / H < 0.55 ? 'translate-y-0' : '-translate-y-full',
          )}
          style={{
            left: `clamp(6rem, ${(sx(h.t) / W) * 100}%, calc(100% - 6rem))`,
            top: `${(sy(h.total) / H) * 100}%`,
            marginTop: sy(h.total) / H < 0.55 ? 14 : -12,
          }}
        >
          <div className="font-medium text-ink">{h.s.name}</div>
          <div className="mb-1.5 text-ink-dim">{fmtDate(h.s.date, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 font-mono tabular-nums">
            <dt className="text-ink-muted">Específicos</dt>
            <dd className="text-right text-ink">{fmtNum(h.especificos)}/120</dd>
            <dt className="text-ink-muted">Básicos</dt>
            <dd className="text-right text-ink">{fmtNum(h.s.basicos)}/24</dd>
            <dt className="text-ink-muted">Jurídicos</dt>
            <dd className="text-right text-ink">{fmtNum(h.s.juridicos)}/16</dd>
            <dt className="text-ink-muted">Discursiva</dt>
            <dd className="text-right text-ink">{fmtNum(h.s.discursiva)}/40</dd>
            <dt className="border-t border-line pt-0.5 font-medium text-ink">Total</dt>
            <dd className="border-t border-line pt-0.5 text-right font-semibold text-ink">{fmtNum(h.total)}/200</dd>
          </dl>
        </div>
      )}

      {pts.length === 0 && (
        <div className="absolute inset-0 grid place-items-center">
          <p className="rounded-md bg-surface px-3 py-2 text-xs text-ink-muted border border-line">Registre o primeiro simulado para ver a evolução.</p>
        </div>
      )}
      {outOfRange > 0 && <p className="mt-1 text-[11px] text-ink-dim">{outOfRange} simulado(s) fora do período do plano não aparecem no gráfico.</p>}
    </div>
  );
}
