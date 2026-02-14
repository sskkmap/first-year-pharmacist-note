export default function Footer() {
    return (
        <footer style={{ marginTop: '4rem', textAlign: 'center', padding: '2rem', borderTop: '1px solid hsl(var(--secondary))', color: 'hsl(var(--foreground))', opacity: 0.6, fontSize: '0.9rem' }}>
            <p>&copy; 2024 Yakuzaishi Note. All rights reserved.</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                本サイトは処方意図の推測を補助する参考情報です。診断・治療を目的とはしていません。
            </p>
        </footer>
    );
}
