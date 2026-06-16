---
title: "麻薬換算（オピオイド換算）ツール"
date: "2026-05-03"
category: "ツール"
tags: ["ツール", "換算", "麻薬", "オピオイド", "緩和ケア"]
published: true
description: "オピオイドスイッチングやレスキュー量計算のためのモルヒネ等価換算ツールです。"
summary: "モルヒネ、オキシコドン、フェンタニル、ヒドロモルフォンなど、各種オピオイド鎮痛薬の等価量を相互に換算するツールです。"
---

モルヒネ、オキシコドン、フェンタニル、ヒドロモルフォンなど、各種オピオイド鎮痛薬の等価量を相互に換算するツールです。
基準となる薬剤の用量を入力すると、経口モルヒネ量に基づいて他の薬剤の等価量が自動計算されます。

> [!WARNING]
> 本ツールは富山大学などのオピオイドスイッチング換算表に基づく目安です（現在デバッグ・調整中）。
> 実際にオピオイドスイッチングを行う際は、交差耐性を考慮して**計算値から20〜30%減量**することが推奨されています。患者の痛みや副作用の状況を見ながら慎重に用量設定を行ってください。

## オピオイド鎮痛薬一覧 2024.5

<div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
<table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
  <thead>
    <tr>
      <th style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem', border: '1px solid white' }}>成分</th>
      <th style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem', border: '1px solid white' }}>薬剤名</th>
      <th style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem', border: '1px solid white' }}>剤型</th>
      <th style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem', border: '1px solid white' }}>規格</th>
      <th style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem', border: '1px solid white', textAlign: 'center' }}>ﾚｽｷｭｰ</th>
      <th style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem', border: '1px solid white' }}>投与経路</th>
      <th style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem', border: '1px solid white' }}>Tmax (hr)</th>
      <th style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem', border: '1px solid white' }}>T1/2 (hr)</th>
      <th style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem', border: '1px solid white' }}>投与間隔 (hr)</th>
      <th style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem', border: '1px solid white' }}>薬価</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowSpan="5" style={{ backgroundColor: '#ecfdf5', borderBottom: '2px solid #94a3b8', padding: '0.5rem', fontWeight: 'bold', verticalAlign: 'middle', textAlign: 'center' }}>モルヒネ</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>塩酸モルヒネ散(水剤)</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>液/散</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>－</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>◎</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>経口</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>0.3～1</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>2～4</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>4</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>22.43/10mg</td>
    </tr>
    <tr>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>オプソ</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>液</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>5mg<br/>10mg</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>◎</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>経口</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>0.3～1</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>2～4</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>定期:4<br/>ﾚｽｷｭｰ:1</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>171.8<br/>211.9</td>
    </tr>
    <tr>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>*アンペック坐剤</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>坐</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>10mg<br/>20mg<br/>30mg</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>◎</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>直腸内</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>1.3～1.5</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>4.2～6</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>定期:6～12<br/>ﾚｽｷｭｰ:2</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>320.1<br/>612.9<br/>866.3</td>
    </tr>
    <tr>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>MSコンチン</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>錠</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>10mg<br/>*30mg<br/>*60mg</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>×</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>経口</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>2～4</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>2～3</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>12(8)</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>245.6<br/>713.5<br/>1288.1</td>
    </tr>
    <tr>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>モルヒネ塩酸塩</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>注</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>10mg<br/>50mg</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem', textAlign: 'center' }}>〇</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>皮下/静注</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>-</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>2</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>-</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>305<br/>1371</td>
    </tr>
    <tr>
      <td rowSpan="3" style={{ backgroundColor: '#f0fdf4', borderBottom: '2px solid #94a3b8', padding: '0.5rem', fontWeight: 'bold', verticalAlign: 'middle', textAlign: 'center' }}>オキシコドン</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>オキシコンチンTR</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>錠</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>5mg<br/>*10mg<br/>20mg<br/>40mg</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>×</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>経口</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>2～5</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>4</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>12(8)</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>121.4<br/>233.6<br/>433.7<br/>799.1</td>
    </tr>
    <tr>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>オキノーム</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>散</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>2.5mg<br/>5mg<br/>10mg<br/>*20mg</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>◎</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>経口</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>1.7～1.9</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>4.5～6</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>定期:6<br/>ﾚｽｷｭｰ:1</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>53.8<br/>111.2<br/>220.7<br/>457.5</td>
    </tr>
    <tr>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>オキシコドン</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>注</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>10mg<br/>50mg</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem', textAlign: 'center' }}>〇</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>皮下/静注</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>-</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>3～4</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>-</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>141<br/>653</td>
    </tr>
    <tr>
      <td rowSpan="3" style={{ backgroundColor: '#ecfdf5', borderBottom: '2px solid #94a3b8', padding: '0.5rem', fontWeight: 'bold', verticalAlign: 'middle', textAlign: 'center' }}>フェンタニル</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>フェントステープ</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>貼布</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>0.5mg<br/>1mg<br/>2mg<br/>4mg<br/>*6mg<br/>8mg</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>×</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>経皮</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>18～26</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>20～26</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>24<br/>(1d)</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>266.7<br/>491.3<br/>914.4<br/>1701.5<br/>2552<br/>3275.6</td>
    </tr>
    <tr>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>アブストラル</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>錠</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>100μg<br/>200μg<br/>*400μg</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>〇</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>舌下</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>0.5～1</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>5～13</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>添付文章参照</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>536.1<br/>759.9<br/>940.7</td>
    </tr>
    <tr>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>フェンタニル</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>注</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>0.1mg<br/>0.5mg</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem', textAlign: 'center' }}>〇</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>皮下/静注</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>-</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>3.5</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>-</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>181<br/>851</td>
    </tr>
    <tr>
      <td rowSpan="3" style={{ backgroundColor: '#f0fdf4', borderBottom: '2px solid #94a3b8', padding: '0.5rem', fontWeight: 'bold', verticalAlign: 'middle', textAlign: 'center' }}>ヒドロモルフォン</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>ナルサス</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>錠</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>2mg<br/>6mg<br/>12mg<br/>*24mg</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>×</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>経口</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>3.3～5</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>8.88～16.8</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>24</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>206.6<br/>540.0<br/>990.2<br/>1815.8</td>
    </tr>
    <tr>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>ナルラピド</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>錠</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>1mg<br/>*2mg<br/>4mg</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>◎</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>経口</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>0.5～1</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>5.3～18.3</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>定期:6<br/>ﾚｽｷｭｰ:1</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>112.6<br/>206.6<br/>378.8</td>
    </tr>
    <tr>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>ナルベイン</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>注</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>2mg<br/>*20mg</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem', textAlign: 'center' }}>〇</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>皮下/静注</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>－</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>静注:2.5<br/>皮下:2～9</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>-</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>738<br/>6457</td>
    </tr>
    <tr>
      <td style={{ backgroundColor: '#ecfdf5', borderBottom: '2px solid #94a3b8', padding: '0.5rem', fontWeight: 'bold', verticalAlign: 'middle', textAlign: 'center' }}>メサドン</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>メサペイン</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>錠</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>5mg<br/>*10mg</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem', textAlign: 'center' }}>×</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>経口</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>3～7</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>初期:4～8<br/>継続:22～48</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>8～12</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>184.8<br/>351.2</td>
    </tr>
    <tr>
      <td style={{ backgroundColor: '#f0fdf4', borderBottom: '2px solid #94a3b8', padding: '0.5rem', fontWeight: 'bold', verticalAlign: 'middle', textAlign: 'center' }}>タペンタドール</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>*タペンタ</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>錠</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>25mg<br/>50mg<br/>100mg</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem', textAlign: 'center' }}>×</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>経口</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>5</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>5～6</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>12</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>110.7<br/>210.1<br/>399.0</td>
    </tr>
    <tr>
      <td rowSpan="2" style={{ backgroundColor: '#ecfdf5', borderBottom: '2px solid #94a3b8', padding: '0.5rem', fontWeight: 'bold', verticalAlign: 'middle', textAlign: 'center' }}>トラマドール</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>トラマドール<br/>塩酸塩OD</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>錠</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>25mg<br/>*50mg</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>◎</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>経口</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>ﾄﾗﾏﾄﾞｰﾙ:1～1.5<br/>M1:1～2</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>ﾄﾗﾏﾄﾞｰﾙ:5～7<br/>M1:6～9</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>6</td>
      <td style={{ borderBottom: '1px solid #cbd5e1', padding: '0.5rem' }}>10.3<br/>18.1</td>
    </tr>
    <tr>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>ワントラム</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>錠</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>100mg</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem', textAlign: 'center' }}></td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>経口</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>7～12</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>5～8</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>24</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>77.8</td>
    </tr>
    <tr>
      <td style={{ backgroundColor: '#f0fdf4', borderBottom: '2px solid #94a3b8', padding: '0.5rem', fontWeight: 'bold', verticalAlign: 'middle', textAlign: 'center' }}>コデイン</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>コデインリン酸塩</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>錠<br/>散1%</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>*5mg<br/>20mg<br/>1g</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem', textAlign: 'center' }}>◎</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>経口</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>0.6～1</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>2</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>8</td>
      <td style={{ borderBottom: '2px solid #94a3b8', padding: '0.5rem' }}>10.1<br/>77<br/>10.2/1g</td>
    </tr>
  </tbody>
</table>
</div>
<div style={{ fontSize: '0.8rem', opacity: 0.7 }}>参考: 富山大学附属病院 オピオイドスイッチング換算表</div>
