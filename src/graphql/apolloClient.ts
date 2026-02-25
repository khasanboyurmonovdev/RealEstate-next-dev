import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const HARDCODE_AGENT_TOKEN_FOR_NOW = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OTlkZTVkMDYzZjRhN2QyYmQxYjMxZTAiLCJtZW1iZXJUeXBlIjoiQUdFTlQiLCJtZW1iZXJTdGF0dXMiOiJBQ1RJVkUiLCJtZW1iZXJBdXRoVHlwZSI6IlBIT05FIiwibWVtYmVyUGhvbmUiOiI5OTg5MDAwMDAwMDEiLCJtZW1iZXJOaWNrIjoiYWdlbnQxMiIsIm1lbWJlckltYWdlIjoiIiwibWVtYmVyUHJvcGVydGllcyI6MCwibWVtYmVyQXJ0aWNsZXMiOjAsIm1lbWJlckZvbGxvd2VycyI6MCwibWVtYmVyRm9sbG93aW5ncyI6MCwibWVtYmVyUG9pbnRzIjowLCJtZW1iZXJMaWtlcyI6MCwibWVtYmVyVmlld3MiOjAsIm1lbWJlckNvbW1lbnRzIjowLCJtZW1iZXJSYW5rIjowLCJtZW1iZXJXYXJuaW5ncyI6MCwibWVtYmVyQmxvY2tzIjowLCJjcmVhdGVkQXQiOiIyMDI2LTAyLTI0VDE3OjU0OjI0LjUyNloiLCJ1cGRhdGVkQXQiOiIyMDI2LTAyLTI0VDE3OjU0OjI0LjUyNloiLCJfX3YiOjAsImlhdCI6MTc3MTk1NTkwOSwiZXhwIjoxNzc0NTQ3OTA5fQ.fcC0WcfOifZDZEOPsCFSFT0SaXN7MiZMcskH4Apgay8';

const httpLink = new HttpLink({
	uri: 'http://localhost:3007/graphql',
});

const authLink = setContext((_, { headers }) => ({
	headers: {
		...headers,
		Authorization: `Bearer ${HARDCODE_AGENT_TOKEN_FOR_NOW}`,
	},
}));

export const client = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache(),
});
