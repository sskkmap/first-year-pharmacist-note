/**
 * Web Crypto API を使用したAES-GCM-256暗号化ユーティリティ
 */

const ITERATIONS = 100000;
const KEY_LEN = 256;
const ALGO = 'AES-GCM';

/**
 * パスフレーズとソルトから暗号化鍵を導出する
 */
export async function deriveKey(passphrase, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(passphrase),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: ALGO, length: KEY_LEN },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * データを暗号化する
 */
export async function encryptData(data, key) {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: ALGO, iv: iv },
        key,
        enc.encode(JSON.stringify(data))
    );

    return {
        encrypted: new Uint8Array(encrypted),
        iv: iv
    };
}

/**
 * データを復号化する
 */
export async function decryptData(encryptedData, key, iv) {
    const decrypted = await crypto.subtle.decrypt(
        { name: ALGO, iv: iv },
        key,
        encryptedData
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decrypted));
}

/**
 * Uint8ArrayをBase64文字列に変換する
 */
export function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Base64文字列をUint8Arrayに変換する
 */
export function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

/**
 * 安全なID (UUID v4) を生成する
 * crypto.randomUUID が使えない環境（非セキュアコンテキストなど）ではフォールバックを使用
 */
export function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // フォールバックロジック
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
