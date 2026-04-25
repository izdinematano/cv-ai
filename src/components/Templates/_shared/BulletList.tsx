'use client';

/**
 * Renders a multi-line bullet description as a clean bullet list.
 * The BulletEditor stores bullets separated by newlines; this component
 * splits them, strips any existing bullet markers, and renders each
 * line as a styled list item so it appears correctly in every template.
 */

interface BulletListProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  bulletColor?: string;
  fontSize?: number | string;
  lineHeight?: number | string;
  gap?: number;
}

function splitBullets(raw: string): string[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(/\r?\n/)
    .map((s) => s.replace(/^\s*[-–•*]\s*/, '').trimEnd())
    .filter(Boolean);
}

export default function BulletList({
  text,
  className,
  style,
  bulletColor = 'currentColor',
  fontSize = 'inherit',
  lineHeight = 1.55,
  gap = 6,
}: BulletListProps) {
  const bullets = splitBullets(text);
  if (bullets.length === 0) return null;

  // Single line without real bullets — render as plain paragraph
  if (bullets.length === 1) {
    return (
      <p className={className} style={{ margin: 0, fontSize, lineHeight, ...style }}>
        {bullets[0]}
      </p>
    );
  }

  return (
    <ul
      className={className}
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: `${gap}px`,
        fontSize,
        lineHeight,
        ...style,
      }}
    >
      {bullets.map((b, i) => (
        <li
          key={i}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: bulletColor,
              marginTop: '0.45em',
              flexShrink: 0,
            }}
          />
          <span style={{ flex: 1 }}>{b}</span>
        </li>
      ))}
    </ul>
  );
}
