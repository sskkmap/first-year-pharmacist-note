'use client';

import React, { useState, useEffect } from 'react';
import SimpleCalendar from './SimpleCalendar';

const TIMINGS = [
    { id: 'morning', label: '朝', color: '#ff4d4d' },
    { id: 'noon', label: '昼', color: '#ffcc00' },
    { id: 'evening', label: '夕', color: '#4d79ff' },
    { id: 'bedtime', label: '寝る前', color: '#2ecc71' },
];

export default function DaysCalc() {
    const [toolMode, setToolMode] = useState('standard'); // 'standard' or 'special'
    const [dosePerDay, setDosePerDay] = useState(3);
    const [selectedTimings, setSelectedTimings] = useState(['morning', 'noon', 'evening']);
    const [days, setDays] = useState(14);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [startTiming, setStartTiming] = useState('morning');
    const [calcMode, setCalcMode] = useState('days'); // 'days' or 'endDate'
    const [result, setResult] = useState({ totalDoses: 0, totalTablets: 0, remainder: 0, actualDays: 0, doseDates: null });
    const [showWarning, setShowWarning] = useState(true);

    // Special Mode States
    const [weekDays, setWeekDays] = useState([true, true, true, true, true, true, true]); // Mon-Sun
    const [cyclicOn, setCyclicOn] = useState(1);
    const [cyclicOff, setCyclicOff] = useState(0);

    const parseLocalDate = (dateStr) => {
        if (!dateStr) return null;
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    };

    const formatDateLocal = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    useEffect(() => {
        calculate();
    }, [toolMode, dosePerDay, selectedTimings, days, startDate, endDate, startTiming, calcMode, weekDays, cyclicOn, cyclicOff]);

    const calculate = () => {
        const timingOrder = ['morning', 'noon', 'evening', 'bedtime'];
        const startIndex = timingOrder.indexOf(startTiming);

        if (toolMode === 'standard') {
            const frequency = selectedTimings.length;
            if (frequency === 0) {
                setResult({ totalDoses: 0, totalTablets: 0, remainder: 0, actualDays: 0, doseDates: null });
                return;
            }

            const dosePerTime = dosePerDay / frequency;
            const activeIndices = selectedTimings
                .map(t => timingOrder.indexOf(t))
                .sort((a, b) => a - b);

            const skippedDoses = activeIndices.filter(idx => idx < startIndex).length;

            if (calcMode === 'days') {
                const firstDayDoses = activeIndices.filter(idx => idx >= startIndex).length;
                const fullDays = days - 1;
                const totalDoses = firstDayDoses + (fullDays * frequency);
                const totalTablets = totalDoses * dosePerTime;

                const start = parseLocalDate(startDate);
                if (start) {
                    const end = new Date(start);
                    end.setDate(end.getDate() + (days - 1));
                    const endDateStr = formatDateLocal(end);
                    if (endDateStr !== endDate) setEndDate(endDateStr);
                }

                setResult({
                    totalDoses,
                    totalTablets: Math.round(totalTablets * 100) / 100,
                    remainder: Math.round(skippedDoses * dosePerTime * 100) / 100,
                    actualDays: days,
                    doseDates: null
                });
            } else {
                const start = parseLocalDate(startDate);
                const end = parseLocalDate(endDate);
                if (!start || !end || end < start) return;

                const diffTime = Math.abs(end - start);
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

                const firstDayDoses = activeIndices.filter(idx => idx >= startIndex).length;
                const fullDays = diffDays - 1;
                const totalDoses = firstDayDoses + (fullDays * frequency);
                const totalTablets = totalDoses * dosePerTime;

                if (diffDays !== days) setDays(diffDays);

                setResult({
                    totalDoses,
                    totalTablets: Math.round(totalTablets * 100) / 100,
                    remainder: Math.round(skippedDoses * dosePerTime * 100) / 100,
                    actualDays: diffDays,
                    doseDates: null
                });
            }
        } else {
            // Special Mode Logic
            const start = parseLocalDate(startDate);
            if (!start) return;

            let end;
            const doseDates = [];
            const cycleTotal = cyclicOn + cyclicOff;

            if (calcMode === 'count') {
                // Mode: Dose Count (find end date by counting N doses)
                let i = 0;
                let foundDoses = 0;
                while (foundDoses < days && i < 1000) { // Safety guard
                    const date = new Date(start);
                    date.setDate(date.getDate() + i);

                    const jsDay = date.getDay();
                    const mappedDay = jsDay === 0 ? 6 : jsDay - 1;
                    const isDayOfWeekMatch = weekDays[mappedDay];
                    const isCycleMatch = cycleTotal > 0
                        ? (Math.floor(i / 7) % cycleTotal < cyclicOn)
                        : true;

                    if (isDayOfWeekMatch && isCycleMatch) {
                        doseDates.push(formatDateLocal(date));
                        foundDoses++;
                        end = date;
                    }
                    i++;
                }
                if (end) {
                    const endDateStr = formatDateLocal(end);
                    if (endDateStr !== endDate) setEndDate(endDateStr);
                }
            } else if (calcMode === 'days') {
                // Mode: Period from Days (look at fixed calendar window)
                end = new Date(start);
                end.setDate(end.getDate() + (days - 1));
                const totalRangeDays = days;

                for (let i = 0; i < totalRangeDays; i++) {
                    const date = new Date(start);
                    date.setDate(date.getDate() + i);

                    const jsDay = date.getDay();
                    const mappedDay = jsDay === 0 ? 6 : jsDay - 1;
                    const isDayOfWeekMatch = weekDays[mappedDay];
                    const isCycleMatch = cycleTotal > 0
                        ? (Math.floor(i / 7) % cycleTotal < cyclicOn)
                        : true;

                    if (isDayOfWeekMatch && isCycleMatch) {
                        doseDates.push(formatDateLocal(date));
                    }
                }
                const endDateStr = formatDateLocal(end);
                if (endDateStr !== endDate) setEndDate(endDateStr);
            } else {
                // Mode: Fixed Date Range
                end = parseLocalDate(endDate);
                if (!start || !end || end < start) return;
                const totalRangeDays = Math.round(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

                for (let i = 0; i < totalRangeDays; i++) {
                    const date = new Date(start);
                    date.setDate(date.getDate() + i);

                    const jsDay = date.getDay();
                    const mappedDay = jsDay === 0 ? 6 : jsDay - 1;
                    const isDayOfWeekMatch = weekDays[mappedDay];
                    const isCycleMatch = cycleTotal > 0
                        ? (Math.floor(i / 7) % cycleTotal < cyclicOn)
                        : true;

                    if (isDayOfWeekMatch && isCycleMatch) {
                        doseDates.push(formatDateLocal(date));
                    }
                }
                if (doseDates.length !== days) setDays(doseDates.length);
            }

            const totalTablets = doseDates.length * dosePerDay;
            setResult({
                totalDoses: doseDates.length,
                totalTablets: Math.round(totalTablets * 100) / 100,
                remainder: 0,
                actualDays: doseDates.length,
                doseDates
            });
        }
    };

    // Check both total tablets AND per-dose amount for 0.5 divisibility
    const dosePerTimeCheck = toolMode === 'standard' && selectedTimings.length > 0
        ? dosePerDay / selectedTimings.length
        : dosePerDay;
    const isIndivisible = (result.totalTablets % 0.5 !== 0) || (Math.round(dosePerTimeCheck * 1000) % 500 !== 0);

    const toggleTiming = (id) => {
        setSelectedTimings(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const adjustDate = (amount) => {
        const current = parseLocalDate(startDate);
        if (current) {
            current.setDate(current.getDate() + amount);
            setStartDate(formatDateLocal(current));
        }
    };

    const adjustDays = (amount) => {
        setDays(prev => Math.max(1, prev + amount));
    };

    const adjustEndDate = (amount) => {
        const current = parseLocalDate(endDate);
        if (current) {
            current.setDate(current.getDate() + amount);
            setEndDate(formatDateLocal(current));
        }
    };

    const adjustStartTiming = (amount) => {
        const timingOrder = ['morning', 'noon', 'evening', 'bedtime'];
        const currentIndex = timingOrder.indexOf(startTiming);
        let nextIndex = currentIndex + amount;
        if (nextIndex < 0) nextIndex = timingOrder.length - 1;
        if (nextIndex >= timingOrder.length) nextIndex = 0;
        setStartTiming(timingOrder[nextIndex]);
    };

    const StepperButton = ({ label, onClick, style }) => (
        <button
            onClick={onClick}
            style={{
                padding: '0.4rem 0.6rem',
                borderRadius: '10px',
                border: '1px solid hsl(var(--primary) / 0.2)',
                background: 'white',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '38px',
                height: '38px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                color: 'hsl(var(--primary))',
                ...style
            }}
            onMouseEnter={(e) => {
                e.target.style.background = 'hsl(var(--primary))';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px hsl(var(--primary) / 0.2)';
            }}
            onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = 'hsl(var(--primary))';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            }}
        >
            {label}
        </button>
    );

    return (
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ marginTop: 0, color: 'hsl(var(--primary))', fontSize: '1.5rem', borderBottom: '2px solid hsl(var(--primary) / 0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                🚩 処方日数計算ツール
            </h2>

            {/* Mode Selector */}
            <div style={{
                display: 'flex',
                background: 'hsl(var(--secondary) / 0.3)',
                padding: '0.4rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                border: '1px solid hsl(var(--secondary))',
                width: 'fit-content'
            }}>
                <button
                    onClick={() => setToolMode('standard')}
                    style={{
                        padding: '0.6rem 1.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: toolMode === 'standard' ? 'white' : 'transparent',
                        color: toolMode === 'standard' ? 'hsl(var(--primary))' : 'hsl(var(--foreground) / 0.6)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: toolMode === 'standard' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s',
                        fontSize: '0.9rem'
                    }}
                >
                    通常用法 (朝・昼・夕など)
                </button>
                <button
                    onClick={() => setToolMode('special')}
                    style={{
                        padding: '0.6rem 1.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: toolMode === 'special' ? 'white' : 'transparent',
                        color: toolMode === 'special' ? 'hsl(var(--primary))' : 'hsl(var(--foreground) / 0.6)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: toolMode === 'special' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s',
                        fontSize: '0.9rem'
                    }}
                >
                    特殊用法 (週数回・周期・月1など)
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                {/* Left Column: Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{ background: 'hsl(var(--primary) / 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid hsl(var(--primary) / 0.1)' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.8rem', fontSize: '0.9rem', color: 'hsl(var(--primary))' }}>計算モード選択</label>
                        <div style={{ display: 'grid', gridTemplateColumns: toolMode === 'special' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '0.4rem' }}>
                            <button
                                onClick={() => setCalcMode('days')}
                                style={{
                                    padding: '0.5rem 0.2rem', borderRadius: '8px', border: '1px solid hsl(var(--primary))',
                                    background: calcMode === 'days' ? 'hsl(var(--primary))' : 'transparent',
                                    color: calcMode === 'days' ? 'white' : 'hsl(var(--primary))', cursor: 'pointer',
                                    fontSize: 'clamp(0.65rem, 2.5vw, 0.8rem)', textAlign: 'center', lineHeight: '1.3'
                                }}
                            >
                                {toolMode === 'standard' ? '処方日数から計算' : '服用期間から計算'}
                            </button>
                            {toolMode === 'special' && (
                                <button
                                    onClick={() => setCalcMode('count')}
                                    style={{
                                        padding: '0.5rem 0.2rem', borderRadius: '8px', border: '1px solid hsl(var(--primary))',
                                        background: calcMode === 'count' ? 'hsl(var(--primary))' : 'transparent',
                                        color: calcMode === 'count' ? 'white' : 'hsl(var(--primary))', cursor: 'pointer',
                                        fontSize: 'clamp(0.65rem, 2.5vw, 0.8rem)', textAlign: 'center', lineHeight: '1.3'
                                    }}
                                >
                                    処方日数(回数)から計算
                                </button>
                            )}
                            <button
                                onClick={() => setCalcMode('endDate')}
                                style={{
                                    padding: '0.5rem 0.2rem', borderRadius: '8px', border: '1px solid hsl(var(--primary))',
                                    background: calcMode === 'endDate' ? 'hsl(var(--primary))' : 'transparent',
                                    color: calcMode === 'endDate' ? 'white' : 'hsl(var(--primary))', cursor: 'pointer',
                                    fontSize: 'clamp(0.65rem, 2.5vw, 0.8rem)', textAlign: 'center', lineHeight: '1.3'
                                }}
                            >
                                服用終了日から計算
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem', opacity: 0.8 }}>開始日</label>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <StepperButton label="-1" onClick={() => adjustDate(-1)} />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid hsl(var(--secondary))', fontSize: '0.9rem' }}
                            />
                            <StepperButton label="+1" onClick={() => adjustDate(1)} />
                        </div>
                    </div>

                    {toolMode === 'standard' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem', opacity: 0.8 }}>開始タイミング</label>
                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                    <StepperButton label="<" onClick={() => adjustStartTiming(-1)} />
                                    <select
                                        value={startTiming}
                                        onChange={(e) => setStartTiming(e.target.value)}
                                        style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid hsl(var(--secondary))', fontSize: '0.9rem' }}
                                    >
                                        {TIMINGS.map(t => (
                                            <option key={t.id} value={t.id}>{t.label}から</option>
                                        ))}
                                    </select>
                                    <StepperButton label=">" onClick={() => adjustStartTiming(1)} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem', opacity: 0.8 }}>
                            {calcMode === 'days'
                                ? (toolMode === 'standard' ? '処方日数 (日分)' : '処方対象期間 (日分)')
                                : calcMode === 'count'
                                    ? '処方日数 (服用回数)'
                                    : '服用終了予定日'}
                        </label>
                        {calcMode !== 'endDate' ? (
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                <StepperButton label="-1" onClick={() => adjustDays(-1)} />
                                <input
                                    type="number"
                                    value={days}
                                    onChange={(e) => setDays(Number(e.target.value))}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--secondary))', fontSize: '1rem' }}
                                    min="1"
                                />
                                <StepperButton label="+1" onClick={() => adjustDays(1)} />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                <StepperButton label="-1" onClick={() => adjustEndDate(-1)} />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--secondary))', fontSize: '1rem' }}
                                />
                                <StepperButton label="+1" onClick={() => adjustEndDate(1)} />
                            </div>
                        )}
                        {toolMode === 'special' && calcMode === 'days' && <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.4rem' }}>※カレンダー上で「何日間」の期間を表示するかを指定します。</p>}
                        {toolMode === 'special' && calcMode === 'count' && <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.4rem' }}>※実際に「何回分」の薬を出すかに基づいて終了日を計算します。</p>}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem', opacity: 0.8 }}>
                            {toolMode === 'standard' ? '用法・用量 (1日量・タイミング)' : '用法・用量 (1回量・特定日)'}
                        </label>

                        {toolMode === 'standard' ? (
                            <>
                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.8rem' }}>
                                    <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>1日合計</span>
                                    <StepperButton label="-1" onClick={() => setDosePerDay(prev => Math.max(0, prev - 1))} />
                                    <input
                                        type="number"
                                        value={dosePerDay}
                                        onChange={(e) => setDosePerDay(Number(e.target.value))}
                                        style={{ width: '60px', padding: '0.4rem', borderRadius: '6px', border: '1px solid hsl(var(--secondary))', textAlign: 'center' }}
                                        step="0.5" min="0"
                                    />
                                    <StepperButton label="+1" onClick={() => setDosePerDay(prev => prev + 1)} />
                                    <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>錠</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                                    {TIMINGS.map(t => {
                                        const isActive = selectedTimings.includes(t.id);
                                        return (
                                            <div
                                                key={t.id}
                                                style={{
                                                    flex: 1,
                                                    minWidth: '70px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '0.4rem'
                                                }}
                                            >
                                                <span
                                                    onClick={() => toggleTiming(t.id)}
                                                    style={{
                                                        fontSize: '1.4rem',
                                                        lineHeight: 1,
                                                        cursor: 'pointer',
                                                        color: isActive ? t.color : 'hsl(var(--foreground) / 0.3)',
                                                        transition: 'all 0.2s',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {isActive ? '●' : '○'}
                                                </span>
                                                <button
                                                    onClick={() => toggleTiming(t.id)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.6rem 0.4rem',
                                                        borderRadius: '10px',
                                                        border: `2px solid ${isActive ? t.color : 'hsl(var(--foreground) / 0.15)'}`,
                                                        background: isActive ? `${t.color}15` : 'hsl(var(--foreground) / 0.02)',
                                                        color: isActive ? (t.id === 'noon' ? '#856404' : t.color) : 'hsl(var(--foreground) / 0.5)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '900',
                                                        boxShadow: isActive ? `0 4px 12px ${t.color}15` : 'none',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    {t.label}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'hsl(var(--secondary) / 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid hsl(var(--secondary) / 0.2)' }}>
                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', fontWeight: 'bold' }}>1回量</span>
                                    <StepperButton label="-1" onClick={() => setDosePerDay(prev => Math.max(0, prev - 1))} />
                                    <input
                                        type="number"
                                        value={dosePerDay}
                                        onChange={(e) => setDosePerDay(Number(e.target.value))}
                                        style={{ width: '70px', padding: '0.5rem', borderRadius: '8px', border: '1px solid hsl(var(--secondary))', textAlign: 'center', background: 'white' }}
                                        step="0.5" min="0"
                                    />
                                    <StepperButton label="+1" onClick={() => setDosePerDay(prev => prev + 1)} />
                                    <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>錠</span>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>服用曜日</label>
                                    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                                        {['月', '火', '水', '木', '金', '土', '日'].map((day, idx) => (
                                            <button
                                                key={day}
                                                onClick={() => {
                                                    const newDays = [...weekDays];
                                                    newDays[idx] = !newDays[idx];
                                                    setWeekDays(newDays);
                                                }}
                                                style={{
                                                    flex: 1,
                                                    minWidth: '35px',
                                                    padding: '0.4rem 0',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${weekDays[idx] ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'}`,
                                                    background: weekDays[idx] ? 'hsl(var(--primary))' : 'white',
                                                    color: weekDays[idx] ? 'white' : 'hsl(var(--foreground) / 0.6)',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold',
                                                    transition: 'all 0.1s'
                                                }}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'hsl(var(--primary))' }}>服用・休薬サイクル</label>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>休薬期間がない場合は「休薬週」は0のままでOKです</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>服薬週</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <StepperButton label="-1" onClick={() => setCyclicOn(prev => Math.max(1, prev - 1))} style={{ height: '32px', minWidth: '32px' }} />
                                                <input type="number" value={cyclicOn} onChange={(e) => setCyclicOn(Number(e.target.value))} style={{ width: '40px', textAlign: 'center', border: '1px solid hsl(var(--secondary))', borderRadius: '4px' }} />
                                                <StepperButton label="+1" onClick={() => setCyclicOn(prev => prev + 1)} style={{ height: '32px', minWidth: '32px' }} />
                                                <span style={{ fontSize: '0.8rem' }}>週</span>
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>休薬週</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <StepperButton label="-1" onClick={() => setCyclicOff(prev => Math.max(0, prev - 1))} style={{ height: '32px', minWidth: '32px' }} />
                                                <input type="number" value={cyclicOff} onChange={(e) => setCyclicOff(Number(e.target.value))} style={{ width: '40px', textAlign: 'center', border: '1px solid hsl(var(--secondary))', borderRadius: '4px' }} />
                                                <StepperButton label="+1" onClick={() => setCyclicOff(prev => prev + 1)} style={{ height: '32px', minWidth: '32px' }} />
                                                <span style={{ fontSize: '0.8rem' }}>週</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Results */}
                <div style={{
                    background: 'var(--glass-bg)',
                    padding: '2rem',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                    border: '1px solid hsl(var(--primary) / 0.14)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'hsl(var(--primary))' }} />

                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.9rem', opacity: 0.7, fontWeight: 'bold', letterSpacing: '0.05em' }}>合計必要量</span>
                        <div style={{ fontSize: '4rem', fontWeight: '900', color: 'hsl(var(--primary))', margin: '0.5rem 0', lineHeight: 1 }}>
                            {result.totalTablets} <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>錠</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', background: 'hsl(var(--primary) / 0.1)', padding: '0.3rem 0.8rem', borderRadius: '99px', fontWeight: 'bold' }}>
                                {result.totalDoses} 回分
                            </span>
                            <span style={{ fontSize: '0.8rem', background: 'hsl(var(--primary) / 0.1)', padding: '0.3rem 0.8rem', borderRadius: '99px', fontWeight: 'bold' }}>
                                {result.actualDays} 日処方
                            </span>
                        </div>
                    </div>

                    {isIndivisible && showWarning && (
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: 'hsl(0, 100%, 97%)',
                            border: '1px solid hsl(0, 100%, 85%)',
                            borderRadius: '12px',
                            animation: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both'
                        }}>
                            <div style={{ color: 'hsl(0, 84%, 44%)', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                ⚠️ 数量エラー
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'hsl(0, 84%, 30%)', marginTop: '0.4rem', lineHeight: 1.4 }}>
                                {toolMode === 'standard' && selectedTimings.length > 0 && Math.round((dosePerDay / selectedTimings.length) * 1000) % 500 !== 0
                                    ? `1回量(${Math.round((dosePerDay / selectedTimings.length) * 100) / 100}錠)が0.5錠単位で割り切れません。用法・用量を確認してください。`
                                    : '合計錠数が0.5錠単位で割り切れません。用法・用量を確認してください。'}
                            </p>
                            <button
                                onClick={() => setShowWarning(false)}
                                style={{
                                    marginTop: '0.8rem',
                                    width: '100%',
                                    padding: '0.4rem',
                                    background: 'white',
                                    border: '1px solid hsl(0, 100%, 85%)',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                理解しました（非表示）
                            </button>
                        </div>
                    )}

                    <div style={{ margin: '1.5rem 0', borderTop: '1px dashed hsl(var(--secondary))' }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>服用終了予定日</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'hsl(var(--primary))' }}>{endDate || '---'}</span>
                        </div>
                        {result.remainder > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'hsl(10, 80%, 95%)', padding: '0.6rem 1rem', borderRadius: '10px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'hsl(10, 80%, 30%)', fontWeight: 'bold' }}>手持ちの余り (在庫調整分)</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'hsl(10, 80%, 40%)' }}>{result.remainder} 錠</span>
                            </div>
                        )}
                    </div>

                    {result.remainder > 0 && (
                        <p style={{ fontSize: '0.75rem', marginTop: '1rem', opacity: 0.6, lineHeight: 1.4, textAlign: 'center' }}>
                            ※開始日が「{TIMINGS.find(t => t.id === startTiming)?.label}」からのため、<br />
                            その日の服用前の分として {result.remainder} 錠を余らせて計算しています。
                        </p>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid hsl(var(--secondary))' }}>
                <h3 style={{ color: 'hsl(var(--primary))', fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ background: 'hsl(var(--primary))', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.9rem' }}>CHECK</span>
                    <span>服用スケジュール</span>
                </h3>
                <SimpleCalendar
                    startDate={startDate}
                    endDate={endDate}
                    selectedTimings={selectedTimings}
                    startTiming={startTiming}
                    doseDates={result.doseDates}
                />
            </div>
        </div>
    );
}
