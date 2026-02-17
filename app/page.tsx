"use client";

import { Bree_Serif } from "next/font/google";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const bree = Bree_Serif({
  subsets: ["latin"],
  weight: "400",
});


type Post = {
  id: string;
  nickname: string;
  mood: number;
  content: string;
  created_at: string;
};

function moodLabel(m: number) {
  if (m <= 1) return "kötüyüm 😔";
  if (m === 2) return "idare ederim 🤨";
  if (m === 3) return "orta şekerim 🙂";
  if (m === 4) return "iyiyim ya 😉";
  return "çok iyiyim 😎";
}

export default function Home() {
  const ui = {
    page: "min-h-screen bg-gradient-to-b from-[#bd7ebf]/45 via-[#bd7ebf]/80 to-stone-100 text-stone-900",
    container: "mx-auto max-w-5xl px-4 py-10 space-y-8",
    header: "space-y-2 text-center",
    title: "text-[50px] font-semibold tracking-tight text-stone",
    subtitle: "text-[16px] text-stone italic tracking-wide",

    card: "rounded-2xl border border-[#bd7ebf]/40 bg-white/80 backdrop-blur p-5 shadow-lg",
    postCard: "rounded-2xl border border-[#bd7ebf]/40 bg-white/80 backdrop-blur p-5",


    label: "text-xs text-zinc-900",
    input:
      "w-full rounded-xl border border-[#bd7ebf]/40 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#bd7ebf]",
    textarea:
      "w-full min-h-[120px] rounded-xl border border-[#bd7ebf]/40 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#bd7ebf]",

    primaryBtn:
      "text-sm px-3 py-1.5 rounded-lg border-2 border-[#bd7ebf]/40 text-stone-600 transition hover:bg-[#bd7ebf]/20 hover:text-[#7a3c8c] hover:border-[#bd7ebf] active:scale-95",


    meta: "text-xs text-zinc-900",
    date: "mt-4 text-xs text-zinc-500",
  };

  const [nickname, setNickname] = useState("anon");
  const [mood, setMood] = useState(3);
  const [content, setContent] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function fetchPosts() {
    setLoading(true);
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    setPosts((data as Post[]) ?? []);
    setLoading(false);
  }

  async function sendPost() {
    if (!content.trim()) return alert("bi şey yaz 😄");

    setSending(true);
    const { error } = await supabase.from("posts").insert({
      nickname: nickname.trim() || "anon",
      mood,
      content: content.trim(),
    });
    setSending(false);

    if (error) return alert(error.message);

    setContent("");
    await fetchPosts();
  }

  useEffect(() => {
    const saved = localStorage.getItem("oa_nick");
    if (saved) setNickname(saved);
    fetchPosts();
  }, []);

  useEffect(() => {
    localStorage.setItem("oa_nick", nickname);
  }, [nickname]);

  return (
    <main className={ui.page}>
      <div className={ui.container}>
        <header className={ui.header}>
          <h1 className={`${ui.title} ${bree.className}`}>
            Online Arkadaşın
          </h1>
          <p className={ui.subtitle}>
            Bugün neler oldu?
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          {/* SOL: yazma */}
          <section className={`${ui.card} space-y-4 lg:sticky lg:top-6`}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="space-y-2">
                <label className={ui.label}>Nickname</label>
                <input
                  className={ui.input}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="anon"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={ui.label}>Mood</label>
                  <span className={ui.meta}>
                    {mood} / 5 • {moodLabel(mood)}
                  </span>
                </div>

                <input
                  type="range"
                  min={1}
                  max={5}
                  value={mood}
                  onChange={(e) => setMood(Number(e.target.value))}
                  className="w-full accent-zinc-900"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className={ui.label}>Günlük</label>
              <textarea
                className={ui.textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Günün nasıldı?"
                maxLength={1200}
              />
              <div className="text-xs text-right text-zinc-500">
                {content.length} / 1200
              </div>

            </div>

            <div className="flex items-center justify-between">
              <button className={ui.primaryBtn} onClick={sendPost} disabled={sending}>
                {sending ? "Gönderiliyor..." : "Gönder"}
              </button>
            </div>
          </section>

          {/* SAĞ: akış */}
          <section className="space-y-3">
            <div className="flex items-end justify-between">
              <h2 className="text-lg font-semibold">Akış</h2>
              <span className="text-xs text-zinc-900">son {posts.length} post</span>
            </div>

            {loading ? (
              <p className="text-zinc-900">yükleniyor...</p>
            ) : posts.length === 0 ? (
              <p className="text-zinc-900">henüz post yok</p>
            ) : (
              <div className="space-y-3">
                {posts.map((p) => (
                  <article key={p.id} className={ui.postCard}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{p.nickname}</div>
                      <div className={ui.meta}>
                        mood {p.mood}/5 • {moodLabel(p.mood)}
                      </div>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap">{p.content}</p>

                    <div className={ui.date}>
                      {new Date(p.created_at).toLocaleString("tr-TR")}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <footer className="pt-6 text-center text-xs text-zinc-600">
          made by behlulyazc
        </footer>
      </div>
    </main>
  );
}
