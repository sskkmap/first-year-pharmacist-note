import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PrivacyPage() {
    return (
        <main style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, hsl(var(--primary) / 0.1), transparent 40%), radial-gradient(circle at bottom left, hsl(260, 60%, 60% / 0.1), transparent 40%)',
            paddingBottom: '4rem'
        }}>
            <Header />

            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid hsl(var(--secondary))' }}>
                        プライバシーポリシー
                    </h1>

                    <div className="article-content">
                        <h3>個人情報の利用目的</h3>
                        <p>
                            当ブログでは、お問い合わせや記事へのコメントの際、名前やメールアドレス等の個人情報を入力いただく場合がございます。<br />
                            取得した個人情報は、お問い合わせに対する回答や必要な情報を電子メールなどをでご連絡する場合に利用させていただくものであり、これらの目的以外では利用いたしません。
                        </p>

                        <h3>アクセス解析ツールについて</h3>
                        <p>
                            当ブログでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。<br />
                            このGoogleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
                        </p>

                        <h3>免責事項</h3>
                        <p>
                            当ブログからのリンクやバナーなどで移動したサイトで提供される情報、サービス等について一切の責任を負いません。<br />
                            また当ブログのコンテンツ・情報について、できる限り正確な情報を提供するように努めておりますが、正確性や安全性を保証するものではありません。情報が古くなっていることもございます。
                        </p>
                        <p>
                            当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますのでご了承ください。
                        </p>

                        <h3>著作権について</h3>
                        <p>
                            当ブログで掲載している文章や画像などにつきましては、無断転載することを禁止します。<br />
                            当ブログは著作権や肖像権の侵害を目的としたものではありません。著作権や肖像権に関して問題がございましたら、お問い合わせフォームよりご連絡ください。迅速に対応いたします。
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
