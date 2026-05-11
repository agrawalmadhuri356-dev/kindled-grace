import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Copy, Check, Crown, BookOpen, Sparkles, X,
  MoreVertical, Info, LifeBuoy, Star, Send, ChevronLeft,
} from "lucide-react";
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

// Full A–Z list used by the alphabetical jump bar. Letters with no prompts
// are rendered disabled so the bar layout stays consistent.
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * AdSlot — a clearly-labelled placeholder container for monetization.
 * Replace the inner content with your ad-network snippet (AdSense, Carbon,
 * EthicalAds, etc.). Rendered with a subtle dashed border so it's obviously
 * an ad placement during development and review.
 */
const AdSlot = ({ variant = "in-feed" }: { variant?: "banner" | "in-feed" }) => (
  <div
    role="complementary"
    aria-label="Advertisement"
    className={[
      "border border-dashed border-white/15 rounded-2xl bg-white/[0.02]",
      "flex items-center justify-center text-center",
      variant === "banner"
        ? "w-full px-4 py-4 sm:py-5 min-h-[90px]"
        : "col-span-full px-4 py-6 min-h-[120px]",
    ].join(" ")}
  >
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-pp-muted">
        Advertisement
      </p>
      <p className="mt-1 text-xs text-pp-muted/70">
        {variant === "banner" ? "728×90 / responsive ad slot" : "In-feed sponsored slot"}
      </p>
    </div>
  </div>
);

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
  const [menuOpen, setMenuOpen] = useState(false);
  type MenuView = "root" | "about" | "support" | "rating" | "submit";
  const [menuView, setMenuView] = useState<MenuView>("root");

  // Submit Prompt form state
  const [spCategory, setSpCategory] = useState<Category>("Developer");
  const [spTitle, setSpTitle] = useState("");
  const [spDescription, setSpDescription] = useState("");
  const [spBody, setSpBody] = useState("");
  const [rating, setRating] = useState(0);
  const [ratingCategory, setRatingCategory] = useState<Category>("Developer");
  type CatStats = Record<Category, { sum: number; count: number }>;
  type CatUser = Record<Category, number>;
  const emptyStats: CatStats = {
    Developer: { sum: 0, count: 0 },
    "UI/UX Design": { sum: 0, count: 0 },
    "Content Writing": { sum: 0, count: 0 },
    "Social Media": { sum: 0, count: 0 },
  };
  const emptyUser: CatUser = {
    Developer: 0,
    "UI/UX Design": 0,
    "Content Writing": 0,
    "Social Media": 0,
  };
  const [ratingStats, setRatingStats] = useState<CatStats>(emptyStats);
  const [userRatings, setUserRatings] = useState<CatUser>(emptyUser);

  // Load persisted ratings on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("promptdex_ratings_v2");
      if (raw) {
        const parsed = JSON.parse(raw);
        const merged = { ...emptyStats };
        for (const c of CATEGORIES) {
          if (parsed?.[c] && typeof parsed[c].sum === "number" && typeof parsed[c].count === "number") {
            merged[c] = { sum: parsed[c].sum, count: parsed[c].count };
          }
        }
        setRatingStats(merged);
      }
      const mine = localStorage.getItem("promptdex_user_ratings_v2");
      if (mine) {
        const parsed = JSON.parse(mine);
        const merged = { ...emptyUser };
        for (const c of CATEGORIES) {
          const n = parseInt(parsed?.[c], 10);
          if (n >= 1 && n <= 5) merged[c] = n;
        }
        setUserRatings(merged);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync star selector when switching category
  useEffect(() => {
    setRating(userRatings[ratingCategory] || 0);
  }, [ratingCategory, userRatings]);

  const currentStats = ratingStats[ratingCategory];
  const currentUser = userRatings[ratingCategory];
  const average = currentStats.count > 0 ? currentStats.sum / currentStats.count : 0;

  const submitRating = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    const prev = currentUser;
    const nextEntry =
      prev > 0
        ? { sum: currentStats.sum - prev + rating, count: currentStats.count }
        : { sum: currentStats.sum + rating, count: currentStats.count + 1 };
    const nextStats = { ...ratingStats, [ratingCategory]: nextEntry };
    const nextUser = { ...userRatings, [ratingCategory]: rating };
    setRatingStats(nextStats);
    setUserRatings(nextUser);
    try {
      localStorage.setItem("promptdex_ratings_v2", JSON.stringify(nextStats));
      localStorage.setItem("promptdex_user_ratings_v2", JSON.stringify(nextUser));
    } catch {
      /* ignore */
    }
    toast.success(
      prev > 0
        ? `Updated ${ratingCategory} rating to ${rating} stars`
        : `Thanks for your ${rating}-star ${ratingCategory} rating!`,
    );
  };

  const openMenu = (v: MenuView = "root") => {
    setMenuView(v);
    setMenuOpen(true);
  };

  const handleSubmitPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spTitle.trim() || !spDescription.trim() || !spBody.trim()) {
      toast.error("Please fill title, description and prompt");
      return;
    }
    if (spDescription.trim().length < 20) {
      toast.error("Description should be at least 20 characters");
      return;
    }
    toast.success("Prompt submitted for review. Thank you!");
    setSpTitle(""); setSpDescription(""); setSpBody(""); setSpCategory("Developer");
    setMenuView("root");
    setMenuOpen(false);
  };

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
            <button
              onClick={() => openMenu("root")}
              aria-label="Open menu"
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg glass hover:bg-white/10 transition"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
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

      {/* Left slide-out menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-[88%] max-w-sm glass-strong p-5 overflow-y-auto prompt-scroll animate-in slide-in-from-left">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                {menuView !== "root" && (
                  <button
                    onClick={() => setMenuView("root")}
                    aria-label="Back"
                    className="rounded-lg glass p-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}
                <h2 className="text-sm font-semibold uppercase tracking-wide text-pp-muted">
                  {menuView === "root" && "Menu"}
                  {menuView === "about" && "About Us"}
                  {menuView === "support" && "Support"}
                  {menuView === "rating" && "Rate PromptDex"}
                  {menuView === "submit" && "Submit Prompt"}
                </h2>
              </div>
              <button onClick={() => setMenuOpen(false)} aria-label="Close" className="rounded-lg glass p-2">
                <X className="h-4 w-4" />
              </button>
            </div>

            {menuView === "root" && (
              <ul className="space-y-2">
                {[
                  { k: "about", label: "About Us", icon: Info, desc: "Who we are & our mission" },
                  { k: "support", label: "Support", icon: LifeBuoy, desc: "Need help? Reach out" },
                  { k: "rating", label: "Rating", icon: Star, desc: "Rate your experience" },
                  { k: "submit", label: "Submit Prompt", icon: Send, desc: "Share your best prompt" },
                ].map((it) => (
                  <li key={it.k}>
                    <button
                      onClick={() => setMenuView(it.k as MenuView)}
                      className="w-full text-left glass hover:bg-white/10 transition rounded-xl p-4 flex items-center gap-3"
                    >
                      <span className="h-9 w-9 rounded-lg gradient-bg flex items-center justify-center shrink-0">
                        <it.icon className="h-4 w-4 text-white" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">{it.label}</span>
                        <span className="block text-xs text-pp-muted">{it.desc}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {menuView === "about" && (
              <div className="space-y-3 text-sm text-pp-muted leading-relaxed">
                <p><span className="gradient-text font-semibold">PromptDex</span> is a curated dictionary of AI prompts crafted for developers, designers, writers and marketers.</p>
                <p>Every prompt is tested across leading models and refined by operators shipping real products. No fluff — just templates that work.</p>
                <p>Free prompts get you moving. Premium ones power the workflows that pay the bills.</p>
              </div>
            )}

            {menuView === "support" && (
              <div className="space-y-3 text-sm">
                <p className="text-pp-muted">Have a question, bug or feature request? We typically respond within 24 hours.</p>
                <a href="mailto:support@promptdex.app" className="block glass rounded-xl p-4 hover:bg-white/10 transition">
                  <p className="text-xs text-pp-muted uppercase tracking-wider">Email</p>
                  <p className="font-semibold">support@promptdex.app</p>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="block glass rounded-xl p-4 hover:bg-white/10 transition">
                  <p className="text-xs text-pp-muted uppercase tracking-wider">Twitter / X</p>
                  <p className="font-semibold">@promptdex</p>
                </a>
              </div>
            )}

            {menuView === "rating" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-pp-muted">Category</label>
                  <select
                    value={ratingCategory}
                    onChange={(e) => setRatingCategory(e.target.value as Category)}
                    className="mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none focus:ring-2 focus:ring-purple-500/40"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-slate-900">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="glass rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold gradient-text leading-none">
                      {currentStats.count > 0 ? average.toFixed(1) : "—"}
                      <span className="text-sm text-pp-muted font-normal"> / 5</span>
                    </p>
                    <p className="text-xs text-pp-muted mt-1">
                      {currentStats.count > 0
                        ? `${ratingCategory} · ${currentStats.count} rating${currentStats.count > 1 ? "s" : ""}`
                        : `No ${ratingCategory} ratings yet — be the first!`}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={[
                          "h-4 w-4",
                          n <= Math.round(average) ? "fill-amber-300 text-amber-300" : "text-pp-muted",
                        ].join(" ")}
                      />
                    ))}
                  </div>
                </div>
                {/* All-category breakdown */}
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => {
                    const s = ratingStats[c];
                    const avg = s.count > 0 ? s.sum / s.count : 0;
                    const active = c === ratingCategory;
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setRatingCategory(c)}
                        className={[
                          "rounded-xl p-3 text-left transition glass",
                          active ? "ring-2 ring-purple-500/60" : "hover:bg-white/10",
                        ].join(" ")}
                      >
                        <p className="text-[11px] uppercase tracking-wider text-pp-muted truncate">{c}</p>
                        <p className="mt-1 text-base font-bold">
                          {s.count > 0 ? avg.toFixed(1) : "—"}
                          <span className="text-[11px] text-pp-muted font-normal"> / 5</span>
                        </p>
                        <p className="text-[10px] text-pp-muted">
                          {s.count} rating{s.count === 1 ? "" : "s"}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm text-pp-muted">
                  {currentUser > 0
                    ? `Your ${ratingCategory} rating: ${currentUser} star${currentUser > 1 ? "s" : ""}. Tap to update.`
                    : `Tap a star to rate ${ratingCategory}.`}
                </p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRating(n)}
                      aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                      className="p-1"
                    >
                      <Star
                        className={[
                          "h-8 w-8 transition",
                          n <= rating ? "fill-amber-300 text-amber-300" : "text-pp-muted",
                        ].join(" ")}
                      />
                    </button>
                  ))}
                </div>
                <button
                  onClick={submitRating}
                  className="w-full gradient-bg text-white rounded-xl py-3 text-sm font-semibold shadow-lg shadow-purple-500/25"
                >
                  {currentUser > 0 ? "Update Rating" : "Submit Rating"}
                </button>
              </div>
            )}

            {menuView === "submit" && (
              <form onSubmit={handleSubmitPrompt} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-pp-muted">Category</label>
                  <select
                    value={spCategory}
                    onChange={(e) => setSpCategory(e.target.value as Category)}
                    className="mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none focus:ring-2 focus:ring-purple-500/40"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-slate-900">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-pp-muted">Title</label>
                  <input
                    value={spTitle}
                    onChange={(e) => setSpTitle(e.target.value)}
                    placeholder="e.g. Killer Cold Email Prompt"
                    className="mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-pp-muted/70 focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-pp-muted">
                    Description <span className="text-pp-muted/70 normal-case">(min 20 chars)</span>
                  </label>
                  <textarea
                    value={spDescription}
                    onChange={(e) => setSpDescription(e.target.value)}
                    placeholder="Briefly describe what this prompt does and when to use it…"
                    rows={3}
                    className="mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-pp-muted/70 focus:ring-2 focus:ring-purple-500/40 resize-none"
                  />
                  <p className="mt-1 text-[11px] text-pp-muted">{spDescription.trim().length} characters</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-pp-muted">Prompt</label>
                  <textarea
                    value={spBody}
                    onChange={(e) => setSpBody(e.target.value)}
                    placeholder="Paste the full prompt here…"
                    rows={6}
                    className="mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-pp-muted/70 focus:ring-2 focus:ring-purple-500/40 resize-none font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full gradient-bg text-white rounded-xl py-3 text-sm font-semibold shadow-lg shadow-purple-500/25 inline-flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" /> Submit Prompt
                </button>
              </form>
            )}
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