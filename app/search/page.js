export const dynamic = "force-dynamic";

import Link from 'next/link';
import ArticleList from '../components/homepege/ArticleList';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchInput from '../components/SearchInput';
import { getArticlesForSearch } from '../lib/articles';

export default async function SearchPage({ searchParams }) {
    const params = await searchParams;
    const { q } = params ?? {};

    const matchedArticles = q ? getArticlesForSearch(q) : [];

    return (
        <main style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, hsl(var(--primary) / 0.1), transparent 40%)',
            paddingBottom: '4rem'
        }}>
            <Header />

            <div className="container">
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                        検索結果
                    </h1>
                    <p style={{ opacity: 0.7 }}>
                        "{q}" の検索結果: {matchedArticles.length} 件
                    </p>
                </div>

                <div style={{ maxWidth: '600px', margin: '0 auto 3rem' }}>
                    <SearchInput />
                </div>

                {matchedArticles.length > 0 ? (
                    <ArticleList articles={matchedArticles} title="該当記事一覧" horizontalScroll={false} />
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
                        <p>お探しの記事は見つかりませんでした。</p>
                        <p style={{ marginTop: '0.5rem' }}>別のキーワードで試してみてください。</p>
                    </div>
                )}
            </div>

            <div className="container" style={{ minHeight: '60px', display: 'flex', alignItems: 'center' }}>
                <Link href="/" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                    ← ホームに戻る
                </Link>
            </div>

            <Footer />
        </main>
    );
}