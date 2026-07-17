import { useState } from "react";

const chartWidth = 800;
const chartHeight = 360;
const padding = { top: 28, right: 28, bottom: 54, left: 58 };
const minNoise = 40;
const maxNoise = 90;
const yTicks = [40, 50, 60, 70, 80, 90];

function getRisk(noise, safeThreshold) {
  if (noise > safeThreshold) return "High";
  if (noise >= safeThreshold - 10) return "Medium";
  return "Low";
}

function getPointColor(noise, safeThreshold) {
  const risk = getRisk(noise, safeThreshold);

  if (risk === "High") return "#dc2626";
  if (risk === "Medium") return "#d97706";
  return "#059669";
}

function PredictionChart({ data, safeThreshold }) {
  const [activePoint, setActivePoint] = useState(null);
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const tooltipWidth = 142;
  const tooltipHeight = 70;

  const getX = (index) =>
    padding.left + (index / Math.max(data.length - 1, 1)) * plotWidth;
  const getY = (noise) =>
    padding.top + ((maxNoise - noise) / (maxNoise - minNoise)) * plotHeight;

  const linePoints = data
    .map((item, index) => `${getX(index)},${getY(item.noise)}`)
    .join(" ");
  const thresholdY = getY(safeThreshold);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">Predicted Noise Levels</h3>
          <p className="mt-1 text-sm text-slate-500">
            Hover or focus a point to inspect its prediction.
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-5 bg-teal-600" />
            Prediction
          </span>
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-5 border-t-2 border-dashed border-red-500" />
            Safe threshold
          </span>
        </div>
      </div>

      <div className="relative overflow-x-auto rounded-xl border border-slate-200 bg-slate-50">
        <svg
          className="h-[360px] min-w-[680px] w-full"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label="Predicted noise level chart"
        >
          {yTicks.map((tick) => {
            const y = getY(tick);

            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  x2={chartWidth - padding.right}
                  y1={y}
                  y2={y}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 12}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="12"
                  textAnchor="end"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          <text
            x="17"
            y={chartHeight / 2}
            fill="#475569"
            fontSize="12"
            textAnchor="middle"
            transform={`rotate(-90 17 ${chartHeight / 2})`}
          >
            Noise level (dB)
          </text>

          <line
            x1={padding.left}
            x2={chartWidth - padding.right}
            y1={thresholdY}
            y2={thresholdY}
            stroke="#ef4444"
            strokeDasharray="8 6"
            strokeWidth="2"
          />
          <text
            x={chartWidth - padding.right}
            y={thresholdY - 8}
            fill="#dc2626"
            fontSize="12"
            textAnchor="end"
          >
            {safeThreshold} dB safe threshold
          </text>

          <polyline
            fill="none"
            points={linePoints}
            stroke="#0d9488"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />

          {data.map((item, index) => {
            const x = getX(index);
            const y = getY(item.noise);

            return (
              <g
                key={item.time}
                tabIndex="0"
                role="button"
                aria-label={`${item.time}: ${item.noise} decibels, ${getRisk(
                  item.noise,
                  safeThreshold,
                )} risk`}
                onFocus={() => setActivePoint({ item, index })}
                onBlur={() => setActivePoint(null)}
                onMouseEnter={() => setActivePoint({ item, index })}
                onMouseLeave={() => setActivePoint(null)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r="7"
                  fill={getPointColor(item.noise, safeThreshold)}
                  stroke="#ffffff"
                  strokeWidth="3"
                />
                <text
                  x={x}
                  y={chartHeight - 24}
                  fill="#475569"
                  fontSize="12"
                  textAnchor="middle"
                >
                  {item.time}
                </text>
              </g>
            );
          })}

          {activePoint && (() => {
            const pointX = getX(activePoint.index);
            const pointY = getY(activePoint.item.noise);
            const tooltipX =
              pointX + tooltipWidth + 18 > chartWidth
                ? pointX - tooltipWidth - 16
                : pointX + 16;
            const tooltipY = Math.min(
              Math.max(pointY - tooltipHeight / 2, padding.top),
              chartHeight - padding.bottom - tooltipHeight,
            );

            return (
              <g
                pointerEvents="none"
                transform={`translate(${tooltipX} ${tooltipY})`}
              >
                <rect
                  width={tooltipWidth}
                  height={tooltipHeight}
                  rx="6"
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
                <text x="12" y="21" fill="#0f172a" fontSize="13" fontWeight="600">
                  {activePoint.item.time}
                </text>
                <text x="12" y="42" fill="#475569" fontSize="12">
                  {activePoint.item.noise} dB predicted
                </text>
                <text x="12" y="59" fill="#64748b" fontSize="11" fontWeight="500">
                  {getRisk(activePoint.item.noise, safeThreshold)} risk
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}

export default PredictionChart;
