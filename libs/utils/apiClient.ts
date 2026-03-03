// Phase 4 Task 9a — API client with device hint headers

export function getApiHeaders(deviceType?: string, authToken?: string): HeadersInit {
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
	};
	if (deviceType) {
		headers['X-Device-Type'] = deviceType;
	}
	if (authToken) {
		headers['Authorization'] = `Bearer ${authToken}`;
	}
	return headers;
}
