export const dynamic = 'force-dynamic';

//カテゴリによって表示する記事を変更
import Link from 'next/link';
import ArticleList from '../../components/homepege/ArticleList';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getArticlesByCategory, getSortedArticlesData } from '../../lib/articles';
import { categories } from '../../data/mockData';

// 静的エクスポート用: 全カテゴリのパスを事前生成
export function generateStaticParams() {
    const allCategories = categories.map((c) => ({
        category: c.name,
    }));
    // 'all' カテゴリも追加
    allCategories.push({ category: 'all' });
    return allCategories;
}

export default async function CategoryPage({ params }) {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);

    let categoryArticles;
    if (decodedCategory === 'all') {
        categoryArticles = getSortedArticlesData();
    } else {
        categoryArticles = getArticlesByCategory(decodedCategory);
    }

    return (
        <main style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, hsl(var(--primary) / 0.1), transparent 40%)',
            paddingBottom: '4rem'
        }}>
            {/* Header / Nav */}
            <Header />

            <div className="container">
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                        {decodedCategory}
                    </h1>
                    <p style={{ opacity: 0.7 }}>カテゴリー記事一覧</p>
                </div>

                {categoryArticles.length > 0 ? (
                    <ArticleList articles={categoryArticles} horizontalScroll={false} />
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
                        記事が見つかりませんでした。
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
