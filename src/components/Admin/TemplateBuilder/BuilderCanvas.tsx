'use client';

/**
 * Interactive A4 canvas used by the admin template builder.
 *
 * Features:
 *  - Absolute-positioned block handles (draggable + 8 resize points).
 *  - Grid snap (configurable via the GRID constant).
 *  - Keyboard: arrows nudge, shift+arrows nudge 10x, Delete removes, Esc clears selection.
 *  - Clicking empty canvas clears the selection.
 *  - Live preview of the actual CV content rendered inside each block via
 *    <CustomTemplate showOverflow />.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { createShowcaseCVData } from '@/lib/templateCatalog';
import {
  A4_HEIGHT,
  A4_WIDTH,
  GRID,
  type CustomTemplateBlock,
  type CustomTemplateSpec,
  blockLabel,
  snapToGrid,
} from '@/lib/customTemplate';
import CustomTemplate from '@/components/Templates/CustomTemplate';

interface Props {
  spec: CustomTemplateSpec;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (blocks: CustomTemplateBlock[]) => void;
  zoom: number;
}

type DragState =
  | { kind: 'move'; id: string; startX: number; startY: number; origX: number; origY: number }
  | {
      kind: 'resize';
      id: string;
      handle: Handle;
      startX: number;
      startY: number;
      origX: number;
      origY: number;
      origW: number;
      origH: number;
    }
  | null;

type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

/** Threshold in unscaled px for snapping to another block's edge. */
const GUIDE_THRESHOLD = 5;

interface Guide {
  kind: 'v' | 'h';
  /** Coordinate (x for vertical guide, y for horizontal guide). */
  at: number;
  /** Start + end along the perpendicular axis so the guide appears only
   *  between the relevant blocks, not edge-to-edge of the canvas. */
  from: number;
  to: number;
}

