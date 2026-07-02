'use client';

import React, { useState } from 'react';

// カリウム製剤のデータ定義
// factorは常用量比（アスパラK : グルコン酸K : 塩化K錠 : 塩化K散 = 16 : 40 : 36 : 134）に基づいています
const potassiumDrugs = [
    { id: 'aspartate_tab', name: 'アスパラカリウム錠300mg', equivalent: 1.8, unit: '錠', factor: 16 },
    { id: 'aspartate_pwd', name: 'アスパラカリウム散50％', equivalent: 2.9, unit: 'g', factor: 16 },
    { id: 'gluconate_tab_2_5', name: 'グルコンサンK錠2.5mEq', equivalent: 2.5, unit: '錠', factor: 40 },
    { id: 'gluconate_tab_5', name: 'グルコンサンK錠5mEq', equivalent: 5.0, unit: '錠', factor: 40 },
    { id: 'gluconate_pwd', name: 'グルコンサンK細粒4mEq/g', equivalent: 4.0, unit: 'g', factor: 40 },
    { id: 'kcl_tab', name: '塩化カリウム徐放錠600mg「St」', equivalent: 8.0, unit: '錠', factor: 36 },
    { id: 'kcl_pwd', name: '塩化カリウム', equivalent: 13.4, unit: 'g', factor: 134 },
];

