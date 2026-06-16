export const dynamic = "force-dynamic";

// ここで各記事をMDからHTMLへ変更
import { getArticleData, getSortedArticlesData } from '../../lib/articles';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArticleContent from '../../components/ArticleContent';
import DaysCalc from '../../components/tools/DaysCalc';
import { categories } from '../../data/mockData';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import VisitManagementWrapper from '../../components/tools/VisitManagementWrapper';
import ZanyakuCalc from '../../components/tools/ZanyakuCalc';
import NarcoticPumpCalc from '../../components/tools/NarcoticPumpCalc';
import DaysCalculation from '../../components/tools/DaysCalculation';
import RenalCalc from '../../components/tools/RenalCalc';
import KampoSearch from '../../components/tools/KampoSearch';
import BmiCalc from '../../components/tools/BmiCalc';
import SteroidCalc from '../../components/tools/SteroidCalc';
import PotassiumCalc from '../../components/tools/PotassiumCalc';
import InsulinCalc from '../../components/tools/InsulinCalc';
import CpCalc from '../../components/tools/CpCalc';
import OpioidCalc from '../../components/tools/OpioidCalc';
import MedicationHistorySupportTool from '../../components/tools/MedicationHistorySupportTool';
import RandomArticleLinks from '../../components/homepege/RandomArticleLinks';

