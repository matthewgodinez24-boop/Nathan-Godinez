"use client";

/**
 * Pedal — SVG-rendered guitar pedal in four finishes and four knob layouts.
 *
 * Designed as a product family: identical chassis dimensions, hairline rules,
 * stencil typography. The variation is only finish + LED color + knob layout.
 */

export type PedalLayout = "single" | "quad" | "dual-channel" | "vu-meter";
export type PedalFinish = "amber" | "ivory" | "cobalt" | "midnight";

export type PedalConfig = {
  id: string;
  index: string;
  label: string;
  sublabel: string;
  headline: string;
  body: string;
  finish: PedalFinish;
  layout: PedalLayout;
  knobs: { label: string; angle: number }[];
  ledColor: string;
};

type FinishStops = {
  base: string;
  highlight: string;
  shadow: string;
  ink: string; // text + screen-printed details
  bezel: string; // metallic ring tone for knobs/footswitch/jacks
};

const FINISHES: Record<PedalFinish, FinishStops> = {
  amber: {
    base: "#3b2618",
    highlight: "#a86a32",
    shadow: "#1a0e07",
    ink: "#f3d8a7",
    bezel: "#d9b285",
  },
  ivory: {
    base: "#e7e1d4",
    highlight: "#fbf7ee",
    shadow: "#a59c87",
    ink: "#3a2f24",
    bezel: "#b8ad95",
  },
  cobalt: {
    base: "#10243f",
    highlight: "#3270b8",
    shadow: "#04101f",
    ink: "#cce0ff",
    bezel: "#7faedf",
  },
  midnight: {
    base: "#15140f",
    highlight: "#3a352a",
    shadow: "#06050a",
    ink: "#f3deb6",
    bezel: "#9c8c69",
  },
};

