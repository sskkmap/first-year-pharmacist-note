'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function MedicationHistorySupport() {
  const [inputDrug, setInputDrug] = useState('');
  const [normalizedDrug, setNormalizedDrug] = useState('');
  const [extractedDrugNames, setExtractedDrugNames] = useState([]);
  const [assessmentTexts, setAssessmentTexts] = useState({ diseaseCategories: [], disease: [], ingredientCategories: [], ingredient: [], common: [] });
  const [selectedTexts, setSelectedTexts] = useState([]);
  const [finalAssessment, setFinalAssessment] = useState('');

  // CSVデータを格納
  const [normalizationDict, setNormalizationDict] = useState([]);
  const [masterDrugs, setMasterDrugs] = useState([]);
  const [diseaseCodeList, setDiseaseCodeList] = useState([]);
  const [ingredientCodeList, setIngredientCodeList] = useState([]);
  const [commonList, setCommonList] = useState([]);

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

      const normalizedSeg = normalizeSearchText(segmentText);
      if (!normalizedSeg || normalizedSeg.length < 2) return;

      // 2-1. まずこのセグメントが辞書にあるか探す
      let foundInDict = false;
      for (let entry of dictEntries) {
        if (entry.normalizedKey && entry.normalizedKey.length >= 2) {
          if (normalizedSeg === entry.normalizedKey || normalizedSeg.includes(entry.normalizedKey)) {
            extractedSet.add(entry.value);
            foundInDict = true;
            break; // 最も長いマッチキーで確定
          }
        }
      }

      // 2-2. 辞書になければ、マスタから最も近い商品名を探す
      if (!foundInDict) {
        const match = findBestProductMatch(segmentText);
        if (match) {
          extractedSet.add(match.value);
        }
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
  // CSVを読み込む関数
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

  // 服薬指導文章を検索
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

    const firstText = (texts.disease[0]?.texts[0]) || (texts.ingredient[0]?.texts[0]) || texts.common[0] || '';
    if (firstText) {
      setSelectedTexts([firstText]);
    } else {
      setSelectedTexts([]);
    }
  };


  // selectedTexts が変わったらリアルタイムでアセスメント更新
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
        <input
          type="text"
          value={inputDrug}
          onChange={handleInputChange}
          className="border border-gray-300 rounded px-3 py-2 w-full"
          placeholder="例: アムロジピン5mgサワイ"
        />
        <button
          onClick={handleSearch}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          検索
        </button>
      </div>

      {normalizedDrug && (
        <div className="mb-4">
          <p>一般化された薬: {normalizedDrug}</p>
        </div>
      )}

      {(assessmentTexts.diseaseCategories.length > 0 || assessmentTexts.ingredientCategories.length > 0 || assessmentTexts.common.length > 0) && (
        <div className="mb-4">

          {assessmentTexts.disease.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold flex items-center flex-wrap gap-2 text-slate-800">
                <span>疾患に基づく候補文章</span>
                {/*
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  薬効分類コードのページより取得
                </span>
                */}
              </h3>
              <div className="space-y-4 mt-3">
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
            </div>
          )}

          {assessmentTexts.ingredient.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold flex items-center flex-wrap gap-2 text-slate-800">
                <span>成分に基づく候補文章</span>
                {/*
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  成分グループのページより取得
                </span>
                */}
              </h3>
              <div className="space-y-4 mt-3">
                {assessmentTexts.ingredient.map((group, groupIndex) => (
                  <div key={`ingredient-group-${groupIndex}`} className="border-l-4 border-sky-400 pl-3 py-1 bg-sky-50/30 rounded-r-md">
                    <h4 className="font-bold text-sky-800 text-sm mb-2">{group.category}</h4>
                    <ul className="space-y-2">
                      {group.texts?.map((text, index) => (
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
            </div>
          )}

          {assessmentTexts.common.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold flex items-center flex-wrap gap-2 text-slate-800">
                <span>共通項目候補文章</span>
                {/*
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  共通項目のページより取得
                </span>
                */}
              </h3>
              <ul className="space-y-2 mt-2 border-l-4 border-amber-400 pl-3 py-1 bg-amber-50/30 rounded-r-md">
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

      {finalAssessment && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">生成されたアセスメント:</h2>
          <textarea
            value={finalAssessment}
            onChange={(e) => setFinalAssessment(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full h-32"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => navigator.clipboard.writeText(finalAssessment)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              クリップボードへコピー
            </button>
            <button
              onClick={handleRandomSelect}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded transition-colors"
            >
              ランダムにチェックリストを選択
            </button>
          </div>
        </div>
      )}
    </div>
  );
}