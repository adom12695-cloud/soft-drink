import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Droplets, Menu, X, ArrowRight, CheckCircle,
  Truck, BarChart3, Warehouse, Users, Star,
  ChevronDown, Package, ShieldCheck, Zap,
} from 'lucide-react'

// ─── Image assets (Unsplash + official CDN URLs) ──────────────────────────────
const IMAGES = {
  // Hero — Pepsi cans on ice, vibrant blue
  hero:       'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=1600&q=90',
  // Products section
  pepsiCan:   'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80',
  cocaCola:   'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80',
  energyDrink:'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=600&q=80',
  juice:      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80',
  water:      'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80',
  sparkling:  'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=600&q=80',
  // How It Works
  warehouse:  'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
  retailer:   'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
  stock:      'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&q=80',
  delivery:   'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80',
  // CTA banner — Pepsi bottles on production line
  cta:        'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=1600&q=90',
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Products',  href: '#products'  },
    { label: 'Features',  href: '#features'  },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
  ]

  const scrollTo = (href) => {
    setOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
              <Droplets size={20} className="text-white" />
            </div>
            <span className={`font-bold text-lg tracking-tight transition-colors
              ${scrolled ? 'text-slate-900' : 'text-white'}`}>
              SoftDrink<span className="text-indigo-400">Dist</span>
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <button key={l.label} onClick={() => scrollTo(l.href)}
                className={`text-sm font-medium transition-colors hover:text-indigo-400
                  ${scrolled ? 'text-slate-600' : 'text-white/80'}`}>
                {l.label}
              </button>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors
                ${scrolled ? 'text-slate-700 hover:text-indigo-600' : 'text-white/90 hover:text-white'}`}>
              Sign In
            </Link>
            <Link to="/register"
              className="text-sm font-semibold px-5 py-2 bg-indigo-600 hover:bg-indigo-700
                         text-white rounded-lg transition-colors shadow-sm">
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)}
            className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-slate-700' : 'text-white'}`}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((l) => (
              <button key={l.label} onClick={() => scrollTo(l.href)}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium
                           text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                {l.label}
              </button>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/login" onClick={() => setOpen(false)}
                className="text-center py-2.5 text-sm font-medium text-slate-700
                           border border-slate-200 rounded-lg hover:border-indigo-300">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setOpen(false)}
                className="text-center py-2.5 text-sm font-semibold text-white
                           bg-indigo-600 hover:bg-indigo-700 rounded-lg">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
const Hero = () => {
  const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950">

      {/* ── Background: split image right side ── */}
      <div className="absolute inset-0">
        {/* Full bleed image — right half visible, left fades to dark */}
        <img
          src={IMAGES.hero}
          alt="Pepsi cans on ice"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.7) saturate(1.1)' }}
        />
        {/* Strong left-side dark panel so text is crisp */}
        <div className="absolute inset-0 bg-gradient-to-r
                        from-slate-950 via-slate-950/85 to-slate-950/20" />
        {/* Subtle indigo tint at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t
                        from-indigo-950/60 via-transparent to-transparent" />
        {/* Top vignette */}
        <div className="absolute inset-0 bg-gradient-to-b
                        from-slate-950/40 via-transparent to-transparent" />
      </div>

      {/* ── Decorative elements ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large glow behind text */}
        <div className="absolute top-1/2 -translate-y-1/2 -left-32
                        w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
        {/* Accent dot grid */}
        <div className="absolute top-24 right-[45%] w-px h-32
                        bg-gradient-to-b from-transparent via-indigo-500/40 to-transparent" />
        <div className="absolute bottom-24 right-[40%] w-px h-24
                        bg-gradient-to-b from-transparent via-blue-500/30 to-transparent" />
        {/* Floating ring */}
        <div className="absolute top-1/3 right-[38%] w-64 h-64 rounded-full
                        border border-indigo-500/10 animate-pulse"
             style={{ animationDuration: '4s' }} />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto
                      px-6 sm:px-10 lg:px-16 pt-28 pb-20
                      flex flex-col justify-center min-h-screen">

        {/* ── Left column — all text ── */}
        <div className="max-w-xl">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2.5 mb-8">
            <span className="flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/30
                             text-indigo-300 text-[11px] font-bold px-4 py-2 rounded-full
                             uppercase tracking-[0.15em] backdrop-blur-sm">
              <Zap size={10} className="text-indigo-400" />
              Enterprise Distribution Platform
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-black text-white tracking-tight leading-[1.0] mb-7">
            <span className="block text-5xl sm:text-6xl lg:text-[72px]">
              Distribute
            </span>
            <span className="block text-5xl sm:text-6xl lg:text-[72px]
                             text-transparent bg-clip-text
                             bg-gradient-to-r from-indigo-400 via-blue-300 to-cyan-400
                             drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]">
              Smarter.
            </span>
            <span className="block text-5xl sm:text-6xl lg:text-[72px] text-white/85">
              Sell Faster.
            </span>
          </h1>

          {/* Divider line */}
          <div className="flex items-center gap-3 mb-7">
            <div className="w-10 h-0.5 bg-indigo-500 rounded-full" />
            <div className="w-4 h-0.5 bg-indigo-500/40 rounded-full" />
            <div className="w-2 h-0.5 bg-indigo-500/20 rounded-full" />
          </div>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed mb-10 max-w-md">
            The all-in-one supply chain platform built for soft drink distributors.
            Track inventory, manage orders, and coordinate deliveries — all in real time.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5
                         bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm
                         rounded-xl transition-all duration-200
                         shadow-[0_8px_32px_rgba(99,102,241,0.45)]
                         hover:shadow-[0_8px_40px_rgba(99,102,241,0.65)]
                         hover:-translate-y-0.5 active:translate-y-0"
            >
              Start Free Today
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              onClick={() => scrollTo('#how-it-works')}
              className="inline-flex items-center gap-2 px-7 py-3.5
                         text-slate-300 hover:text-white text-sm font-semibold
                         border border-slate-700 hover:border-slate-500
                         rounded-xl transition-all duration-200 backdrop-blur-sm
                         hover:bg-white/5"
            >
              See How It Works
              <ChevronDown size={15} />
            </button>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center gap-6">
            {[
              { icon: CheckCircle, text: 'Real-time Tracking' },
              { icon: ShieldCheck, text: 'Role-Based Access'  },
              { icon: Package,     text: 'Instant Invoices'   },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={11} className="text-indigo-400" />
                </div>
                <span className="text-slate-400 text-xs font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Floating stats card — bottom right of text area ── */}
        <div className="absolute bottom-16 right-8 lg:right-16 hidden lg:block">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10
                          rounded-2xl p-5 shadow-2xl w-64">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-4">
              Live Platform Stats
            </p>
            <div className="space-y-3">
              {[
                { label: 'Orders Processed', value: '10,000+', color: 'bg-indigo-500' },
                { label: 'Active Retailers',  value: '500+',    color: 'bg-emerald-500' },
                { label: 'On-Time Delivery',  value: '98.5%',   color: 'bg-blue-500'   },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
                    <span className="text-slate-400 text-xs">{s.label}</span>
                  </div>
                  <span className="text-white text-sm font-bold">{s.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">System Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <button
        onClick={() => scrollTo('#stats')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2
                   flex flex-col items-center gap-1.5
                   text-slate-500 hover:text-slate-300 transition-colors"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase font-semibold">Scroll</span>
        <div className="w-5 h-8 border border-slate-600 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-slate-400 rounded-full animate-bounce" />
        </div>
      </button>
    </section>
  )
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
const Stats = () => {
  const stats = [
    { value: '10,000+', label: 'Orders Processed' },
    { value: '500+',    label: 'Active Retailers'  },
    { value: '98.5%',   label: 'On-Time Delivery'  },
    { value: '16+',     label: 'Product Brands'    },
  ]

  return (
    <section id="stats" className="bg-indigo-600 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-black text-white mb-1">{s.value}</p>
              <p className="text-indigo-200 text-sm font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Products Showcase ────────────────────────────────────────────────────────
const Products = () => {
  const categories = [
    { label: 'Cola',          img: IMAGES.pepsiCan,    count: '3 brands',  color: 'from-slate-900/60 to-indigo-900/40'   },
    { label: 'Sparkling',     img: IMAGES.sparkling,   count: '4 brands',  color: 'from-slate-900/60 to-cyan-900/40'     },
    { label: 'Energy Drinks', img: IMAGES.energyDrink, count: '3 brands',  color: 'from-slate-900/60 to-orange-900/40'   },
    { label: 'Juices',        img: IMAGES.juice,       count: '2 brands',  color: 'from-slate-900/60 to-orange-800/40'   },
    { label: 'Water',         img: IMAGES.water,       count: '3 brands',  color: 'from-slate-900/60 to-sky-900/40'      },
    { label: 'Iced Tea',      img: IMAGES.cocaCola,    count: '2 brands',  color: 'from-slate-900/60 to-amber-900/40'    },
  ]

  return (
    <section id="products" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-indigo-600 text-sm font-bold uppercase tracking-widest">Our Catalog</span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mt-3 mb-4">
            Premium Brands,<br />One Platform
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            From Pepsi to Red Bull — manage your entire soft drink portfolio from a single dashboard.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div key={cat.label}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {/* Image */}
              <img src={cat.img} alt={cat.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              {/* Gradient overlay — subtle dark tint so text is readable but image shows through */}
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} transition-opacity group-hover:opacity-90`} />
              {/* Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <p className="text-xl sm:text-2xl font-black drop-shadow-lg">{cat.label}</p>
                <p className="text-sm text-white/80 mt-1 font-medium">{cat.count}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700
                       text-white font-semibold rounded-xl transition-colors shadow-sm">
            Browse Full Catalog
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Features Section ─────────────────────────────────────────────────────────
const Features = () => {
  const features = [
    {
      icon: ShieldCheck,
      color: 'bg-indigo-100 text-indigo-600',
      title: 'Role-Based Access Control',
      desc: 'Four distinct roles — Distributor, Warehouse Manager, Retailer, and Delivery Personnel — each with tailored dashboards and permissions.',
    },
    {
      icon: Warehouse,
      color: 'bg-blue-100 text-blue-600',
      title: 'Real-Time Inventory',
      desc: 'Track every stock movement with a full audit log. Get instant low-stock alerts before you run out.',
    },
    {
      icon: ShoppingCartIcon,
      color: 'bg-emerald-100 text-emerald-600',
      title: 'One-Click Ordering',
      desc: 'Retailers browse the live catalog, build a cart, and place orders in seconds. Stock is deducted automatically.',
    },
    {
      icon: Truck,
      color: 'bg-amber-100 text-amber-600',
      title: 'Delivery Tracking',
      desc: 'Assign orders to drivers with one click. Drivers update status from Dispatched to Delivered in real time.',
    },
    {
      icon: BarChart3,
      color: 'bg-violet-100 text-violet-600',
      title: 'Sales Analytics',
      desc: 'Distributors get a live analytics dashboard — total revenue, order breakdown by status, and recent activity.',
    },
    {
      icon: Users,
      color: 'bg-rose-100 text-rose-600',
      title: 'User Management',
      desc: 'Create, activate, deactivate, and manage all users across your network from one admin panel.',
    },
  ]

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="text-indigo-600 text-sm font-bold uppercase tracking-widest">Platform Features</span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mt-3 mb-4">
            Everything You Need
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Built specifically for soft drink distribution — not a generic tool bolted together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title}
                className="group p-7 rounded-2xl border border-slate-100 hover:border-indigo-200
                           hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Inline icon component to avoid import issues
const ShoppingCartIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
)

// ─── How It Works ─────────────────────────────────────────────────────────────
const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      role: 'Distributor',
      roleBg: 'bg-indigo-600',
      accent: 'border-indigo-500/40 hover:border-indigo-400',
      glow: 'group-hover:shadow-indigo-500/20',
      title: 'Set Up Your Catalog',
      desc: 'Add products, set prices, and create accounts for your warehouse team, retailers, and drivers. Full control from day one.',
      img: IMAGES.warehouse,
    },
    {
      step: '02',
      role: 'Retailer',
      roleBg: 'bg-emerald-600',
      accent: 'border-emerald-500/40 hover:border-emerald-400',
      glow: 'group-hover:shadow-emerald-500/20',
      title: 'Browse & Order',
      desc: 'Retailers log in, browse the live product catalog, and place orders with real-time stock visibility. No phone calls needed.',
      img: IMAGES.retailer,
    },
    {
      step: '03',
      role: 'Warehouse',
      roleBg: 'bg-blue-600',
      accent: 'border-blue-500/40 hover:border-blue-400',
      glow: 'group-hover:shadow-blue-500/20',
      title: 'Manage Stock',
      desc: 'Warehouse managers record every stock movement. Full audit trail, low-stock alerts, and instant visibility across all products.',
      img: IMAGES.stock,
    },
    {
      step: '04',
      role: 'Delivery',
      roleBg: 'bg-amber-500',
      accent: 'border-amber-500/40 hover:border-amber-400',
      glow: 'group-hover:shadow-amber-500/20',
      title: 'Dispatch & Deliver',
      desc: 'Distributors assign orders to drivers in one click. Drivers update status on the go — retailers get notified instantly.',
      img: IMAGES.delivery,
    },
  ]

  return (
    <section id="how-it-works" className="py-28 bg-slate-950 relative overflow-hidden">

      {/* Background glow blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold
                           uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20
                           px-4 py-2 rounded-full mb-5">
            <Zap size={11} />
            The Process
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-2 mb-5 tracking-tight">
            Four Roles.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              One Workflow.
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            From warehouse shelf to retailer door — every step tracked, every role empowered.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((s, idx) => (
            <div
              key={s.step}
              className={`group relative overflow-hidden rounded-2xl bg-slate-900
                          border ${s.accent} transition-all duration-300
                          hover:shadow-2xl ${s.glow}`}
            >
              {/* Full background image with strong overlay */}
              <div className="absolute inset-0">
                <img
                  src={s.img}
                  alt={s.title}
                  className="w-full h-full object-cover transition-transform duration-700
                             group-hover:scale-105"
                  style={{ filter: 'brightness(0.25)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative p-8 min-h-[220px] flex flex-col justify-between">
                {/* Top row: step number + role badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 ${s.roleBg} rounded-2xl flex items-center
                                  justify-center text-white font-black text-xl shadow-lg
                                  ring-4 ring-white/10`}>
                    {s.step}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5
                                   rounded-full text-white ${s.roleBg} shadow-sm`}>
                    {s.role}
                  </span>
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-2xl font-black text-white mb-3 leading-tight">
                    {s.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                {/* Step connector line (not on last two) */}
                {idx < 2 && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-px h-6
                                  bg-gradient-to-b from-slate-600 to-transparent
                                  hidden md:block" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom connector */}
        <div className="flex items-center justify-center mt-16 gap-4">
          {steps.map((s, i) => (
            <React.Fragment key={s.step}>
              <div className={`w-3 h-3 rounded-full ${s.roleBg} shadow-lg`} />
              {i < steps.length - 1 && (
                <div className="flex-1 max-w-[80px] h-px bg-gradient-to-r from-slate-700 to-slate-600" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const Testimonials = () => {
  const reviews = [
    {
      name: 'Marcus Johnson',
      role: 'Regional Distributor',
      avatar: 'MJ',
      color: 'bg-indigo-600',
      stars: 5,
      text: "We cut our order processing time by 60%. The role-based dashboards mean everyone only sees what they need — no confusion, no mistakes.",
    },
    {
      name: 'Sarah Okonkwo',
      role: 'Warehouse Manager',
      avatar: 'SO',
      color: 'bg-emerald-600',
      stars: 5,
      text: "The stock audit log is a game changer. I can see every movement, who did it, and why. Low-stock alerts have saved us from running out twice already.",
    },
    {
      name: 'David Chen',
      role: 'Retail Store Owner',
      avatar: 'DC',
      color: 'bg-blue-600',
      stars: 5,
      text: "Ordering used to take phone calls and emails. Now I open the app, pick what I need, and it's done in two minutes. The invoice is right there.",
    },
    {
      name: 'Amara Diallo',
      role: 'Delivery Driver',
      avatar: 'AD',
      color: 'bg-amber-500',
      stars: 5,
      text: "My delivery list is always up to date. I tap one button to mark delivered and the retailer gets notified instantly. Super clean.",
    },
    {
      name: 'Tom Reeves',
      role: 'Operations Director',
      avatar: 'TR',
      color: 'bg-violet-600',
      stars: 5,
      text: "The analytics dashboard gives me a real-time view of revenue and order status. I used to wait for end-of-week reports — now I check it every morning.",
    },
    {
      name: 'Priya Nair',
      role: 'Franchise Retailer',
      avatar: 'PN',
      color: 'bg-rose-500',
      stars: 5,
      text: "I manage three stores and track all orders from one account. The order history and invoices are always there when I need them.",
    },
  ]

  return (
    <section id="testimonials" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="text-indigo-600 text-sm font-bold uppercase tracking-widest">Testimonials</span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mt-3 mb-4">
            Trusted by the Network
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            From distributors to drivers — here's what the team says.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.name}
              className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm
                         hover:shadow-md transition-shadow duration-300">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(r.stars)].map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              {/* Quote */}
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                &ldquo;{r.text}&rdquo;
              </p>
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${r.color} flex items-center justify-center
                                text-white text-sm font-bold flex-shrink-0`}>
                  {r.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
const CTABanner = () => (
  <section className="relative py-32 overflow-hidden">

    {/* Background */}
    <div className="absolute inset-0">
      <img
        src={IMAGES.cta}
        alt="Soft drink production line"
        className="w-full h-full object-cover object-center"
        style={{ filter: 'brightness(0.55) saturate(1.3)' }}
      />
      {/* Deep indigo overlay — lighter so image shows through */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/70 via-slate-900/60 to-indigo-900/50" />
      {/* Top edge fade */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-slate-50 to-transparent" />
    </div>

    {/* Glow orbs */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl" />
    </div>

    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-400/25
                      text-indigo-300 text-xs font-bold px-5 py-2.5 rounded-full mb-8
                      uppercase tracking-widest backdrop-blur-sm">
        <Package size={12} />
        Ready to Scale?
      </div>

      {/* Headline */}
      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
        Start Managing Your
        <span className="block text-transparent bg-clip-text
                         bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
          Distribution Network
        </span>
        Today
      </h2>

      {/* Subtext */}
      <p className="text-slate-300/80 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
        Set up your account in minutes. Add your team, load your products,
        and start taking orders — no credit card required.
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {['Free to start', '4 user roles', 'Real-time inventory', 'Order tracking', 'Email notifications'].map((f) => (
          <span key={f}
            className="flex items-center gap-1.5 bg-white/8 border border-white/10
                       text-white/70 text-xs font-medium px-4 py-2 rounded-full backdrop-blur-sm">
            <CheckCircle size={12} className="text-indigo-400" />
            {f}
          </span>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/register"
          className="inline-flex items-center justify-center gap-2.5 px-10 py-4
                     bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base
                     rounded-xl transition-all duration-200
                     shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)]
                     hover:-translate-y-0.5">
          Create Free Account
          <ArrowRight size={18} />
        </Link>
        <Link to="/login"
          className="inline-flex items-center justify-center gap-2.5 px-10 py-4
                     bg-white/8 hover:bg-white/15 border border-white/15 hover:border-white/30
                     text-white font-semibold text-base rounded-xl
                     transition-all duration-200 backdrop-blur-sm">
          Sign In to Dashboard
        </Link>
      </div>
    </div>
  </section>
)

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="bg-slate-900 border-t border-slate-800 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Droplets size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white">
              SoftDrink<span className="text-indigo-400">Dist</span>
            </span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            The enterprise-grade distribution management platform built for the soft drink industry.
          </p>
        </div>

        {/* Platform */}
        <div>
          <p className="text-white font-semibold text-sm mb-4">Platform</p>
          <ul className="space-y-2.5">
            {['Dashboard', 'Inventory', 'Orders', 'Analytics', 'Deliveries'].map((l) => (
              <li key={l}>
                <Link to="/login" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Roles */}
        <div>
          <p className="text-white font-semibold text-sm mb-4">Roles</p>
          <ul className="space-y-2.5">
            {['Distributor', 'Warehouse Manager', 'Retailer', 'Delivery Personnel'].map((l) => (
              <li key={l}>
                <span className="text-slate-400 text-sm">{l}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} SoftDrinkDist. Built with Node.js, React, Tailwindcss & MongoDB.
        </p>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Droplets size={14} className="text-indigo-500" />
          Powered by the distribution network
        </div>
      </div>
    </div>
  </footer>
)

// ─── Main Export ──────────────────────────────────────────────────────────────
const LandingPage = () => {
  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="font-sans">
      <Navbar />
      <Hero />
      <Stats />
      <Products />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  )
}

export default LandingPage
