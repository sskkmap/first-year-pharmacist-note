/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    outputFileTracingIncludes: {
        '/articles/[id]': ['./data-articles/**/*'],
        '/': ['./data-articles/**/*'],
    },
    experimental: {
    },
};

export default nextConfig;
