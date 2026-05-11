import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Linkedin,
  Globe,
  Truck,
  Handshake,
  Award,
  Leaf,
  ShieldCheck,
  ChefHat,
} from "lucide-react";
import logo from "@/assets/montinelli-logo.png";
import heroImg from "@/assets/hero.jpg";
import aboutImg from "@/assets/about.jpg";
import passata from "@/assets/passata.jpg";
import atunGirasol from "@/assets/atun-girasol.png";
import atunAgua from "@/assets/atun-agua.png";
import recipePasta from "@/assets/recipe-pasta.jpg";
import recipeTuna from "@/assets/recipe-tuna.jpg";
import recipeBruschetta from "@/assets/recipe-bruschetta.jpg";
import perosDetLavanda from "@/assets/peros-detergente-lavanda.png";
import perosDetTropical from "@/assets/peros-detergente-tropical.png";
import perosDetRosas from "@/assets/peros-detergente-rosas.png";
import perosDetLimon from "@/assets/peros-detergente-limon.png";
import perosCloro from "@/assets/peros-cloro.png";
import perosLavaplatosVerde from "@/assets/peros-lavaplatos-verde.png";
import perosLavaplatosAmarillo from "@/assets/peros-lavaplatos-amarillo.png";
import perosSuavBlancas from "@/assets/peros-suavizante-blancas.png";
import perosSuavLavanda from "@/assets/peros-suavizante-lavanda.png";
import perosLogo from "@/assets/peros-logo.png";
import { useReveal } from "@/hooks/use-reveal";

