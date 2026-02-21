import { generateId } from './crypto';

/**
 * スケジュール生成ロジック
 */

/**
 * 指定した月の開始日と終了日を取得 (1ヶ月前〜半年後の計算用)
 */
export function getScheduleRange(baseDate = new Date()) {
    const start = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1);
    const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 7, 0); // 半年後(6ヶ月)の末日
    return { start, end };
}

/**
 * 特定の患者に対するスケジュールを生成する
 */
export function generatePatientSchedule(patient, startDate, endDate) {
    const schedules = [];
    const current = new Date(startDate);

    // 患者の基準日（ここから間隔を計算）
    const baseDate = patient.startBaseDate ? new Date(patient.startBaseDate) : new Date(startDate);
    baseDate.setHours(0, 0, 0, 0);

    while (current <= endDate) {
        if (isScheduledDay(patient, current, baseDate)) {
            schedules.push({
                id: generateId(),
                patientId: patient.id,
                date: current.toISOString().split('T')[0],
                status: 'scheduled', // scheduled | received | no_prescription | confirmed | rescheduled
                updatedAt: new Date().toISOString(),
            });
        }
        current.setDate(current.getDate() + 1);
    }
    return schedules;
}

/**
 * 特定の日が患者のスケジュール日かどうか判定
 */
function isScheduledDay(patient, date, baseDate) {
    // 1. 単発訪問(single)の場合：日付が一致するかのみ判定
    if (patient.type === 'single') {
        return formatDateLocal(date) === patient.targetDate;
    }

    // 2. 定期訪問(periodic)の場合
    // 曜日の判定
    if (date.getDay() !== patient.dayOfWeek) return false;

    // 第N週の判定 (複数指定に対応)
    // patient.weekNumbers = [1, 3] のような形式を想定
    if (patient.weekNumbers && patient.weekNumbers.length > 0) {
        const weekNum = Math.ceil(date.getDate() / 7);
        if (!patient.weekNumbers.includes(weekNum)) return false;
    } else if (patient.weekNumber && patient.weekNumber !== 'every') {
        const weekNum = Math.ceil(date.getDate() / 7);
        if (weekNum !== parseInt(patient.weekNumber)) return false;
    }

    // 間隔（週）の判定 (weekNumbers指定がない場合のみ有効とするのが一般的)
    if (!patient.weekNumbers || patient.weekNumbers.length === 0) {
        if (patient.intervalWeeks > 1) {
            const diffTime = Math.abs(date - baseDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const diffWeeks = Math.floor(diffDays / 7);
            if (diffWeeks % patient.intervalWeeks !== 0) return false;
        }
    }

    return true;
}

function formatDateLocal(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * 全患者のスケジュールを更新・維持する
 */
export function syncGlobalSchedules(patients, existingSchedules, range) {
    const { start, end } = range;
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    // 1. 保存すべきデータの切り出し
    // - 範囲外(1ヶ月より前)のデータ
    // - 範囲内だが、すでに「対応済」などのステータスがついているデータ
    let preserved = existingSchedules.filter(s => {
        const d = s.date;
        return d < startStr || s.status !== 'scheduled';
    });

    // 2. アクティブな患者ごとにスケジュールを生成して追加
    patients.forEach(patient => {
        if (!patient.active || patient.deleted) return;

        const patientSchedules = generatePatientSchedule(patient, start, end);

        patientSchedules.forEach(newS => {
            // 同一日の同一患者にすでにデータ（preservedにある「対応済」など）があれば、新規の 'scheduled' は追加しない
            const exists = preserved.find(es => es.patientId === newS.patientId && es.date === newS.date);
            if (!exists) {
                preserved.push(newS);
            }
        });
    });

    return preserved.sort((a, b) => a.date.localeCompare(b.date));
}
