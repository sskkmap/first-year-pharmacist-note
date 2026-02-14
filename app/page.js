//ホームページ
import Profile from './components/homepege/Profile';
import CategoryList from './components/homepege/CategoryList';
import ArticleList from './components/homepege/ArticleList';
import Header from './components/Header';
import Footer from './components/Footer';
import { getSortedArticlesData } from './lib/articles';

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
        <CategoryList />
        <ArticleList articles={allArticles} />
      </div>

      <Footer />
    </main>
  );
}
