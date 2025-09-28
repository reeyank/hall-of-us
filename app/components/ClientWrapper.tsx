"use client";

import { CedarCopilot, ProviderConfig } from "cedar-os";
import type {
  CustomParams,
  BaseParams,
  LLMResponse,
  StreamHandler,
  StreamResponse,
  StreamEvent,
} from "cedar-os";
import { AuthProvider } from "./AuthProvider";

// Define custom parameter types for additional payload
interface LangChainCustomParams extends CustomParams {
  // Add any LangChain-specific parameters here
  // For example:
  // model?: string;
  // frequency_penalty?: number;
  // presence_penalty?: number;
  // top_p?: number;
  // stop?: string[];
  // [key: string]: unknown; // Already included via CustomParams
}

type LangChainConfig = { provider: 'custom'; config: Record<string, unknown> };

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const LangChainProvider: ProviderConfig = {
    provider: "custom",
    config: {
      callLLM: async (params: LangChainCustomParams, config: LangChainConfig): Promise<LLMResponse> => {
        const { prompt, systemPrompt, temperature, maxTokens, ...rest } =
          params;
        console.log("callLLM: LangChainProvider called with params:", params);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}langchain/completions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${config.config.apiKey}`,
            },
            body: JSON.stringify({
              messages: [
                ...(systemPrompt
                  ? [{ role: "system", content: systemPrompt }]
                  : []),
                { role: "user", content: prompt },
              ],
              temperature,
              max_tokens: maxTokens,
              ...rest,
            }),
          }
        );

        console.log("callLLM: LangChainProvider received response:", response);

        return (LangChainProvider as any).config.handleResponse(response);
      },

      callLLMStructured: async (params: LangChainCustomParams & any, config: LangChainConfig): Promise<LLMResponse> => {
        const {
          prompt,
          systemPrompt,
          schema,
          schemaName,
          schemaDescription,
          ...rest
        } = params;
        console.log(
          "callLLMStructured: LangChainProvider called with params:",
          params
        );

        const body: any = {
          messages: [
            ...(systemPrompt
              ? [{ role: "system", content: systemPrompt }]
              : []),
            { role: "user", content: prompt },
          ],
          ...rest,
        };
        console.log("callLLMStructured: Request body before schema:", body);

        // Add schema for structured output (format depends on your API)
        if (schema) {
          console.log("callLLMStructured: Adding schema to request body:", {
            name: schemaName || "response",
            description: schemaDescription,
            schema: schema,
          });
          body.response_format = {
            type: "json_schema",
            json_schema: {
              name: schemaName || "response",
              description: schemaDescription,
              schema: schema,
            },
          };
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}langchain/completions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${config.config.apiKey}`,
            },
            body: JSON.stringify(body),
          }
        );

        const result = await (LangChainProvider as any).config.handleResponse(response);
        console.log("callLLMStructured: Received result:", result);

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

      streamLLM: (params: LangChainCustomParams, config: LangChainConfig, handler: StreamHandler): StreamResponse => {
        console.log("streamLLM: LangChainProvider called with params:", params);
        const abortController = new AbortController();

        const completion = (async () => {
          try {
            const { prompt, systemPrompt, temperature, maxTokens, ...rest } =
              params;

            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}langchain/completions`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${config.config.apiKey}`,
                },
                body: JSON.stringify({
                  messages: [
                    ...(systemPrompt
                      ? [{ role: "system", content: systemPrompt }]
                      : []),
                    { role: "user", content: prompt },
                  ],
                  temperature,
                  max_tokens: maxTokens,
                  stream: true, // Enable streaming
                  ...rest,
                }),
                signal: abortController.signal,
              }
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Handle Server-Sent Events stream
            await (LangChainProvider as any).config.handleEventStream(response, {
              onMessage: (chunk: string) => {
                // Parse your API's streaming format
                try {
                  const data = JSON.parse(chunk);
                  const content = data.choices?.[0]?.delta?.content || "";
                  if (content) {
                    handler({ type: "chunk", content });
                  }
                } catch {
                  // Skip parsing errors
                }
              },
              onDone: () => {
                handler({ type: "done", completedItems: [] });
              },
            });
          } catch (error) {
            if (error instanceof Error && error.name !== "AbortError") {
              handler({ type: "error", error });
            }
          }
        })();

        return {
          abort: () => abortController.abort(),
          completion,
        };
      },

      handleResponse: async (response: Response): Promise<LLMResponse> => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
          content: data.response || data.text || "",
          usage: data.usage,
          metadata: { model: data.model, id: data.id },
        };
      },

      handleEventStream: async (response: Response, { onMessage, onDone }: { onMessage: (chunk: string) => void; onDone: () => void }) => {
        const reader = response.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") {
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
    },
  };

  return (
    <CedarCopilot llmProvider={LangChainProvider}>
      <AuthProvider>{children}</AuthProvider>
    // </CedarCopilot>
  );
}
