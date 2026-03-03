// Phase 4 Task 8 — next/image optimization config
/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	env: {
		REACT_APP_API_URL: process.env.REACT_APP_API_URL,
		REACT_APP_API_GRAPHQL_URL: process.env.REACT_APP_API_GRAPHQL_URL,
		REACT_APP_API_WS: process.env.REACT_APP_API_WS,
	},
	images: {
		remotePatterns: [
			// Backend API — local development
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '3007',
				pathname: '/**',
			},
			// Backend API — production
			{
				protocol: 'https',
				hostname: 'api.ijaraly.uz',
				pathname: '/**',
			},
			// ngrok tunnel (used for Telegram auth / testing)
			{
				protocol: 'https',
				hostname: '*.ngrok-free.app',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '*.ngrok.io',
				pathname: '/**',
			},
			// Yandex Maps static images (Phase 3)
			{
				protocol: 'https',
				hostname: '*.maps.yandex.net',
			},
			{
				protocol: 'https',
				hostname: 'static-maps.yandex.ru',
			},
		],
		formats: ['image/avif', 'image/webp'],
		deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
		imageSizes: [16, 32, 48, 64, 96, 128, 256],
		minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
	},
};

const { i18n } = require('./next-i18next.config');
nextConfig.i18n = i18n;

module.exports = nextConfig;