export default function BuilderCanvas({ spec, selectedId, onSelect, onChange, zoom }: Props) {
  const [drag, setDrag] = useState<DragState>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const showcase = useRef(createShowcaseCVData(spec.id.replace(/^custom-/, 'creative'))).current;
  const pages = Math.max(1, spec.pages || 1);
  const canvasHeight = A4_HEIGHT * pages;

  // ----- keyboard -------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedId) return;
      const step = e.shiftKey ? GRID * 4 : GRID;
      const block = spec.blocks.find((b) => b.id === selectedId);
      if (!block) return;
      const patch = (dx: number, dy: number) => {
        const next = spec.blocks.map((b) =>
          b.id === selectedId
            ? {
                ...b,
                x: Math.max(0, Math.min(A4_WIDTH - b.w, b.x + dx)),
                y: Math.max(0, b.y + dy),
              }
            : b
        );
        onChange(next);
      };
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        patch(-step, 0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        patch(step, 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        patch(0, -step);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        patch(0, step);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onChange(spec.blocks.filter((b) => b.id !== selectedId));
        onSelect(null);
      } else if (e.key === 'Escape') {
        onSelect(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, spec.blocks, onChange, onSelect]);

  // ----- pointer drag ---------------------------------------------------
  const onPointerDown = useCallback(
    (block: CustomTemplateBlock, e: React.PointerEvent) => {
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      onSelect(block.id);
      setDrag({
        kind: 'move',
        id: block.id,
        startX: e.clientX,
        startY: e.clientY,
        origX: block.x,
        origY: block.y,
      });
    },
    [onSelect]
  );

  const onHandleDown = useCallback(
    (block: CustomTemplateBlock, handle: Handle, e: React.PointerEvent) => {
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      onSelect(block.id);
      setDrag({
        kind: 'resize',
        id: block.id,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        origX: block.x,
        origY: block.y,
        origW: block.w,
        origH: block.h,
      });
    },
    [onSelect]
  );

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => {
      const dx = (e.clientX - drag.startX) / zoom;
      const dy = (e.clientY - drag.startY) / zoom;

      // Collect snap targets: x-edges and y-edges from every *other* block,
      // plus the canvas centre and margins (48px padding guide).
      const others = spec.blocks.filter((b) => b.id !== drag.id);
      const xEdges = new Set<number>([0, A4_WIDTH / 2, A4_WIDTH, 48, A4_WIDTH - 48]);
      const yEdges = new Set<number>([0, canvasHeight, 48, canvasHeight - 48]);
      for (const o of others) {
        xEdges.add(o.x);
        xEdges.add(o.x + o.w / 2);
        xEdges.add(o.x + o.w);
        yEdges.add(o.y);
        yEdges.add(o.y + o.h / 2);
        yEdges.add(o.y + o.h);
      }

      const snapTo = (value: number, edges: Set<number>): { v: number; hit: number | null } => {
        let hit: number | null = null;
        let best = GUIDE_THRESHOLD + 1;
        for (const e of edges) {
          const d = Math.abs(e - value);
          if (d < best && d <= GUIDE_THRESHOLD) {
            best = d;
            hit = e;
          }
        }
        return { v: hit ?? value, hit };
      };

      const activeGuides: Guide[] = [];

      const next = spec.blocks.map((b) => {
        if (b.id !== drag.id) return b;
        if (drag.kind === 'move') {
          // Start from the grid-snapped value and then refine with edge snap.
          const gx = snapToGrid(drag.origX + dx);
          const gy = snapToGrid(drag.origY + dy);
          // Try snapping left / centre-x / right to any other edge.
          const leftS = snapTo(gx, xEdges);
          const rightS = snapTo(gx + b.w, xEdges);
          const midXS = snapTo(gx + b.w / 2, xEdges);
          let x = leftS.v;
          if (leftS.hit === null && rightS.hit !== null) x = rightS.v - b.w;
          if (leftS.hit === null && rightS.hit === null && midXS.hit !== null) x = midXS.v - b.w / 2;

          const topS = snapTo(gy, yEdges);
          const botS = snapTo(gy + b.h, yEdges);
          const midYS = snapTo(gy + b.h / 2, yEdges);
          let y = topS.v;
          if (topS.hit === null && botS.hit !== null) y = botS.v - b.h;
          if (topS.hit === null && botS.hit === null && midYS.hit !== null) y = midYS.v - b.h / 2;

          // Emit guide lines for the snaps that landed.
          if (leftS.hit !== null) activeGuides.push({ kind: 'v', at: leftS.hit, from: 0, to: canvasHeight });
          if (rightS.hit !== null) activeGuides.push({ kind: 'v', at: rightS.hit, from: 0, to: canvasHeight });
          if (midXS.hit !== null) activeGuides.push({ kind: 'v', at: midXS.hit, from: 0, to: canvasHeight });
          if (topS.hit !== null) activeGuides.push({ kind: 'h', at: topS.hit, from: 0, to: A4_WIDTH });
          if (botS.hit !== null) activeGuides.push({ kind: 'h', at: botS.hit, from: 0, to: A4_WIDTH });
          if (midYS.hit !== null) activeGuides.push({ kind: 'h', at: midYS.hit, from: 0, to: A4_WIDTH });

          return {
            ...b,
            x: Math.max(0, Math.min(A4_WIDTH - b.w, x)),
            y: Math.max(0, y),
          };
        }
        // resize (no smart guide, grid only)
        let { origX, origY, origW, origH } = drag;
        let x = origX;
        let y = origY;
        let w = origW;
        let h = origH;
        const minW = 40;
        const minH = 24;
        if (drag.handle.includes('e')) w = Math.max(minW, snapToGrid(origW + dx));
        if (drag.handle.includes('s')) h = Math.max(minH, snapToGrid(origH + dy));
        if (drag.handle.includes('w')) {
          const nx = snapToGrid(origX + dx);
          const nw = origW + (origX - nx);
          if (nw >= minW && nx >= 0) {
            x = nx;
            w = nw;
          }
        }
        if (drag.handle.includes('n')) {
          const ny = snapToGrid(origY + dy);
          const nh = origH + (origY - ny);
          if (nh >= minH && ny >= 0) {
            y = ny;
            h = nh;
          }
        }
        return { ...b, x, y, w, h };
      });
      setGuides(activeGuides);
      onChange(next);
    };
    const onUp = () => {
      setDrag(null);
      setGuides([]);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [drag, spec.blocks, onChange, zoom, canvasHeight]);

  return (
    <div
      style={{
        padding: 24,
        overflow: 'auto',
        background: '#f1f5f9',
        flex: 1,
        minHeight: 0,
      }}
    >
      <div
        style={{
          width: A4_WIDTH * zoom,
          height: canvasHeight * zoom,
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <div
          ref={canvasRef}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) onSelect(null);
          }}
          style={{
            width: A4_WIDTH,
            height: canvasHeight,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            position: 'relative',
            background: spec.bgColor,
            boxShadow: '0 10px 40px rgba(15,23,42,0.15)',
            backgroundImage:
              'linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)',
            backgroundSize: `${GRID}px ${GRID}px`,
          }}
        >
          {/* Page break indicators inside the canvas (distinct from export-time
              page breaks which the PDF exporter adds automatically). */}
          {pages > 1 &&
            Array.from({ length: pages - 1 }).map((_, i) => (
              <div
                key={`break-${i}`}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: (i + 1) * A4_HEIGHT,
                  height: 0,
                  borderTop: '2px dashed rgba(79,70,229,0.45)',
                  pointerEvents: 'none',
                  zIndex: 100,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: 4,
                    fontSize: 10,
                    fontWeight: 800,
                    color: '#4f46e5',
                    background: '#eef2ff',
                    padding: '2px 8px',
                    borderRadius: 6,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                  }}
                >
                  Página {i + 2}
                </span>
              </div>
            ))}
          {/* Smart guides overlay */}
          {guides.map((g, i) => (
            <div
              key={i}
              aria-hidden="true"
              style={{
                position: 'absolute',
                background: '#ef4444',
                pointerEvents: 'none',
                zIndex: 400,
                ...(g.kind === 'v'
                  ? { left: g.at, top: g.from, width: 1, height: g.to - g.from }
                  : { left: g.from, top: g.at, width: g.to - g.from, height: 1 }),
              }}
            />
          ))}
          {/* Live template render underneath so admin sees real content */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <CustomTemplate spec={spec} data={showcase} lang="pt" showOverflow />
          </div>

          {/* Interactive overlay: draggable frames per block */}
          {spec.blocks.map((block) => {
            const isSelected = block.id === selectedId;
            return (
              <div
                key={block.id}
                onPointerDown={(e) => onPointerDown(block, e)}
                style={{
                  position: 'absolute',
                  left: block.x,
                  top: block.y,
                  width: block.w,
                  height: block.h,
                  border: isSelected
                    ? '2px solid #4f46e5'
                    : '1px dashed rgba(79,70,229,0.35)',
                  background: isSelected ? 'rgba(79,70,229,0.06)' : 'transparent',
                  cursor: 'move',
                  touchAction: 'none',
                  zIndex: isSelected ? 50 : 10,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -20,
                    left: 0,
                    fontSize: 10,
                    fontWeight: 700,
                    color: isSelected ? '#4f46e5' : '#64748b',
                    background: isSelected ? '#eef2ff' : 'rgba(255,255,255,0.9)',
                    padding: '2px 6px',
                    borderRadius: 6,
                    pointerEvents: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                  }}
                >
                  {blockLabel(block.type)}
                </div>

                {isSelected &&
                  (['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as Handle[]).map((h) => (
                    <div
                      key={h}
                      onPointerDown={(e) => onHandleDown(block, h, e)}
                      style={{
                        position: 'absolute',
                        width: 10,
                        height: 10,
                        background: '#4f46e5',
                        border: '2px solid white',
                        borderRadius: 2,
                        ...handleStyle(h),
                        cursor: `${h}-resize`,
                        touchAction: 'none',
                      }}
                    />
                  ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function handleStyle(h: Handle): React.CSSProperties {
  const s: React.CSSProperties = {};
  if (h.includes('n')) s.top = -5;
  if (h.includes('s')) s.bottom = -5;
  if (h.includes('w')) s.left = -5;
  if (h.includes('e')) s.right = -5;
  if (h === 'n' || h === 's') {
    s.left = '50%';
    s.marginLeft = -5;
  }
  if (h === 'e' || h === 'w') {
    s.top = '50%';
    s.marginTop = -5;
  }
  return s;
}
