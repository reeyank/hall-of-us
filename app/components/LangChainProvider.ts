import type {
	CustomParams,
	ProviderImplementation,
	InferProviderConfig,
	StructuredParams,
	LLMResponse,
	StreamHandler,
	StreamResponse,
	StreamEvent,
} from '@cedar-os/core';

type CustomConfig = InferProviderConfig<'custom'>;

const LangChainProvider: ProviderImplementation<
	CustomParams,
	CustomConfig
> = {
	callLLM: async (params, config) => {
		const { prompt, systemPrompt, temperature, maxTokens, ...rest } = params;
		console.log('callLLM: LangChainProvider called with params:', params);

		const response = await fetch(`http://localhost:8000/langchain/completions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${config.config.apiKey}`,
			},
			body: JSON.stringify({
				messages: [
					...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
					{ role: 'user', content: prompt },
				],
				temperature,
				max_tokens: maxTokens,
				...rest,
			}),
		});

		console.log('callLLM: LangChainProvider received response:', response);

		return LangChainProvider.handleResponse(response);
	},

	callLLMStructured: async (params, config) => {
		const {
			prompt,
			systemPrompt,
			schema,
			schemaName,
			schemaDescription,
			...rest
		} = params;
		console.log('callLLMStructured: LangChainProvider called with params:', params);

		const body = {
			messages: [
				...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
				{ role: 'user', content: prompt },
			],
			...rest,
		};
		console.log('callLLMStructured: Request body before schema:', body);

		// Add schema for structured output (format depends on your API)
		if (schema) {
			console.log('callLLMStructured: Adding schema to request body:', {
				name: schemaName || 'response',
				description: schemaDescription,
				schema: schema,
			});
			body.response_format = {
				type: 'json_schema',
				json_schema: {
					name: schemaName || 'response',
					description: schemaDescription,
					schema: schema,
				},
			};
		}

		const response = await fetch('http://localhost:8000/langchain/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${config.config.apiKey}`,
			},
			body: JSON.stringify(body),
		});

		const result = await LangChainProvider.handleResponse(response);
		console.log('callLLMStructured: Received result:', result);

		// Parse structured output if schema was provided
		if (schema && result.content) {
			try {
				result.object = JSON.parse(result.content);
			} catch {
				// Leave object undefined if parsing fails
			}
		}

		return result;
	},

	streamLLM: (params, config, handler) => {
		console.log('streamLLM: LangChainProvider called with params:', params);
		const abortController = new AbortController();

		const completion = (async () => {
			try {
				const { prompt, systemPrompt, temperature, maxTokens, ...rest } = params;

				const response = await fetch('http://localhost:8000/langchain/completions', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${config.config.apiKey}`,
					},
					body: JSON.stringify({
						messages: [
							...(systemPrompt
								? [{ role: 'system', content: systemPrompt }]
								: []),
							{ role: 'user', content: prompt },
						],
						temperature,
						max_tokens: maxTokens,
						stream: true, // Enable streaming
						...rest,
					}),
					signal: abortController.signal,
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				// Handle Server-Sent Events stream
				await LangChainProvider.handleEventStream(response, {
					onMessage: (chunk) => {
						// Parse your API's streaming format
						try {
							const data = JSON.parse(chunk);
							const content = data.choices?.[0]?.delta?.content || '';
							if (content) {
								handler({ type: 'chunk', content });
							}
						} catch {
							// Skip parsing errors
						}
					},
					onDone: () => {
						handler({ type: 'done' });
					},
				});
			} catch (error) {
				if (error instanceof Error && error.name !== 'AbortError') {
					handler({ type: 'error', error });
				}
			}
		})();

		return {
			abort: () => abortController.abort(),
			completion,
		};
	},

	handleResponse: async (response) => {
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return {
			content: data.response || data.text || '',
			usage: data.usage,
			metadata: { model: data.model, id: data.id },
		};
	},

	handleEventStream: async (response, { onMessage, onDone }) => {
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let buffer = '';

		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() || ''; // Keep incomplete line in buffer

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const data = line.slice(6).trim();
						if (data === '[DONE]') {
							onDone();
							return;
						}
						if (data) {
							onMessage(data);
						}
					}
				}
			}
		} finally {
			reader.releaseLock();
		}
	},
};

export default LangChainProvider;
