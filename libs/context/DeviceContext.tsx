// Phase 4 Task 9a — Device context provider
import { createContext, ReactNode } from 'react';
import { DeviceType } from '../utils/deviceDetect';

export const DeviceContext = createContext<DeviceType>('desktop');

interface Props {
	deviceType: DeviceType;
	children: ReactNode;
}

export function DeviceProvider({ deviceType, children }: Props) {
	return <DeviceContext.Provider value={deviceType}>{children}</DeviceContext.Provider>;
}
