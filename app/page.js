export const dynamic = 'force-dynamic';

//ホームページ
import Profile from './components/homepege/Profile';
import CategoryList from './components/homepege/CategoryList';
import ArticleList from './components/homepege/ArticleList';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchInput from './components/SearchInput';
import RandomArticleLinks from './components/homepege/RandomArticleLinks';
import { getSortedArticlesData } from './lib/articles';
import { categories } from './data/mockData';

export default async function HomePage() {
  const allArticles = getSortedArticlesData();

  return (
    <main style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, hsl(var(--primary) / 0.1), transparent 40%), radial-gradient(circle at bottom left, hsl(260, 60%, 60% / 0.1), transparent 40%)',
      paddingBottom: '4rem'
    }}>
      <Header />

      <div className="container">
        <Profile />

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <span style={{
            fontSize: '0.9rem',
            color: 'hsl(var(--primary))',
            background: 'hsl(var(--primary) / 0.1)',
            padding: '0.3rem 1.2rem',
            borderRadius: '2rem',
            fontWeight: '600',
            border: '1px solid hsl(var(--primary) / 0.2)'
          }}>
            全 {allArticles.length} 記事 公開中
          </span>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <SearchInput />
        </div>
        <CategoryList articles={allArticles} />

        <ArticleList articles={allArticles.slice(0, 6)} title="最新記事" viewMoreLink="/categories/all" /> {/* Limited to 6 for "Latest" */}
        {/* Actually, existing code passed allArticles. Let's keep it but maybe limit it if we show categories below? 
            User request: "最新記事の下にカテゴリ毎の記事を最新記事と同様に表示したい".
            So keep allArticles (Latest) as is, maybe limit to 5 if it gets too long, but user didn't ask to limit Latest.
        */}

        <div style={{ marginTop: '3rem' }}>
          {categories.map(category => {
            const categoryArticles = allArticles.filter(a => a.category === category.name).slice(0, 6);
            if (categoryArticles.length === 0) return null;

            return (
              <div key={category.id} style={{ marginBottom: '3rem' }}>
                <ArticleList
                  articles={categoryArticles}
                  title={`${category.name}`}
                  viewMoreLink={`/categories/${category.name}`}
                />
              </div>
            );
          })}
        </div>
        <RandomArticleLinks articles={allArticles} />
      </div>

      <Footer />
    </main>
  );
}
