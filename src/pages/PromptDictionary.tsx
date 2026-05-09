import { useMemo, useState } from "react";
import { Search, Copy, Check, Crown, BookOpen, Sparkles, Menu, X } from "lucide-react";
import { toast } from "sonner";

type Category = "Developer" | "UI/UX Design" | "Content Writing" | "Social Media";

type Prompt = {
  id: string;
  title: string;
  description: string;
  body: string;
  category: Category;
  premium?: boolean;
};

const CATEGORIES: Category[] = ["Developer", "UI/UX Design", "Content Writing", "Social Media"];

const PROMPTS: Prompt[] = [
  {
    id: "p1",
    title: "Master 43-Point Dev Prompt",
    description: "A comprehensive system prompt covering architecture, testing, security, and DX checkpoints for senior engineers.",
    body: "Act as a principal engineer. For the following task, deliver: 1) Requirements clarification, 2) Architecture diagram, 3) Trade-offs, 4) Test plan, 5) Security review...",
    category: "Developer",
    premium: true,
  },
  {
    id: "p2",
    title: "Bug Hunter Co-Pilot",
    description: "Walks an LLM through structured root-cause analysis with hypothesis tracking and minimal repro steps.",
    body: "You are a senior debugger. Given the bug report, propose 3 hypotheses ranked by likelihood, the cheapest test for each...",
    category: "Developer",
  },
  {
    id: "p3",
    title: "API Design Reviewer",
    description: "Critiques REST and GraphQL endpoint contracts against industry best practices in seconds.",
    body: "Review this API spec for naming, versioning, error contracts, pagination, idempotency, and security...",
    category: "Developer",
  },
  {
    id: "p4",
    title: "Glassmorphism UI Generator",
    description: "Outputs production-ready Tailwind classes for layered glass UI with proper contrast and accessibility.",
    body: "Design a glassmorphism component for [PURPOSE]. Output Tailwind classes using a dark base, blurred backdrop...",
    category: "UI/UX Design",
    premium: true,
  },
  {
    id: "p5",
    title: "Design Critique Partner",
    description: "Provides Nielsen-heuristic-based feedback on screenshots or component specs with concrete fixes.",
    body: "Act as a senior product designer. Critique the attached UI against Nielsen's 10 heuristics, with one fix per issue...",
    category: "UI/UX Design",
  },
  {
    id: "p6",
    title: "Empathy Map Builder",
    description: "Generates a structured empathy map for any persona in under a minute.",
    body: "Build an empathy map (Says, Thinks, Does, Feels) for the following persona, grounded in 3 realistic scenarios...",
    category: "UI/UX Design",
  },
  {
    id: "p7",
    title: "Long-Form SEO Article",
    description: "Generates a 2,000-word SEO-optimized article with semantic structure, FAQs, and meta description.",
    body: "Write a 2000-word SEO article on [TOPIC]. Include H1, semantic H2s, FAQ schema, internal link suggestions...",
    category: "Content Writing",
    premium: true,
  },
  {
    id: "p8",
    title: "Newsletter Hook Writer",
    description: "Crafts irresistible subject lines and opening hooks tested against high-performing patterns.",
    body: "Write 10 subject lines and matching opening hooks for a newsletter about [TOPIC]. Use curiosity, specificity...",
    category: "Content Writing",
  },
  {
    id: "p9",
    title: "Tone Translator",
    description: "Rewrites any draft across 6 distinct brand voices while preserving meaning.",
    body: "Rewrite the following text in 6 voices: authoritative, playful, empathetic, technical, witty, and minimalist...",
    category: "Content Writing",
  },
  {
    id: "p10",
    title: "Viral Thread Architect",
    description: "Outputs a 9-tweet thread structure with hook, payoff, and CTA tuned for engagement.",
    body: "Write a 9-tweet thread on [TOPIC]. Tweet 1 = pattern-interrupt hook. Tweet 9 = soft CTA...",
    category: "Social Media",
    premium: true,
  },
  {
    id: "p11",
    title: "Reels Script in 30 Seconds",
    description: "Generates short-form video scripts with hook, beats, and on-screen text cues.",
    body: "Write a 30-second Reel/TikTok script with: 3-second hook, 4 story beats, on-screen text per beat...",
    category: "Social Media",
  },
  {
    id: "p12",
    title: "LinkedIn Authority Post",
    description: "Builds a credibility-driven LinkedIn post with story, insight, and discussion prompt.",
    body: "Write a LinkedIn post following Story → Insight → CTA. Open with a 1-line hook under 8 words...",
    category: "Social Media",
  },
  // ===== Developer (+) =====
  { id: "p13", title: "Code Refactor Surgeon", description: "Refactors legacy functions into clean, testable units with rationale for every change.", body: "Refactor the following code. Output: 1) Smell list, 2) Refactored code, 3) Diff rationale, 4) Suggested unit tests...", category: "Developer" },
  { id: "p14", title: "Regex Whisperer", description: "Explains and generates regex patterns with edge-case examples and test strings.", body: "Generate a regex for [PATTERN]. Include: explanation, 5 matching strings, 5 non-matching strings, common pitfalls...", category: "Developer", premium: true },
  { id: "p15", title: "SQL Query Optimizer", description: "Audits slow queries and proposes indexes, rewrites, and execution-plan improvements.", body: "Analyze this SQL. Suggest indexes, rewrites, and explain expected plan changes for Postgres...", category: "Developer" },
  { id: "p16", title: "Test Case Generator", description: "Produces exhaustive unit, integration, and edge-case tests from a function signature.", body: "Given this function signature, generate Vitest test cases covering happy paths, edge cases, and failure modes...", category: "Developer" },
  { id: "p17", title: "Dockerfile Architect", description: "Writes minimal multi-stage Dockerfiles with security and caching best practices.", body: "Write a multi-stage Dockerfile for a [STACK] app. Optimize layer caching, run as non-root, minimize image size...", category: "Developer", premium: true },
  { id: "p18", title: "Git Commit Crafter", description: "Turns a diff or change summary into Conventional Commit messages with scope.", body: "Convert this change summary into a Conventional Commit. Provide subject, body, footer with BREAKING CHANGE if needed...", category: "Developer" },
  // ===== UI/UX Design (+) =====
  { id: "p19", title: "Design Token Generator", description: "Creates a full semantic token set (color, spacing, type) from a single brand color.", body: "Given brand color [HEX], generate semantic tokens: color scales, spacing, type ramp, radii, shadows, in HSL...", category: "UI/UX Design" },
  { id: "p20", title: "Wireframe to Component Map", description: "Translates a low-fi wireframe description into a component tree with props.", body: "From this wireframe description, output a React component tree with prop signatures and Tailwind hints...", category: "UI/UX Design" },
  { id: "p21", title: "Microcopy Polisher", description: "Rewrites buttons, errors, and empty states with friendly, action-oriented voice.", body: "Rewrite the following microcopy in a friendly, action-oriented voice. Keep under [N] characters per item...", category: "UI/UX Design", premium: true },
  { id: "p22", title: "Accessibility Audit", description: "Reviews a component spec against WCAG 2.2 AA with prioritized fixes.", body: "Audit this component for WCAG 2.2 AA. Output: violations, severity, exact fix, success criterion reference...", category: "UI/UX Design" },
  { id: "p23", title: "Onboarding Flow Designer", description: "Designs a 4-step onboarding flow tuned for activation and time-to-value.", body: "Design a 4-step onboarding for [PRODUCT]. Each step: goal, UI elements, copy, success metric...", category: "UI/UX Design" },
  { id: "p24", title: "Color Palette Synthesizer", description: "Builds an accessible 5-color palette with contrast ratios for every pair.", body: "Generate a 5-color accessible palette around [MOOD]. Provide HSL values and AA/AAA contrast matrix...", category: "UI/UX Design", premium: true },
  // ===== Content Writing (+) =====
  { id: "p25", title: "Case Study Storyteller", description: "Turns raw metrics and notes into a compelling problem→solution→result case study.", body: "Write a case study using Problem → Approach → Solution → Result. Include 3 pull-quotes and 4 metrics...", category: "Content Writing" },
  { id: "p26", title: "Cold Email Sequencer", description: "Crafts a 5-touch outbound sequence with varied angles and clear CTAs.", body: "Write a 5-email cold sequence to [PERSONA]. Vary angles: pain, proof, peer, provocative, parting...", category: "Content Writing", premium: true },
  { id: "p27", title: "Landing Page Copywriter", description: "Generates above-the-fold hero, feature blocks, and CTA copy in one pass.", body: "Write landing page copy for [PRODUCT]: hero, subhead, 3 feature blocks (icon idea + headline + body), CTA, FAQ...", category: "Content Writing" },
  { id: "p28", title: "Blog Outline Architect", description: "Produces SEO-aware H2/H3 outlines with search intent mapping.", body: "Build an outline for a blog on [TOPIC]. Map each H2 to search intent, suggest internal links, and FAQ questions...", category: "Content Writing" },
  { id: "p29", title: "Press Release Builder", description: "Drafts a journalist-ready press release with headline, dateline, and boilerplate.", body: "Write a press release for [ANNOUNCEMENT]. Include headline, dateline, lede, 2 quotes, boilerplate...", category: "Content Writing" },
  { id: "p30", title: "Product Description Engine", description: "Writes 3 variants of e-commerce product copy tuned for different audiences.", body: "Write 3 product description variants for [PRODUCT]: premium, value-conscious, gift-buyer. 60–80 words each...", category: "Content Writing" },
  // ===== Social Media (+) =====
  { id: "p31", title: "Carousel Post Generator", description: "Designs a 7-slide Instagram/LinkedIn carousel with hook, value, and CTA arc.", body: "Design a 7-slide carousel on [TOPIC]. Slide 1 hook, 2–6 value, 7 CTA. Include on-slide text and caption...", category: "Social Media" },
  { id: "p32", title: "YouTube Title A/B Lab", description: "Generates 10 high-CTR title variants with thumbnail concepts.", body: "Generate 10 YouTube title + thumbnail-text pairs for [VIDEO]. Optimize curiosity, specificity, and clarity...", category: "Social Media", premium: true },
  { id: "p33", title: "Hashtag Strategy", description: "Builds a tiered hashtag set (broad, niche, branded) for any post.", body: "Build a hashtag set for a post about [TOPIC]: 5 broad, 10 niche, 5 community, 2 branded. Justify each...", category: "Social Media" },
  { id: "p34", title: "Content Calendar Builder", description: "Generates a 30-day social calendar across formats and pillars.", body: "Build a 30-day content calendar for [BRAND] across pillars: educate, inspire, sell, behind-the-scenes...", category: "Social Media" },
  { id: "p35", title: "Reply Guy Pro", description: "Drafts insightful, on-brand replies to drive engagement on viral posts.", body: "Given this post, draft 5 reply options that add value, show personality, and avoid sounding salesy...", category: "Social Media" },
  { id: "p36", title: "Personal Brand Bio", description: "Crafts a magnetic 160-char bio in 5 voices with optional emoji set.", body: "Write 5 versions of a 160-character bio for [PERSON]. Voices: authoritative, witty, warm, technical, minimalist...", category: "Social Media", premium: true },
  { id: "p37", title: "Newsletter Cross-Post", description: "Repurposes a newsletter into platform-native posts for X, LinkedIn, and Threads.", body: "Repurpose this newsletter into: 1 X thread (8 tweets), 1 LinkedIn post, 1 Threads post. Match each platform's voice...", category: "Social Media" },
];

