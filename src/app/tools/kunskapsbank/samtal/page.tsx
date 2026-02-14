"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useKBConversations, type KBMessage } from "@/hooks/use-kb-conversations";
import { FeatureGate } from "@/components/feature-gate";

/* ------------------------------------------------------------------ */
/*  SSE stream helper                                                  */
/* ------------------------------------------------------------------ */

async function streamChat(
  messages: KBMessage[],
  onDelta: (text: string) => void,
  onDone: () => void,
  onError: (msg: string) => void
) {
  try {
    const res = await fetch("/api/kunskapsbank/samtal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        onError("Tjänsten är överbelastad. Försök igen om en stund.");
        return;
      }
      const body = await res.json().catch(() => ({}));
      onError(body.error || "Något gick fel.");
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError("Kunde inte läsa svar.");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const payload = trimmed.slice(6);
        if (payload === "[DONE]") {
          onDone();
          return;
        }
        try {
          const json = JSON.parse(payload);
          // OpenAI format
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) onDelta(delta);
          // Anthropic format
          if (json.type === "content_block_delta" && json.delta?.text) {
            onDelta(json.delta.text);
          }
        } catch {
          // ignore parse errors for non-JSON lines
        }
      }
    }
    onDone();
  } catch {
    onError("Anslutningsfel. Kontrollera din internetanslutning.");
  }
}

/* ------------------------------------------------------------------ */
/*  Markdown-ish renderer (simple: bold, italic, paragraphs)           */
/* ------------------------------------------------------------------ */

function SimpleMarkdown({ text }: { text: string }) {
  // Split into paragraphs, handle **bold** and *italic*
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className="space-y-2">
      {paragraphs.map((p, i) => {
        const html = p
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.+?)\*/g, "<em>$1</em>")
          .replace(/\n/g, "<br />");
        return (
          <p
            key={i}
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function SamtalPage() {
  const {
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    createConversation,
    updateMessages,
    deleteConversation,
  } = useKBConversations();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setError(null);

    // Get or create conversation
    let convId = activeId;
    if (!convId) {
      convId = createConversation();
    }

    // Add user message
    const currentMessages: KBMessage[] = [
      ...(activeConversation?.messages || []),
      { role: "user", content: text },
    ];
    updateMessages(convId, currentMessages);

    setIsLoading(true);

    let soFar = "";
    await streamChat(
      currentMessages,
      (delta) => {
        soFar += delta;
        updateMessages(convId!, [
          ...currentMessages,
          { role: "assistant", content: soFar },
        ]);
      },
      () => {
        setIsLoading(false);
      },
      (errMsg) => {
        setError(errMsg);
        setIsLoading(false);
      }
    );
  }, [input, isLoading, activeId, activeConversation, createConversation, updateMessages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const messages = activeConversation?.messages || [];

  return (
    <FeatureGate featureKey="verktyg.kunskapsbank">
      <div className="flex h-screen">
        {/* Conversation sidebar */}
        {sidebarOpen && (
          <div className="w-64 border-r border-border/60 bg-card/50 flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-border/40">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Samtal
              </span>
              <button
                onClick={() => {
                  createConversation();
                }}
                className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
              >
                <Icon name="plus" size={12} />
                Nytt
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {conversations.length === 0 ? (
                <p className="text-xs text-muted-foreground/50 p-3 text-center">
                  Inga samtal ännu
                </p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                      conv.id === activeId
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                    onClick={() => setActiveId(conv.id)}
                  >
                    <Icon name="message-circle" size={12} className="shrink-0" />
                    <span className="text-xs truncate flex-1">{conv.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-destructive transition-opacity cursor-pointer"
                    >
                      <Icon name="x" size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-border/40">
              <Link
                href="/tools/kunskapsbank"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="arrow-left" size={12} />
                Tillbaka till kunskapsbanken
              </Link>
            </div>
          </div>
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-card/60">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Icon name={sidebarOpen ? "panel-left-close" : "panel-left-open"} size={16} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-foreground truncate">
                {activeConversation?.title || "Reflekterande samtal"}
              </h1>
            </div>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Icon name="info" size={16} />
            </button>
          </div>

          {/* Info panel */}
          {showInfo && (
            <div className="px-6 py-4 bg-primary/5 border-b border-primary/10">
              <div className="max-w-2xl mx-auto space-y-2">
                <h2 className="text-sm font-semibold text-foreground">Om samtalsstödet</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Det här är ett reflekterande AI-stöd som hjälper dig formulera medvetna
                  ställningstaganden kring upphandling av IT-system. Det ger inga svar eller
                  juridisk rådgivning, utan hjälper dig se olika perspektiv och formulera dina
                  resonemang.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Samtalen sparas lokalt i din webbläsare och skickas inte vidare.
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-2xl mx-auto space-y-4">
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                    <Icon name="message-circle" size={24} className="text-primary" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground mb-2">
                    Reflekterande samtal
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Beskriv din situation eller det dilemma du står inför. Jag hjälper dig utforska
                    olika perspektiv och formulera ett medvetet ställningstagande.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted/50 border border-border/40 text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <SimpleMarkdown text={msg.content} />
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-muted/50 border border-border/40 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-center">
                  <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl px-4 py-2 text-xs">
                    {error}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="border-t border-border/60 bg-card/60 px-6 py-3">
            <div className="max-w-2xl mx-auto flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Beskriv din situation eller ställ en fråga..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
                style={{ minHeight: "40px", maxHeight: "120px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
              <Button
                onClick={send}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="self-end rounded-xl px-3"
              >
                <Icon name="send" size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