export default function PotassiumCalc() {
    const [calcMode, setCalcMode] = useState('standard'); // 'standard' (常用量換算) or 'meq' (mEq等量換算)
    const [inputValue, setInputValue] = useState('');     // 入力された値の文字列
    const [inputDrugId, setInputDrugId] = useState('');   // 入力された箇所のID ('meq_input' または 各製剤のid)

    // 入力変更時のハンドラー
    const handleInputChange = (id, value) => {
        if (value === '') {
            setInputValue('');
            setInputDrugId('');
            return;
        }
        setInputValue(value);
        setInputDrugId(id);
    };

    // クリアボタンハンドラー
    const handleClear = () => {
        setInputValue('');
        setInputDrugId('');
    };

    // 選択された入力薬の実際のカリウム量 (mEq) を計算
    const calculateMeq = (inputId, val) => {
        if (val === '' || isNaN(parseFloat(val))) return 0;
        const numVal = parseFloat(val);
        if (inputId === 'meq_input') return numVal;
        const drug = potassiumDrugs.find(d => d.id === inputId);
        return drug ? numVal * drug.equivalent : 0;
    };

    // 他の製剤の換算量を計算する関数
    const calculateQuantity = (targetDrug, inputId, val, mode) => {
        if (val === '' || isNaN(parseFloat(val))) return '';
        const numVal = parseFloat(val);

        if (inputId === targetDrug.id) {
            return val; // アクティブに入力中の箇所はそのままの文字列を表示
        }

        if (mode === 'meq') {
            // --- mEq等量換算 (1-to-1 mEq) ---
            let sourceMeq = 0;
            if (inputId === 'meq_input') {
                sourceMeq = numVal;
            } else {
                const sourceDrug = potassiumDrugs.find(d => d.id === inputId);
                sourceMeq = numVal * sourceDrug.equivalent;
            }
            const rawVal = sourceMeq / targetDrug.equivalent;
            // 精度よく小数点第2位まで表示
            return (Math.round(rawVal * 100) / 100).toString();
        } else {
            // --- 常用量換算 (比率 16:40:36:134 ベース) ---
            let sourceMeq = 0;
            let sourceFactor = 16; // mEq入力から計算する場合はアスパラKをデフォルト基準とする

            if (inputId === 'meq_input') {
                sourceMeq = numVal;
                sourceFactor = 16;
            } else {
                const sourceDrug = potassiumDrugs.find(d => d.id === inputId);
                sourceMeq = numVal * sourceDrug.equivalent;
                sourceFactor = sourceDrug.factor;
            }

            const targetFactor = targetDrug.factor;
            // 常用量比率で補正した目標 mEq
            const targetMeq = sourceMeq * (targetFactor / sourceFactor);
            const rawVal = targetMeq / targetDrug.equivalent;
            // 常用量換算は臨床上の使いやすさを考慮して小数点第1位に丸める（例の0.6g, 1.8錠等に合わせる）
            return (Math.round(rawVal * 10) / 10).toString();
        }
    };

    const currentMeq = inputDrugId === 'meq_input' 
        ? inputValue 
        : (inputValue !== '' ? (Math.round(calculateMeq(inputDrugId, inputValue) * 100) / 100).toString() : '');

    return (
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ marginTop: 0, color: 'hsl(var(--primary))', fontSize: '1.5rem', borderBottom: '2px solid hsl(var(--primary) / 0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🍌 カリウム製剤換算ツール</span>
                <button
                    onClick={handleClear}
                    className="btn"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: 'transparent', border: '1px solid hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}
                >
                    クリア
                </button>
            </h2>

            {/* モード切り替えスイッチ */}
            <div style={{ 
                display: 'flex', 
                background: 'hsl(var(--secondary) / 0.1)', 
                padding: '4px', 
                borderRadius: '8px', 
                marginBottom: '1rem',
                border: '1px solid hsl(var(--border))'
            }}>
                <button
                    onClick={() => setCalcMode('standard')}
                    style={{
                        flex: 1,
                        padding: '0.6rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: calcMode === 'standard' ? 'white' : 'transparent',
                        color: calcMode === 'standard' ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                        fontWeight: 'bold',
                        boxShadow: calcMode === 'standard' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    常用量換算 (16 : 40 : 36 : 134)
                </button>
                <button
                    onClick={() => setCalcMode('meq')}
                    style={{
                        flex: 1,
                        padding: '0.6rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: calcMode === 'meq' ? 'white' : 'transparent',
                        color: calcMode === 'meq' ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                        fontWeight: 'bold',
                        boxShadow: calcMode === 'meq' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    mEq等量換算 (含有量比 1:1)
                </button>
            </div>

            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.5' }}>
                {calcMode === 'standard' 
                    ? '【常用量換算】各製剤の1日最大用量（常用量上限）を等価とみなして比率換算します（アスパラK : グルコン酸K : 塩化K錠 : 塩化K散 = 16 : 40 : 36 : 134）。臨床上の切り替え目安です。' 
                    : '【mEq等量換算】純粋なカリウム含有量（mEq）が等しくなるように換算します。'}
            </p>

            {/* mEq入力・表示欄 */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'hsl(var(--primary) / 0.05)', borderRadius: '8px', border: '1px solid hsl(var(--primary) / 0.15)' }}>
                <label style={{ display: 'block', fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'hsl(var(--primary))' }}>
                    {calcMode === 'standard' ? '基準カリウム量 (mEq) ※アスパラK換算基準' : '総カリウム量 (mEq) から計算'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="number"
                        value={currentMeq}
                        onChange={(e) => handleInputChange('meq_input', e.target.value)}
                        placeholder="例: 10"
                        min="0"
                        step="any"
                        style={{ width: '150px', padding: '0.8rem', borderRadius: '8px', border: '2px solid hsl(var(--primary))', fontSize: '1.2rem', textAlign: 'right', fontWeight: 'bold' }}
                    />
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>mEq</span>
                </div>
                {calcMode === 'standard' && (
                    <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>
                        ※常用量換算モードでは、mEq入力は「アスパラカリウム」のカリウム量を基準として換算を行います。
                    </div>
                )}
            </div>

            {/* 各製剤の入力・表示リスト */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {potassiumDrugs.map((drug) => {
                    const displayValue = calculateQuantity(drug, inputDrugId, inputValue, calcMode);
                    
                    return (
                        <div key={drug.id} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                background: 'hsl(var(--secondary) / 0.1)', 
                                padding: '1rem', 
                                borderRadius: '8px',
                                border: '1px solid transparent'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'hsl(var(--foreground))' }}>
                                        {drug.name}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                                        1{drug.unit} = {drug.equivalent} mEq (比率用量: {drug.factor})
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="number"
                                            value={displayValue}
                                            onChange={(e) => handleInputChange(drug.id, e.target.value)}
                                            placeholder="0"
                                            min="0"
                                            step="any"
                                            style={{ width: '120px', padding: '0.6rem', borderRadius: '6px', border: '1px solid hsl(var(--secondary))', fontSize: '1.1rem', textAlign: 'right' }}
                                        />
                                        <span style={{ fontWeight: 'bold', color: 'hsl(var(--secondary-foreground))', width: '20px' }}>{drug.unit}</span>
                                    </div>
                                    {displayValue !== '' && (
                                        <div style={{ fontSize: '0.85rem', color: 'hsl(var(--primary))', fontWeight: 'bold' }}>
                                            (= {Math.round(parseFloat(displayValue) * drug.equivalent * 100) / 100} mEq)
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 塩化カリウム散に対する注意書きを該当欄の直下に表示 */}
                            {drug.id === 'kcl_pwd' && calcMode === 'standard' && (
                                <div style={{ 
                                    marginTop: '0.4rem', 
                                    padding: '0.6rem 1rem', 
                                    background: 'hsl(35, 100%, 96%)', 
                                    border: '1px solid hsl(35, 100%, 85%)', 
                                    borderRadius: '6px', 
                                    fontSize: '0.8rem', 
                                    color: 'hsl(35, 90%, 25%)',
                                    lineHeight: '1.4'
                                }}>
                                    ⚠️ <strong>注意：</strong>常用量換算で他の薬剤から塩化カリウム散に変える場合、1日に摂取するmEq量が急激に増えるため、初回はmEq換算で切り替えるなどモニタリングしながらの投与が望ましい。
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* 参考値と比率の説明 */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'hsl(var(--secondary) / 0.05)', borderRadius: '8px', fontSize: '0.85rem', opacity: 0.8, lineHeight: '1.6' }}>
                <p style={{ margin: 0 }}><strong>各製剤の規格とカリウム含有量（mEq）:</strong><br />
                ・アスパラカリウム錠300mg： 1錠 ≒ 1.8 mEq<br />
                ・アスパラカリウム散50%： 1g ≒ 2.9 mEq<br />
                ・グルコンサンK錠2.5mEq： 1錠 = 2.5 mEq<br />
                ・グルコンサンK錠5mEq： 1錠 = 5.0 mEq<br />
                ・グルコンサンK細粒4mEq/g： 1g = 4.0 mEq<br />
                ・塩化カリウム徐放錠600mg「St」： 1錠 = 8.0 mEq<br />
                ・塩化カリウム（散）： 1g ≒ 13.4 mEq
                </p>
                <p style={{ margin: '0.5rem 0 0 0', borderTop: '1px solid hsl(var(--border))', paddingTop: '0.5rem' }}>
                    <strong>常用量対比の比率（mEq上限量対比）:</strong><br />
                    アスパラK : グルコン酸K : 塩化K錠 : 塩化K散 = 16 : 40 : 36 : 134
                </p>
            </div>
        </div>
    );
}
