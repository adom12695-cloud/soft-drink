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
  hero: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=1400&q=80',
  // Products section
  pepsiCan:   'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80',
  cocaCola:   'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80',
  energyDrink:'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=600&q=80',
  juice:      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80',
  water:      'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80',
  sparkling:  'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=600&q=80',
  // About / warehouse
  warehouse:  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80',
  // Delivery
  delivery:   'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=80',
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
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* Background image */}
      <div className="absolute inset-0">
        <img src={IMAGES.hero} alt="Pepsi cans on ice"
          className="w-full h-full object-cover object-center" />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/30" />
        {/* Blue tint at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 via-transparent to-transparent" />
      </div>

      {/* Floating bubbles decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div key={i}
            className="absolute rounded-full bg-white/5 border border-white/10 animate-pulse"
            style={{
              width:  `${40 + i * 20}px`,
              height: `${40 + i * 20}px`,
              top:    `${10 + i * 10}%`,
              left:   `${60 + (i % 3) * 12}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-2xl">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30
                          backdrop-blur-sm text-indigo-300 text-xs font-semibold px-4 py-2
                          rounded-full mb-6 uppercase tracking-widest">
            <Zap size={12} />
            Enterprise Distribution Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            Distribute
            <span className="block text-transparent bg-clip-text
                             bg-gradient-to-r from-indigo-400 to-blue-400">
              Smarter.
            </span>
            Sell Faster.
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-10 max-w-xl">
            The all-in-one supply chain platform for soft drink distributors.
            Track inventory, manage orders, and coordinate deliveries — all in real time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4
                         bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base
                         rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/50
                         hover:shadow-indigo-600/40 hover:-translate-y-0.5">
              Start Free Today
              <ArrowRight size={18} />
            </Link>
            <button onClick={() => scrollTo('#how-it-works')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4
                         bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white
                         font-semibold text-base rounded-xl border border-white/20
                         transition-all duration-200">
              See How It Works
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-6 mt-12">
            {['Real-time Tracking', 'Role-Based Access', 'Instant Invoices'].map((t) => (
              <div key={t} className="flex items-center gap-2 text-slate-300 text-sm">
                <CheckCircle size={16} className="text-indigo-400 flex-shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button onClick={() => scrollTo('#stats')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50
                   hover:text-white transition-colors animate-bounce">
        <ChevronDown size={28} />
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
      color: 'bg-indigo-600',
      title: 'Set Up Your Catalog',
      desc: 'Add products, set prices, and create accounts for your warehouse team, retailers, and drivers.',
      img: IMAGES.warehouse,
    },
    {
      step: '02',
      role: 'Retailer',
      color: 'bg-emerald-600',
      title: 'Browse & Order',
      desc: 'Retailers log in, browse the live product catalog, and place orders with real-time stock visibility.',
      img: IMAGES.pepsiCan,
    },
    {
      step: '03',
      role: 'Warehouse',
      color: 'bg-blue-600',
      title: 'Manage Stock',
      desc: 'Warehouse managers record stock in/out movements. Every change is logged with a full audit trail.',
      img: IMAGES.cocaCola,
    },
    {
      step: '04',
      role: 'Delivery',
      color: 'bg-amber-500',
      title: 'Dispatch & Deliver',
      desc: 'Distributors assign orders to drivers. Drivers update status from Dispatched to Delivered on the go.',
      img: IMAGES.delivery,
    },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="text-indigo-400 text-sm font-bold uppercase tracking-widest">The Process</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
            How It Works
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Four roles, one seamless workflow — from warehouse shelf to retailer door.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((s) => (
            <div key={s.step}
              className="group relative overflow-hidden rounded-2xl bg-slate-800 border border-slate-700
                         hover:border-indigo-500/50 transition-all duration-300">
              {/* Background image */}
              <div className="absolute inset-0">
                <img src={s.img} alt={s.title}
                  className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 to-slate-900/80" />
              </div>

              <div className="relative p-8">
                <div className="flex items-start gap-5">
                  <div className={`flex-shrink-0 w-12 h-12 ${s.color} rounded-xl flex items-center
                                  justify-center text-white font-black text-lg shadow-lg`}>
                    {s.step}
                  </div>
                  <div>
                    <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1
                                     rounded-full text-white ${s.color} mb-3 inline-block`}>
                      {s.role}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            </div>
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
  <section className="relative py-24 overflow-hidden">
    {/* Background */}
    <div className="absolute inset-0">
      <img src={IMAGES.delivery} alt="Delivery truck"
        className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/95 via-indigo-900/85 to-indigo-900/70" />
    </div>

    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20
                      text-indigo-200 text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
        <Package size={12} />
        Ready to Scale?
      </div>
      <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
        Start Managing Your<br />Distribution Network Today
      </h2>
      <p className="text-indigo-200 text-lg mb-10 max-w-xl mx-auto">
        Set up your account in minutes. Add your team, load your products, and start taking orders.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/register"
          className="inline-flex items-center justify-center gap-2 px-10 py-4
                     bg-white hover:bg-slate-100 text-indigo-700 font-bold text-base
                     rounded-xl transition-colors shadow-xl">
          Create Free Account
          <ArrowRight size={18} />
        </Link>
        <Link to="/login"
          className="inline-flex items-center justify-center gap-2 px-10 py-4
                     bg-white/10 hover:bg-white/20 border border-white/30 text-white
                     font-semibold text-base rounded-xl transition-colors backdrop-blur-sm">
          Sign In
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
