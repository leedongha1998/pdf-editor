import { useState } from 'react';
import { StampAnnotation } from '../types/pdf';

interface StampLayerProps {
  isActive: boolean;
  annotations: StampAnnotation[];
  onAnnotationsChange: (annotations: StampAnnotation[]) => void;
  stampName: string;
  stampColor: string;
  stampSize: number;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function StampSVG({ name, color, size }: { name: string; color: string; size: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 3;
  const chars = name.split('');
  const n = chars.length;
  const borderWidth = Math.max(2.5, size * 0.044);

  let fontSize: number;
  let positions: { x: number; y: number }[];

  if (n <= 3) {
    fontSize = n === 1 ? size * 0.44 : n === 2 ? size * 0.33 : size * 0.26;
    const totalH = n * fontSize;
    const startY = cy - totalH / 2 + fontSize * 0.85;
    positions = chars.map((_, i) => ({ x: cx, y: startY + i * fontSize }));
  } else {
    fontSize = size * 0.22;
    const half = Math.ceil(n / 2);
    const col1 = chars.slice(0, half);
    const col2 = chars.slice(half);
    const colGap = fontSize * 1.1;
    positions = [
      ...col1.map((_, i) => ({
        x: cx - colGap / 2,
        y: cy - (col1.length * fontSize) / 2 + fontSize * 0.85 + i * fontSize,
      })),
      ...col2.map((_, i) => ({
        x: cx + colGap / 2,
        y: cy - (col2.length * fontSize) / 2 + fontSize * 0.85 + i * fontSize,
      })),
    ];
  }

  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      <circle
        cx={cx} cy={cy} r={r}
        fill={hexToRgba(color, 0.08)}
        stroke={color}
        strokeWidth={borderWidth}
      />
      <circle
        cx={cx} cy={cy}
        r={r - borderWidth * 1.8}
        fill="none"
        stroke={color}
        strokeWidth={0.8}
        opacity={0.45}
      />
      {chars.map((ch, i) => (
        <text
          key={i}
          x={positions[i].x}
          y={positions[i].y}
          textAnchor="middle"
          fontSize={fontSize}
          fill={color}
          fontFamily="'Nanum Myeongjo', 'Malgun Gothic', 'Apple SD Gothic Neo', serif"
          fontWeight="bold"
        >
          {ch}
        </text>
      ))}
    </svg>
  );
}

export default function StampLayer({
  isActive,
  annotations,
  onAnnotationsChange,
  stampName,
  stampColor,
  stampSize,
}: StampLayerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleLayerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stampName.trim()) return;
    if ((e.target as HTMLElement).closest('[data-stamp]')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onAnnotationsChange([
      ...annotations,
      { id: crypto.randomUUID(), x, y, name: stampName.trim(), color: stampColor, size: stampSize },
    ]);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        cursor: isActive ? (stampName.trim() ? 'crosshair' : 'not-allowed') : 'default',
        pointerEvents: isActive ? 'auto' : 'none',
      }}
      onClick={handleLayerClick}
    >
      {annotations.map((ann) => (
        <div
          key={ann.id}
          data-stamp=""
          style={{
            position: 'absolute',
            left: `${ann.x * 100}%`,
            top: `${ann.y * 100}%`,
            transform: 'translate(-50%, -50%)',
            cursor: isActive ? 'pointer' : 'default',
            opacity: hoveredId === ann.id ? 0.5 : 0.88,
            transition: 'opacity 0.15s',
            pointerEvents: isActive ? 'auto' : 'none',
          }}
          onMouseEnter={() => setHoveredId(ann.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={(e) => {
            e.stopPropagation();
            onAnnotationsChange(annotations.filter((a) => a.id !== ann.id));
          }}
          title={isActive ? '클릭하여 도장 제거' : undefined}
        >
          <StampSVG name={ann.name} color={ann.color} size={ann.size} />
        </div>
      ))}
    </div>
  );
}
