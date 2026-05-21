"use client";

import * as React from "react";
import Link from "next/link";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  MessageSquare,
  Send,
  Sparkles,
  X,
  Loader2,
  RefreshCcw,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Role = "user" | "assistant";

type CourseRecommendation = {
  _id?: string;
  title?: string;
  description?: string;
  price?: number;
  image?: string;
  thumbnailUrl?: string;
  category?: string;
};

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  recommendations?: CourseRecommendation[];
};

const QUICK_PROMPTS = [
  "I want to learn React",
  "Best backend course?",
  "Affordable courses",
  "Beginner friendly",
];

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AIChatbot() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: uid(),
      role: "assistant",
      content:
        "Hi! I'm **LearnBot**. Tell me what you'd like to learn and I'll find the best courses for you.",
      timestamp: Date.now(),
    },
  ]);

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, open]);

  React.useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [open]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    setMessages((prev) => [
      ...prev,
      { id: uid(), role: "user", content, timestamp: Date.now() },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/ai/suggest`,
        { message: content },
        { withCredentials: true }
      );

      const reply =
        res.data?.reply ||
        "Sorry, I couldn't come up with a recommendation right now.";
      const recommendations: CourseRecommendation[] =
        res.data?.recommendations || [];

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: reply,
          timestamp: Date.now(),
          recommendations,
        },
      ]);
    } catch (err: unknown) {
      const fallback =
        (axios.isAxiosError(err) && err.response?.data?.message) ||
        "Something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: fallback,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function resetChat() {
    setMessages([
      {
        id: uid(),
        role: "assistant",
        content: "Fresh start! What would you like to learn today?",
        timestamp: Date.now(),
      },
    ]);
  }

  return (
    <>
      {/* Launcher FAB */}
      <button
        type="button"
        aria-label={open ? "Close chat" : "Open LearnBot"}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-13 w-13 items-center justify-center rounded-full",
          "bg-neutral-900 text-white shadow-lg ring-1 ring-white/10",
          "transition-all duration-200 hover:bg-neutral-800 hover:scale-105",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
          open && "rotate-90"
        )}
      >
        {open ? <X className="size-5" /> : <MessageSquare className="size-5" />}
      </button>

      {/* Chat window */}
      <div
        className={cn(
          "fixed z-50 transition-all duration-250 ease-out",
          "right-3 bottom-22 sm:right-5",
          "w-[calc(100vw-1.5rem)] sm:w-[390px]",
          "h-[72vh] sm:h-[580px] max-h-[88vh]",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-3 pointer-events-none"
        )}
      >
        <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-100 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-2.5">
              <div className="relative flex size-8 items-center justify-center rounded-full bg-neutral-900 dark:bg-white">
                <Bot className="size-4 text-white dark:text-neutral-900" />
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-neutral-50 bg-emerald-500 dark:border-neutral-900" />
              </div>
              <div className="leading-none">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">LearnBot</p>
                <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                  AI Course Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={resetChat}
                title="New chat"
                className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-200/70 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <RefreshCcw className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-200/70 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgb(212 212 212) transparent" }}
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {loading && <TypingIndicator />}
          </div>

          {/* Quick prompts — shown only at the start */}
          {messages.length <= 1 && !loading && (
            <div className="shrink-0 px-4 pb-2">
              <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                <Sparkles className="size-3" /> Suggestions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-600 transition-all hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:bg-neutral-700"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="shrink-0 border-t border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-end gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 transition-all focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-300 dark:border-neutral-700 dark:bg-neutral-950 dark:focus-within:border-neutral-500">
              <Textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about courses…"
                disabled={loading}
                className="min-h-0 flex-1 resize-none border-0 bg-transparent px-0 py-1.5 shadow-none focus-visible:ring-0"
              />
              <Button
                type="button"
                size="icon"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="size-8 shrink-0 rounded-lg bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-30 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
              </Button>
            </div>
            <p className="mt-1.5 px-0.5 text-[10px] text-neutral-400 dark:text-neutral-600">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-150",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 dark:bg-white mt-0.5">
          <Bot className="size-3.5 text-white dark:text-neutral-900" />
        </div>
      )}

      <div
        className={cn(
          "flex max-w-[82%] flex-col gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-br-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "rounded-bl-sm border border-neutral-100 bg-neutral-50 text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none text-neutral-900 dark:text-neutral-100 prose-headings:text-neutral-900 prose-strong:text-neutral-900 prose-code:text-neutral-700 dark:prose-headings:text-white dark:prose-strong:text-white dark:prose-code:text-neutral-300">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Course cards */}
        {!isUser &&
          message.recommendations &&
          message.recommendations.length > 0 && (
            <div className="flex w-full flex-col gap-2 pt-0.5">
              {message.recommendations.map((c, i) => (
                <CourseCard key={c._id || i} course={c} />
              ))}
            </div>
          )}

        <span className="px-1 text-[10px] text-neutral-400">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: CourseRecommendation }) {
  const thumbnail = course.thumbnailUrl || course.image;
  const href = course._id ? `/dashboard/${course._id}` : "/dashboard";

  return (
    <Link
      href={href}
      className="group flex gap-3 rounded-xl border border-neutral-100 bg-white p-2.5 transition-all hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
    >
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt={course.title || "Course"}
          className="size-14 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <Sparkles className="size-5 text-neutral-400" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <div className="flex items-start justify-between gap-1">
          <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
            {course.title || "Untitled course"}
          </p>
          <ExternalLink className="size-3.5 shrink-0 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        {course.description && (
          <p className="line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
            {course.description}
          </p>
        )}
        <p className="text-xs font-semibold text-neutral-900 dark:text-white">
          {typeof course.price === "number" ? `₹${course.price}` : "Free"}
        </p>
      </div>
    </Link>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-in fade-in duration-150">
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 dark:bg-white">
        <Bot className="size-3.5 text-white dark:text-neutral-900" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-neutral-100 bg-neutral-50 px-3.5 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <span className="size-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-neutral-400" />
      </div>
    </div>
  );
}
