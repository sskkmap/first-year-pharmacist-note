'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function MedicationHistorySupportTool() {
  const [inputDrug, setInputDrug] = useState('');
  const [normalizedDrug, setNormalizedDrug] = useState('');
  const [extractedDrugNames, setExtractedDrugNames] = useState([]);
  const [assessmentTexts, setAssessmentTexts] = useState({ diseaseCategories: [], disease: [], ingredientCategories: [], ingredient: [], common: [] });
  const [selectedTexts, setSelectedTexts] = useState([]);
  const [finalAssessment, setFinalAssessment] = useState('');

  const [normalizationDict, setNormalizationDict] = useState([]);
  const [masterDrugs, setMasterDrugs] = useState([]);
  const [diseaseCodeList, setDiseaseCodeList] = useState([]);
  const [ingredientCodeList, setIngredientCodeList] = useState([]);
  const [commonList, setCommonList] = useState([]);

  // OCR機能用のステート
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [ocrResults, setOcrResults] = useState([]);
  const [showOcrModal, setShowOcrModal] = useState(false);

  // 画像回転用のステート
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageRotation, setImageRotation] = useState(0);
  const [showRotationModal, setShowRotationModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // アコーディオン開閉状態のステート
  const [isDiseaseOpen, setIsDiseaseOpen] = useState(true);
  const [isIngredientOpen, setIsIngredientOpen] = useState(true);
  const [isCommonOpen, setIsCommonOpen] = useState(false);

  // 1.0. Canvasによる画像の回転処理
  const getRotatedImageBlob = (imageSrc, rotation) => {
    return new Promise((resolve, reject) => {
      if (rotation === 0) {
        fetch(imageSrc)
          .then(res => res.blob())
          .then(resolve)
          .catch(reject);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (rotation % 180 !== 0) {
          canvas.width = img.naturalHeight;
          canvas.height = img.naturalWidth;
        } else {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('画像の回転処理に失敗しました。'));
          }
        }, 'image/jpeg');
      };
      img.onerror = () => reject(new Error('画像の読み込みに失敗しました。'));
      img.src = imageSrc;
    });
  };

  // 1. Tesseract.jsをCDNからロードする
  const loadTesseract = () => {
    return new Promise((resolve, reject) => {
      if (window.Tesseract) {
        resolve(window.Tesseract);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      script.onload = () => resolve(window.Tesseract);
      script.onerror = () => reject(new Error('Tesseract.js の読み込みに失敗しました。'));
      document.head.appendChild(script);
    });
  };

  // 2. レーベンシュタイン距離の計算
  const getLevenshteinDistance = (a, b) => {
    const tmp = [];
    for (let i = 0; i <= a.length; i++) tmp[i] = [i];
    for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        tmp[i][j] = Math.min(
          tmp[i - 1][j] + 1,
          tmp[i][j - 1] + 1,
          tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return tmp[a.length][b.length];
  };

  // 3. 類似度スコアの計算
  const getSimilarity = (a, b) => {
    const maxLength = Math.max(a.length, b.length);
    if (maxLength === 0) return 1.0;
    return 1.0 - getLevenshteinDistance(a, b) / maxLength;
  };

  // 4. OCRで読み取った行のクレンジング処理
  const cleanOcrLine = (line) => {
    if (!line) return '';
    let cleaned = line
      .replace(/\u3000/g, ' ')
      .replace(/「[^」]*」/g, ' ')
      .replace(/『[^』]*』/g, ' ')
      .replace(/【[^】]*】/g, ' ')
      .replace(/［[^］]*］/g, ' ')
      .replace(/\[[^\]]*\]/g, ' ')
      .replace(/[「」『』【】［］\[\]]/g, ' ')
      .replace(/[()（）]/g, ' ');

    // 規格・用法・用量・日数などの除去
    cleaned = cleaned
      .replace(/[0-9０-９]+(?:\.?[0-9０-９]+)?\s*(mg|㎎|ｍｇ|g|ｇ|mL|ｍL|ｍl|ml|％|%|錠|包|回|日|週間|月|日の|週|ｶﾌﾟｾﾙ|カプセル)/gi, '')
      .replace(/[0-9０-９]+/g, '')
      .replace(/(１日|1日|１回|1回|１回目|1回目|朝|昼|夕|就寝前|寝る前|朝食後|昼食後|夕食後|毎日|毎朝|毎夕|毎晩|毎食後|用法|分服|日分|錠分)/g, '')
      .replace(/\s+/g, '')
      .trim();

    return cleaned;
  };

  // 5. 成分名から不要な修飾名（塩など）を除去して一般名にする
  const extractGenericName = (ingredientName) => {
    if (!ingredientName) return '';
    let name = ingredientName;
    const suffixes = [
      'ベシル酸塩', '塩酸塩水和物', '塩酸塩', '酒石酸塩', 'マレイン酸塩',
      'クエン酸塩', 'カルシウム', 'ナトリウム水和物', 'ナトリウム',
      'カリウム', '水和物', '酢酸エステル', 'エステル', '炭酸水素ナトリウム',
      'メタンスルホン酸塩', 'トシル酸塩水和物', 'トシル酸塩', 'フマル酸塩',
      'リン酸塩'
    ];
    suffixes.forEach(suffix => {
      name = name.replace(new RegExp(suffix + '$', 'g'), '');
    });
    return name.trim();
  };

  // 5.1. 濁点・半濁点の除去（清音化）
  const removeVoicedMarks = (text) => {
    if (!text) return '';
    return text
      .normalize('NFD') // 濁点を文字から分離（例：「が」→「か」＋「゛」）
      .replace(/[\u3099\u309a]/g, '') // 濁点・半濁点記号を除去
      .normalize('NFC'); // 再結合
  };

  // 6. normalization_dictionaryを用いた誤字補正とあいまいマッチング
  const findBestOcrMatch = (lineText) => {
    const cleanedLine = cleanOcrLine(lineText);
    if (!cleanedLine || cleanedLine.length < 2) return null;

    const flatLine = removeVoicedMarks(cleanedLine);

    // 12000件のループを高速化するため、まずは清音化した状態で部分一致を試す
    const exactMatches = normalizationDict.filter(item => {
      const dictKey = item['変換前(商品名/誤字)'];
      if (!dictKey) return false;
      const cleanedDictKey = cleanOcrLine(dictKey);
      if (!cleanedDictKey) return false;
      const flatDictKey = removeVoicedMarks(cleanedDictKey);
      return flatDictKey.includes(flatLine) || flatLine.includes(flatDictKey);
    });

    if (exactMatches.length > 0) {
      // 部分一致が見つかった場合は、最も短いものを優先
      exactMatches.sort((a, b) => a['変換前(商品名/誤字)'].length - b['変換前(商品名/誤字)'].length);
      const match = exactMatches[0];
      return {
        corrected: match['変換前(商品名/誤字)'],
        generic: extractGenericName(match['変換後(成分名)'] || match['変換前(商品名/誤字)']),
        similarity: 1.0
      };
    }

    // あいまい一致の計算
    let bestMatch = null;
    let highestSimilarity = 0;

    for (let i = 0; i < normalizationDict.length; i++) {
      const item = normalizationDict[i];
      const originalName = item['変換前(商品名/誤字)'];
      if (!originalName) continue;

      const cleanedDictKey = cleanOcrLine(originalName);
      if (!cleanedDictKey) continue;

      const flatDictKey = removeVoicedMarks(cleanedDictKey);

      // 長さが違いすぎるものはあらかじめ除外（高速化）
      const lengthDiff = Math.abs(flatLine.length - flatDictKey.length);
      if (lengthDiff > Math.max(flatLine.length, flatDictKey.length) * 0.5) {
        continue;
      }

      // 清音化した文字列で類似度を計算する
      const similarity = getSimilarity(flatLine, flatDictKey);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = {
          corrected: originalName,
          generic: extractGenericName(item['変換後(成分名)'] || originalName),
          similarity: similarity
        };
      }

      if (highestSimilarity === 1.0) {
        break;
      }
    }

    // 類似度の閾値（0.6以上）
    if (bestMatch && highestSimilarity >= 0.6) {
      return bestMatch;
    }
    return null;
  };

  const extractDrugNamesFromText = (input) => {
    if (!input) return [];

    const normalizeSearchText = (text) => {
      if (!text) return '';
      let normalized = text
        .replace(/\u3000/g, ' ')
        // 括弧とその中身を丸ごと削除（例：「トーワ」などを除去）
        .replace(/「[^」]*」/g, ' ')
        .replace(/『[^』]*』/g, ' ')
        .replace(/【[^】]*】/g, ' ')
        .replace(/［[^］]*］/g, ' ')
        .replace(/\[[^\]]*\]/g, ' ')
        .replace(/[「」『』【】［］\[\]]/g, ' ')
        .replace(/[()（）]/g, ' ');


      // 主要なメーカー名・屋号の除去
      const manufacturers = [
        'サワイ', '沢井', 'トーワ', '東和', '日医工', 'アメル', 'サンド', 'ファイザー', '武田テバ',
        'タカタ', '高田', '明治', '杏林', 'あすか', 'ケミファ', 'ＹＤ', 'yd', 'Ｙｄ', 'ＪＧ', 'jg',
        'Ｊｇ', 'ＮＰ', 'np', 'ＫＭＰ', 'kmp', '三和', '日新', '大原', 'オーハラ', '陽進堂', 'ツルハラ',
        'アスコット', 'マイラン', 'モチダ', '持田', 'ニプロ', 'テバ', 'ＥＥ', 'ee', 'ＥＭＥＣ', 'emec',
        'ＦＦＰ', 'ffp', 'ＮＰＩ', 'npi', 'ＴＣ', 'tc', 'ＴＣＫ', 'tck', 'ＶＴＲＳ', 'vtrs', 'ＺＥ', 'ze',
        'マルイシ', '丸石', 'シオエ', '塩野', 'ケンエー', '健栄', '山善', 'ヨシダ', '吉田', 'フジナガ',
        '藤永', 'コーワ', '興和', 'シオノギ', '塩野義', 'サンド', '武田', '第一三共', 'アステラス',
        'ファイザー', 'バイエル', 'ノバルティス', '中外', '大塚', 'エーザイ', '小野', '田辺三菱',
        '協和キリン', '塩野義', '大正', '日本ケミファ', '日本ジェネリック', '高田製薬', 'ダイト', '共創未来'
      ];
      const mfgRegex = new RegExp(`(${manufacturers.join('|')})`, 'gi');
      normalized = normalized.replace(mfgRegex, ' ');

      // 数値・単位・用法などの除去を剤形よりも先に行う（小数点付き数字がきれいに消えるように）
      normalized = normalized
        .replace(/[0-9０-９]+(?:\.?[0-9０-９]+)?\s*(mg|㎎|ｍｇ|mL|ｍL|ｍl|ml|％|%|錠|包|回|日|週間|月|日の|週|ｶﾌﾟｾﾙ|カプセル)/gi, '')
        .replace(/[0-9０-９]+/g, '')
        .replace(/(１日|1日|１回|1回|１回目|1回目|朝|昼|夕|就寝前|寝る前|朝食後|昼食後|夕食後|毎日|毎朝|毎夕|毎晩|毎食後|就寝前)/g, '');

      // 剤形の除去
      const formulations = [
        'ＯＤ錠', 'OD錠', 'ＯＤフィルム', 'ODフィルム', 'ＯＤ', 'OD', '錠', 'カプセル', 'ｶﾌﾟｾﾙ',
        '軟膏', 'クリーム', 'ゲル', '点眼液', '点耳液', '点鼻液', '貼付剤', 'テープ', 'パッチ',
        '細粒', '散', 'ドライシロップ', 'ＤＳ', 'DS', 'シロップ', '内用液', '液', 'ゼリー', '点眼',
        '点耳', '点鼻', '吸入', 'スプレー', 'ローション', 'パップ', 'テープ剤', '坐薬', 'サポ', '注',
        '注射液', '配合錠', '配合シロップ', '配合顆粒'
      ];
      const formRegex = new RegExp(`(${formulations.join('|')})`, 'gi');
      normalized = normalized.replace(formRegex, ' ');

      return normalized
        .replace(/\s+/g, '')
        .trim();
    };

    const segments = input
      .replace(/\u3000/g, ' ')
      .split(/[\n\r,；;、\t]+/)
      .map(segment => segment.trim())
      .filter(Boolean);

    const dictEntries = normalizationDict
      .filter(item => item['変換前(商品名/誤字)'])
      .map(item => {
        const key = item['変換前(商品名/誤字)'];
        return {
          key,
          normalizedKey: normalizeSearchText(key),
          value: item['変換後(成分名)'] || key,
        };
      })
      .sort((a, b) => b.normalizedKey.length - a.normalizedKey.length);

    const allProductEntries = masterDrugs
      .filter(item => item['商品名'])
      .map(item => ({
        key: item['商品名'],
        value: item['商品名'],
      }))
      .sort((a, b) => b.key.length - a.key.length);

    const cleanSegment = (segment) => {
      return segment
        .replace(/[Ｒr][ｐp][.\s]*\d*[)）]?/gi, '')
        .replace(/^[0-9０-９]+[．.]\s*/, '')
        .replace(/^[^ァ-ヶー一-龠ぁ-んa-zA-Z0-9０-９]+/, '')
        .replace(/[()（）]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const findBestProductMatch = (segmentText) => {
      const normalizedSegment = normalizeSearchText(segmentText);
      if (!normalizedSegment || normalizedSegment.length < 2) {
        return null;
      }

      const candidates = allProductEntries.filter(entry => {
        const normalizedKey = normalizeSearchText(entry.key);
        if (!normalizedKey) return false;
        if (normalizedKey === normalizedSegment) return true;
        if (normalizedKey.startsWith(normalizedSegment)) return true;
        if (normalizedSegment.startsWith(normalizedKey)) return true;
        if (normalizedSegment.length >= 4 && normalizedKey.includes(normalizedSegment)) return true;
        if (normalizedKey.length >= 4 && normalizedSegment.includes(normalizedKey)) return true;
        return false;
      });

      if (candidates.length === 0) {
        return null;
      }

      // 完全一致、前方一致、文字数の短い順（昇順）で賢く並び替える
      candidates.sort((a, b) => {
        const aNorm = normalizeSearchText(a.key);
        const bNorm = normalizeSearchText(b.key);

        // 1. 完全一致を優先
        const aExact = aNorm === normalizedSegment;
        const bExact = bNorm === normalizedSegment;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // 2. 前方一致を優先
        const aStarts = aNorm.startsWith(normalizedSegment);
        const bStarts = bNorm.startsWith(normalizedSegment);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // 3. 文字数が短い順（昇順）を優先（合剤の混入防止）
        return a.key.length - b.key.length;
      });

      return candidates[0];
    };

    const extractedSet = new Set();

    segments.forEach((segment) => {
      const segmentText = cleanSegment(segment);
      if (!segmentText) return;

      const match = findBestProductMatch(segmentText);
      if (match) {
        extractedSet.add(match.value);
      }
    });

    return [...extractedSet];
  };

  const normalizeDrug = (drugName) => {
    const entry = normalizationDict.find(item => item['変換前(商品名/誤字)'] === drugName);
    return entry ? entry['変換後(成分名)'] : drugName;
  };

  const findMasterRows = (drugName) => {
    if (!drugName) return [];

    // 商品名部分一致で探す
    const byProduct = masterDrugs.filter(item => item['商品名']?.includes(drugName));
    if (byProduct.length > 0) {
      const normalized = normalizeDrug(drugName);
      // 成分名が完全一致する「単剤」があるかチェック
      const singleIngredientMatches = byProduct.filter(item => item['成分名'] === normalized);
      if (singleIngredientMatches.length > 0) {
        return singleIngredientMatches; // 単剤があれば合剤を除外して返す
      }
      return byProduct;
    }

    // 成分名で探す場合も、まず完全一致を優先する
    const normalized = normalizeDrug(drugName);
    const exactIngredientMatches = masterDrugs.filter(item => item['成分名'] === normalized);
    if (exactIngredientMatches.length > 0) {
      return exactIngredientMatches;
    }
    return masterDrugs.filter(item => item['成分名']?.includes(normalized));
  };

  const getUniqueMasterValues = (rows) => {
    const drugCodes = [...new Set(rows.map(item => item['薬効分類コード']).filter(Boolean))];
    const ingredientCodes = [...new Set(rows.map(item => {
      const drugCode = item['薬効分類コード'];
      const group = item['成分グループ'];
      if (drugCode && group) {
        const drugCodeStr = String(drugCode).padStart(4, '0');
        const groupStr = String(group).padStart(3, '0');
        return drugCodeStr + groupStr;
      }
      return null;
    }).filter(Boolean))];

    return {
      drugCodes,
      ingredientCodes,
    };
  };

  const flattenTexts = (texts) => {
    return [...new Set(
      texts
        .flatMap(text => text ? text.split('｜') : [])
        .map(text => text.trim())
        .filter(Boolean)
    )];
  };

  const loadCSV = async (path) => {
    const response = await fetch(path);
    const text = await response.text();
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        complete: (results) => resolve(results.data),
        error: reject,
      });
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const normDict = await loadCSV('/data/medication-hostory-support-tool/normalization_dictionary.csv');
        setNormalizationDict(normDict);

        const master = await loadCSV('/data/medication-hostory-support-tool/master_drugs.csv');
        setMasterDrugs(master);

        const disease = await loadCSV('/data/medication-hostory-support-tool/assessment_code_lists_updated_disease_code.csv');
        setDiseaseCodeList(disease);

        const ingredient = await loadCSV('/data/medication-hostory-support-tool/assessment_code_lists_updated_ingredient_code.csv');
        setIngredientCodeList(ingredient);

        const common = await loadCSV('/data/medication-hostory-support-tool/assessment_code_lists_updated_common.csv');
        setCommonList(common);
      } catch (error) {
        console.error('Error loading CSV:', error);
      }
    };
    loadData();
  }, []);

  const searchAssessmentTexts = (masterRows) => {
    const { drugCodes, ingredientCodes } = getUniqueMasterValues(masterRows);

    // 疾患に基づく候補文章
    const diseaseEntries = diseaseCodeList.filter(item => drugCodes.includes(item['薬効分類コード']));
    const diseaseCategories = [...new Set(diseaseEntries.map(item => item['意味']).filter(Boolean))];

    const diseaseGroupMap = new Map();
    diseaseEntries.forEach(item => {
      const category = item['意味']?.trim();
      const textVal = item['服薬指導文章'];
      if (!category || !textVal) return;

      const texts = flattenTexts([textVal]);
      if (texts.length === 0) return;

      if (!diseaseGroupMap.has(category)) {
        diseaseGroupMap.set(category, []);
      }
      const existing = diseaseGroupMap.get(category);
      texts.forEach(t => {
        if (!existing.includes(t)) {
          existing.push(t);
        }
      });
    });
    const diseaseGroups = Array.from(diseaseGroupMap.entries()).map(([category, texts]) => ({
      category,
      texts,
    }));

    // 成分に基づく候補文章
    const ingredientEntries = ingredientCodeList.filter(item => {
      const itemCode = String(item['成分コード'] || '');
      return ingredientCodes.some(code => itemCode.startsWith(code) || code.startsWith(itemCode));
    });
    const ingredientCategories = [...new Set(ingredientEntries.map(item => item['意味']).filter(Boolean))];

    const ingredientGroupMap = new Map();
    ingredientEntries.forEach(item => {
      const category = item['意味']?.trim();
      const textVal = item['服薬指導文章'];
      if (!category || !textVal) return;

      const texts = flattenTexts([textVal]);
      if (texts.length === 0) return;

      if (!ingredientGroupMap.has(category)) {
        ingredientGroupMap.set(category, []);
      }
      const existing = ingredientGroupMap.get(category);
      texts.forEach(t => {
        if (!existing.includes(t)) {
          existing.push(t);
        }
      });
    });
    const ingredientGroups = Array.from(ingredientGroupMap.entries()).map(([category, texts]) => ({
      category,
      texts,
    }));

    const commonTexts = flattenTexts(commonList.map(item => item['意味']));

    return {
      diseaseCategories,
      disease: diseaseGroups,
      ingredientCategories,
      ingredient: ingredientGroups,
      common: commonTexts,
    };
  };

  const handleOcrFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target.result);
      setImageRotation(0);
      setShowRotationModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // ファイル入力をクリア
  };

  const executeOcrAfterRotation = async () => {
    if (!selectedImage) return;

    setShowRotationModal(false);
    setOcrLoading(true);
    setOcrStatus('画像の向きを処理中...');

    try {
      // 1. 画像の回転を実行してBlobを得る
      const rotatedBlob = await getRotatedImageBlob(selectedImage, imageRotation);

      setOcrStatus('OCRライブラリを準備中...');
      const Tesseract = await loadTesseract();

      setOcrStatus('画像を解析中...');
      const { data: { text } } = await Tesseract.recognize(
        rotatedBlob,
        'jpn',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setOcrStatus(`テキスト認識中: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      setOcrStatus('薬剤名を照合・補正中...');

      const lines = text.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean);
      const results = [];

      for (const line of lines) {
        const match = findBestOcrMatch(line);
        if (match) {
          if (!results.some(r => r.generic === match.generic)) {
            results.push({
              raw: line,
              corrected: match.corrected,
              generic: match.generic,
              similarity: match.similarity,
              checked: true
            });
          }
        }
      }

      if (results.length === 0) {
        alert('画像から薬剤情報を検出できませんでした。別の画像、または別の向きをお試しください。');
      } else {
        setOcrResults(results);
        setShowOcrModal(true);
      }
    } catch (err) {
      console.error(err);
      alert('OCR処理中にエラーが発生しました: ' + err.message);
    } finally {
      setOcrLoading(false);
      setOcrStatus('');
      setSelectedImage(null);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;

    const handleSuccess = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(handleSuccess)
        .catch((err) => {
          console.error('Clipboard API fail, using fallback:', err);
          fallbackCopy(text, handleSuccess);
        });
    } else {
      fallbackCopy(text, handleSuccess);
    }
  };

  const fallbackCopy = (text, onSuccess) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        onSuccess();
      } else {
        alert('コピーに失敗しました。手動で選択してコピーしてください。');
      }
    } catch (err) {
      console.error('Fallback copy fail:', err);
      alert('コピーに失敗しました。');
    }
  };

  const handleInputChange = (e) => {
    setInputDrug(e.target.value);
  };

  const handleSearch = () => {
    const extracted = extractDrugNamesFromText(inputDrug);
    if (extracted.length === 0) {
      setAssessmentTexts({ diseaseCategories: [], disease: [], ingredientCategories: [], ingredient: [], common: [] });
      setExtractedDrugNames([]);
      setNormalizedDrug('');
      setSelectedTexts([]);
      return;
    }

    setExtractedDrugNames(extracted);
    const matchedRows = extracted.flatMap(name => findMasterRows(name));
    const normalized = extracted.join('、');
    setNormalizedDrug(normalized);

    const rowsToSearch = matchedRows.length > 0
      ? matchedRows
      : extracted.flatMap(name => masterDrugs.filter(row => row['成分名']?.includes(normalizeDrug(name))));

    const texts = searchAssessmentTexts(rowsToSearch);
    setAssessmentTexts(texts);

    // 成分に基づく候補文章の各グループから、1つずつランダムに自動選択する
    const initialSelected = [];
    if (texts.ingredient && texts.ingredient.length > 0) {
      texts.ingredient.forEach(group => {
        if (group.texts && group.texts.length > 0) {
          const randomIndex = Math.floor(Math.random() * group.texts.length);
          initialSelected.push(group.texts[randomIndex]);
        }
      });
    }

    setSelectedTexts(initialSelected);
  };

  useEffect(() => {
    const assessment = selectedTexts.join('\n');
    setFinalAssessment(assessment);
    if (selectedTexts.length > 0) {
      navigator.clipboard.writeText(assessment).catch(err => console.error('コピー失敗:', err));
    }
  }, [selectedTexts]);


  const handleSelectText = (text) => {
    if (selectedTexts.includes(text)) {
      setSelectedTexts(selectedTexts.filter(t => t !== text));
    } else {
      setSelectedTexts([...selectedTexts, text]);
    }
  };

  const handleRandomSelect = () => {
    const newSelected = [];

    // 1. 疾患に基づく候補文章から各グループ1個ずつランダムに選ぶ
    if (assessmentTexts.disease && assessmentTexts.disease.length > 0) {
      assessmentTexts.disease.forEach(group => {
        if (group.texts && group.texts.length > 0) {
          const randomIndex = Math.floor(Math.random() * group.texts.length);
          newSelected.push(group.texts[randomIndex]);
        }
      });
    }

    // 2. 成分に基づく候補文章から各グループ1個ずつランダムに選ぶ
    if (assessmentTexts.ingredient && assessmentTexts.ingredient.length > 0) {
      assessmentTexts.ingredient.forEach(group => {
        if (group.texts && group.texts.length > 0) {
          const randomIndex = Math.floor(Math.random() * group.texts.length);
          newSelected.push(group.texts[randomIndex]);
        }
      });
    }

    // 3. 共通項目候補文章は選択なし

    setSelectedTexts(newSelected);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">薬歴サポートツール</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">薬の名前を入力:</label>
        <textarea
          value={inputDrug}
          onChange={handleInputChange}
          className="border border-gray-300 rounded px-3 py-2 w-full h-32"
          placeholder={`例:（薬剤ごとに改行をお願い致します）
アムロジピン5mgサワイ
コンサータ5mg 1日1回就寝前 1錠`}
        />
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer transition-colors"
          >
            検索
          </button>

          <label className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-1 cursor-pointer transition-colors select-none">
            📷 カメラ・写真から入力
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleOcrFileChange}
              className="hidden"
              disabled={ocrLoading}
            />
          </label>

          {ocrLoading && (
            <span className="text-sm text-slate-600 flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {ocrStatus}
            </span>
          )}
        </div>
      </div>


      {/*
      {normalizedDrug && (
        <div className="mb-4">
          <p>一般化された薬: {normalizedDrug}</p>
        </div>
      )}
*/}

      {/*
      {extractedDrugNames.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">抽出された薬剤:</h2>
          <div className="flex flex-wrap gap-2">
            {extractedDrugNames.map((name, index) => (
              <span key={`extracted-${index}`} className="bg-slate-100 text-slate-800 px-3 py-1 rounded-md text-sm">
                {name}
              </span>
            ))}
          </div>
        </div>
      )} */}


      {(assessmentTexts.diseaseCategories.length > 0 || assessmentTexts.ingredientCategories.length > 0 || assessmentTexts.common.length > 0) && (
        <div className="mb-4">
          {/* <h2 className="text-lg font-semibold mb-2">検索結果:</h2>

          {assessmentTexts.diseaseCategories.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold">疾患カテゴリ:</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {assessmentTexts.diseaseCategories.map((category, index) => (
                  <span key={`disease-cat-${index}`} className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-md text-sm">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {assessmentTexts.ingredientCategories.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold">成分カテゴリ:</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {assessmentTexts.ingredientCategories.map((category, index) => (
                  <span key={`ingredient-cat-${index}`} className="bg-sky-100 text-sky-900 px-3 py-1 rounded-md text-sm">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {assessmentTexts.common.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold">共通項目:</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {assessmentTexts.common.map((text, index) => (
                  <span key={`common-cat-${index}`} className="bg-amber-100 text-amber-900 px-3 py-1 rounded-md text-sm">
                    {text}
                  </span>
                ))}
              </div>
            </div>
          )} */}


          {assessmentTexts.disease.length > 0 && (
            <div className="mb-4 border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm">
              <h3
                onClick={() => setIsDiseaseOpen(!isDiseaseOpen)}
                className="font-semibold flex items-center justify-between p-3 text-slate-800 bg-slate-50/80 cursor-pointer select-none border-b border-slate-100 hover:bg-slate-100/70 transition-colors"
              >
                <span className="flex items-center gap-1.5 text-base">
                  🛡️ 疾患に基づく候補文章
                </span>
                <span className="text-slate-400 text-xs font-normal">
                  {isDiseaseOpen ? '▲ 閉じる' : '▼ 開く'}
                </span>
              </h3>
              {isDiseaseOpen && (
                <div className="space-y-4 p-4">
                  {assessmentTexts.disease.map((group, groupIndex) => (
                    <div key={`disease-group-${groupIndex}`} className="border-l-4 border-emerald-400 pl-3 py-1 bg-emerald-50/30 rounded-r-md">
                      <h4 className="font-bold text-emerald-800 text-sm mb-2">{group.category}</h4>
                      <ul className="space-y-2">
                        {group.texts?.map((text, index) => (
                          <li key={`disease-${groupIndex}-${index}`} className="flex items-start">
                            <label className="flex items-start cursor-pointer select-none w-full">
                              <input
                                type="checkbox"
                                checked={selectedTexts.includes(text)}
                                onChange={() => handleSelectText(text)}
                                className="mr-2 mt-1.5 flex-shrink-0"
                              />
                              <span className="text-slate-700 text-sm">{text}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {assessmentTexts.ingredient.length > 0 && (
            <div className="mb-4 border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm">
              <h3
                onClick={() => setIsIngredientOpen(!isIngredientOpen)}
                className="font-semibold flex items-center justify-between p-3 text-slate-800 bg-slate-50/80 cursor-pointer select-none border-b border-slate-100 hover:bg-slate-100/70 transition-colors"
              >
                <span className="flex items-center gap-1.5 text-base">
                  🧪 成分に基づく候補文章
                </span>
                <span className="text-slate-400 text-xs font-normal">
                  {isIngredientOpen ? '▲ 閉じる' : '▼ 開く'}
                </span>
              </h3>
              {isIngredientOpen && (
                <div className="space-y-4 p-4">
                  {assessmentTexts.ingredient.map((group, groupIndex) => (
                    <div key={`ingredient-group-${groupIndex}`} className="border-l-4 border-sky-400 pl-3 py-1 bg-sky-50/30 rounded-r-md">
                      <h4 className="font-bold text-sky-800 text-sm mb-2">{group.category}</h4>
                      <ul className="space-y-2">
                        {group.texts.map((text, index) => (
                          <li key={`ingredient-${groupIndex}-${index}`} className="flex items-start">
                            <label className="flex items-start cursor-pointer select-none w-full">
                              <input
                                type="checkbox"
                                checked={selectedTexts.includes(text)}
                                onChange={() => handleSelectText(text)}
                                className="mr-2 mt-1.5 flex-shrink-0"
                              />
                              <span className="text-slate-700 text-sm">{text}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {assessmentTexts.common.length > 0 && (
            <div className="mb-4 border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm">
              <h3
                onClick={() => setIsCommonOpen(!isCommonOpen)}
                className="font-semibold flex items-center justify-between p-3 text-slate-800 bg-slate-50/80 cursor-pointer select-none border-b border-slate-100 hover:bg-slate-100/70 transition-colors"
              >
                <span className="flex items-center gap-1.5 text-base">
                  📋 共通項目候補文章
                </span>
                <span className="text-slate-400 text-xs font-normal">
                  {isCommonOpen ? '▲ 閉じる' : '▼ 開く'}
                </span>
              </h3>
              {isCommonOpen && (
                <div className="p-4">
                  <ul className="space-y-2 border-l-4 border-amber-400 pl-3 py-1 bg-amber-50/30 rounded-r-md">
                    {assessmentTexts.common.map((text, index) => (
                      <li key={`common-${index}`} className="flex items-start">
                        <label className="flex items-start cursor-pointer select-none w-full">
                          <input
                            type="checkbox"
                            checked={selectedTexts.includes(text)}
                            onChange={() => handleSelectText(text)}
                            className="mr-2 mt-1.5 flex-shrink-0"
                          />
                          <span className="text-slate-700 text-sm">{text}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )
      }

      {
        finalAssessment && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">生成されたアセスメント:</h2>
            <textarea
              value={finalAssessment}
              onChange={(e) => setFinalAssessment(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full h-32"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => copyToClipboard(finalAssessment)}
                className={`px-4 py-2 rounded text-white font-semibold transition-colors duration-200 cursor-pointer ${copied ? 'bg-emerald-600' : 'bg-gray-500 hover:bg-gray-600'
                  }`}
              >
                {copied ? 'コピー完了！ ✓' : 'クリップボードへコピー'}
              </button>
              <button
                onClick={handleRandomSelect}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded transition-colors"
              >
                ランダムにチェックリストを選択
              </button>
            </div>
          </div>
        )
      }

      {/* OCR結果確認モーダル */}
      {showOcrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                  <span>📷 読み取り結果の確認・修正</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  画像から抽出されたお薬の一覧です。誤字が自動補正されています。
                </p>
              </div>
              <button
                onClick={() => setShowOcrModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-grow space-y-4">
              <div className="divide-y divide-gray-100">
                {ocrResults.map((item, index) => (
                  <div key={index} className="py-3 flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => {
                        const newResults = [...ocrResults];
                        newResults[index].checked = !newResults[index].checked;
                        setOcrResults(newResults);
                      }}
                      className="mt-1.5 flex-shrink-0 cursor-pointer h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 max-w-full truncate">
                          元の文字: {item.raw}
                        </span>
                        {item.similarity > 0 && item.similarity < 1.0 && (
                          <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 font-medium">
                            自動補正 (類似度: {Math.round(item.similarity * 100)}%)
                          </span>
                        )}
                      </div>

                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-500 font-medium">補正後の商品名:</label>
                          <input
                            type="text"
                            value={item.corrected}
                            onChange={(e) => {
                              const newResults = [...ocrResults];
                              newResults[index].corrected = e.target.value;
                              setOcrResults(newResults);
                            }}
                            className="border border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded px-2.5 py-1 text-sm w-full mt-0.5 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 font-medium">入力する名前 (成分・一般名):</label>
                          <input
                            type="text"
                            value={item.generic}
                            onChange={(e) => {
                              const newResults = [...ocrResults];
                              newResults[index].generic = e.target.value;
                              setOcrResults(newResults);
                            }}
                            className="border border-purple-300 bg-purple-50/20 focus:border-purple-500 focus:ring-purple-500 rounded px-2.5 py-1 text-sm w-full mt-0.5 font-semibold text-purple-800 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => setShowOcrModal(false)}
                className="px-4 py-2 border border-gray-300 text-slate-700 rounded text-sm hover:bg-slate-100 transition-colors cursor-pointer"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  const selectedDrugs = ocrResults
                    .filter(item => item.checked && item.generic.trim())
                    .map(item => item.generic.trim());

                  if (selectedDrugs.length > 0) {
                    const newText = inputDrug
                      ? `${inputDrug.trim()}\n${selectedDrugs.join('\n')}`
                      : selectedDrugs.join('\n');
                    setInputDrug(newText);
                  }
                  setShowOcrModal(false);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded text-sm font-semibold hover:bg-purple-700 transition-colors cursor-pointer shadow-sm"
              >
                選択した薬を入力欄に反映
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 画像確認・回転用モーダル */}
      {showRotationModal && selectedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">🔄 画像の向きを調整</h2>
                <p className="text-xs text-slate-500 mt-1">
                  文字が正しく上を向くように回転させてください。
                </p>
              </div>
              <button
                onClick={() => {
                  setShowRotationModal(false);
                  setSelectedImage(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow flex flex-col items-center justify-center bg-slate-100 min-h-[300px]">
              <div className="relative border border-slate-300 rounded bg-white p-2 shadow-inner overflow-hidden max-w-full flex items-center justify-center" style={{ minHeight: '260px' }}>
                <img
                  src={selectedImage}
                  alt="プレビュー"
                  className="max-w-full max-h-[50vh] object-contain transition-transform duration-200"
                  style={{ transform: `rotate(${imageRotation}deg)` }}
                />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setImageRotation((prev) => (prev - 90 + 360) % 360)}
                  className="bg-white border border-gray-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded text-sm flex items-center gap-1 transition-colors cursor-pointer"
                >
                  ↩️ 左に90度
                </button>
                <button
                  onClick={() => setImageRotation((prev) => (prev + 90) % 360)}
                  className="bg-white border border-gray-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded text-sm flex items-center gap-1 transition-colors cursor-pointer"
                >
                  ↪️ 右に90度
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRotationModal(false);
                  setSelectedImage(null);
                }}
                className="px-4 py-2 border border-gray-300 text-slate-700 rounded text-sm hover:bg-slate-100 transition-colors cursor-pointer"
              >
                キャンセル
              </button>
              <button
                onClick={executeOcrAfterRotation}
                className="px-5 py-2 bg-purple-600 text-white rounded text-sm font-semibold hover:bg-purple-700 transition-colors cursor-pointer shadow-sm"
              >
                この向きで読み取りを開始
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}

