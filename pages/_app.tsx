// Phase 4 Task 6 — Mobile polish
// Phase 4 Task 9a — SSR device detection
import type { AppContext, AppProps } from 'next/app';
import NextApp from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useState } from 'react';
import { light } from '../scss/MaterialTheme';
import { ApolloProvider } from '@apollo/client';
import { initializeApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import { DeviceProvider } from '../libs/context/DeviceContext';
import { DeviceType } from '../libs/utils/deviceDetect';
import MobileBottomNav from '../libs/components/MobileBottomNav';

const client = initializeApollo();
import '../scss/app.scss';
import '../scss/mobile-globals.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

interface CustomAppProps extends AppProps {
	deviceType: DeviceType;
}

const App = ({ Component, pageProps, deviceType }: CustomAppProps) => {
	// @ts-ignore
	const [theme, setTheme] = useState(createTheme(light));
	return (
		<DeviceProvider deviceType={deviceType}>
			<ApolloProvider client={client}>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<Component {...pageProps} />
					<MobileBottomNav />
				</ThemeProvider>
			</ApolloProvider>
		</DeviceProvider>
	);
};

App.getInitialProps = async (appContext: AppContext) => {
	const appProps = await NextApp.getInitialProps(appContext);
	const req = appContext.ctx.req;

	let deviceType: DeviceType = 'desktop';
	if (req) {
		const { getDeviceType } = await import('../libs/utils/deviceDetect');
		deviceType = getDeviceType(req);
	} else if (typeof navigator !== 'undefined') {
		const { parseUserAgent } = await import('../libs/utils/deviceDetect');
		deviceType = parseUserAgent(navigator.userAgent);
	}

	return { ...appProps, deviceType };
};

export default appWithTranslation(App as any);
