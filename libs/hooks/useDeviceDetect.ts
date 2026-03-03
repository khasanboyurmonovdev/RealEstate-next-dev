// Phase 4 Task 9a — Rewritten to read from DeviceContext (SSR-safe)
import { useContext } from 'react';
import { DeviceContext } from '../context/DeviceContext';

const useDeviceDetect = (): string => {
	return useContext(DeviceContext);
};

export default useDeviceDetect;
