import { createClient } from '@supabase/auth-helpers-sveltekit';
import { SSE } from 'sse.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getPagination = (page: number, size: number) => {
	const limit = size ? +size : 5;
	const from = page ? page * limit : 0;
	const to = page ? from + size : size;

	return { from, to };
};

export const createEventSource = async (query: string, name = 'me', conversationHistory = '') => {
	const {
		data: { session }
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error('You must be logged in to use this feature');
	}

	const eventSource = new SSE(`${supabaseUrl}/functions/v1/chat-stream`, {
		headers: {
			Authorization: `Bearer ${session?.access_token}`,
			'Content-Type': 'application/json'
		},
		payload: JSON.stringify({
			query,
			name,
			conversationHistory,
			currentTime: new Date().toLocaleString()
			// customOpenAiKey: null // @TODO fetch the user's custom key
		})
	});
	return eventSource;
};