const nav = [
  { href: "#nosotros", label: "Nosotros" },
  { href: "#marcas", label: "Marcas" },
  { href: "#catalogo", label: "Catálogo" },
  { href: "#peros", label: "Peros" },
  { href: "#distribucion", label: "Distribución" },
  { href: "#alianzas", label: "Alianzas" },
  { href: "#recetas", label: "Recetas" },
  { href: "#contacto", label: "Contacto" },
];

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-ink/85 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-20">
        <a href="#top" className="flex items-center gap-4">
          <img src={logo} alt="Montinelli" className="h-9 w-auto" />
          <span className="hidden sm:inline-block h-6 w-px bg-cream/20" />
          <span className="hidden sm:inline-block text-[11px] tracking-[0.4em] uppercase text-cream/60">
            Grupo
          </span>
        </a>
        <nav className="hidden lg:flex items-center gap-9">
          {nav
            .filter((n) => !["#peros", "#recetas"].includes(n.href))
            .map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-[13px] tracking-[0.14em] uppercase text-cream/80 hover:text-gold transition-colors"
              >
                {n.label}
              </a>
            ))}
        </nav>
        <a
          href="#contacto"
          className="hidden lg:inline-flex items-center gap-2 text-[13px] tracking-[0.14em] uppercase border border-gold/40 text-gold hover:bg-gold hover:text-[var(--ink)] transition-all px-5 py-2.5"
        >
          Contáctanos
        </a>
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden text-cream"
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden bg-ink border-t border-white/5">
          <nav className="flex flex-col px-6 py-6 gap-5">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="text-sm tracking-[0.14em] uppercase text-cream/80"
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative h-screen min-h-[700px] w-full overflow-hidden bg-ink"
    >
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Productos premium Montinelli"
          className="w-full h-full object-cover animate-ken-burns"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/60 to-[var(--ink)]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--ink)]/80 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 lg:px-10 flex items-end pb-20 lg:pb-28">
        <div className="grid lg:grid-cols-12 gap-12 w-full items-end mt-24">
          <div className="lg:col-span-9">
            <h1 className="font-display text-cream text-5xl md:text-7xl lg:text-[7.5rem] leading-[0.95] font-light">
              Sabores que viajan,
              <br />
              <span className="italic text-gradient-gold">
                calidad que perdura.
              </span>
            </h1>
            <p className="mt-8 text-cream/75 text-base md:text-lg max-w-xl leading-relaxed">
              Grupo Montinelli importa, representa y distribuye productos
              premium en Venezuela — con estándares internacionales de calidad
              y una operación logística confiable.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="#contacto"
                className="group inline-flex items-center justify-center gap-3 bg-gold text-[var(--ink)] px-8 py-4 text-[13px] tracking-[0.18em] uppercase font-medium hover:bg-[var(--gold-soft)] transition-all"
              >
                Contáctanos
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
              <a
                href="#catalogo"
                className="inline-flex items-center justify-center gap-3 border border-cream/30 text-cream px-8 py-4 text-[13px] tracking-[0.18em] uppercase hover:border-gold hover:text-gold transition-all"
              >
                Ver catálogo
              </a>
            </div>
          </div>

          <div className="lg:col-span-3 hidden lg:flex flex-col gap-10 items-end text-right pb-2">
            {[
              { v: "100+", l: "Puntos de venta" },
              { v: "3", l: "Marcas representadas" },
              { v: "100%", l: "Origen verificado" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-5xl text-gold font-light leading-none">
                  {s.v}
                </div>
                <div className="mt-3 text-[10px] tracking-[0.3em] uppercase text-cream/60">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-cream/50">
        <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-gold to-transparent" />
      </div>
    </section>
  );
}

function SectionLabel({
  kicker,
  title,
  subtitle,
  light,
}: {
  kicker: string;
  title: React.ReactNode;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <div className="reveal max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="gold-divider" />
        <span
          className={`text-[11px] tracking-[0.3em] uppercase ${light ? "text-gold" : "text-[var(--wine)]"}`}
        >
          {kicker}
        </span>
      </div>
      <h2
        className={`font-display text-4xl md:text-5xl lg:text-6xl font-light leading-tight ${light ? "text-cream" : "text-foreground"}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-6 text-base md:text-lg leading-relaxed ${light ? "text-cream/70" : "text-muted-foreground"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function About() {
  return (
    <section id="nosotros" className="py-28 md:py-40 bg-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        <div className="lg:col-span-5 reveal">
          <div className="relative">
            <img
              src={aboutImg}
              alt="Grupo Montinelli"
              className="w-full aspect-[4/5] object-cover shadow-elegant"
              loading="lazy"
              width={1600}
              height={1100}
            />
            <div className="absolute -bottom-8 -right-8 hidden md:block bg-ink text-cream p-8 max-w-[260px] shadow-elegant">
              <div className="font-display text-5xl text-gold">+100</div>
              <div className="text-[11px] tracking-[0.2em] uppercase mt-2 text-cream/70">
                Puntos de venta en Caracas
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7">
          <SectionLabel
            kicker="Sobre Grupo Montinelli"
            title={
              <>
                Curaduría premium.
                <br />
                <span className="italic text-[var(--wine)]">Distribución</span>{" "}
                con propósito.
              </>
            }
            subtitle="Somos un grupo venezolano dedicado a la importación, representación y distribución de productos premium. Construimos puentes entre fabricantes internacionales de excelencia y el mercado nacional, con altos estándares de calidad y una operación logística confiable."
          />
          <div className="grid sm:grid-cols-2 gap-6 mt-12 reveal">
            {[
              {
                icon: Award,
                title: "Calidad internacional",
                text: "Selección rigurosa de productos importados con trazabilidad y altos estándares de calidad.",
              },
              {
                icon: Truck,
                title: "Logística nacional",
                text: "Capacidad de distribución a supermercados, tiendas gourmet y canales HORECA.",
              },
              {
                icon: Handshake,
                title: "Alianzas estratégicas",
                text: "Relaciones de largo plazo con manufactureros y desarrollo de marca privada.",
              },
              {
                icon: ShieldCheck,
                title: "Confianza",
                text: "Cumplimiento, formalidad y transparencia con nuestros aliados comerciales.",
              },
            ].map((f) => (
              <div key={f.title} className="border-t border-foreground/10 pt-6">
                <f.icon className="text-[var(--wine)] mb-4" size={22} />
                <h3 className="font-display text-xl mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Brands() {
  return (
    <section id="marcas" className="py-28 md:py-40 gradient-dark text-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <SectionLabel
          light
          kicker="Nuestras marcas"
          title={
            <>
              Un portafolio construido con
              <span className="italic text-gradient-gold"> identidad</span>.
            </>
          }
          subtitle="Desarrollamos y representamos marcas con narrativa, posicionamiento y calidad consistente. Cada marca tiene un rol claro dentro del portafolio del Grupo."
        />

        <div className="mt-20 grid lg:grid-cols-3 gap-6 reveal">
          {/* Montinelli main */}
          <div className="lg:col-span-2 relative bg-[var(--ink)] border border-gold/20 p-10 md:p-16 overflow-hidden group">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gold/10 blur-3xl group-hover:bg-gold/20 transition-all duration-700" />
            <div className="relative">
              <span className="text-[10px] tracking-[0.3em] uppercase text-gold/80">
                Marca insignia
              </span>
              <img src={logo} alt="Montinelli" className="h-16 md:h-20 mt-6" />
              <p className="mt-8 text-cream/70 max-w-lg leading-relaxed">
                Montinelli ofrece productos seleccionados de origen internacional:
                atún premium, passata di pomodoro y una línea en expansión que
                lleva calidad y sabor auténtico a la mesa venezolana.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                {["Calidad Internacional", "Origen Seleccionado", "Premium"].map((t) => (
                  <span
                    key={t}
                    className="text-[10px] tracking-[0.2em] uppercase border border-gold/30 text-gold px-3 py-1.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Peros */}
          <div className="relative bg-[var(--ink)] border border-cream/10 p-10 md:p-12 flex flex-col justify-between overflow-hidden group">
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[var(--deep-blue)]/30 blur-3xl group-hover:bg-[var(--deep-blue)]/50 transition-all duration-700" />
            <div className="relative">
              <span className="text-[10px] tracking-[0.3em] uppercase text-cream/50">
                Cuidado del hogar
              </span>
              <img src={perosLogo} alt="Peros" className="h-16 mt-6" />
              <div className="gold-divider mt-4" />
              <p className="mt-6 text-sm text-cream/65 leading-relaxed">
                Línea completa de cuidado del hogar: detergentes, suavizantes,
                lavaplatos y cloro. Marca con presencia internacional, distribuida
                en Venezuela por Grupo Montinelli.
              </p>
            </div>
            <a
              href="#peros"
              className="relative mt-10 inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-gold hover:text-[var(--gold-soft)] transition"
            >
              Ver línea Peros <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const products = [
  {
    img: passata,
    name: "Passata di Pomodoro",
    line: "Passata Premium",
    desc: "Puré de tomate de calidad superior. Sabor intenso, textura refinada — ideal para pastas, pizzas y salsas gourmet.",
    sizes: ["680 ml"],
    accent: "from-[var(--wine)]/30 to-transparent",
  },
  {
    img: atunGirasol,
    name: "Atún en Aceite de Girasol",
    line: "Sólido · Premium",
    desc: "Atún sólido en aceite de girasol. Alto en proteína, sabor pleno y consistencia firme para platos gourmet y familiares.",
    sizes: ["170 g · 110.5 g esc."],
    accent: "from-orange-500/30 to-transparent",
  },
  {
    img: atunAgua,
    name: "Atún Sólido al Natural",
    line: "Light · Saludable",
    desc: "Atún sólido al natural en agua. Opción ligera, versátil y rica en proteína — perfecta para una alimentación equilibrada.",
    sizes: ["170 g · 110.5 g esc."],
    accent: "from-[var(--deep-blue)]/40 to-transparent",
  },
];

function Catalog() {
  return (
    <section id="catalogo" className="py-28 md:py-40 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <SectionLabel
          kicker="Catálogo"
          title={
            <>
              Productos seleccionados,
              <br />
              <span className="italic text-[var(--wine)]">
                presentación cuidada
              </span>
              .
            </>
          }
          subtitle="Un portafolio en constante expansión. Pronto: nuevas variantes de atún en aceite de oliva, presentaciones en distintos tamaños, lomos y desmenuzados."
        />

        <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products.map((p, i) => (
            <article
              key={p.name}
              className="reveal group relative bg-cream border border-foreground/5 overflow-hidden hover:shadow-product transition-all duration-700"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div
                className={`relative h-80 flex items-center justify-center overflow-hidden bg-gradient-to-br ${p.accent}`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream/40" />
                <img
                  src={p.img}
                  alt={p.name}
                  className="relative z-10 max-h-[85%] w-auto object-contain group-hover:scale-105 transition-transform duration-700 animate-float drop-shadow-2xl"
                  loading="lazy"
                />
              </div>
              <div className="p-8 border-t border-foreground/5">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[var(--wine)]">
                  {p.line}
                </span>
                <h3 className="font-display text-2xl mt-3">{p.name}</h3>
                <div className="gold-divider mt-3" />
                <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
                  {p.desc}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-foreground/10 pt-5">
                  <span className="text-[11px] tracking-[0.2em] uppercase text-foreground/60">
                    {p.sizes[0]}
                  </span>
                  <span className="text-[11px] tracking-[0.2em] uppercase text-gold">
                    Montinelli
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center reveal">
          <p className="text-sm text-muted-foreground italic">
            Próximamente · Atún en aceite de oliva · Lomos · Desmenuzado · Nuevas
            presentaciones
          </p>
        </div>
      </div>
    </section>
  );
}

const perosCategories = [
  {
    label: "Detergente en polvo",
    desc: "Ropa blanca y de color · Resultado perfecto en cada lavada.",
    items: [
      {
        img: perosDetTropical,
        name: "Brisa Tropical",
        size: "900 g",
        tone: "from-orange-400/30",
      },
      {
        img: perosDetRosas,
        name: "Frescas de Rosas",
        size: "900 g",
        tone: "from-pink-400/30",
      },
      {
        img: perosDetLimon,
        name: "Frescura de Limón",
        size: "900 g",
        tone: "from-yellow-300/30",
      },
      {
        img: perosDetLavanda,
        name: "Brisa de Lavanda",
        size: "450 g",
        tone: "from-purple-400/30",
      },
    ],
  },
  {
    label: "Suavizantes",
    desc: "Línea Peros Soft — fragancias suaves y duraderas.",
    items: [
      {
        img: perosSuavBlancas,
        name: "Flores Blancas",
        size: "1 L",
        tone: "from-amber-200/30",
      },
      {
        img: perosSuavLavanda,
        name: "Jardín de Lavanda",
        size: "1 L",
        tone: "from-purple-300/30",
      },
    ],
  },
  {
    label: "Lavaplatos & Cloro",
    desc: "Limpieza profunda para la cocina y el hogar.",
    items: [
      {
        img: perosLavaplatosVerde,
        name: "Lavaplatos Limón Clásico",
        size: "750 ml",
        tone: "from-emerald-400/30",
      },
      {
        img: perosLavaplatosAmarillo,
        name: "Lavaplatos Limón",
        size: "750 ml",
        tone: "from-yellow-300/30",
      },
      {
        img: perosCloro,
        name: "Cloro Clásico",
        size: "1 kg",
        tone: "from-blue-400/30",
      },
    ],
  },
];

function PerosSection() {
  return (
    <section
      id="peros"
      className="py-28 md:py-40 bg-cream relative overflow-hidden"
    >
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[var(--deep-blue)]/5 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <SectionLabel
              kicker="Peros · Cuidado del hogar"
              title={
                <>
                  Limpieza confiable,
                  <br />
                  <span className="italic text-[var(--deep-blue)]">
                    presencia internacional
                  </span>
                  .
                </>
              }
              subtitle="Peros es una marca global de cuidado del hogar distribuida en Venezuela por Grupo Montinelli. Una propuesta completa: detergentes, suavizantes, lavaplatos y cloro, con calidad consistente y rotación probada en el canal."
            />
          </div>
          <div className="lg:col-span-4 reveal">
            <img src={perosLogo} alt="Peros" className="h-20 md:h-24" />
            <div className="gold-divider mt-3" />
            <p className="mt-3 text-[11px] tracking-[0.25em] uppercase text-foreground/60">
              Resultado perfecto en cada lavada
            </p>
          </div>
        </div>

        <div className="mt-20 space-y-20">
          {perosCategories.map((cat, ci) => (
            <div key={cat.label} className="reveal">
              <div className="flex items-baseline justify-between flex-wrap gap-4 mb-10 border-b border-foreground/10 pb-5">
                <div>
                  <span className="text-[10px] tracking-[0.3em] uppercase text-[var(--deep-blue)]">
                    0{ci + 1} · Categoría
                  </span>
                  <h3 className="font-display text-3xl md:text-4xl mt-2">
                    {cat.label}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {cat.desc}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {cat.items.map((p, i) => (
                  <article
                    key={p.name}
                    className="group relative bg-background border border-foreground/5 hover:shadow-product transition-all duration-500"
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    <div
                      className={`relative h-56 md:h-64 flex items-center justify-center overflow-hidden bg-gradient-to-br ${p.tone} to-transparent`}
                    >
                      <img
                        src={p.img}
                        alt={p.name}
                        className="relative z-10 max-h-[88%] w-auto object-contain group-hover:scale-105 transition-transform duration-700 drop-shadow-xl"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5 border-t border-foreground/5">
                      <h4 className="font-display text-lg leading-tight">
                        {p.name}
                      </h4>
                      <div className="mt-2 flex items-center justify-between text-[10px] tracking-[0.2em] uppercase">
                        <span className="text-foreground/60">{p.size}</span>
                        <span className="text-[#e63946]">Peros</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Distribution() {
  const stats = [
    { value: "+100", label: "Puntos de venta en Caracas" },
    { value: "Nacional", label: "Expansión en curso" },
    { value: "B2B", label: "Supermercados y HORECA" },
    { value: "24/7", label: "Operación logística" },
  ];
  return (
    <section
      id="distribucion"
      className="relative py-28 md:py-40 bg-ink text-cream overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--gold) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <SectionLabel
          light
          kicker="Distribución"
          title={
            <>
              Cobertura, capilaridad y
              <span className="italic text-gradient-gold"> confianza</span>.
            </>
          }
          subtitle="Presencia en más de 100 puntos de venta en Caracas y un plan activo de expansión nacional. Trabajamos con cadenas de supermercados, tiendas gourmet, distribuidores regionales y canal HORECA."
        />

        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-px bg-cream/10 reveal">
          {stats.map((s) => (
            <div key={s.label} className="bg-ink p-8 lg:p-10">
              <div className="font-display text-4xl lg:text-5xl text-gold font-light">
                {s.value}
              </div>
              <div className="mt-3 text-[11px] tracking-[0.2em] uppercase text-cream/60">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Partnerships() {
  const items = [
    {
      icon: Globe,
      title: "Representación de marcas",
      text: "Representamos marcas internacionales en el mercado venezolano con compromiso, profesionalismo y visión de largo plazo.",
    },
    {
      icon: Handshake,
      title: "Alianzas de distribución",
      text: "Construimos acuerdos sólidos con manufactureros y distribuidores para una presencia consistente en cada categoría.",
    },
    {
      icon: Award,
      title: "Marca privada",
      text: "Desarrollamos productos bajo marca propia o marca blanca con socios manufactureros internacionales.",
    },
    {
      icon: Leaf,
      title: "Sourcing premium",
      text: "Identificamos e importamos productos de origen seleccionado, con altos estándares internacionales de calidad.",
    },
  ];
  return (
    <section id="alianzas" className="py-28 md:py-40 bg-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <SectionLabel
              kicker="Alianzas internacionales"
              title={
                <>
                  Socios de
                  <br />
                  <span className="italic text-[var(--wine)]">largo plazo</span>
                  .
                </>
              }
              subtitle="Buscamos relaciones serias con manufactureros que valoren la calidad, el cumplimiento y la construcción conjunta de marca en un mercado de gran potencial."
            />
            <a
              href="#contacto"
              className="mt-10 inline-flex items-center gap-3 text-[12px] tracking-[0.2em] uppercase text-[var(--wine)] border-b border-[var(--wine)] pb-2 hover:text-gold hover:border-gold transition-all"
            >
              Conversemos sobre tu marca <ArrowRight size={16} />
            </a>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-px bg-foreground/10 reveal">
            {items.map((it) => (
              <div key={it.title} className="bg-cream p-8 lg:p-10">
                <it.icon className="text-[var(--wine)] mb-5" size={26} />
                <h3 className="font-display text-2xl mb-3">{it.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {it.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Recipes() {
  const recipes = [
    {
      img: recipePasta,
      kicker: "Clásico",
      title: "Spaghetti al pomodoro",
      time: "25 min",
    },
    {
      img: recipeTuna,
      kicker: "Mediterráneo",
      title: "Bowl de atún & rúcula",
      time: "15 min",
    },
    {
      img: recipeBruschetta,
      kicker: "Aperitivo",
      title: "Bruschetta di tonno",
      time: "10 min",
    },
  ];
  return (
    <section id="recetas" className="py-28 md:py-40 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <SectionLabel
            kicker="Inspiración gourmet"
            title={
              <>
                Recetas para
                <br />
                <span className="italic text-[var(--wine)]">
                  la mesa de cada día
                </span>
                .
              </>
            }
          />
          <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-foreground/60 reveal">
            <ChefHat size={16} /> Editorial · Próximamente más
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-6">
          {recipes.map((r, i) => (
            <article
              key={r.title}
              className="reveal group relative overflow-hidden cursor-pointer"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={r.img}
                  alt={r.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/90 via-[var(--ink)]/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-cream">
                <span className="text-[10px] tracking-[0.3em] uppercase text-gold">
                  {r.kicker}
                </span>
                <h3 className="font-display text-2xl md:text-3xl mt-3 leading-tight">
                  {r.title}
                </h3>
                <div className="mt-4 flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase text-cream/70">
                  <span>{r.time}</span>
                  <span className="w-8 h-px bg-gold/60" />
                  <span>Receta</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    data.append("access_key", "5e287a70-440d-4a4a-97e6-9b93f7aeb39f");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });
      if (res.ok) {
        setSent(true);
        form.reset();
      }
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="contacto"
      className="py-28 md:py-40 gradient-dark text-cream"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-5">
          <SectionLabel
            light
            kicker="Contacto"
            title={
              <>
                Hablemos de
                <br />
                <span className="italic text-gradient-gold">
                  tu próximo proyecto
                </span>
                .
              </>
            }
            subtitle="Distribuidores, supermercados, manufactureros internacionales y aliados estratégicos: conversemos."
          />
          <div className="mt-12 space-y-6">
            <a
              href="mailto:contacto@grupomontinelli.com"
              className="flex items-center gap-4 text-cream/80 hover:text-gold transition-colors"
            >
              <Mail size={18} className="text-gold" />{" "}
              contacto@grupomontinelli.com
            </a>
            <a
              href="tel:+58000000000"
              className="flex items-center gap-4 text-cream/80 hover:text-gold transition-colors"
            >
              <Phone size={18} className="text-gold" /> +58 (000) 000 00 00
            </a>
            <div className="flex items-center gap-4 text-cream/80">
              <MapPin size={18} className="text-gold" /> Caracas, Venezuela
            </div>
            <a
              href="https://wa.me/580000000000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 mt-4 bg-gold text-[var(--ink)] px-6 py-3 text-[12px] tracking-[0.2em] uppercase hover:bg-[var(--gold-soft)] transition-all"
            >
              WhatsApp Comercial <ArrowRight size={14} />
            </a>
            <div className="flex items-center gap-5 pt-6 border-t border-cream/10">
              <a
                href="#"
                aria-label="Instagram"
                className="text-cream/60 hover:text-gold transition"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="text-cream/60 hover:text-gold transition"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="text-cream/60 hover:text-gold transition"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-[var(--ink)] border border-cream/10 p-8 md:p-12 reveal"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Nombre" name="name" required />
            <Field label="Empresa" name="company" />
            <Field label="Email" name="email" type="email" required />
            <Field label="Teléfono" name="phone" type="tel" />
          </div>
          <div className="mt-6">
            <label className="block text-[10px] tracking-[0.25em] uppercase text-cream/60 mb-3">
              Mensaje
            </label>
            <textarea
              name="message"
              required
              rows={5}
              className="w-full bg-transparent border-b border-cream/20 focus:border-gold focus:outline-none py-3 text-cream resize-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={sent || sending}
            className="mt-10 inline-flex items-center gap-3 bg-gold text-[var(--ink)] px-10 py-4 text-[12px] tracking-[0.22em] uppercase hover:bg-[var(--gold-soft)] transition-all disabled:opacity-60"
          >
            {sent ? "Mensaje enviado" : sending ? "Enviando..." : "Enviar mensaje"}
            {!sent && !sending && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.25em] uppercase text-cream/60 mb-3">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full bg-transparent border-b border-cream/20 focus:border-gold focus:outline-none py-3 text-cream transition-colors"
      />
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-ink text-cream/70 border-t border-cream/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <img src={logo} alt="Montinelli" className="h-9" />
          <p className="mt-6 text-sm max-w-md leading-relaxed text-cream/60">
            Grupo Montinelli — Distribución de alimentos premium en Venezuela.
            Importación, representación de marcas y alianzas internacionales.
          </p>
        </div>
        <div>
          <h4 className="text-[11px] tracking-[0.25em] uppercase text-gold mb-5">
            Navegación
          </h4>
          <ul className="space-y-3 text-sm">
            {nav.slice(0, 5).map((n) => (
              <li key={n.href}>
                <a href={n.href} className="hover:text-gold transition">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] tracking-[0.25em] uppercase text-gold mb-5">
            Contacto
          </h4>
          <ul className="space-y-3 text-sm">
            <li>contacto@grupomontinelli.com</li>
            <li>Caracas, Venezuela</li>
            <li>+58 (000) 000 00 00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] tracking-[0.2em] uppercase text-cream/40">
          <span>&copy; {new Date().getFullYear()} Grupo Montinelli</span>
          <span>Calidad Internacional · Distribución Premium</span>
        </div>
      </div>
    </footer>
  );
}

export function Landing() {
  useReveal();
  return (
    <main className="bg-background text-foreground overflow-x-hidden">
      <Header />
      <Hero />
      <About />
      <Brands />
      <Catalog />
      <PerosSection />
      <Distribution />
      <Partnerships />
      <Recipes />
      <Contact />
      <Footer />
    </main>
  );
}