export function generateStaticParams() {
    const articles = getSortedArticlesData();
    return articles.map((article) => ({
        id: article.id,
    }));
}
export default async function ArticlePage({ params, searchParams }) {
    const { id } = await params;
    const allArticles = getSortedArticlesData();
    
    let articleData = null;
    let errorInfo = null;

    try {
        console.log(`[DEBUG - ArticlePage] Attempting to load article details for id: "${id}"`);
        articleData = await getArticleData(id);
        console.log(`[DEBUG - ArticlePage] getArticleData returned: ${articleData ? 'Data found' : 'null'}`);
    } catch (e) {
        console.error(`[CRITICAL - ArticlePage] Error during getArticleData for id "${id}":`, e);
        errorInfo = {
            message: e.message,
            stack: e.stack,
            step: 'getArticleData'
        };
    }

    if (errorInfo) {
        return (
            <main style={{ padding: '2rem', color: '#ff4444', fontFamily: 'monospace', background: '#1a1a1a', minHeight: '100vh' }}>
                <h1 style={{ fontSize: '1.8rem', borderBottom: '1px solid #ff4444', paddingBottom: '0.5rem' }}>
                    [デバッグ詳細] サーバーエラーが発生しました
                </h1>
                <p>この画面はエラーの原因を特定するための一時的なものです。</p>
                <div style={{ margin: '1.5rem 0' }}>
                    <strong>エラー発生位置:</strong> {errorInfo.step}<br />
                    <strong>エラーメッセージ:</strong>
                    <pre style={{ background: '#2d2d2d', padding: '1rem', borderRadius: '4px', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#fff' }}>
                        {errorInfo.stack || errorInfo.message}
                    </pre>
                </div>
                <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                    <p><strong>現在の作業ディレクトリ (process.cwd()):</strong> {process.cwd()}</p>
                    <p><strong>__dirname:</strong> {typeof __dirname !== 'undefined' ? __dirname : 'N/A'}</p>
                </div>
            </main>
        );
    }

    if (!articleData) {
        notFound();
    }

    // Draft / Coming Soon Logic
    const isPublished = articleData.published;

    // Static generation doesn't support searchParams at build time
    const preview = (await searchParams)?.preview;
    const isSecretPreview = preview === 'secret';
    const isDev = process.env.NODE_ENV === 'development';

    const canViewDraft = isPublished || isDev || isSecretPreview;

    if (!canViewDraft) {
        return (
            <main style={{
                minHeight: '100vh',
                background: 'radial-gradient(circle at top right, hsl(var(--primary) / 0.1), transparent 40%)',
                paddingBottom: '4rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Header />
                <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', width: '100%' }}>
                        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Coming Soon
                        </h1>
                        <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '2rem' }}>
                            この記事は現在作成中です。<br />
                            公開までもう少々お待ちください。
                        </p>
                        <Link href="/" className="btn btn-primary">
                            ホームに戻る
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    const categoryData = categories.find(c => c.name === articleData.category);
    // ... existing rendering logic ...
    const categoryColor = categoryData ? categoryData.color : 'hsl(var(--secondary))';
    // Create a background color with opacity based on the category color
    // Since color is HSL string, we can hack it or just use it as border/text
    // Let's use it as border and text, and a light background

    return (
        <main style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, hsl(var(--primary) / 0.1), transparent 40%)',
            paddingBottom: '4rem'
        }}>
            {/* Header / Nav */}
            <Header />

            <article className="container glass-panel" style={{ padding: '1rem' }}>
                {/* Article Header */}
                <header className="article-info-header" style={{ marginBottom: '2rem', borderBottom: '1px solid hsl(var(--secondary))', paddingBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-block',
                        fontSize: '0.9rem',
                        background: categoryData ? `color-mix(in srgb, ${categoryData.color} 15%, transparent)` : 'hsl(var(--secondary))',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '99px',
                        marginBottom: '1rem',
                        color: categoryData ? categoryData.color : 'hsl(var(--secondary-foreground))',
                        fontWeight: '600',
                        border: categoryData ? `1px solid ${categoryData.color}` : 'none'
                    }}>
                        {articleData.category}
                    </div>
                    {/* Draft Badge for Admin */}
                    {!isPublished && (
                        <span style={{
                            marginLeft: '0.5rem',
                            fontSize: '0.8rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: 'hsl(var(--destructive) / 0.1)',
                            color: 'hsl(var(--destructive))',
                            border: '1px solid hsl(var(--destructive))',
                            fontWeight: 'bold'
                        }}>
                            下書き (Draft)
                        </span>
                    )}
                    <h1 className="article-header-intro" style={{ fontSize: '2rem', fontWeight: '800', lineHeight: '1.3', marginBottom: '1rem' }}>
                        {articleData.title}
                    </h1>
                    <p className="article-header-intro" style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '1.5rem' }}>
                        {articleData.summary}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {articleData.tags?.map(tag => (
                            <span key={tag} style={{ fontSize: '0.8rem', color: 'hsl(var(--primary))' }}>#{tag}</span>
                        ))}
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.6 }}>
                        {articleData.date}
                    </div>
                </header>

                {/* Table of Contents */}
                {articleData.toc && articleData.toc.length > 0 && (
                    <div className="glass-panel article-page-toc" style={{
                        margin: '0 0 3rem 0',
                        padding: '1.5rem',
                        background: 'hsl(var(--secondary) / 0.3)',
                        borderRadius: '12px',
                        border: '1px solid hsl(var(--secondary))'
                    }}>
                        <div style={{ fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>目次</span>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {articleData.toc.map((item, index) => (
                                <li key={index} style={{
                                    marginBottom: '0.5rem',
                                    paddingLeft: item.level === 3 ? '1.5rem' : '0'
                                }}>
                                    <a
                                        href={`#${item.id}`}
                                        style={{
                                            textDecoration: 'none',
                                            color: 'hsl(var(--primary))',
                                            fontWeight: item.level === 2 ? '600' : '400',
                                            fontSize: '0.95rem',
                                            display: 'block',
                                            padding: '0.25rem 0',
                                            transition: 'opacity 0.2s'
                                        }}
                                        className="toc-link"
                                    >
                                        {item.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Medication History Support Tool */}
                {id === 'medication-history-support' && <MedicationHistorySupportTool />}

                {/* Article Content */}
                {id === 'days-calc' && <DaysCalc />}
                {id === 'visit-management' && <VisitManagementWrapper />}
                {id === 'zanyaku-calc' && <ZanyakuCalc />}
                {id === 'narcotic-pump' && <NarcoticPumpCalc />}
                {id === 'days-calculation' && <DaysCalculation />}
                {id === 'renal-calc' && <RenalCalc />}
                {id === 'kampo-search' && <KampoSearch />}
                {id === 'bmi-calc' && <BmiCalc />}
                {id === 'steroid-calc' && <SteroidCalc />}
                {id === 'potassium-calc' && <PotassiumCalc />}
                {id === 'insulin-calc' && <InsulinCalc />}
                {id === 'cp-calc' && <CpCalc />}
                {id === 'opioid-calc' && <OpioidCalc />}
                <ArticleContent html={articleData.contentHtml} />
            </article>

            <div className="container" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                <RandomArticleLinks articles={allArticles} />
            </div>

            <div className="container" style={{ minHeight: '60px', display: 'flex', alignItems: 'center' }}>
                <Link href="/" className="btn btn-primary back-home-button" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                    ← ホームに戻る
                </Link>
            </div>
            <Footer />
        </main>
    );
}
