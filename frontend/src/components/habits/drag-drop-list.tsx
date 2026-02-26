'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Habit } from '@/lib/types';
import HabitCard from './habit-card';
import { motion, AnimatePresence } from 'framer-motion';
import { habitsApi } from '@/lib/api';
import { toast } from 'sonner';

interface SortableHabitProps {
    habit: Habit;
    activeId: string | null;
    onEdit: (habit: Habit) => void;
    onDelete: (id: string) => void;
    onArchive: (id: string) => void;
    onComplete: (habitId: string, newStreak: number) => void;
}

function SortableHabit({ habit, activeId, onEdit, onDelete, onArchive, onComplete }: SortableHabitProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: habit.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : activeId ? 0.9 : 1, // Hide original if dragging, dim if other is dragging
    };

    return (
        <div ref={setNodeRef} style={style}>
            <HabitCard
                habit={habit}
                onEdit={onEdit}
                onDelete={onDelete}
                onArchive={onArchive}
                onComplete={onComplete}
                dragHandleProps={{ ...attributes, ...listeners }}
                isDragging={isDragging}
            />
        </div>
    );
}

interface DragDropListProps {
    habits: Habit[];
    onEdit: (habit: Habit) => void;
    onDelete: (id: string) => void;
    onArchive: (id: string) => void;
    onComplete: (habitId: string, newStreak: number) => void;
    onChange: (habits: Habit[]) => void;
}

export default function DragDropList({ habits, onEdit, onDelete, onArchive, onComplete, onChange }: DragDropListProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [localHabits, setLocalHabits] = useState(habits);

    useEffect(() => {
        setLocalHabits(habits);
    }, [habits]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            setActiveId(null);
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const oldIndex = localHabits.findIndex((h) => h.id === active.id);
            const newIndex = localHabits.findIndex((h) => h.id === over.id);
            const reordered = arrayMove(localHabits, oldIndex, newIndex).map((h, i) => ({ ...h, order: i }));

            setLocalHabits(reordered);
            onChange(reordered);

            try {
                await habitsApi.reorder(reordered.map((h) => ({ id: h.id, order: h.order })));
            } catch {
                toast.error('Failed to save order. Please try again.');
                setLocalHabits(habits); // revert
                onChange(habits);
            }
        },
        [localHabits, habits, onChange]
    );

    const activeHabit = localHabits.find((h) => h.id === activeId);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            accessibility={{
                announcements: {
                    onDragStart: ({ active }) => {
                        const habit = localHabits.find((h) => h.id === active.id);
                        return `Picked up habit ${habit?.title}. It is in position ${localHabits.indexOf(habit!) + 1} of ${localHabits.length}.`;
                    },
                    onDragOver: ({ active, over }) => {
                        if (over) {
                            const activeHabit = localHabits.find((h) => h.id === active.id);
                            const overHabit = localHabits.find((h) => h.id === over.id);
                            return `${activeHabit?.title} is now over ${overHabit?.title}.`;
                        }
                        return '';
                    },
                    onDragEnd: ({ active }) => {
                        const habit = localHabits.find((h) => h.id === active.id);
                        return `${habit?.title} dropped.`;
                    },
                    onDragCancel: ({ active }) => {
                        const habit = localHabits.find((h) => h.id === active.id);
                        return `Drag cancelled. ${habit?.title} moved back to original position.`;
                    },
                },
            }}
        >
            <SortableContext items={localHabits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    role="list"
                    aria-label="Habits list – drag to reorder"
                    className="space-y-4"
                >
                    {localHabits.map((habit) => (
                        <motion.div key={habit.id} variants={itemVariants} role="listitem">
                            <SortableHabit
                                habit={habit}
                                activeId={activeId}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onArchive={onArchive}
                                onComplete={onComplete}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </SortableContext>

            <DragOverlay>
                {activeHabit && (
                    <HabitCard
                        habit={activeHabit}
                        onEdit={() => { }}
                        onDelete={() => { }}
                        onComplete={() => { }}
                        isDragging
                    />
                )}
            </DragOverlay>
        </DndContext>
    );
}
