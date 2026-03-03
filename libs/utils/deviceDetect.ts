// Phase 4 Task 9a — Device detection utility
import { IncomingMessage } from 'http';
import { useContext } from 'react';
import { DeviceContext } from '../context/DeviceContext';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function parseUserAgent(ua: string): DeviceType {
	const tablet = /iPad|Android(?!.*Mobile)|Tablet/i;
	const mobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;

	if (tablet.test(ua)) return 'tablet';
	if (mobile.test(ua)) return 'mobile';
	return 'desktop';
}

export function getDeviceType(req?: IncomingMessage): DeviceType {
	const ua = req?.headers['user-agent'] || '';
	return parseUserAgent(ua);
}

export function useDeviceType(): DeviceType {
	return useContext(DeviceContext);
}

export function useIsMobile(): boolean {
	const device = useDeviceType();
	return device === 'mobile';
}

export function useIsTablet(): boolean {
	const device = useDeviceType();
	return device === 'tablet';
}

export function useIsDesktop(): boolean {
	const device = useDeviceType();
	return device === 'desktop';
}
