'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeatmapPoint } from '@/lib/types';
import { intensityToColor, formatDate, cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface HeatmapGridProps {
    data: HeatmapPoint[];
    loading?: boolean;
    onCellClick?: (point: HeatmapPoint) => void;
}

const WEEKS = 13; // 90 days ≈ 13 weeks
const DAYS_PER_WEEK = 7;
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function HeatmapGrid({ data, loading, onCellClick }: HeatmapGridProps) {
    const [hoveredPoint, setHoveredPoint] = useState<HeatmapPoint | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    if (loading) {
        return <Skeleton className="h-28 rounded-lg" />;
    }

    if (!data.length) {
        return (
            <p className="text-sm text-center py-6" style={{ color: 'var(--muted-foreground)' }}>
                No data yet. Start completing habits!
            </p>
        );
    }

    // Pad data to fill full grid (13 weeks × 7 days = 91 slots)
    const startDate = new Date(data[0].date + 'T00:00:00');
    const startPad = startDate.getDay();
    const paddedData: (HeatmapPoint | null)[] = [
        ...Array(startPad).fill(null),
        ...data,
    ];

    while (paddedData.length < WEEKS * DAYS_PER_WEEK) {
        paddedData.push(null);
    }

    // Group into weeks for easier rendering/labeling
    const weeks = Array.from({ length: WEEKS }, (_, i) =>
        paddedData.slice(i * DAYS_PER_WEEK, (i + 1) * DAYS_PER_WEEK)
    );

    // Calculate month labels
    const monthLabels: { label: string; weekIndex: number }[] = [];
    weeks.forEach((week, i) => {
        const firstValidPoint = week.find(p => p !== null);
        if (firstValidPoint) {
            const date = new Date(firstValidPoint.date + 'T00:00:00');
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            if (monthLabels.length === 0 || monthLabels[monthLabels.length - 1].label !== monthName) {
                // Only add if it's the start of a month or if enough space has passed
                if (monthLabels.length === 0 || i - monthLabels[monthLabels.length - 1].weekIndex >= 3) {
                    monthLabels.push({ label: monthName, weekIndex: i });
                }
            }
        }
    });

    const handleInteraction = (e: React.MouseEvent | React.FocusEvent, point: HeatmapPoint) => {
        setHoveredPoint(point);

        if ('clientX' in e && e.clientX !== 0) {
            setTooltipPos({ x: e.clientX, y: e.clientY });
        } else {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
        }
    };

    return (
        <div aria-label="90-day habit completion heatmap" role="img" className="relative pt-6">
            {/* Month Labels Container */}
            <div className="flex gap-1 mb-2 ml-[16px] relative" aria-hidden="true">
                {monthLabels.map((m, idx) => (
                    <span
                        key={idx}
                        className="absolute text-[9px] font-bold text-muted-foreground/30 uppercase tracking-tighter"
                        style={{ left: `calc(${m.weekIndex} * (10px + 3px))` }}
                    >
                        {m.label}
                    </span>
                ))}
            </div>

            <div className="flex gap-1">
                {/* Day labels column */}
                <div className="flex flex-col gap-1 mr-1" aria-hidden="true">
                    {DAY_LABELS.map((d, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-end"
                            style={{ height: 10, minWidth: 10, fontSize: 9, fontWeight: 600, color: 'var(--muted-foreground)', opacity: 0.3 }}
                        >
                            {i % 2 === 1 ? d : ''}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex gap-[3px] overflow-x-auto pb-2 scrollbar-hide">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-[3px]">
                            {week.map((point, dayIndex) => {
                                const i = weekIndex * DAYS_PER_WEEK + dayIndex;
                                if (!point) {
                                    return (
                                        <motion.div
                                            key={dayIndex}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.03 }}
                                            transition={{ delay: i * 0.005 }}
                                            className="w-2.5 h-2.5 rounded-[1.5px] bg-white"
                                            aria-hidden="true"
                                        />
                                    );
                                }

                                const color = intensityToColor(point.intensity);
                                const isTodayPoint = point.date === new Date().toISOString().split('T')[0];
                                const label = `${formatDate(point.date)}: ${point.completed}/${point.total} habits completed`;
                                const isFull = point.intensity === 1;

                                return (
                                    <motion.button
                                        key={dayIndex}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.005, duration: 0.2 }}
                                        className={cn(
                                            "heatmap-cell w-2.5 h-2.5 rounded-[1.5px] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                                            isTodayPoint && "ring-1 ring-white/40 ring-offset-1 ring-offset-background",
                                            isFull && "shadow-[0_0_6px_rgba(99,102,241,0.3)]"
                                        )}
                                        style={{ backgroundColor: color }}
                                        aria-label={label}
                                        onClick={() => onCellClick?.(point)}
                                        onMouseEnter={(e) => handleInteraction(e, point)}
                                        onMouseLeave={() => setHoveredPoint(null)}
                                        onFocus={(e) => handleInteraction(e, point)}
                                        onBlur={() => setHoveredPoint(null)}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 mt-3 justify-end opacity-40" aria-hidden="true">
                <span className="text-[9px] font-bold uppercase tracking-wider">Less</span>
                {[0, 0.3, 0.6, 1].map((intensity, i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-[1.5px]"
                        style={{ backgroundColor: intensityToColor(intensity) }}
                    />
                ))}
                <span className="text-[9px] font-bold uppercase tracking-wider">More</span>
            </div>

            {/* Tooltip */}
            <AnimatePresence>
                {hoveredPoint && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed z-[100] pointer-events-none rounded-xl px-3 py-2.5 glass border border-white/10 shadow-2xl min-w-[140px]"
                        style={{
                            left: tooltipPos.x + 12,
                            top: tooltipPos.y - 80,
                        }}
                    >
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">{formatDate(hoveredPoint.date)}</p>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-semibold">{hoveredPoint.completed} / {hoveredPoint.total} habits</span>
                            <span className="text-xs font-bold text-primary">
                                {hoveredPoint.total > 0
                                    ? `${Math.round(hoveredPoint.intensity * 100)}%`
                                    : '0%'
                                }
                            </span>
                        </div>
                        <div className="absolute -bottom-1 left-4 w-2 h-2 glass rotate-45 border-r border-b border-white/10 z-[-1]" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
