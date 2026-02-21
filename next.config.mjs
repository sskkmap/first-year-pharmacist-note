/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        outputFileTracingIncludes: {
            '/articles/*': ['./app/data/articles/**/*'],
        },
    },
    serverExternalPackages: ['remark', 'remark-gfm', 'remark-rehype', 'rehype-slug', 'rehype-stringify', 'gray-matter'],
};

export default nextConfig;
