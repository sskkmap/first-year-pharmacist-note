---
title: "ステロイド換算ツール"
date: "2026-05-03"
category: "ツール"
tags: ["ツール", "換算", "ステロイド", "プレドニゾロン"]
published: true
description: "ヒドロコルチゾン、プレドニゾロン、デキサメタゾンなど各種ステロイドの等価量を自動計算します。"
summary: "ヒドロコルチゾン、プレドニゾロン、デキサメタゾンなど各種ステロイドの等価量を自動計算します。"
---

ステロイド製剤の力価を換算するためのツールです。
いずれかのステロイドの投与量を入力すると、他のステロイドの等価量が自動で計算されます。

プレドニゾロン換算など、日常業務での素早い計算にご活用ください。

> [!WARNING]
> 本ツールによる換算値はあくまで一般的な目安です。実際の投与量設定にあたっては、患者の病態、肝機能、腎機能、半減期などを総合的に考慮してください。

## ステロイド力価・作用時間一覧表

<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', margin: '1.5rem 0', fontSize: '0.95rem' }}>
  <thead>
    <tr>
      <th style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '0.75rem', borderRight: '1px solid white', textAlign: 'center' }}>作用時間</th>
      <th style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '0.75rem', borderRight: '1px solid white' }}>一般名<br/>(商品名)</th>
      <th style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '0.75rem', borderRight: '1px solid white', textAlign: 'center' }}>概算<br/>等力価<sup>a</sup></th>
      <th style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '0.75rem', borderRight: '1px solid white', textAlign: 'center' }}>糖質<br/>作用</th>
      <th style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '0.75rem', textAlign: 'center' }}>鉱質<br/>作用</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowSpan="2" style={{ backgroundColor: '#e0f2fe', padding: '0.75rem', borderBottom: '1px solid #cbd5e1', verticalAlign: 'middle', fontWeight: 'bold', textAlign: 'center' }}>短時間<br/><span style={{fontWeight:'normal', fontSize:'0.85em', color:'#475569'}}>8～12H</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}><strong>ヒドロコルチゾン</strong><br/><span style={{fontSize:'0.85em'}}>(コートリル®、ソルコーテフ®)</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '1.1em', textAlign: 'center' }}>20<span style={{fontSize:'0.8em'}}>mg</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc', textAlign: 'center' }}>1</td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc', textAlign: 'center' }}>1</td>
    </tr>
    <tr>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}><strong>コルチゾン</strong><br/><span style={{fontSize:'0.85em'}}>(コートン®)</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontSize: '1.1em', textAlign: 'center' }}>25<span style={{fontSize:'0.8em'}}>mg</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', textAlign: 'center' }}>0.8</td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', textAlign: 'center' }}>0.8</td>
    </tr>
    <tr>
      <td rowSpan="4" style={{ backgroundColor: '#f1f5f9', padding: '0.75rem', borderBottom: '1px solid #cbd5e1', verticalAlign: 'middle', fontWeight: 'bold', textAlign: 'center' }}>中間<br/><span style={{fontWeight:'normal', fontSize:'0.85em', color:'#475569'}}>12～36H</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}><strong>プレドニゾロン</strong><br/><span style={{fontSize:'0.85em'}}>(プレドニン®)</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '1.1em', textAlign: 'center' }}>5<span style={{fontSize:'0.8em'}}>mg</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc', textAlign: 'center' }}>4</td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc', textAlign: 'center' }}>0.8</td>
    </tr>
    <tr>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}><strong>メチルプレドニゾロン</strong><br/><span style={{fontSize:'0.85em'}}>(メドロール®、ソル・メドロール®)</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontSize: '1.1em', textAlign: 'center' }}>4<span style={{fontSize:'0.8em'}}>mg</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', textAlign: 'center' }}>5</td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', textAlign: 'center' }}>0.5</td>
    </tr>
    <tr>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}><strong>トリアムシノロン</strong><br/><span style={{fontSize:'0.85em'}}>(レダコート®)</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '1.1em', textAlign: 'center' }}>4<span style={{fontSize:'0.8em'}}>mg</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc', textAlign: 'center' }}>5</td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc', textAlign: 'center' }}>0</td>
    </tr>
    <tr>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}><strong>フルドロコルチゾン</strong><sup>b</sup><br/><span style={{fontSize:'0.85em'}}>(フロリネフ®)</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', textAlign: 'center' }}>— *</td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', textAlign: 'center' }}>10～15</td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', textAlign: 'center' }}>125～150</td>
    </tr>
    <tr>
      <td rowSpan="2" style={{ backgroundColor: '#e0f2fe', padding: '0.75rem', borderBottom: '1px solid #cbd5e1', verticalAlign: 'middle', fontWeight: 'bold', textAlign: 'center' }}>長時間<br/><span style={{fontWeight:'normal', fontSize:'0.85em', color:'#475569'}}>36～72H</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}><strong>デキサメタゾン</strong><br/><span style={{fontSize:'0.85em'}}>(デカドロン®)</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '1.1em', textAlign: 'center' }}>0.75<span style={{fontSize:'0.8em'}}>mg</span><br/><span style={{fontSize:'0.7em'}}>(0.5mg<sup>c</sup>)</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc', textAlign: 'center' }}>25<br/><span style={{fontSize:'0.8em'}}>(30～60<sup>c</sup>)</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc', textAlign: 'center' }}>0</td>
    </tr>
    <tr>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}><strong>ベタメタゾン</strong><br/><span style={{fontSize:'0.85em'}}>(リンデロン®)</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontSize: '1.1em', textAlign: 'center' }}>0.75<span style={{fontSize:'0.8em'}}>mg</span><br/><span style={{fontSize:'0.7em'}}>(0.5mg<sup>c</sup>)</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', textAlign: 'center' }}>25<br/><span style={{fontSize:'0.8em'}}>(24～40<sup>c</sup>)</span></td>
      <td style={{ padding: '0.75rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', textAlign: 'center' }}>0</td>
    </tr>
  </tbody>