const PromptDictionary = () => {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<Category | "All">("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROMPTS.filter((p) => {
      const catOk = activeCat === "All" || p.category === activeCat;
      const qOk = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [query, activeCat]);

  const grouped = useMemo(() => {
    const map = new Map<string, Prompt[]>();
    [...PROMPTS]
      .sort((a, b) => a.title.localeCompare(b.title))
      .forEach((p) => {
        const letter = p.title[0].toUpperCase();
        if (!map.has(letter)) map.set(letter, []);
        map.get(letter)!.push(p);
      });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  const handleCopy = async (p: Prompt) => {
    try {
      await navigator.clipboard.writeText(p.body);
      setCopiedId(p.id);
      toast.success("Prompt copied to clipboard");
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      toast.error("Could not copy");
    }
  };

  const scrollToPrompt = (id: string) => {
    const el = document.getElementById(`prompt-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2");
      setTimeout(() => el.classList.remove("ring-2"), 1400);
    }
    setSidebarOpen(false);
  };

  return (
    <div className="prompt-app font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-30 glass-strong">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-[15px] font-semibold tracking-tight">PromptDex</p>
              <p className="text-[11px] text-pp-muted">AI Prompt Dictionary</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 rounded-lg glass px-3 py-2 text-sm"
            aria-label="Open dictionary"
          >
            <BookOpen className="h-4 w-4" /> Dictionary
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block">
          <div className="glass-strong rounded-2xl p-5 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto prompt-scroll">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-4 w-4 text-pp-muted" />
              <h2 className="text-sm font-semibold tracking-wide uppercase text-pp-muted">Dictionary</h2>
            </div>
            <SidebarList grouped={grouped} onSelect={scrollToPrompt} />
          </div>
        </aside>

        {/* Main */}
        <main>
          {/* Hero */}
          <section className="text-center mb-10 sm:mb-14">
            <span className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs text-pp-muted">
              <Sparkles className="h-3.5 w-3.5" /> 200+ curated prompts
            </span>
            <h1 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              The <span className="gradient-text">AI Prompt</span> Dictionary
            </h1>
            <p className="mt-3 sm:mt-4 text-pp-muted max-w-xl mx-auto text-sm sm:text-base">
              Look up battle-tested prompts for code, design, content and growth — copy, paste, and ship.
            </p>

            {/* Search */}
            <div className="mt-7 sm:mt-8 max-w-2xl mx-auto">
              <div className="gradient-border rounded-2xl">
                <div className="glass-strong rounded-2xl flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4">
                  <Search className="h-5 w-5 text-pp-muted shrink-0" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for any Prompt (e.g., Coding, UI Design, Marketing)"
                    className="bg-transparent w-full outline-none text-[15px] placeholder:text-pp-muted/80"
                    aria-label="Search prompts"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="text-pp-muted hover:text-white transition"
                      aria-label="Clear"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {(["All", ...CATEGORIES] as const).map((cat) => {
                const active = activeCat === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCat(cat as Category | "All")}
                    className={[
                      "rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition",
                      active
                        ? "gradient-bg text-white shadow-lg shadow-purple-500/25"
                        : "glass text-pp-muted hover:text-white",
                    ].join(" ")}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Cards */}
          <section
            aria-label="Prompts"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5"
          >
            {filtered.map((p) => (
              <article
                id={`prompt-${p.id}`}
                key={p.id}
                className="glass rounded-2xl p-5 flex flex-col transition hover:-translate-y-0.5 hover:border-white/20 ring-purple-500/60"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[11px] uppercase tracking-wider text-pp-muted">{p.category}</span>
                  {p.premium && (
                    <span className="inline-flex items-center gap-1 rounded-full gradient-bg text-white text-[10px] font-semibold px-2 py-0.5">
                      <Crown className="h-3 w-3" /> Premium
                    </span>
                  )}
                </div>
                <h3 className="text-[17px] font-semibold leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm text-pp-muted leading-relaxed flex-1">{p.description}</p>
                <button
                  onClick={() => handleCopy(p)}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl glass-strong hover:bg-white/10 transition px-4 py-2.5 text-sm font-medium"
                >
                  {copiedId === p.id ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copy to Clipboard
                    </>
                  )}
                </button>
              </article>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full glass rounded-2xl p-10 text-center text-pp-muted">
                No prompts match your search.
              </div>
            )}
          </section>

          {/* About Us */}
          <section id="about" aria-label="About Us" className="mt-20">
            <div className="gradient-border rounded-3xl">
              <div className="glass-strong rounded-3xl p-6 sm:p-10">
                <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8 items-center">
                  <div>
                    <span className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs text-pp-muted">
                      <Sparkles className="h-3.5 w-3.5" /> About PromptDex
                    </span>
                    <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight">
                      Prompts that <span className="gradient-text">actually ship work</span>.
                    </h2>
                    <p className="mt-4 text-pp-muted leading-relaxed text-sm sm:text-base">
                      PromptDex is a curated dictionary of AI prompts for builders, designers, writers and marketers.
                      Every prompt is tested across leading models, structured for reliable output, and refined by a
                      community of operators shipping real products.
                    </p>
                    <p className="mt-3 text-pp-muted leading-relaxed text-sm sm:text-base">
                      No fluff, no clickbait — just battle-tested templates you can copy, paste and adapt in seconds.
                      Free prompts to get you moving, premium ones for the workflows that pay the bills.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {[
                      { k: "37+", v: "Curated prompts" },
                      { k: "4", v: "Core categories" },
                      { k: "100%", v: "Tested in production" },
                      { k: "1-tap", v: "Copy & ship" },
                    ].map((s) => (
                      <div key={s.v} className="glass rounded-2xl p-4 text-center">
                        <p className="text-2xl sm:text-3xl font-extrabold gradient-text">{s.k}</p>
                        <p className="mt-1 text-[11px] sm:text-xs text-pp-muted uppercase tracking-wider">{s.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="mt-16 text-center text-xs text-pp-muted">
            Built for builders. Glassmorphism + gradients · {new Date().getFullYear()}
          </footer>
        </main>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-0 h-full w-[82%] max-w-sm glass-strong p-5 overflow-y-auto prompt-scroll">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-pp-muted" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-pp-muted">Dictionary</h2>
              </div>
              <button onClick={() => setSidebarOpen(false)} aria-label="Close" className="rounded-lg glass p-2">
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarList grouped={grouped} onSelect={scrollToPrompt} />
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarList = ({
  grouped,
  onSelect,
}: {
  grouped: [string, Prompt[]][];
  onSelect: (id: string) => void;
}) => (
  <nav className="space-y-5">
    {grouped.map(([letter, items]) => (
      <div key={letter}>
        <div className="flex items-center gap-2 mb-2">
          <span className="h-6 w-6 rounded-md gradient-bg text-white text-xs font-bold flex items-center justify-center">
            {letter}
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <ul className="space-y-1">
          {items.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => onSelect(p.id)}
                className="w-full text-left text-sm text-pp-muted hover:text-white px-2 py-1.5 rounded-md hover:bg-white/5 transition flex items-center gap-2"
              >
                <span className="truncate">{p.title}</span>
                {p.premium && <Crown className="h-3 w-3 text-amber-300 shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </nav>
);

export default PromptDictionary;