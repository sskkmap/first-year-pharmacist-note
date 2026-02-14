'use client';

import React from 'react';

export default function SimpleCalendar({ startDate, endDate, selectedTimings, startTiming, doseDates = null }) {
    const [showAll, setShowAll] = React.useState(false);

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

    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);

    if (!start || !end) return null;

    // Get the range of months to display
    const allMonths = [];
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endLimit = new Date(end.getFullYear(), end.getMonth(), 1);

    while (current <= endLimit) {
        allMonths.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
    }

    const timingOrder = ['morning', 'noon', 'evening', 'bedtime'];
    const timingLabels = { morning: '朝', noon: '昼', evening: '夕', bedtime: '寝', dose: '服' };

    const renderMonth = (monthDate) => {
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return (
            <div key={`${year}-${month}`} style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ textAlign: 'left', marginBottom: '1.2rem', fontSize: '1rem', fontWeight: 'bold', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '4px', height: '1.2rem', background: 'hsl(var(--primary))', borderRadius: '2px' }}></span>
                    {year}年 {month + 1}月
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                    {['日', '月', '火', '水', '木', '金', '土'].map((w, idx) => (
                        <div key={w} style={{
                            textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold',
                            color: idx === 0 ? '#ff4d4d' : idx === 6 ? '#4d79ff' : 'hsl(var(--foreground))',
                            opacity: 0.9, paddingBottom: '6px'
                        }}>{w}</div>
                    ))}
                    {days.map((date, i) => {
                        if (!date) return <div key={`empty-${i}`} />;

                        const dateKey = formatDateLocal(date);
                        const isInRange = date >= start && date <= end;
                        const isDoseDay = doseDates ? doseDates.includes(dateKey) : isInRange;

                        const isStart = date.getTime() === start.getTime();
                        const isEnd = date.getTime() === end.getTime();
                        const isToday = date.toDateString() === new Date().toDateString();

                        const dosesOnDay = doseDates
                            ? (doseDates.includes(dateKey) ? ['dose'] : [])
                            : selectedTimings.filter(t => {
                                if (date > start && date < end) return true;
                                if (date.getTime() === start.getTime()) {
                                    return timingOrder.indexOf(t) >= timingOrder.indexOf(startTiming);
                                }
                                if (date.getTime() === end.getTime()) {
                                    return true;
                                }
                                return false;
                            });

                        return (
                            <div
                                key={date.toISOString()}
                                style={{
                                    minHeight: '64px',
                                    padding: '6px',
                                    borderRadius: '10px',
                                    background: isDoseDay ? 'hsl(var(--primary) / 0.08)' : 'transparent',
                                    border: isStart || isEnd
                                        ? '2px solid hsl(var(--primary))'
                                        : isToday ? '1.5px solid hsl(var(--primary) / 0.3)' : '1px solid hsl(var(--secondary) / 0.15)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    opacity: date.getMonth() === month ? 1 : 0.3,
                                    boxShadow: isDoseDay ? '0 2px 8px rgba(0,0,0,0.02)' : 'none',
                                    position: 'relative'
                                }}
                            >
                                <span style={{
                                    fontSize: '0.8rem',
                                    fontWeight: isDoseDay || isToday ? 'bold' : 'normal',
                                    color: (i % 7 === 0) ? '#ff4d4d' : (i % 7 === 6) ? '#4d79ff' : 'inherit',
                                    marginBottom: '4px'
                                }}>
                                    {date.getDate()}
                                </span>
                                {isStart && <span style={{ position: 'absolute', top: '-10px', background: 'hsl(var(--primary))', color: 'white', fontSize: '10px', padding: '0px 4px', borderRadius: '4px' }}>開始</span>}
                                {isEnd && <span style={{ position: 'absolute', bottom: '-10px', background: 'hsl(var(--primary))', color: 'white', fontSize: '10px', padding: '0px 4px', borderRadius: '4px', zIndex: 1 }}>終了</span>}

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', justifyContent: 'center', marginTop: 'auto' }}>
                                    {dosesOnDay.map(t => {
                                        const colors = {
                                            morning: '#ff4d4d',
                                            noon: '#ffcc00',
                                            evening: '#4d79ff',
                                            bedtime: '#2ecc71',
                                            dose: 'hsl(var(--primary))'
                                        };
                                        return (
                                            <span
                                                key={t}
                                                style={{
                                                    fontSize: '0.55rem',
                                                    padding: '1px 3px',
                                                    background: colors[t] || 'hsl(var(--primary))',
                                                    color: t === 'noon' ? 'black' : 'white',
                                                    borderRadius: '3px',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {timingLabels[t]}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const intermediateCount = allMonths.length - 2;

    return (
        <div style={{ marginTop: '1rem', background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)' }}>
            <div style={{
                background: 'hsl(var(--primary) / 0.05)',
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                border: '1px solid hsl(var(--primary) / 0.1)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'hsl(var(--primary))' }}>🚩 服薬期間サマリー</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'hsl(var(--primary))', letterSpacing: '0.05em' }}>
                    {startDate.replace(/-/g, '/')} 〜 {endDate.replace(/-/g, '/')}
                </span>
            </div>

            {allMonths.length > 2 && !showAll ? (
                <>
                    {renderMonth(allMonths[0])}
                    <div style={{ textAlign: 'center', margin: '2rem 0', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '1px', background: 'hsl(var(--secondary) / 0.2)', zIndex: 0 }} />
                        <button
                            onClick={() => setShowAll(true)}
                            style={{
                                position: 'relative',
                                zIndex: 1,
                                padding: '0.6rem 2rem',
                                borderRadius: '99px',
                                border: '1px solid hsl(var(--primary) / 0.3)',
                                background: 'white',
                                color: 'hsl(var(--primary))',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'hsl(var(--primary) / 0.05)'}
                            onMouseLeave={(e) => e.target.style.background = 'white'}
                        >
                            中間の {intermediateCount} ヶ月分を表示
                        </button>
                    </div>
                    {renderMonth(allMonths[allMonths.length - 1])}
                </>
            ) : (
                <>
                    {allMonths.map(month => renderMonth(month))}
                    {showAll && allMonths.length > 2 && (
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <button
                                onClick={() => setShowAll(false)}
                                style={{
                                    padding: '0.4rem 1.5rem',
                                    borderRadius: '99px',
                                    border: '1px solid hsl(var(--secondary))',
                                    background: 'transparent',
                                    color: 'hsl(var(--secondary))',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                }}
                            >
                                折りたたむ
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
