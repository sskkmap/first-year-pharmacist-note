'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { deriveKey, encryptData, decryptData, arrayBufferToBase64, base64ToUint8Array, generateId } from '../../lib/visit-management/crypto';
import { setData, getData, clearAllData } from '../../lib/visit-management/db';
import { getScheduleRange, syncGlobalSchedules } from '../../lib/visit-management/schedule';
import VisitCalendar from './VisitCalendar';

/**
 * 訪問処方管理メインコンポーネント
 */
export default function VisitManagement() {
    // --- ステート管理 ---
    const [passphrase, setPassphrase] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [encryptionKey, setEncryptionKey] = useState(null);
    const [appData, setAppData] = useState({
        patients: [],
        schedules: [],
        logs: [],
        masterDeviceId: null,
        dataVersion: 1
    });
    const [deviceId, setDeviceId] = useState(null);
    const [viewMode, setViewMode] = useState('calendar'); // calendar | daily | patients | logs | settings
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSecure, setIsSecure] = useState(true);
    const [hasExistingData, setHasExistingData] = useState(false);
    const [isSetupOpen, setIsSetupOpen] = useState(false);

    // --- 新規追加・編集ステート ---
    const [editingPatient, setEditingPatient] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // --- 初期化 ---
    useEffect(() => {
        // Web Crypto API (subtle) の利用可否チェック
        if (typeof window !== 'undefined' && !window.crypto?.subtle) {
            setIsSecure(false);
            setError('このブラウザ環境では暗号化機能（Web Crypto API）を利用できません。HTTPS通信または localhost でのアクセスが必要です。');
            setLoading(false); // Stop loading if not secure
            return; // Exit useEffect early
        }

        const init = async () => {
            let storedId = localStorage.getItem('visit_management_device_id');
            if (!storedId) {
                storedId = generateId();
                localStorage.setItem('visit_management_device_id', storedId);
            }
            setDeviceId(storedId);

            const encryptedPackage = await getData('encrypted_package');
            setHasExistingData(!!encryptedPackage);
            setLoading(false);
        };
        init();
    }, []);

    // --- 補助: データの保存 ---
    const commitData = async (newData) => {
        setAppData(newData);
        const stored = await getData('encrypted_package');
        if (stored && encryptionKey) {
            const salt = base64ToUint8Array(stored.salt);
            await saveData(newData, encryptionKey, salt);
        }
    };

    const saveData = async (data, key, salt) => {
        const encrypted = await encryptData(data, key);
        await setData('encrypted_package', {
            encryptedData: arrayBufferToBase64(encrypted.encrypted),
            iv: arrayBufferToBase64(encrypted.iv),
            salt: arrayBufferToBase64(salt),
            dataVersion: data.dataVersion,
            masterDeviceId: data.masterDeviceId,
            lastUpdated: new Date().toISOString()
        });
    };

    // --- アクション: 認証系 ---
    const validatePassphrase = (pw) => {
        // 8文字以上、英字と数字の両方を含む
        const hasLetter = /[a-zA-Z]/.test(pw);
        const hasNumber = /[0-9]/.test(pw);
        return pw.length >= 8 && hasLetter && hasNumber;
    };
    const handleUnlock = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const pkg = await getData('encrypted_package');
            const salt = base64ToUint8Array(pkg.salt);
            const key = await deriveKey(passphrase, salt);
            const data = await decryptData(base64ToUint8Array(pkg.encryptedData), key, base64ToUint8Array(pkg.iv));

            setAppData(data);
            setEncryptionKey(key);
            setIsUnlocked(true);

            const range = getScheduleRange();
            const updated = syncGlobalSchedules(data.patients, data.schedules, range);
            if (updated.length !== data.schedules.length) {
                commitData({ ...data, schedules: updated });
            }
        } catch (err) {
            setError('パスフレーズが正しくないか、復号に失敗しました。');
        } finally { setLoading(false); }
    };

    const handleSetup = async (e) => {
        if (e) e.preventDefault();

        // 0. 未入力チェック
        if (!passphrase || passphrase.trim() === '') {
            alert('パスフレーズが入力されていないため、削除できませんでした。入力してから再度お試しください。');
            return;
        }

        // 1. 確認ポップアップ
        if (hasExistingData) {
            const confirmed = window.confirm('【最終確認】既存のデータをすべて削除して新しくセットアップします。本当によろしいですか？');
            if (!confirmed) return;
        }

        // 2. パスフレーズバリデーション
        if (!validatePassphrase(passphrase)) {
            setError('パスフレーズは英字と数字を含む8文字以上である必要があります。');
            alert('入力されたパスフレーズが条件（英字と数字を含む8文字以上）を満たしていないため、削除できませんでした。入力内容を確認してから再度お試しください。');
            return;
        }

        setLoading(true);
        setError('');
        try {
            // 3. データクリア
            // データベース内の全レコードを削除
            await clearAllData();

            // デバイスIDもリセット
            const newDeviceId = generateId();
            localStorage.setItem('visit_management_device_id', newDeviceId);
            setDeviceId(newDeviceId);

            // 4. 新しいデータで初期化
            const salt = window.crypto.getRandomValues(new Uint8Array(16));
            const key = await deriveKey(passphrase, salt);
            const initialData = {
                patients: [], schedules: [],
                logs: [{ id: generateId(), actionType: 'init', memo: 'システム再初期化', deviceId: newDeviceId, createdAt: new Date().toISOString() }],
                masterDeviceId: newDeviceId, dataVersion: 1, lastUpdated: new Date().toISOString()
            };

            await saveData(initialData, key, salt);

            // 5. 完了処理
            alert('セットアップが完了しました。ページを再読み込みします。');
            window.location.href = window.location.pathname; // 強制リロード

        } catch (err) {
            console.error('Setup Error:', err);
            setError('エラーが発生しました：' + (err.message || 'ブラウザのストレージを確認してください'));
        } finally {
            setLoading(false);
        }
    };

    // --- アクション: 患者管理 ---
    const handleSavePatient = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const type = fd.get('type'); // periodic | single

        let patient = {
            id: editingPatient?.id || generateId(),
            name: fd.get('name'),
            type: type,
            updatedAt: new Date().toISOString(),
            active: true,
            deleted: false
        };

        if (type === 'periodic') {
            const weekNumbers = fd.getAll('weekNumbers').map(Number);
            patient = {
                ...patient,
                dayOfWeek: parseInt(fd.get('dayOfWeek')),
                weekNumbers: weekNumbers,
                // 下換性のためのweekNumber (最初の1つ)
                weekNumber: weekNumbers[0] || 'every',
                intervalWeeks: 1, // 第N週指定がある場合は1で固定し、スケジュールロジック側に任せる
                startBaseDate: fd.get('startBaseDate')
            };

        } else {
            // 単発
            const baseDateStr = fd.get('singleBaseDate');
            const prescriptionDays = parseInt(fd.get('prescriptionDays'));
            const calcMode = fd.get('calcMode'); // exact | near_day

            const baseDate = new Date(baseDateStr);
            const targetDate = new Date(baseDate);
            targetDate.setDate(baseDate.getDate() + prescriptionDays);

            if (calcMode === 'near_day') {
                const targetDay = baseDate.getDay();
                // 一番近いその前の同じ曜日を探す
                while (targetDate.getDay() !== targetDay) {
                    targetDate.setDate(targetDate.getDate() - 1);
                }
            }

            patient = {
                ...patient,
                targetDate: targetDate.toISOString().split('T')[0],
                prescriptionDays,
                calcMode,
                singleBaseDate: baseDateStr
            };
        }

        const newPatients = editingPatient?.id ? appData.patients.map(p => p.id === patient.id ? patient : p) : [...appData.patients, patient];
        const newSchedules = syncGlobalSchedules(newPatients, appData.schedules, getScheduleRange());

        commitData({
            ...appData,
            patients: newPatients,
            schedules: newSchedules,
            logs: [...appData.logs, {
                id: generateId(), patientId: patient.id,
                actionType: editingPatient?.id ? 'edit' : 'register',
                memo: `[${type === 'periodic' ? '定期' : '単発'}] ${patient.name} さんを${editingPatient?.id ? '編集' : '登録'}しました`,
                deviceId, createdAt: new Date().toISOString()
            }]
        });
        setIsEditModalOpen(false);
    };

    const handleDeletePatient = async (patientId) => {
        const patient = appData.patients.find(p => p.id === patientId);
        if (!patient) return;

        if (!window.confirm(`${patient.name} さんの登録を削除しますか？（スケジュールも削除されます）`)) return;

        const newPatients = appData.patients.map(p => p.id === patientId ? { ...p, deleted: true, updatedAt: new Date().toISOString() } : p);
        const newSchedules = syncGlobalSchedules(newPatients, appData.schedules, getScheduleRange());

        commitData({
            ...appData,
            patients: newPatients,
            schedules: newSchedules,
            logs: [...appData.logs, {
                id: generateId(), patientId,
                actionType: 'delete',
                memo: `${patient.name} さんの登録を削除しました`,
                deviceId, createdAt: new Date().toISOString()
            }]
        });
        setIsEditModalOpen(false);
    };

    // --- アクション: 当日対応ステータス更新 ---
    const updateScheduleStatus = (scheduleId, newStatus, memo = '') => {
        const schedule = appData.schedules.find(s => s.id === scheduleId);
        if (!schedule) return;

        const patient = appData.patients.find(p => p.id === schedule.patientId);

        const newSchedules = appData.schedules.map(s =>
            s.id === scheduleId ? { ...s, status: newStatus, updatedAt: new Date().toISOString() } : s
        );

        commitData({
            ...appData,
            schedules: newSchedules,
            logs: [...appData.logs, {
                id: generateId(), patientId: schedule.patientId,
                actionType: newStatus,
                memo: `${patient?.name} さんのステータスを [${newStatus}] に変更しました${memo ? ': ' + memo : ''}`,
                deviceId, createdAt: new Date().toISOString()
            }]
        });
    };

    // --- 算出プロパティ ---
    const dailySchedules = useMemo(() => {
        return appData.schedules
            .filter(s => s.date === selectedDate)
            .map(s => ({ ...s, patient: appData.patients.find(p => p.id === s.patientId) }))
            .filter(s => s.patient && !s.patient.deleted);
    }, [appData.schedules, appData.patients, selectedDate]);

    // --- レンダリング ---
    if (loading) return <div className="p-8 text-center text-primary animate-pulse">読み込み中...</div>;

    if (!isUnlocked) {
        return (
            <div className="max-w-md mx-auto p-8 glass-panel mt-10 shadow-2xl border-primary/20">
                <h2 className="text-3xl font-extrabold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">訪問処方管理</h2>
                <form onSubmit={handleUnlock} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2 opacity-80">
                            パスフレーズ <span className="text-[10px] text-primary ml-2">※英字と数字を組み合わせた8文字以上</span>
                        </label>
                        <input type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} required
                            className="w-full p-4 rounded-xl bg-secondary/30 border border-primary/20 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                            placeholder="••••••••" />
                    </div>
                    {error && <p className="text-destructive text-sm font-medium animate-bounce text-center">{error}</p>}

                    {hasExistingData ? (
                        <button type="submit" className="w-full py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                            ロックを解除
                        </button>
                    ) : (
                        <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 text-center space-y-2">
                            <p className="text-xs font-bold text-primary">データが見つかりません</p>
                            <p className="text-[10px] opacity-60">下のボタンから「新規セットアップ」を行ってください</p>
                        </div>
                    )}

                    <div className="pt-4 border-t border-primary/10">
                        <button type="button" onClick={() => setIsSetupOpen(!isSetupOpen)}
                            className="w-full py-2 text-xs font-bold opacity-40 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {isSetupOpen ? '▼ 管理メニューを閉じる' : '▶ セットアップ・初期化'}
                        </button>

                        {isSetupOpen && (
                            <div className="mt-4 p-4 bg-destructive/5 rounded-2xl border border-destructive/10 animate-in slide-in-from-top-2 duration-300">
                                <p className="text-[10px] text-destructive font-bold mb-4 text-center">
                                    ※ 既存のデータを削除して新しく作成します。<br />
                                    パスフレーズ入力欄に「新しいパスワード」を入力してから、下のボタンをクリックしてください。<br />
                                    この操作は取り消せません。
                                </p>
                                <button type="button" onClick={handleSetup}
                                    className="w-full py-3 rounded-xl bg-destructive text-white text-sm font-bold shadow-lg shadow-destructive/20 hover:scale-[1.02] active:scale-95 transition-all">
                                    {hasExistingData ? '全データを削除して再セットアップ' : '新規セットアップを開始'}
                                </button>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="visit-management-app">
            <nav className="flex gap-2 mb-8 p-1 bg-secondary/20 rounded-2xl overflow-x-auto no-scrollbar">
                {[
                    { id: 'calendar', label: 'カレンダー', icon: '📅' },
                    { id: 'daily', label: '当日対応', icon: '📋' },
                    { id: 'patients', label: '患者管理', icon: '👥' },
                    { id: 'logs', label: '履歴', icon: '📜' },
                    { id: 'settings', label: '設定', icon: '⚙️' }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setViewMode(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap
                                ${viewMode === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'hover:bg-primary/10 opacity-70'}`}>
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </nav>

            <div className="min-h-[60vh] animate-in fade-in slide-in-from-bottom-4 duration-500">
                {viewMode === 'calendar' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-secondary/10 p-6 rounded-3xl gap-4">
                            <div>
                                <h3 className="text-2xl font-black">スケジュール展望</h3>
                                <p className="opacity-60 font-medium">日付を選択して詳細を確認できます</p>
                            </div>
                            <button
                                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                                className="bg-primary/10 text-primary px-6 py-2 rounded-xl font-bold hover:bg-primary/20"
                            >
                                今日
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <VisitCalendar
                                    selectedDate={selectedDate}
                                    onDateSelect={(date) => setSelectedDate(date)}
                                    patients={appData.patients}
                                    schedules={appData.schedules}
                                />
                            </div>

                            <div className="glass-panel p-6 overflow-hidden">
                                <h4 className="text-lg font-black mb-4 border-b border-primary/10 pb-2 flex items-center gap-2">
                                    <span>📅</span> {selectedDate} の予定
                                </h4>
                                {dailySchedules.length > 0 ? (
                                    <div className="space-y-3 overflow-y-auto max-h-[400px] no-scrollbar">
                                        {dailySchedules.map(item => (
                                            <div key={item.id} className="flex items-center gap-3 p-3 bg-secondary/10 rounded-xl">
                                                <div className={`w-2 h-8 rounded-full ${item.status === 'received' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <div className="flex-1">
                                                    <div className="text-sm font-bold">{item.patient.name}</div>
                                                    <div className="text-[10px] opacity-60 uppercase">{item.status}</div>
                                                </div>
                                                <button onClick={() => setViewMode('daily')} className="text-[10px] bg-primary text-white p-1 rounded-md">詳細</button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center opacity-40 text-sm py-12">この日の訪問予定はありません</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'daily' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-secondary/10 p-6 rounded-3xl gap-4">
                            <div>
                                <h3 className="text-2xl font-black">{selectedDate}</h3>
                                <p className="opacity-60 font-medium">合計: {dailySchedules.length} 名の訪問予定</p>
                            </div>
                            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-background px-6 py-3 rounded-2xl border border-primary/20 font-bold outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer" />
                        </div>

                        <div className="grid gap-4">
                            {dailySchedules.map(item => (
                                <div key={item.id} className="p-6 glass-panel flex flex-col sm:flex-row justify-between items-center gap-6 group hover:border-primary/40 transition-colors">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className={`w-3 h-12 rounded-full ${item.status === 'received' ? 'bg-green-500' :
                                            item.status === 'scheduled' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse' :
                                                'bg-secondary'
                                            }`} />
                                        <div>
                                            <div className="text-xl font-black">{item.patient.name}</div>
                                            <div className="text-sm opacity-60 font-bold uppercase tracking-wider">{item.status}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                                        {[
                                            { id: 'received', label: '到着', color: 'bg-green-500' },
                                            { id: 'confirmed', label: '電話', color: 'bg-blue-500' },
                                            { id: 'no_prescription', label: 'なし', color: 'bg-yellow-500' },
                                            { id: 'rescheduled', label: '別日', color: 'bg-purple-500' }
                                        ].map(btn => (
                                            <button key={btn.id} onClick={() => updateScheduleStatus(item.id, btn.id)}
                                                className={`px-4 py-2 rounded-xl text-white text-xs font-black transition-all hover:scale-110 active:scale-90 ${btn.color} ${item.status === btn.id ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : 'opacity-40 hover:opacity-100'}`}>
                                                {btn.label}
                                            </button>
                                        ))}
                                        <button onClick={() => updateScheduleStatus(item.id, 'scheduled')} className="px-4 py-2 rounded-xl bg-secondary text-xs font-black opacity-40 hover:opacity-100">未</button>
                                    </div>
                                </div>
                            ))}
                            {dailySchedules.length === 0 && (
                                <div className="p-20 text-center opacity-40 italic">
                                    この日の訪問予定はありません
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {viewMode === 'patients' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h3 className="text-2xl font-black text-primary">患者管理マスター</h3>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button onClick={() => { setEditingPatient({ type: 'periodic' }); setIsEditModalOpen(true); }}
                                    className="flex-1 bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm">
                                    ➕ 定期患者様登録
                                </button>
                                <button onClick={() => { setEditingPatient({ type: 'single' }); setIsEditModalOpen(true); }}
                                    className="flex-1 bg-secondary text-primary px-6 py-3 rounded-2xl font-bold border border-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm">
                                    ➕ 単発患者様登録
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {appData.patients.filter(p => !p.deleted).map(p => (
                                <div key={p.id} className="p-6 glass-panel relative group border border-primary/5 hover:border-primary/20 transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="text-xl font-black text-primary mb-1">{p.name}</div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${p.type === 'single' ? 'bg-secondary text-primary' : 'bg-primary text-white'}`}>
                                                {p.type === 'single' ? '単発' : '定期'}
                                            </span>
                                        </div>
                                        <button onClick={() => { setEditingPatient(p); setIsEditModalOpen(true); }}
                                            className="p-2 hover:bg-primary/10 rounded-xl transition-colors">✏️</button>
                                    </div>

                                    <div className="flex gap-2 flex-wrap">
                                        {p.type === 'single' ? (
                                            <>
                                                <span className="px-2 py-1 bg-secondary/30 rounded-lg text-xs font-bold flex items-center gap-1">
                                                    📅 予定日: {p.targetDate}
                                                </span>
                                                <span className="px-2 py-1 bg-secondary/30 rounded-lg text-xs font-bold">
                                                    💊 {p.prescriptionDays}日分
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="px-2 py-1 bg-primary/10 rounded-lg text-xs font-bold text-primary">
                                                    {['日', '月', '火', '水', '木', '金', '土'][p.dayOfWeek]}曜
                                                </span>
                                                <span className="px-2 py-1 bg-secondary/30 rounded-lg text-xs font-bold">
                                                    {p.weekNumbers?.length > 0 ? `第${p.weekNumbers.join(',')}週` : (p.weekNumber === 'every' ? '毎週' : `第${p.weekNumber}週`)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {viewMode === 'logs' && (
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black mb-6">監査ログ</h3>
                        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-4 scrollbar-thin">
                            {appData.logs.slice().reverse().map(log => (
                                <div key={log.id} className="p-4 bg-secondary/10 rounded-2xl border border-primary/5 text-sm flex gap-4">
                                    <div className="font-mono text-[10px] opacity-40 shrink-0 w-32">{new Date(log.createdAt).toLocaleString()}</div>
                                    <div className="font-black text-primary min-w-[80px]">[{log.actionType}]</div>
                                    <div className="opacity-80">{log.memo}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {viewMode === 'settings' && (
                    <div className="space-y-8">
                        <h3 className="text-2xl font-black">環境設定</h3>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="p-8 bg-secondary/10 rounded-[2rem] border border-primary/10">
                                <h4 className="font-black mb-4 flex items-center gap-2">📱 端末ステータス</h4>
                                <div className="space-y-2 text-sm">
                                    <p className="flex justify-between"><span className="opacity-60">デバイスID:</span> <span className="font-mono text-[10px]">{deviceId}</span></p>
                                    <p className="flex justify-between"><span className="opacity-60">権限ランク:</span>
                                        <span className={`font-black ${appData.masterDeviceId === deviceId ? 'text-green-500' : 'text-yellow-500'}`}>
                                            {appData.masterDeviceId === deviceId ? 'マスター管理者' : 'サブ端末'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="p-8 bg-secondary/10 rounded-[2rem] border border-primary/10 flex flex-col justify-center items-center gap-4">
                                <h4 className="font-black">💾 データポータビリティ</h4>
                                <div className="flex gap-2">
                                    <button className="px-6 py-3 bg-background rounded-2xl font-bold border border-primary/20 hover:bg-primary/5">出力</button>
                                    <button className="px-6 py-3 bg-background rounded-2xl font-bold border border-primary/20 hover:bg-primary/5">読込</button>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <button onClick={() => window.location.reload()} className="text-xs font-bold text-destructive/60 hover:text-destructive underline decoration-2 underline-offset-4">
                                セッションを切断して再起動する
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* モーダル群 */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
                    <div className="glass-panel w-full max-w-lg p-8 bg-background relative shadow-2xl max-h-[95vh] overflow-y-auto no-scrollbar">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-black text-primary">
                                {editingPatient?.id ? '患者情報の変更' : (editingPatient?.type === 'periodic' ? '定期患者様登録' : '単発患者様登録')}
                            </h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-2xl opacity-40 hover:opacity-100">✕</button>
                        </div>

                        <form onSubmit={handleSavePatient} className="space-y-6">
                            <input type="hidden" name="type" value={editingPatient?.type || 'periodic'} />

                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-60">氏名</label>
                                        <input name="name" defaultValue={editingPatient?.name} required placeholder="氏名を入力"
                                            className="w-full p-4 rounded-2xl bg-secondary/30 border border-primary/20 focus:ring-2 focus:ring-primary/50 outline-none font-bold" />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-xs font-black uppercase tracking-widest opacity-60">
                                            {editingPatient?.type === 'periodic' ? '計算基準日' : '処方日（基準日）'}
                                        </label>
                                        <input type="date" name={editingPatient?.type === 'periodic' ? 'startBaseDate' : 'singleBaseDate'}
                                            defaultValue={(editingPatient?.type === 'periodic' ? editingPatient?.startBaseDate : editingPatient?.singleBaseDate) || new Date().toISOString().split('T')[0]}
                                            className="w-full p-4 rounded-2xl bg-secondary/30 border border-primary/20 outline-none font-mono" />
                                    </div>
                                </div>

                                {editingPatient?.type === 'periodic' ? (
                                    /* 定期患者フォーム: 曜日と週指定を整理 */
                                    <div className="space-y-5 bg-secondary/10 p-5 rounded-[2rem] border border-primary/10">
                                        <div className="grid gap-2">
                                            <label className="text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                                                <span>🗓️</span> 定期訪問曜日
                                            </label>
                                            <div className="grid grid-cols-7 gap-1">
                                                {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
                                                    <label key={i} className="cursor-pointer group">
                                                        <input type="radio" name="dayOfWeek" value={i} defaultChecked={(editingPatient?.dayOfWeek ?? 1) === i} className="hidden peer" />
                                                        <div className="py-2.5 text-center rounded-xl border border-primary/10 bg-background peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all font-bold text-xs shadow-sm">
                                                            {d}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <label className="text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                                                <span>🔢</span> 訪問する週 (第1〜4週)
                                            </label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {[
                                                    { val: 1, label: '1週目' }, { val: 2, label: '2週目' },
                                                    { val: 3, label: '3週目' }, { val: 4, label: '4週目' }
                                                ].map(w => (
                                                    <label key={w.val} className="cursor-pointer group">
                                                        <input type="checkbox" name="weekNumbers" value={w.val}
                                                            defaultChecked={editingPatient?.weekNumbers?.includes(w.val)} className="hidden peer" />
                                                        <div className="py-4 text-center rounded-xl border border-primary/10 bg-background peer-checked:bg-primary/20 peer-checked:border-primary peer-checked:text-primary transition-all font-bold text-xs shadow-sm">
                                                            {w.label}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                            <div className="mt-1 text-[10px] text-primary/60 font-bold bg-primary/5 p-2 rounded-lg">
                                                ※「1週・3週」などを選ぶと、第5週がある月でもズレずに月2回固定で算出されます。
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* 単発患者フォーム */
                                    <div className="space-y-5">
                                        <div className="grid gap-2">
                                            <label className="text-xs font-black uppercase tracking-widest opacity-60">処方日数 (日)</label>
                                            <div className="flex items-center gap-2">
                                                <input type="number" name="prescriptionDays" defaultValue={editingPatient?.prescriptionDays || 28} min="1"
                                                    className="flex-1 p-4 rounded-2xl bg-secondary/30 border border-primary/20 outline-none text-2xl font-black text-center" />
                                                <span className="font-bold opacity-60">日間</span>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <label className="text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                                                <span>🎯</span> 訪問予定日の設定
                                            </label>
                                            <div className="grid grid-cols-1 gap-2">
                                                <label className="flex items-center gap-3 p-4 rounded-2xl bg-background border border-primary/10 cursor-pointer hover:bg-secondary/20 transition-all shadow-sm">
                                                    <input type="radio" name="calcMode" value="exact" defaultChecked={editingPatient?.calcMode !== 'near_day'} className="w-5 h-5 accent-primary" />
                                                    <div>
                                                        <div className="font-bold text-sm">ピッタリ〇日後に設定</div>
                                                        <div className="text-[10px] opacity-60">処方日数後の当日を訪問日にします</div>
                                                    </div>
                                                </label>
                                                <label className="flex items-center gap-3 p-4 rounded-2xl bg-background border border-primary/10 cursor-pointer hover:bg-secondary/20 transition-all shadow-sm">
                                                    <input type="radio" name="calcMode" value="near_day" defaultChecked={editingPatient?.calcMode === 'near_day'} className="w-5 h-5 accent-primary" />
                                                    <div>
                                                        <div className="font-bold text-sm">直近の同じ曜日に合わせる</div>
                                                        <div className="text-[10px] opacity-60">基本はその前（処方切れ前）の同じ曜日に自動調整します</div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 space-y-3">
                                <button type="submit" className="w-full py-5 bg-primary text-white font-black rounded-[2rem] shadow-2xl shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all text-lg">
                                    {editingPatient?.id ? '変更内容を適用する' : 'この内容で登録を確定'}
                                </button>

                                {editingPatient?.id && (
                                    <button type="button" onClick={() => handleDeletePatient(editingPatient.id)}
                                        className="w-full py-3 text-destructive font-bold hover:bg-destructive/5 rounded-xl transition-colors text-sm">
                                        🗑️ この患者様登録を削除
                                    </button>
                                )}

                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-full py-3 font-bold opacity-40 hover:opacity-100 transition-opacity text-sm">
                                    キャンセルして戻る
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .glass-panel {
                    background: rgba(var(--background-rgb), 0.7);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(var(--primary-rgb), 0.1);
                    border-radius: 2rem;
                }
            `}</style>
        </div>
    );
}
