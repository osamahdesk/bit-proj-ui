import { useEffect, useRef, useState, useCallback } from "react";
import "@/App.css";
import { Toaster, toast } from "sonner";
import { 
  ChevronDown, 
  ArrowRight, 
  MapPin, 
  Menu, 
  X, 
  Twitter, 
  Instagram, 
  ScanLine, 
  Box, 
  Activity, 
  Aperture, 
  Send 
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
const API = `${BACKEND_URL}/api`;
const BUILDING_VIDEO = `${process.env.PUBLIC_URL || ""}/assets/building.mp4`;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const EVOL_TABS = {
  plan: {
    label: "Academics",
    phase: "Academic Foundation",
    title: "21 Schools of Excellence",
    desc: "From Aerospace Engineering to Optics & Photonics — BIT's 21 professional schools deliver world-class education in defense technology, vehicle engineering, and computer science.",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80&auto=format&fit=crop"
  },
  create: {
    label: "Research",
    phase: "Research & Innovation",
    title: "Pioneering Discovery",
    desc: "Leading breakthroughs in intelligent unmanned systems, advanced materials, AI, and new energy vehicles — BIT shapes China's future in defense science and smart manufacturing.",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&q=80&auto=format&fit=crop"
  },
  refine: {
    label: "Campus",
    phase: "Campus Life",
    title: "Two Iconic Campuses",
    desc: "The historic Zhongguancun campus in Beijing's Silicon Valley and the modern Liangxiang campus — together housing 30,000+ students from over 100 countries.",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80&auto=format&fit=crop"
  }
};

function App() {
  const videoRef = useRef(null);
  const heroSectionRef = useRef(null);
  const evolutionSectionRef = useRef(null);

  const heroDesktopTextRef = useRef(null);
  const heroMobileTextRef = useRef(null);
  const heroCrimsonDesktopRef = useRef(null);
  const heroCrimsonMobileRef = useRef(null);
  const cueRef = useRef(null);
  const scene2CardRef = useRef(null);
  const scene3Ref = useRef(null);

  // Evolution Refs
  const envisionTextRef = useRef(null);
  const evolutionGridRef = useRef(null);

  // Capabilities Refs
  const capabilitiesHeaderRef = useRef(null);
  const capabilitiesGridRef = useRef(null);

  // Gallery Refs
  const galleryGridRef = useRef(null);

  // Contact Refs
  const contactLeftRef = useRef(null);
  const contactFormRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [navbarTheme, setNavbarTheme] = useState("light-transparent");

  const lerpTimeRef = useRef(0);

  /* ---- Preload the full video before enabling the experience ---- */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    document.body.style.overflow = "hidden";
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      setLoadPct(100);
      try {
        video.pause();
        video.currentTime = 0;
      } catch (e) {}
      setTimeout(() => {
        setReady(true);
        document.body.style.overflow = "";
        window.scrollTo(0, 0);
      }, 350);
    };

    const onProgress = () => {
      try {
        if (video.duration && video.buffered.length) {
          const pct = Math.round((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
          setLoadPct((p) => Math.max(p, Math.min(99, pct)));
        }
      } catch (e) {}
    };

    video.addEventListener("progress", onProgress);
    video.addEventListener("canplaythrough", finish, { once: true });
    
    const poll = setInterval(() => {
      if (video.readyState >= 4) finish();
    }, 300);
    const hardTimeout = setTimeout(finish, 9000);

    video.load();

    return () => {
      video.removeEventListener("progress", onProgress);
      clearInterval(poll);
      clearTimeout(hardTimeout);
      document.body.style.overflow = "";
    };
  }, []);

  /* ---- Scroll-driven scrubbing + overlay choreography ---- */
  useEffect(() => {
    if (!ready) return;
    let raf;

    const render = () => {
      const hero = heroSectionRef.current;
      const video = videoRef.current;
      const screenHeight = window.innerHeight;
      const scrollY = window.scrollY;

      if (hero && video) {
        const heroHeight = hero.offsetHeight;
        const maxHeroScroll = heroHeight - screenHeight;
        const p = maxHeroScroll > 0 ? clamp(scrollY / maxHeroScroll, 0, 1) : 0;

        // Smooth video scrubbing (lerp towards target time)
        if (video.duration) {
          const target = p * video.duration;
          lerpTimeRef.current += (target - lerpTimeRef.current) * 0.12;
          if (
            video.readyState >= 2 &&
            Math.abs(video.currentTime - lerpTimeRef.current) > 0.005
          ) {
            try {
              video.currentTime = lerpTimeRef.current;
            } catch (e) {}
          }
        }

        // Hero Titles (Desktop & Mobile): fade out as you scroll down
        const heroTextOpacity = 1 - smoothstep(0.04, 0.2, p);
        const heroTextTranslateY = -smoothstep(0.04, 0.2, p) * 30;

        if (heroDesktopTextRef.current) {
          heroDesktopTextRef.current.style.opacity = heroTextOpacity;
          heroDesktopTextRef.current.style.transform = `translateY(calc(-50% + ${heroTextTranslateY}px))`;
        }
        if (heroMobileTextRef.current) {
          heroMobileTextRef.current.style.opacity = heroTextOpacity;
        }

        const titleP = smoothstep(0.04, 0.25, p);
        if (heroCrimsonDesktopRef.current) {
          heroCrimsonDesktopRef.current.style.opacity = 1 - titleP;
          heroCrimsonDesktopRef.current.style.filter = `blur(${titleP * 20}px)`;
          heroCrimsonDesktopRef.current.style.transform = `scale(${1 + titleP * 0.3}) translateY(${titleP * 40}px)`;
        }
        if (heroCrimsonMobileRef.current) {
          heroCrimsonMobileRef.current.style.opacity = 1 - titleP;
          heroCrimsonMobileRef.current.style.filter = `blur(${titleP * 20}px)`;
          heroCrimsonMobileRef.current.style.transform = `scale(${1 + titleP * 0.3}) translateY(${titleP * 40}px)`;
        }

        // Scroll cue
        if (cueRef.current) {
          cueRef.current.style.opacity = 1 - smoothstep(0, 0.1, p);
        }

        // Scene 2 Card (Structural Precision)
        if (scene2CardRef.current) {
          const fadeInP = smoothstep(0.28, 0.4, p);
          const fadeOutP = smoothstep(0.55, 0.68, p);
          const o = fadeInP * (1 - fadeOutP);
          scene2CardRef.current.style.opacity = o;
          scene2CardRef.current.style.pointerEvents = o > 0.1 ? "auto" : "none";
          
          scene2CardRef.current.style.filter = `blur(${fadeOutP * 20}px)`;

          // Translation: slide left on desktop, center on mobile, scale & blur on exit
          const slideProgress = 1 - fadeInP;
          if (window.innerWidth >= 1100) {
            scene2CardRef.current.style.transform = `translateY(-50%) translateX(${slideProgress * 36}px) scale(${1 + fadeOutP * 0.3}) translateY(${fadeOutP * 40}px)`;
          } else {
            scene2CardRef.current.style.transform = `translateX(-50%) translateY(${slideProgress * 20}px) scale(${1 + fadeOutP * 0.3}) translateY(${fadeOutP * 40}px)`;
          }
        }

        // Scene 3 Completed Masterpiece (Living Facade)
        if (scene3Ref.current) {
          const o = smoothstep(0.72, 0.88, p);
          scene3Ref.current.style.opacity = o;
          scene3Ref.current.style.pointerEvents = o > 0.1 ? "auto" : "none";
        }
      }

      // Navbar theme dynamic transition
      let theme = "light-transparent";
      if (scrollY > 50) {
        if (scrollY > 4.5 * screenHeight) {
          theme = "dark-glass";
        } else {
          theme = "light-glass";
        }
      }
      setNavbarTheme(theme);

      // Evolution scroll animations
      const evolutionProgress = clamp((scrollY - 5.0 * screenHeight) / (1.0 * screenHeight), 0, 1);
      if (evolutionGridRef.current) {
        evolutionGridRef.current.style.opacity = evolutionProgress;
        evolutionGridRef.current.style.transform = `translateY(${(1 - evolutionProgress) * 60}px)`;
      }

      if (envisionTextRef.current) {
        const pEvol = clamp((scrollY - 5.2 * screenHeight) / (2.6 * screenHeight), 0, 1);
        envisionTextRef.current.style.opacity = 1 - pEvol;
        envisionTextRef.current.style.filter = `blur(${pEvol * 20}px)`;
        envisionTextRef.current.style.transform = `translateY(-50%) scale(${1 + pEvol * 0.3}) translateY(${pEvol * 100}px)`;
      }

      // Auto tab switcher during scroll inside Evolution
      if (scrollY > 5.2 * screenHeight && scrollY < 7.8 * screenHeight) {
        const evolProgress = clamp((scrollY - 5.2 * screenHeight) / (2.6 * screenHeight), 0, 1);
        const computedTab = evolProgress < 0.33 ? "plan" : evolProgress < 0.66 ? "create" : "refine";
        setActiveTab(computedTab);
      }

      // Capabilities scroll animations
      const capabilitiesProgress = clamp((scrollY - 6.5 * screenHeight) / (0.8 * screenHeight), 0, 1);
      if (capabilitiesHeaderRef.current) {
        capabilitiesHeaderRef.current.style.opacity = capabilitiesProgress;
        capabilitiesHeaderRef.current.style.transform = `translateY(${(1 - capabilitiesProgress) * 36}px)`;
      }
      if (capabilitiesGridRef.current) {
        capabilitiesGridRef.current.style.opacity = capabilitiesProgress;
        capabilitiesGridRef.current.style.transform = `translateY(${(1 - capabilitiesProgress) * 36}px)`;
      }

      // Gallery scroll animations
      const galleryProgress = clamp((scrollY - 7.5 * screenHeight) / (0.8 * screenHeight), 0, 1);
      if (galleryGridRef.current) {
        galleryGridRef.current.style.opacity = galleryProgress;
        galleryGridRef.current.style.transform = `translateY(${(1 - galleryProgress) * 36}px)`;
      }

      // Contact scroll animations
      const contactProgress = clamp((scrollY - 8.5 * screenHeight) / (0.8 * screenHeight), 0, 1);
      if (contactLeftRef.current) {
        contactLeftRef.current.style.opacity = contactProgress;
        contactLeftRef.current.style.transform = `translateY(${(1 - contactProgress) * 30}px)`;
      }
      if (contactFormRef.current) {
        contactFormRef.current.style.opacity = contactProgress;
        contactFormRef.current.style.transform = `translateY(${(1 - contactProgress) * 30}px)`;
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (id === "hero" || id === "overview") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (id === "evolution") {
      const screenHeight = window.innerHeight;
      window.scrollTo({ top: 5.2 * screenHeight, behavior: "smooth" });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTab = (tab) => {
    const screenHeight = window.innerHeight;
    let targetScroll = 0;
    if (tab === "plan") {
      targetScroll = 5.2 * screenHeight + 0.1 * 2.6 * screenHeight;
    } else if (tab === "create") {
      targetScroll = 5.2 * screenHeight + 0.5 * 2.6 * screenHeight;
    } else if (tab === "refine") {
      targetScroll = 5.2 * screenHeight + 0.9 * 2.6 * screenHeight;
    }
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    if (downloading) return;
    setDownloading(true);
    toast.loading("Packaging the full project…", { id: "dl" });
    try {
      const res = await fetch(`${API}/download-project`);
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "beijing-architectural-evolution.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Project downloaded — full source bundled.", { id: "dl" });
    } catch (e) {
      toast.error("Download failed. Please try again.", { id: "dl" });
    } finally {
      setDownloading(false);
    }
  };

  // Dynamic header styles
  let headerBgColor = "transparent";
  let headerBackdropFilter = "none";
  let headerBorderBottom = "1px solid transparent";
  let headerTextColor = "text-ink";
  let headerLinkColor = "text-ink/55";

  if (navbarTheme === "light-glass") {
    headerBgColor = "rgba(255, 255, 255, 0.85)";
    headerBackdropFilter = "blur(18px)";
    headerBorderBottom = "1px solid rgba(0, 0, 0, 0.05)";
  } else if (navbarTheme === "dark-glass") {
    headerBgColor = "rgba(10, 10, 11, 0.8)";
    headerBackdropFilter = "blur(18px)";
    headerBorderBottom = "1px solid rgba(255, 255, 255, 0.08)";
    headerTextColor = "text-white";
    headerLinkColor = "text-white/55";
  }

  return (
    <div className="App">
      <Toaster position="top-center" richColors />

      {/* Preloader */}
      <div 
        data-testid="preloader" 
        className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white transition-all duration-700 ${ready ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <div className="font-body mb-3 text-[11px] uppercase tracking-[0.35em] text-ink/40">
          北京理工大学 — Beijing Institute of Technology
        </div>
        <div className="font-display text-4xl text-ink sm:text-5xl">
          德以明理 <span style={{ color: "var(--crimson)" }}>学以精工</span>
        </div>
        <div className="mt-12 w-[min(420px,72vw)]">
          <div className="mb-3 flex items-end justify-between">
            <span className="font-body text-[11px] uppercase tracking-[0.25em] text-ink/40">
              Preparing experience
            </span>
            <span data-testid="preloader-percent" className="font-display text-2xl" style={{ color: "var(--crimson)" }}>
              {loadPct}%
            </span>
          </div>
          <div className="h-px w-full overflow-hidden bg-ink/10">
            <div className="h-full transition-all duration-200" style={{ background: "var(--crimson)", width: `${loadPct}%` }} />
          </div>
          <div className="font-body mt-4 text-[11px] tracking-wide text-ink/35">
            Buffering full video for seamless scroll-scrubbing…
          </div>
        </div>
      </div>

      {/* Top Navbar */}
      <header 
        data-testid="navbar" 
        className="fixed inset-x-0 top-0 z-[100] transition-all duration-500" 
        style={{ 
          backgroundColor: headerBgColor, 
          backdropFilter: headerBackdropFilter, 
          borderBottom: headerBorderBottom 
        }}
      >
        <nav className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-6 lg:px-10">
          <button 
            onClick={() => scrollToSection("hero")} 
            data-testid="navbar-logo" 
            className={`font-display text-2xl tracking-wide transition-colors duration-500 ${headerTextColor}`}
          >
            B<span style={{ color: "var(--crimson)" }}>I</span>T
            <span className="ml-2 hidden align-middle text-[11px] font-body uppercase tracking-[0.28em] opacity-50 sm:inline">
              Institute of Technology
            </span>
          </button>
          
          <div className="hidden items-center gap-9 xl:flex">
            <button 
              onClick={() => scrollToSection("hero")} 
              data-testid="nav-link-overview" 
              className={`group relative font-body text-sm uppercase tracking-[0.18em] transition-colors duration-300 hover:text-[var(--crimson)] ${headerLinkColor}`}
            >
              Overview
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-[var(--crimson)] transition-all duration-300 group-hover:w-full" />
            </button>
            <button 
              onClick={() => scrollToSection("evolution")} 
              data-testid="nav-link-evolution" 
              className={`group relative font-body text-sm uppercase tracking-[0.18em] transition-colors duration-300 hover:text-[var(--crimson)] ${headerLinkColor}`}
            >
              Evolution
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-[var(--crimson)] transition-all duration-300 group-hover:w-full" />
            </button>
            <button 
              onClick={() => scrollToSection("capabilities")} 
              data-testid="nav-link-capabilities" 
              className={`group relative font-body text-sm uppercase tracking-[0.18em] transition-colors duration-300 hover:text-[var(--crimson)] ${headerLinkColor}`}
            >
              Capabilities
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-[var(--crimson)] transition-all duration-300 group-hover:w-full" />
            </button>
            <button 
              onClick={() => scrollToSection("gallery")} 
              data-testid="nav-link-gallery" 
              className={`group relative font-body text-sm uppercase tracking-[0.18em] transition-colors duration-300 hover:text-[var(--crimson)] ${headerLinkColor}`}
            >
              Gallery
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-[var(--crimson)] transition-all duration-300 group-hover:w-full" />
            </button>
            <button 
              onClick={() => scrollToSection("contact")} 
              data-testid="nav-link-contact" 
              className={`group relative font-body text-sm uppercase tracking-[0.18em] transition-colors duration-300 hover:text-[var(--crimson)] ${headerLinkColor}`}
            >
              Contact
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-[var(--crimson)] transition-all duration-300 group-hover:w-full" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noreferrer" 
              aria-label="Twitter" 
              className={`hidden transition-colors hover:text-[var(--crimson)] sm:block ${headerLinkColor}`}
            >
              <Twitter size={18} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer" 
              aria-label="Instagram" 
              className={`hidden transition-colors hover:text-[var(--crimson)] sm:block ${headerLinkColor}`}
            >
              <Instagram size={18} />
            </a>
            <button 
              data-testid="nav-mobile-toggle" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`xl:hidden ${headerTextColor}`} 
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown menu */}
        <div 
          className="overflow-hidden transition-all duration-400 xl:hidden" 
          style={{ 
            maxHeight: mobileMenuOpen ? "300px" : "0px",
            backgroundColor: navbarTheme === "dark-glass" ? "rgba(10, 10, 11, 0.95)" : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(18px)"
          }}
        >
          <div className="flex flex-col gap-1 px-6 py-4">
            <button 
              onClick={() => scrollToSection("hero")} 
              className={`border-b py-3 font-body text-sm text-left uppercase tracking-[0.2em] border-black/5 ${navbarTheme === "dark-glass" ? "text-white/70" : "text-ink/70"}`}
            >
              Overview
            </button>
            <button 
              onClick={() => scrollToSection("evolution")} 
              className={`border-b py-3 font-body text-sm text-left uppercase tracking-[0.2em] border-black/5 ${navbarTheme === "dark-glass" ? "text-white/70" : "text-ink/70"}`}
            >
              Evolution
            </button>
            <button 
              onClick={() => scrollToSection("capabilities")} 
              className={`border-b py-3 font-body text-sm text-left uppercase tracking-[0.2em] border-black/5 ${navbarTheme === "dark-glass" ? "text-white/70" : "text-ink/70"}`}
            >
              Capabilities
            </button>
            <button 
              onClick={() => scrollToSection("gallery")} 
              className={`border-b py-3 font-body text-sm text-left uppercase tracking-[0.2em] border-black/5 ${navbarTheme === "dark-glass" ? "text-white/70" : "text-ink/70"}`}
            >
              Gallery
            </button>
            <button 
              onClick={() => scrollToSection("contact")} 
              className={`border-b py-3 font-body text-sm text-left uppercase tracking-[0.2em] border-black/5 ${navbarTheme === "dark-glass" ? "text-white/70" : "text-ink/70"}`}
            >
              Contact
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="hero" ref={heroSectionRef} style={{ height: "520vh", position: "relative" }}>
          <div className="sticky-video-container">
            {/* Scroll Scrubbed Video */}
            <video 
              ref={videoRef}
              data-testid="scroll-video" 
              src={BUILDING_VIDEO}
              playsInline 
              preload="auto" 
              muted
              style={{ 
                position: "absolute", 
                inset: 0, 
                width: "100%", 
                height: "100%", 
                objectFit: "contain", 
                background: "#ffffff" 
              }}
            />

            {/* Red grid lines overlay */}
            <div 
              aria-hidden="true" 
              style={{ 
                position: "absolute", 
                inset: 0, 
                opacity: 0.5, 
                backgroundImage: "linear-gradient(rgba(138, 28, 20, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(138, 28, 20, 0.07) 1px, transparent 1px)", 
                backgroundSize: "44px 44px", 
                pointerEvents: "none" 
              }}
            />

            {/* Desktop Hero Text */}
            <div 
              ref={heroDesktopTextRef}
              className="hidden xl:block" 
              style={{ 
                position: "absolute", 
                top: "45%", 
                left: 80, 
                transform: "translateY(-50%)", 
                maxWidth: 460,
                transition: "opacity 0.15s linear"
              }}
            >
              <div className="font-body" style={{ fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--crimson)", marginBottom: 18 }}>
                Est. 1940 — 延安自然科学院
              </div>
              <h1 className="font-display" style={{ fontSize: "clamp(32px, 4.5vw, 54px)", color: "#1a1a1a", lineHeight: 1.02 }}>
                BEIJING INSTITUTE
              </h1>
              <h1 ref={heroCrimsonDesktopRef} className="font-display" style={{ fontSize: "clamp(50px, 7.5vw, 88px)", fontWeight: 700, color: "var(--crimson)", lineHeight: 0.95, marginTop: -4, display: "inline-block", transformOrigin: "left center" }}>
                OF TECHNOLOGY
              </h1>
              <p className="font-body" style={{ fontSize: 18, color: "#555555", maxWidth: 360, marginTop: 22, lineHeight: 1.5 }}>
                Project 985 · Double First-Class · A legacy of defense innovation, engineering excellence, and 30,000+ students shaping the future.
              </p>
            </div>

            {/* Mobile Hero Text */}
            <div 
              ref={heroMobileTextRef}
              className="flex flex-col items-center text-center xl:hidden" 
              style={{ 
                padding: "120px 24px 0",
                position: "absolute",
                inset: "0 0 auto",
                transition: "opacity 0.15s linear"
              }}
            >
              <div className="font-body" style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--crimson)", marginBottom: 14 }}>
                Est. 1940 — 北京理工大学
              </div>
              <h1 className="font-display" style={{ fontSize: "clamp(30px, 8vw, 44px)", color: "#1a1a1a", lineHeight: 1.05 }}>
                BEIJING INSTITUTE
              </h1>
              <h1 ref={heroCrimsonMobileRef} className="font-display" style={{ fontSize: "clamp(40px, 12vw, 64px)", fontWeight: 700, color: "var(--crimson)", lineHeight: 0.95, display: "inline-block", transformOrigin: "center center" }}>
                OF TECHNOLOGY
              </h1>
              <p className="font-body" style={{ fontSize: 15, color: "#555555", maxWidth: 340, marginTop: 16, lineHeight: 1.5 }}>
                Project 985 · Double First-Class · Engineering excellence since 1940.
              </p>
            </div>

            {/* Scroll build indicator */}
            <div 
              ref={cueRef}
              style={{ 
                position: "absolute", 
                bottom: 40, 
                left: "50%", 
                transform: "translateX(-50%)", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                gap: 14, 
                pointerEvents: "none",
                transition: "opacity 0.15s linear"
              }}
            >
              <span className="font-body" style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "#888888" }}>
                Scroll to build
              </span>
              <span className="animate-bob" style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid #bbbbbb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronDown size={16} color="#888888" />
              </span>
            </div>

            {/* Scene 2 structural card */}
            <div 
              ref={scene2CardRef}
              className="left-1/2 bottom-10 w-[88%] max-w-[360px] -translate-x-1/2 xl:left-auto xl:right-20 xl:bottom-auto xl:top-[45%] xl:w-auto xl:-translate-x-0 xl:-translate-y-1/2" 
              style={{ 
                position: "absolute", 
                opacity: 0, 
                transition: "opacity 0.15s linear, transform 0.15s linear", 
                pointerEvents: "none" 
              }}
            >
              <div style={{ background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(8px)", padding: 32, borderLeft: "4px solid var(--crimson)", boxShadow: "rgba(0, 0, 0, 0.12) 0px 24px 60px", borderRadius: 4 }}>
                <h3 className="font-display" style={{ fontSize: 24, color: "#1a1a1a", marginBottom: 12 }}>
                  01 / University Profile
                </h3>
                <p className="font-body" style={{ fontSize: 15, color: "#444444", maxWidth: 320, lineHeight: 1.55 }}>
                  Founded in 1940 in Yan'an, BIT is a Project 985 & Double First-Class (Category A) research university administered by MIIT — home to 30+ academicians and 3,400+ faculty members.
                </p>
              </div>
                       {/* Scene 3 Living Facade Facts bar */}
            <div 
              ref={scene3Ref}
              style={{ 
                position: "absolute", 
                inset: 0, 
                opacity: 0, 
                transition: "opacity 0.15s linear", 
                pointerEvents: "none" 
              }}
            >
              {/* Glassmorphic header pill - Dark frosted glass */}
              <div
                style={{
                  position: "absolute",
                  top: "12vh",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(15, 15, 16, 0.65)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "30px",
                  padding: "10px 28px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
                  whiteSpace: "nowrap",
                  textAlign: "center"
                }}
              >
                <h2 className="font-display" style={{ margin: 0, fontSize: "clamp(18px, 3.5vw, 26px)", color: "#ffffff", letterSpacing: "0.08em", fontWeight: 500 }}>
                  北京理工大学 — BIT CAMPUS
                </h2>
              </div>

              {/* Glassmorphic details card - Dark frosted glass (subtle & secondary) */}
              <div 
                className="flex flex-col gap-6 p-5 sm:p-6 text-center sm:flex-row sm:justify-around sm:text-left mx-auto" 
                style={{ 
                  position: "absolute", 
                  bottom: "6vh", 
                  left: "5%", 
                  right: "5%", 
                  background: "rgba(15, 15, 16, 0.65)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  boxShadow: "0 16px 40px rgba(0, 0, 0, 0.3)",
                  maxWidth: "1000px"
                }}
              >
                <div>
                  <div className="font-body" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", color: "rgba(255, 255, 255, 0.45)", marginBottom: 4, textTransform: "uppercase" }}>
                    LOCATION
                  </div>
                  <div className="font-body" style={{ fontSize: 14, color: "#ffffff", maxWidth: 280, fontWeight: 500 }}>
                    Haidian District, Beijing
                  </div>
                </div>
                
                <div className="hidden sm:block w-px bg-white/10 self-stretch" />
                
                <div>
                  <div className="font-body" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", color: "rgba(255, 255, 255, 0.45)", marginBottom: 4, textTransform: "uppercase" }}>
                    RANKING
                  </div>
                  <div className="font-body" style={{ fontSize: 14, color: "#ffffff", maxWidth: 280, fontWeight: 500 }}>
                    Project 985 · Top 25 in China
                  </div>
                </div>
                
                <div className="hidden sm:block w-px bg-white/10 self-stretch" />
                
                <div>
                  <div className="font-body" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", color: "rgba(255, 255, 255, 0.45)", marginBottom: 4, textTransform: "uppercase" }}>
                    STUDENTS
                  </div>
                  <div className="font-body" style={{ fontSize: 14, color: "#ffffff", maxWidth: 280, fontWeight: 500 }}>
                    30,000+ from 100+ Countries
                  </div>
                </div>
              </div>
            </div>    </div>
          </div>
        </section>

        {/* Evolution Showcase Section */}
        <section 
          id="evolution" 
          data-testid="dissolve-showcase" 
          style={{ height: "260vh", position: "relative", background: "#0a0a0b" }}
        >
          <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
            {/* Background lighting glow */}
            <div 
              aria-hidden="true" 
              style={{ 
                position: "absolute", 
                inset: 0, 
                background: "radial-gradient(120% 80% at 70% 0%, rgba(138, 28, 20, 0.22), transparent 55%), radial-gradient(80% 60% at 10% 100%, rgba(255, 255, 255, 0.05), transparent 60%)" 
              }}
            />

            {/* Big floating background text */}
            <h2 
              ref={envisionTextRef}
              className="font-display select-none" 
              style={{ 
                position: "absolute", 
                top: "50%", 
                right: "5vw", 
                margin: 0, 
                color: "#ffffff", 
                fontSize: "clamp(90px, 18vw, 320px)", 
                lineHeight: 0.85, 
                letterSpacing: "-0.02em", 
                transformOrigin: "right center", 
                pointerEvents: "none", 
                textShadow: "rgba(255, 255, 255, 0.25) 0px 0px 80px", 
                opacity: 1, 
                transform: "translateY(-50%)" 
              }}
            >
              北京理工
            </h2>

            <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-6 pb-16 lg:justify-center lg:px-10">
              <div 
                ref={evolutionGridRef}
                className="grid items-stretch gap-6 lg:grid-cols-[1.35fr_0.9fr] transition-all-500" 
                style={{ opacity: 0.4, transform: "translateY(60px)" }}
              >
                {/* Image Showcase Card */}
                <div className="relative">
                  <div aria-hidden="true" className="absolute -left-4 -top-4 h-full w-full rounded-[28px] border border-white/5 bg-white/[0.02]" />
                  <div aria-hidden="true" className="absolute -left-2 -top-2 h-full w-full rounded-[28px] border border-white/5 bg-white/[0.03]" />
                  
                  <div 
                    className="relative overflow-hidden rounded-[28px] border border-white/10" 
                    style={{ 
                      background: "rgba(255, 255, 255, 0.04)", 
                      backdropFilter: "blur(20px)", 
                      boxShadow: "rgba(0, 0, 0, 0.55) 0px 40px 120px" 
                    }}
                  >
                    <div className="relative aspect-[16/10] w-full">
                      {/* Image transitions with key */}
                      <img 
                        key={activeTab}
                        alt={EVOL_TABS[activeTab].title}
                        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" 
                        src={EVOL_TABS[activeTab].image}
                      />
                      <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10, 10, 11, 0.85) 0%, transparent 45%)" }} />
                      
                      <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
                        <div>
                          <div className="font-body mb-2 text-[11px] uppercase tracking-[0.3em]" style={{ color: "#ff6b5e" }}>
                            {EVOL_TABS[activeTab].phase}
                          </div>
                          <h3 className="font-display text-3xl text-white sm:text-4xl">
                            {EVOL_TABS[activeTab].title}
                          </h3>
                          <p className="font-body mt-3 max-w-md text-sm leading-relaxed text-white/65">
                            {EVOL_TABS[activeTab].desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Info Control Box */}
                <div 
                  className="flex flex-col justify-between rounded-[28px] border border-white/10 p-7 lg:p-9" 
                  style={{ background: "rgba(255, 255, 255, 0.04)", backdropFilter: "blur(20px)" }}
                >
                  <div>
                    <div className="font-body mb-3 text-[11px] uppercase tracking-[0.3em] text-white/40">
                      德以明理，学以精工
                    </div>
                    <p className="font-body text-base leading-relaxed text-white/70">
                      Virtue leads to truth, learning leads to refined craftsmanship. BIT blends 85 years of defense heritage with cutting-edge research in AI, autonomous vehicles, and aerospace engineering.
                    </p>
                  </div>
                  
                  <div className="mt-8">
                    {/* Tab pills */}
                    <div className="relative flex rounded-full border border-white/10 bg-white/[0.03] p-1.5">
                      {Object.keys(EVOL_TABS).map((tabKey) => {
                        const tab = EVOL_TABS[tabKey];
                        const isTabActive = activeTab === tabKey;
                        return (
                          <button 
                            key={tabKey}
                            onClick={() => scrollToTab(tabKey)}
                            data-testid={`showcase-tab-${tabKey}`}
                            className="relative flex-1 rounded-full px-3 py-2.5 text-center transition-all duration-300"
                          >
                            {isTabActive && (
                              <span className="absolute inset-0 rounded-full bg-white opacity-100 transition-all duration-300" />
                            )}
                            <span className={`relative z-10 font-body text-xs uppercase tracking-[0.16em] transition-colors duration-300 ${isTabActive ? "text-ink" : "text-white/55"}`}>
                              {tab.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <button 
                      onClick={() => scrollToSection("contact")}
                      data-testid="showcase-cta"
                      className="btn-primary-ref group mt-5 w-full flex items-center justify-center gap-2"
                    >
                      Apply to BIT
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities Grid Section */}
        <section 
          id="capabilities" 
          data-testid="capabilities" 
          className="relative bg-[#0a0a0b] px-6 py-28 lg:px-10 lg:py-36"
        >
          <div className="mx-auto max-w-[1400px]">
            {/* Section Header */}
            <div 
              ref={capabilitiesHeaderRef}
              className="max-w-2xl transition-all-500" 
              style={{ opacity: 0, transform: "translateY(36px)" }}
            >
              <div className="font-body mb-4 text-[11px] uppercase tracking-[0.3em] text-[#ff6b5e]">
                Key Disciplines
              </div>
              <h2 className="font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
                World-class <span style={{ color: "#ff6b5e" }}>programs</span>.
              </h2>
              <p className="font-body mt-5 text-base leading-relaxed text-white/55">
                One of the "Seven Sons of National Defence" — BIT excels in aerospace, defense technology, intelligent systems, and engineering, with QS World Ranking #259 in 2026.
              </p>
            </div>

            {/* 4 Cards Grid */}
            <div 
              ref={capabilitiesGridRef}
              className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] sm:grid-cols-2 lg:grid-cols-4 transition-all-500"
              style={{ opacity: 0, transform: "translateY(36px)" }}
            >
              {/* Card 0 */}
              <div data-testid="feature-card-0" className="capabilities-grid-item group">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 transition-all duration-500 group-hover:border-[#ff6b5e]/40" style={{ background: "rgba(255, 107, 94, 0.08)" }}>
                  <ScanLine size={22} color="#ff6b5e" />
                </div>
                <h3 className="font-display text-2xl text-white">
                  Defense & Aerospace
                </h3>
                <p className="font-body mt-3 text-sm leading-relaxed text-white/50">
                  Nationally ranked #1 in Weapon Science & Technology. BIT is at the forefront of China's defense innovation, missiles, and space program contributions.
                </p>
              </div>

              {/* Card 1 */}
              <div data-testid="feature-card-1" className="capabilities-grid-item group">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 transition-all duration-500 group-hover:border-[#ff6b5e]/40" style={{ background: "rgba(255, 107, 94, 0.08)" }}>
                  <Box size={22} color="#ff6b5e" />
                </div>
                <h3 className="font-display text-2xl text-white">
                  AI & Computing
                </h3>
                <p className="font-body mt-3 text-sm leading-relaxed text-white/50">
                  Pioneering research in machine learning, NLP, image recognition, and large language model optimization — shaping the future of intelligent systems.
                </p>
              </div>

              {/* Card 2 */}
              <div data-testid="feature-card-2" className="capabilities-grid-item group">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 transition-all duration-500 group-hover:border-[#ff6b5e]/40" style={{ background: "rgba(255, 107, 94, 0.08)" }}>
                  <Activity size={22} color="#ff6b5e" />
                </div>
                <h3 className="font-display text-2xl text-white">
                  Vehicle Engineering
                </h3>
                <p className="font-body mt-3 text-sm leading-relaxed text-white/50">
                  Home to the National Engineering Research Center for Electric Vehicles — BIT leads China's autonomous driving and new energy vehicle revolution.
                </p>
              </div>

              {/* Card 3 */}
              <div data-testid="feature-card-3" className="capabilities-grid-item group">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 transition-all duration-500 group-hover:border-[#ff6b5e]/40" style={{ background: "rgba(255, 107, 94, 0.08)" }}>
                  <Aperture size={22} color="#ff6b5e" />
                </div>
                <h3 className="font-display text-2xl text-white">
                  Optics & Materials
                </h3>
                <p className="font-body mt-3 text-sm leading-relaxed text-white/50">
                  World-class research in photoelectronic imaging, advanced metamaterials, green energy, and biomedical engineering across multiple State Key Laboratories.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section 
          id="gallery" 
          data-testid="gallery" 
          className="relative bg-[#0a0a0b] px-6 pb-32 lg:px-10"
        >
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="font-body mb-4 text-[11px] uppercase tracking-[0.3em] text-[#ff6b5e]">
                  Campus Gallery
                </div>
                <h2 className="font-display text-4xl leading-tight text-white sm:text-5xl">
                  A campus of distinction
                </h2>
              </div>
              <p className="font-body max-w-sm text-sm leading-relaxed text-white/55">
                From the historic Zhongguancun campus to the award-winning Liangxiang Sports Center — architecture that inspires innovation.
              </p>
            </div>

            {/* Gallery Grid */}
            <div 
              ref={galleryGridRef}
              className="grid auto-rows-[200px] grid-cols-2 gap-4 lg:grid-cols-4 lg:auto-rows-[230px] transition-all-500"
              style={{ opacity: 0, transform: "translateY(36px)" }}
            >
              {/* Item 0 - Large Grid item */}
              <figure data-testid="gallery-item-0" className="gallery-figure visible lg:col-span-2 lg:row-span-2">
                <img 
                  alt="BIT Main Campus" 
                  className="gallery-img" 
                  src="https://images.unsplash.com/photo-1562774053-701939374585?w=1000&q=80&auto=format&fit=crop"
                />
                <figcaption className="gallery-caption">
                  <span className="font-body text-[10px] uppercase tracking-[0.28em] text-[#ff6b5e]">
                    Main Campus
                  </span>
                  <div className="font-display text-xl text-white">
                    Zhongguancun Campus
                  </div>
                </figcaption>
              </figure>

              {/* Item 1 */}
              <figure data-testid="gallery-item-1" className="gallery-figure visible">
                <img 
                  alt="Research Lab" 
                  className="gallery-img" 
                  src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=900&q=80&auto=format&fit=crop"
                />
                <figcaption className="gallery-caption">
                  <span className="font-body text-[10px] uppercase tracking-[0.28em] text-[#ff6b5e]">
                    Research
                  </span>
                  <div className="font-display text-xl text-white">
                    State Key Labs
                  </div>
                </figcaption>
              </figure>

              {/* Item 2 */}
              <figure data-testid="gallery-item-2" className="gallery-figure visible">
                <img 
                  alt="University Library" 
                  className="gallery-img" 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80&auto=format&fit=crop"
                />
                <figcaption className="gallery-caption">
                  <span className="font-body text-[10px] uppercase tracking-[0.28em] text-[#ff6b5e]">
                    Knowledge
                  </span>
                  <div className="font-display text-xl text-white">
                    Central Library
                  </div>
                </figcaption>
              </figure>

              {/* Item 3 */}
              <figure data-testid="gallery-item-3" className="gallery-figure visible">
                <img 
                  alt="Student Life" 
                  className="gallery-img" 
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&q=80&auto=format&fit=crop"
                />
                <figcaption className="gallery-caption">
                  <span className="font-body text-[10px] uppercase tracking-[0.28em] text-[#ff6b5e]">
                    Community
                  </span>
                  <div className="font-display text-xl text-white">
                    Student Life
                  </div>
                </figcaption>
              </figure>

              {/* Item 4 */}
              <figure data-testid="gallery-item-4" className="gallery-figure visible">
                <img 
                  alt="Sports Center" 
                  className="gallery-img" 
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&q=80&auto=format&fit=crop"
                />
                <figcaption className="gallery-caption">
                  <span className="font-body text-[10px] uppercase tracking-[0.28em] text-[#ff6b5e]">
                    Athletics
                  </span>
                  <div className="font-display text-xl text-white">
                    Liangxiang Sports
                  </div>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section 
          id="contact" 
          data-testid="contact" 
          className="relative overflow-hidden bg-[#0a0a0b] px-6 py-28 lg:px-10 lg:py-36"
        >
          {/* Radial light gradient overlay */}
          <div aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 85% 20%, rgba(138, 28, 20, 0.22), transparent 60%)" }} />

          <div className="relative mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-2 lg:items-center">
            {/* Left info column */}
            <div 
              ref={contactLeftRef}
              className="transition-all-500"
              style={{ opacity: 0, transform: "translateY(30px)" }}
            >
              <div className="font-body mb-4 text-[11px] uppercase tracking-[0.3em] text-[#ff6b5e]">
                Admissions
              </div>
              <h2 className="font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
                Begin your journey<br />at BIT.
              </h2>
              <p className="font-body mt-5 max-w-md text-base leading-relaxed text-white/55">
                Join 30,000+ students at one of China's most prestigious research universities. Apply for undergraduate, graduate, or international programs.
              </p>
              
              <div className="mt-10 flex items-center gap-3 text-white/70">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10">
                  <MapPin size={16} color="#ff6b5e" />
                </span>
                <div className="font-body text-sm">
                  No. 5 Zhongguancun South Street, Haidian District, Beijing 100081
                </div>
              </div>
            </div>

            {/* Right form column */}
            <form 
              ref={contactFormRef}
              data-testid="contact-form" 
              onSubmit={(e) => { e.preventDefault(); toast.success("Form submitted successfully!"); }}
              className="rounded-3xl border border-white/10 p-7 lg:p-9 transition-all-500" 
              style={{ background: "rgba(255, 255, 255, 0.04)", backdropFilter: "blur(20px)", opacity: 0, transform: "translateY(30px)" }}
            >
              <div className="space-y-4">
                <input 
                  data-testid="contact-name"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 font-body text-sm text-white placeholder-white/35 outline-none transition-colors duration-300 focus:border-[#ff6b5e]/60" 
                  placeholder="Full name" 
                />
                <input 
                  data-testid="contact-email"
                  required
                  type="email"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 font-body text-sm text-white placeholder-white/35 outline-none transition-colors duration-300 focus:border-[#ff6b5e]/60" 
                  placeholder="Email address" 
                />
                <textarea 
                  data-testid="contact-message"
                  required
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 font-body text-sm text-white placeholder-white/35 outline-none transition-colors duration-300 focus:border-[#ff6b5e]/60 resize-none" 
                  placeholder="Tell us about yourself and your interests…"
                />
              </div>
              
              <button 
                data-testid="contact-submit"
                type="submit" 
                className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b5e] px-6 py-3.5 font-body text-sm font-semibold text-[#0a0a0b] transition-all duration-300 hover:bg-white"
              >
                Send application inquiry
                <Send size={15} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer / Running Marquee */}
      <footer data-testid="footer" className="relative bg-[#070708] text-white">
        {/* Repeating text marquee */}
        <div className="overflow-hidden border-y border-white/10 py-6">
          <div className="marquee-container">
            <div className="marquee-content">
              <div className="flex items-center">
                <span className="flex items-center">
                  <span className="font-display px-8 text-3xl text-white/80 sm:text-4xl">INNOVATION</span>
                  <span className="text-[#ff6b5e]">✦</span>
                </span>
                <span className="flex items-center">
                  <span className="font-display px-8 text-3xl text-white/80 sm:text-4xl">RESEARCH</span>
                  <span className="text-[#ff6b5e]">✦</span>
                </span>
                <span className="flex items-center">
                  <span className="font-display px-8 text-3xl text-white/80 sm:text-4xl">AEROSPACE</span>
                  <span className="text-[#ff6b5e]">✦</span>
                </span>
                <span className="flex items-center">
                  <span className="font-display px-8 text-3xl text-white/80 sm:text-4xl">DEFENSE</span>
                  <span className="text-[#ff6b5e]">✦</span>
                </span>
                <span className="flex items-center">
                  <span className="font-display px-8 text-3xl text-white/80 sm:text-4xl">AI</span>
                  <span className="text-[#ff6b5e]">✦</span>
                </span>
                <span className="flex items-center">
                  <span className="font-display px-8 text-3xl text-white/80 sm:text-4xl">EXCELLENCE</span>
                  <span className="text-[#ff6b5e]">✦</span>
                </span>
              </div>
              <div className="flex items-center">
                <span className="flex items-center">
                  <span className="font-display px-8 text-3xl text-white/80 sm:text-4xl">HERITAGE</span>
                  <span className="text-[#ff6b5e]">✦</span>
                </span>
                <span className="flex items-center">
                  <span className="font-display px-8 text-3xl text-white/80 sm:text-4xl">PRECISION</span>
                  <span className="text-[#ff6b5e]">✦</span>
                </span>
                <span className="flex items-center">
                  <span className="font-display px-8 text-3xl text-white/80 sm:text-4xl">ENGINEERING</span>
                  <span className="text-[#ff6b5e]">✦</span>
                </span>
                <span className="flex items-center">
                  <span className="font-display px-8 text-3xl text-white/80 sm:text-4xl">EVOLUTION</span>
                  <span className="text-[#ff6b5e]">✦</span>
                </span>
                <span className="flex items-center">
                  <span className="font-display px-8 text-3xl text-white/80 sm:text-4xl">SYMMETRY</span>
                  <span className="text-[#ff6b5e]">✦</span>
                </span>
                <span className="flex items-center">
                  <span className="font-display px-8 text-3xl text-white/80 sm:text-4xl">STRUCTURE</span>
                  <span className="text-[#ff6b5e]">✦</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info box */}
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 px-6 py-14 lg:flex-row lg:items-center lg:px-10">
          <div>
            <div className="font-display text-3xl">B<span style={{ color: "var(--crimson)" }}>I</span>T</div>
            <p className="font-body mt-2 max-w-xs text-sm text-white/45">
              北京理工大学 — Beijing Institute of Technology. Project 985 · Double First-Class · Est. 1940.
            </p>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <button 
              onClick={(e) => handleDownload(e)}
              disabled={downloading}
              data-testid="download-project-button"
              className="btn-primary-ref bg-white text-ink hover:bg-[var(--crimson)] hover:text-white"
            >
              {downloading ? "Packaging…" : "Download project (.zip)"}
            </button>
            <button 
              onClick={() => scrollToSection("hero")} 
              data-testid="back-to-top"
              className="btn-ghost-ref"
            >
              Replay the build
            </button>
          </div>
        </div>

        <div className="border-t border-white/5 py-6 text-center text-xs text-white/35">
          <span>&copy; {new Date().getFullYear()} 北京理工大学 Beijing Institute of Technology. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