</table>

<div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '1rem', lineHeight: '1.6' }}>
a: ステロイド力価の等価性は、経口投与および／または静脈内投与に適用される。鉱質作用は考慮されていない。<br />
b: Allergy Asthma Clin Immunol. 2013;9(1):30.<br />
*: 鉱質作用がフルドロコルチゾン0.1mgに相当するステロイド量は、プレドニゾロン50mg、もしくはヒドロコルチゾン20mg<br />
c: J Clin Endocrinol Metab. 2024 Jun 17;109(7):1657-1683.
</div>

## ステロイド選択の考え方

各ステロイドの使い分けや特徴を以下にまとめます。

| 薬剤名 | 特徴・用途 | 注意点・適さないケース |
| :--- | :--- | :--- |
| **プレドニゾン<br>(プレドニゾロン)** | ・最も広く使用される全身性ステロイド<br>・鉱質活性に対して糖質活性が高い<br>・抗炎症・免疫抑制目的で用いられる | — |
| **メチルプレドニゾロン** | ・プレドニゾロンに類似<br>・鉱質活性がさらに低いため、水分貯留が望ましくない場合に適する | — |
| **デキサメタゾン** | ・鉱質活性が最小限<br>・プレドニゾロンより力価が高く、作用時間が長い | ・HPA軸抑制をきたすため、重症急性期の短期使用に限られる<br>・作用時間が長く、隔日投与には不向き |
| **コルチゾン / <br>ヒドロコルチゾン** | ・最も力価が低い<br>・糖質・鉱質の両活性を有するため、副腎不全の補充療法に好まれる | — |
| **フルドロコルチゾン** | ・鉱質活性が強い<br>・アジソン病や先天性副腎過形成（塩喪失型）のアルドステロン補充に用いられる | — |