export function Pedal({
  config,
  className,
}: {
  config: PedalConfig;
  className?: string;
}) {
  const f = FINISHES[config.finish];
  const id = `pedal-${config.id}`;

  return (
    <svg
      viewBox="0 0 360 540"
      className={className}
      role="img"
      aria-label={`${config.label} pedal`}
      style={{ filter: "drop-shadow(0 30px 40px rgb(0 0 0 / 0.55))" }}
    >
      <defs>
        <linearGradient id={`${id}-enclosure`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={f.highlight} />
          <stop offset="45%" stopColor={f.base} />
          <stop offset="100%" stopColor={f.shadow} />
        </linearGradient>
        <linearGradient id={`${id}-bevel`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
        </linearGradient>
        <radialGradient id={`${id}-knob`} cx="0.4" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
          <stop offset="40%" stopColor={f.bezel} />
          <stop offset="100%" stopColor={f.shadow} />
        </radialGradient>
        <radialGradient id={`${id}-led`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor={config.ledColor} />
          <stop offset="100%" stopColor={config.ledColor} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-foot`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f0f0f0" />
          <stop offset="50%" stopColor="#a8a8a8" />
          <stop offset="100%" stopColor="#444" />
        </linearGradient>
        <pattern
          id={`${id}-grain`}
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
        >
          <rect width="3" height="3" fill="rgba(255,255,255,0.018)" />
          <rect width="1" height="3" fill="rgba(0,0,0,0.05)" />
        </pattern>
      </defs>

      {/* Enclosure */}
      <rect
        x="20"
        y="20"
        width="320"
        height="500"
        rx="14"
        fill={`url(#${id}-enclosure)`}
      />
      <rect
        x="20"
        y="20"
        width="320"
        height="500"
        rx="14"
        fill={`url(#${id}-grain)`}
      />
      <rect
        x="20"
        y="20"
        width="320"
        height="500"
        rx="14"
        fill={`url(#${id}-bevel)`}
        opacity="0.55"
      />

      {/* Top brand strip */}
      <rect
        x="40"
        y="42"
        width="280"
        height="56"
        rx="2"
        fill="rgba(0,0,0,0.18)"
      />
      <text
        x="56"
        y="64"
        fill={f.ink}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="9"
        letterSpacing="3"
      >
        NG · STUDIO SERIES
      </text>
      <text
        x="56"
        y="88"
        fill={f.ink}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="22"
        fontWeight="700"
        letterSpacing="3"
      >
        {config.label}
      </text>
      <text
        x="304"
        y="88"
        fill={f.ink}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="11"
        textAnchor="end"
        opacity="0.7"
      >
        {config.index}
      </text>

      {/* LED */}
      <g transform="translate(180, 130)">
        <circle r="14" fill={`url(#${id}-led)`} opacity="0.85" />
        <circle r="4" fill={config.ledColor} />
        <circle r="4" fill="white" opacity="0.6" />
      </g>

      {/* Layout-specific control surface */}
      {config.layout === "single" && <SingleLayout id={id} f={f} config={config} />}
      {config.layout === "quad" && <QuadLayout id={id} f={f} config={config} />}
      {config.layout === "dual-channel" && (
        <DualLayout id={id} f={f} config={config} />
      )}
      {config.layout === "vu-meter" && <VuLayout id={id} f={f} config={config} />}

      {/* Sublabel */}
      <text
        x="180"
        y="402"
        fill={f.ink}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="9"
        letterSpacing="2.5"
        textAnchor="middle"
        opacity="0.7"
      >
        {config.sublabel}
      </text>

      {/* Footswitch */}
      <g transform="translate(180, 460)">
        <circle r="30" fill="rgba(0,0,0,0.55)" />
        <circle r="22" fill={`url(#${id}-foot)`} />
        <circle r="22" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="1" />
        <circle r="6" fill="rgba(0,0,0,0.5)" />
      </g>

      {/* Side jacks */}
      <Jack x={28} y={150} />
      <Jack x={332} y={150} />
      <Jack x={28} y={210} />
      <Jack x={332} y={210} />

      {/* Hairline frame */}
      <rect
        x="20"
        y="20"
        width="320"
        height="500"
        rx="14"
        fill="none"
        stroke="rgba(255,255,255,0.07)"
      />
    </svg>
  );
}

function Knob({
  cx,
  cy,
  r = 26,
  label,
  angle,
  id,
  ink,
}: {
  cx: number;
  cy: number;
  r?: number;
  label: string;
  angle: number;
  id: string;
  ink: string;
}) {
  return (
    <g transform={`translate(${cx},${cy})`}>
      {/* Tick marks */}
      {Array.from({ length: 9 }).map((_, i) => {
        const a = -120 + (i * 240) / 8;
        const rad = (a * Math.PI) / 180;
        const x1 = (r + 6) * Math.cos(rad);
        const y1 = (r + 6) * Math.sin(rad);
        const x2 = (r + 10) * Math.cos(rad);
        const y2 = (r + 10) * Math.sin(rad);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={ink}
            strokeWidth="1.2"
            opacity="0.55"
          />
        );
      })}
      {/* Body */}
      <circle r={r + 2} fill="rgba(0,0,0,0.55)" />
      <circle r={r} fill={`url(#${id}-knob)`} />
      <circle r={r} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
      {/* Pointer */}
      <g transform={`rotate(${angle})`}>
        <rect x="-1.5" y={-r + 2} width="3" height={r * 0.45} fill={ink} rx="1" />
      </g>
      {/* Center cap */}
      <circle r={r * 0.18} fill="rgba(0,0,0,0.55)" />

      {/* Label below */}
      <text
        y={r + 26}
        fill={ink}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="9"
        letterSpacing="2.5"
        textAnchor="middle"
        opacity="0.85"
      >
        {label}
      </text>
    </g>
  );
}

function Jack({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r="9" fill="rgba(0,0,0,0.55)" />
      <circle r="6" fill="#1c1c1c" />
      <circle r="2.5" fill="#0a0a0a" />
    </g>
  );
}

/* --------- Layouts --------- */

function SingleLayout({
  id,
  f,
  config,
}: {
  id: string;
  f: FinishStops;
  config: PedalConfig;
}) {
  return (
    <>
      <Knob
        cx={180}
        cy={210}
        r={42}
        label={config.knobs[0]?.label ?? "TONE"}
        angle={config.knobs[0]?.angle ?? 0}
        id={id}
        ink={f.ink}
      />
      <Knob
        cx={180}
        cy={335}
        r={26}
        label={config.knobs[1]?.label ?? "GAIN"}
        angle={config.knobs[1]?.angle ?? 0}
        id={id}
        ink={f.ink}
      />
    </>
  );
}

function QuadLayout({
  id,
  f,
  config,
}: {
  id: string;
  f: FinishStops;
  config: PedalConfig;
}) {
  // 2×2 grid of compact knobs
  const positions = [
    { x: 130, y: 200 },
    { x: 230, y: 200 },
    { x: 130, y: 320 },
    { x: 230, y: 320 },
  ];
  return (
    <>
      {positions.map((p, i) => (
        <Knob
          key={i}
          cx={p.x}
          cy={p.y}
          r={22}
          label={config.knobs[i]?.label ?? ""}
          angle={config.knobs[i]?.angle ?? 0}
          id={id}
          ink={f.ink}
        />
      ))}
    </>
  );
}

function DualLayout({
  id,
  f,
  config,
}: {
  id: string;
  f: FinishStops;
  config: PedalConfig;
}) {
  // Two stacked rows, each implying a separate channel
  return (
    <>
      <text
        x="80"
        y="180"
        fill={f.ink}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="9"
        letterSpacing="2.5"
        opacity="0.6"
      >
        CH 1
      </text>
      <Knob
        cx={130}
        cy={220}
        r={26}
        label={config.knobs[0]?.label ?? "VOX"}
        angle={config.knobs[0]?.angle ?? 0}
        id={id}
        ink={f.ink}
      />
      <line
        x1="180"
        y1="225"
        x2="220"
        y2="225"
        stroke={f.ink}
        strokeWidth="1"
        opacity="0.4"
      />
      <circle cx="220" cy="225" r="4" fill="none" stroke={f.ink} opacity="0.5" />

      <text
        x="80"
        y="300"
        fill={f.ink}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="9"
        letterSpacing="2.5"
        opacity="0.6"
      >
        CH 2
      </text>
      <Knob
        cx={230}
        cy={335}
        r={26}
        label={config.knobs[1]?.label ?? "PROD"}
        angle={config.knobs[1]?.angle ?? 0}
        id={id}
        ink={f.ink}
      />
    </>
  );
}

function VuLayout({
  id,
  f,
  config,
}: {
  id: string;
  f: FinishStops;
  config: PedalConfig;
}) {
  return (
    <>
      {/* VU meter window */}
      <g transform="translate(90, 175)">
        <rect
          width="180"
          height="90"
          rx="6"
          fill="rgba(0,0,0,0.55)"
          stroke="rgba(255,255,255,0.08)"
        />
        <rect width="180" height="90" rx="6" fill={config.ledColor} opacity="0.07" />
        {/* Arc */}
        <path
          d="M 30 78 A 60 60 0 0 1 150 78"
          fill="none"
          stroke={f.ink}
          strokeWidth="1.2"
          opacity="0.55"
        />
        {/* Tick marks */}
        {[-60, -30, 0, 30, 60].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 90 + 56 * Math.sin(rad);
          const y1 = 78 - 56 * Math.cos(rad);
          const x2 = 90 + 64 * Math.sin(rad);
          const y2 = 78 - 64 * Math.cos(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={f.ink}
              strokeWidth="1.2"
              opacity="0.7"
            />
          );
        })}
        {/* Needle */}
        <line
          x1="90"
          y1="78"
          x2="90"
          y2="14"
          stroke="#ff5a3c"
          strokeWidth="1.4"
          transform="rotate(22 90 78)"
        />
        <circle cx="90" cy="78" r="3" fill={f.ink} />
        <text
          x="90"
          y="84"
          fill={f.ink}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="8"
          textAnchor="middle"
          opacity="0.7"
        >
          dB
        </text>
      </g>

      <Knob
        cx={130}
        cy={335}
        r={22}
        label={config.knobs[0]?.label ?? "OUT"}
        angle={config.knobs[0]?.angle ?? 0}
        id={id}
        ink={f.ink}
      />
      <Knob
        cx={230}
        cy={335}
        r={22}
        label={config.knobs[1]?.label ?? "GAIN"}
        angle={config.knobs[1]?.angle ?? 0}
        id={id}
        ink={f.ink}
      />
    </>
  );
}
