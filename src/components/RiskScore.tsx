import { ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';
import { RiskLevel } from '../types/scanner';

interface RiskScoreProps {
  score: number;
  riskLevel: RiskLevel;
  analysisEngine: string;
}

export function RiskScore({ score, riskLevel, analysisEngine }: RiskScoreProps) {
  const getRiskMeta = () => {
    switch (riskLevel) {
      case 'Critical':
        return {
          textColor: 'text-red-400',
          borderColor: 'border-red-600/60',
          bgColor: 'bg-red-950/40',
          meterColor: '#ef4444',
          icon: AlertOctagon,
          summary: 'Multiple high-severity risk indicators detected. Extreme caution advised.',
        };
      case 'High':
        return {
          textColor: 'text-orange-400',
          borderColor: 'border-orange-600/60',
          bgColor: 'bg-orange-950/40',
          meterColor: '#f97316',
          icon: ShieldAlert,
          summary: 'Several anomalies or suspicious patterns found. Verify domain authenticity.',
        };
      case 'Medium':
        return {
          textColor: 'text-amber-400',
          borderColor: 'border-amber-600/60',
          bgColor: 'bg-amber-950/40',
          meterColor: '#f59e0b',
          icon: AlertTriangle,
          summary: 'Some irregularities detected (such as missing encryption or tracking params).',
        };
      case 'Low':
      default:
        return {
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-600/60',
          bgColor: 'bg-emerald-950/40',
          meterColor: '#10b981',
          icon: ShieldCheck,
          summary: 'URL structure conforms to standard legitimate security parameters.',
        };
    }
  };

  const meta = getRiskMeta();
  const IconComponent = meta.icon;

  // Arc meter calculation (percentage of 283 stroke-dasharray)
  const strokeDashoffset = 283 - (283 * Math.min(100, Math.max(0, score))) / 100;

  return (
    <div className={`w-full max-w-full p-4 sm:p-6 rounded-xl border ${meta.borderColor} ${meta.bgColor} backdrop-blur-sm transition-all shadow-lg overflow-hidden`}>
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 w-full max-w-full">
        
        {/* Mobile: Risk Score -> Assessment Information Stacked; Desktop: Side by Side */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full lg:w-auto min-w-0">
          
          {/* Gauge */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-zinc-800"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={meta.meterColor}
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${meta.textColor}`}>
                {score}
              </span>
              <span className="text-[10px] uppercase font-mono text-zinc-400">
                / 100
              </span>
            </div>
          </div>

          {/* Assessment Information */}
          <div className="text-center sm:text-left min-w-0 flex-1">
            <div className="text-xs uppercase font-mono tracking-wider text-zinc-400 mb-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span>Security Assessment</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-300 font-mono text-[11px]">{analysisEngine}</span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2">
              <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${meta.textColor} shrink-0`} />
              <h2 className={`text-2xl sm:text-3xl font-normal font-newsreader tracking-tight ${meta.textColor} truncate`}>
                {riskLevel} Risk
              </h2>
            </div>

            <p className="text-body-md text-zinc-300 mt-2 leading-relaxed break-words font-newsreader">
              {meta.summary}
            </p>
          </div>
        </div>

        {/* Risk Index Spectrum: 2x2 on mobile, 4-col on tablet/desktop */}
        <div className="w-full lg:w-72 bg-zinc-900/90 border border-zinc-800 p-3 sm:p-3.5 rounded-lg text-label-md space-y-2 shrink-0 font-newsreader">
          <div className="flex items-center gap-1.5 text-zinc-400 font-normal pb-1 border-b border-zinc-800">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-label-md">Risk Index Spectrum</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-center text-label-md">
            <div className={`p-1.5 rounded transition-colors ${riskLevel === 'Low' ? 'bg-emerald-950/80 text-emerald-300 font-medium border border-emerald-700/50' : 'bg-zinc-950 text-zinc-400'}`}>
              0–30 Low
            </div>
            <div className={`p-1.5 rounded transition-colors ${riskLevel === 'Medium' ? 'bg-amber-950/80 text-amber-300 font-medium border border-amber-700/50' : 'bg-zinc-950 text-zinc-400'}`}>
              31–60 Medium
            </div>
            <div className={`p-1.5 rounded transition-colors ${riskLevel === 'High' ? 'bg-orange-950/80 text-orange-300 font-medium border border-orange-700/50' : 'bg-zinc-950 text-zinc-400'}`}>
              61–80 High
            </div>
            <div className={`p-1.5 rounded transition-colors ${riskLevel === 'Critical' ? 'bg-red-950/80 text-red-300 font-medium border border-red-700/50' : 'bg-zinc-950 text-zinc-400'}`}>
              81–100 Critical
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
