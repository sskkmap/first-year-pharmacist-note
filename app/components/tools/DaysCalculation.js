'use client';

import React, { useState, useEffect, useRef } from 'react';

// === 色の定義 (約180日・26週以上対応できるようにローテーション) ===
const WEEK_COLORS = [
    'rgba(59, 130, 246, 0.15)', // 青系
    'rgba(16, 185, 129, 0.15)', // 緑系
    'rgba(245, 158, 11, 0.15)', // 黄系
    'rgba(236, 72, 153, 0.15)', // ピンク系
    'rgba(168, 85, 247, 0.15)', // 紫系
];

export default function DaysCalculation() {
    // === State ===
    const [baseDate, setBaseDate] = useState('');
    const [days, setDays] = useState('42');
    const [includeBase, setIncludeBase] = useState(false); // false: 翌日起算, true: 当日起算
    const [displayMonth, setDisplayMonth] = useState(null); // 表示する最初の月

    // === 参照 ===
    const calendarRef = useRef(null);
    const monthRefs = useRef({});

    // === 初期化 ===
    useEffect(() => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        setBaseDate(`${y}-${m}-${d}`);
        setDisplayMonth(new Date(y, today.getMonth(), 1));
    }, []);

    // === 計算ロジック ===
    const getEndDate = () => {
        if (!baseDate || !days || isNaN(days) || parseInt(days) === 0) return null;

        const date = new Date(baseDate);
        const parsedDays = parseInt(days, 10);

        // 含めない（デフォルト）の場合は days分足す, 含める場合は (days - 1)分足す
        const daysToAdd = includeBase ? parsedDays - 1 : parsedDays;

        date.setDate(date.getDate() + daysToAdd);
        return date;
    };

    const endDate = getEndDate();

    // 日付間の差分（日数）を計算
    const getDayDiff = (start, target) => {
        const diffTime = new Date(target).setHours(0, 0, 0, 0) - new Date(start).setHours(0, 0, 0, 0);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    // 服用期間等の情報を取得
    const getDateInfo = (currentDate) => {
        if (!baseDate || !endDate) return null;
        const start = new Date(baseDate);
        const current = new Date(currentDate);

        // 開始日
        const actualStart = new Date(start);
        if (!includeBase) {
            actualStart.setDate(actualStart.getDate() + 1);
        }

        const diffDays = getDayDiff(actualStart, current);

        if (diffDays >= 0 && current <= endDate) {
            const weekNumber = Math.floor(diffDays / 7) + 1;
            const isLastDay = getDayDiff(current, endDate) === 0;
            return {
                diff: diffDays + 1, // ＋〇日
                week: weekNumber,
                isLastDay: isLastDay,
                bgColor: WEEK_COLORS[(weekNumber - 1) % WEEK_COLORS.length]
            };
        }
        return null;
    };

    // カレンダーの生成に必要な月を決定（常に表示月の月とその翌月の2ヶ月分を表示）
    const getMonthsToDisplay = () => {
        if (!displayMonth) return [];

        const months = [
            new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1),
            new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1)
        ];

        return months;
    };

    const months = getMonthsToDisplay();

    // === ナビゲーション ===
    const handlePrevMonth = () => {
        setDisplayMonth(prev => {
            if (!prev) return prev;
            const d = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
            return d;
        });
    };

    const handleNextMonth = () => {
        setDisplayMonth(prev => {
            if (!prev) return prev;
            const d = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
            return d;
        });
    };

    const jumpToToday = () => {
        const t = new Date();
        setDisplayMonth(new Date(t.getFullYear(), t.getMonth(), 1));
    };

    const jumpToEndDate = () => {
        if (endDate) {
            setDisplayMonth(new Date(endDate.getFullYear(), endDate.getMonth(), 1));
        }
    };

    // ダブルクリックで基準日を変更
    const handleDoubleClick = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        setBaseDate(`${y}-${m}-${d}`);
    };

    // === レンダリング ===
    return (
        <div className="days-calculation-tool glass-panel" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'hsl(var(--primary))' }}>
                🗓️ 手持ち合わせ・処方日数計算
            </h2>

            {/* 条件入力 */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem',
                background: 'hsl(var(--secondary) / 0.1)', padding: '1.5rem', borderRadius: '12px'
            }}>
                <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        基準日 <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'hsl(var(--primary))' }}>(カレンダーをダブルクリックでも変更可)</span>
                    </label>
                    <input
                        type="date"
                        value={baseDate}
                        onChange={(e) => setBaseDate(e.target.value)}
                        style={{
                            width: '100%', padding: '0.8rem', borderRadius: '8px',
                            border: '1px solid hsl(var(--secondary))', fontSize: '1rem',
                            background: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))'
                        }}
                    />
                </div>

                <div style={{ flex: '1 1 120px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        処方日数（何日後？）
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="number"
                            min="1"
                            value={days}
                            onChange={(e) => setDays(e.target.value)}
                            placeholder="例: 14"
                            style={{
                                width: '100%', padding: '0.8rem', borderRadius: '8px',
                                border: '1px solid hsl(var(--primary))', fontSize: '1.2rem', fontWeight: 'bold', flex: 1,
                                background: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))'
                            }}
                        />
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>日分</span>
                    </div>
                </div>
            </div>

            {/* モード切替 */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                <label style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                    padding: '0.8rem 0.5rem', background: !includeBase ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                    border: `1px solid ${!includeBase ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'}`,
                    borderRadius: '8px', flex: 1, justifyContent: 'center', fontWeight: !includeBase ? 'bold' : 'normal'
                }}>
                    <input
                        type="radio"
                        name="includeBase"
                        checked={!includeBase}
                        onChange={() => setIncludeBase(false)}
                        style={{ accentColor: 'hsl(var(--primary))', flexShrink: 0 }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.4' }}>
                        <span style={{ fontSize: '1rem' }}>翌日起算</span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 'normal' }}>（基準日を含めない）</span>
                    </div>
                </label>
                <label style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                    padding: '0.8rem 0.5rem', background: includeBase ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                    border: `1px solid ${includeBase ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'}`,
                    borderRadius: '8px', flex: 1, justifyContent: 'center', fontWeight: includeBase ? 'bold' : 'normal'
                }}>
                    <input
                        type="radio"
                        name="includeBase"
                        checked={includeBase}
                        onChange={() => setIncludeBase(true)}
                        style={{ accentColor: 'hsl(var(--primary))', flexShrink: 0 }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.4' }}>
                        <span style={{ fontSize: '1rem' }}>当日起算</span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 'normal' }}>（基準日を含める）</span>
                    </div>
                </label>
            </div>

            {/* 結果表示 */}
            {endDate && (
                <div style={{
                    textAlign: 'center', padding: '1.5rem', background: 'hsl(var(--primary))',
                    color: 'white', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>終了日</span>
                        <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>（計算結果）</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '0.05em' }}>
                        {endDate.getFullYear()}年 {endDate.getMonth() + 1}月 {endDate.getDate()}日
                    </div>
                </div>
            )}

            {/* カレンダー操作ナビ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
                <button
                    onClick={jumpToToday}
                    style={{
                        padding: '0.6rem 0.5rem', borderRadius: '99px', border: '1px solid hsl(var(--secondary))',
                        background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', width: '100%'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'hsl(var(--secondary) / 0.5)'}
                    onMouseLeave={(e) => e.target.style.background = 'hsl(var(--card))'}
                >
                    📍 今日の月へ
                </button>

                {endDate ? (
                    <button
                        onClick={jumpToEndDate}
                        style={{
                            padding: '0.6rem 0.5rem', borderRadius: '99px', border: 'none',
                            background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', fontWeight: 'bold',
                            fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', width: '100%'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'hsl(var(--primary) / 0.2)'}
                        onMouseLeave={(e) => e.target.style.background = 'hsl(var(--primary) / 0.1)'}
                    >
                        🏁 最終日の月へ
                    </button>
                ) : (
                    <div />
                )}

                <button
                    onClick={handlePrevMonth}
                    style={{ padding: '0.6rem 0.5rem', borderRadius: '99px', border: '1px solid hsl(var(--primary) / 0.3)', background: 'hsl(var(--card))', color: 'hsl(var(--primary))', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
                    onMouseEnter={(e) => e.target.style.background = 'hsl(var(--primary) / 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'hsl(var(--card))'}
                >
                    ◀ 前の月へ
                </button>
                <button
                    onClick={handleNextMonth}
                    style={{ padding: '0.6rem 0.5rem', borderRadius: '99px', border: '1px solid hsl(var(--primary) / 0.3)', background: 'hsl(var(--card))', color: 'hsl(var(--primary))', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
                    onMouseEnter={(e) => e.target.style.background = 'hsl(var(--primary) / 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'hsl(var(--card))'}
                >
                    次の月へ ▶
                </button>
            </div>

            {/* カレンダー */}
            <div
                ref={calendarRef}
                style={{
                    padding: '1rem',
                    background: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--secondary) / 0.2)',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)'
                }}
            >
                <div style={{ fontSize: '0.8rem', color: 'hsl(var(--secondary-foreground))', textAlign: 'center', marginBottom: '1rem' }}>
                    💡 日付をダブルクリックで新しい基準日に設定できます
                </div>

                {months.map((monthDate) => {
                    const year = monthDate.getFullYear();
                    const month = monthDate.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();

                    const calendarCells = [];
                    for (let i = 0; i < firstDay; i++) calendarCells.push(null);
                    for (let i = 1; i <= daysInMonth; i++) calendarCells.push(new Date(year, month, i));

                    const monthKey = `${year}-${month}`;

                    return (
                        <div key={monthKey} ref={el => monthRefs.current[monthKey] = el} style={{ marginBottom: '2.5rem' }}>
                            <h4 style={{
                                fontSize: '1.2rem', fontWeight: 'bold', color: 'hsl(var(--foreground))',
                                borderBottom: '2px solid hsl(var(--primary) / 0.2)', paddingBottom: '0.5rem', marginBottom: '1rem'
                            }}>
                                {year}年 {month + 1}月
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px' }}>
                                {['日', '月', '火', '水', '木', '金', '土'].map((w, idx) => (
                                    <div key={w} style={{
                                        textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold',
                                        color: idx === 0 ? '#ef4444' : idx === 6 ? '#3b82f6' : 'inherit',
                                        padding: '0.5rem 0'
                                    }}>
                                        {w}
                                    </div>
                                ))}

                                {calendarCells.map((date, i) => {
                                    if (!date) return <div key={`empty-${i}`} />;

                                    const isBase = baseDate === `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                    const isToday = new Date().toDateString() === date.toDateString();
                                    const info = getDateInfo(date);

                                    const cellBackground = info ? info.bgColor : (isBase ? 'hsl(var(--secondary) / 0.1)' : 'transparent');
                                    const borderColor = info?.isLastDay ? '#ef4444' : isBase ? 'hsl(var(--secondary))' : (isToday ? 'hsl(var(--primary) / 0.3)' : 'transparent');
                                    const borderWidth = info?.isLastDay ? '2px' : isBase ? '2px' : (isToday ? '1px' : '0px');

                                    return (
                                        <div
                                            key={date.toISOString()}
                                            onDoubleClick={() => handleDoubleClick(date)}
                                            style={{
                                                minHeight: '70px',
                                                background: cellBackground,
                                                border: `${borderWidth} solid ${borderColor}`,
                                                borderRadius: '8px',
                                                padding: '4px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                userSelect: 'none',
                                                transition: 'transform 0.1s',
                                            }}
                                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            {/* 日付番号 */}
                                            <span style={{
                                                fontWeight: info || isBase || isToday ? 'bold' : 'normal',
                                                color: (i % 7 === 0) ? '#ef4444' : (i % 7 === 6) ? '#3b82f6' : 'inherit',
                                                fontSize: '1rem',
                                                marginBottom: 'auto'
                                            }}>
                                                {date.getDate()}
                                            </span>

                                            {/* ラベル類 */}
                                            {isBase && <span style={{ fontSize: 'clamp(0.5rem, 1.8vw, 0.65rem)', background: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))', padding: '1px 4px', borderRadius: '4px', marginBottom: '2px', whiteSpace: 'nowrap', maxWidth: '100%', overflow: 'hidden' }}>基準日</span>}
                                            {info && (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
                                                    {/* 第〇週 */}
                                                    <span style={{ fontSize: 'clamp(0.55rem, 2vw, 0.7rem)', fontWeight: 'bold', color: 'hsl(var(--primary))', whiteSpace: 'nowrap', letterSpacing: '-0.03em' }}>
                                                        {info.week}週目
                                                    </span>
                                                    {/* ＋〇日 */}
                                                    <span style={{ fontSize: 'clamp(0.5rem, 1.8vw, 0.65rem)', opacity: 0.8, whiteSpace: 'nowrap', letterSpacing: '-0.03em' }}>
                                                        {info.diff}日目
                                                    </span>
                                                </div>
                                            )}

                                            {info?.isLastDay && (
                                                <div style={{ position: 'absolute', bottom: '-8px', background: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '99px', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                                    終了
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
