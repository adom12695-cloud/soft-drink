/**
 * seed.js — Master seeder
 * Runs users + products in sequence.
 *
 * Usage:
 *   node backend/seeders/seed.js           # skip existing records
 *   node backend/seeders/seed.js --fresh   # wipe everything first
 */
const dns = require('node:dns/promises');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose')
const dotenv   = require('dotenv')
const path     = require('path')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const User    = require('../models/User')
const Product = require('../models/Product')

const isFresh = process.argv.includes('--fresh')

// ─── Users ────────────────────────────────────────────────────────────────────
const USERS = [
  {
    name:     'Admin Distributor',
    email:    'admin@softdrink.com',
    password: 'admin123',
    role:     'distributor',
    phone:    '+1 555-0100',
    address:  '1 Distribution HQ, New York, NY',
  },
  {
    name:     'Warehouse Manager',
    email:    'warehouse@softdrink.com',
    password: 'warehouse123',
    role:     'warehouse_manager',
    phone:    '+1 555-0200',
    address:  'Warehouse A, Brooklyn, NY',
  },
  {
    name:     'Retailer Shop',
    email:    'retailer@softdrink.com',
    password: 'retailer123',
    role:     'retailer',
    phone:    '+1 555-0300',
    address:  '42 Main Street, Queens, NY',
  },
  {
    name:     'Delivery Driver',
    email:    'delivery@softdrink.com',
    password: 'delivery123',
    role:     'delivery_personnel',
    phone:    '+1 555-0400',
    address:  'Depot B, Bronx, NY',
  },
]

// ─── Products ─────────────────────────────────────────────────────────────────
const PRODUCTS = [
  { name: 'Coca-Cola Classic',    brand: 'Coca-Cola',  category: 'cola',         sku: 'CC-500ML',     pricePerUnit: 1.50, unitSize: '500ml', stockQuantity: 500, lowStockThreshold: 100 },
  { name: 'Pepsi Cola',           brand: 'Pepsi',      category: 'cola',         sku: 'PEPSI-500ML',  pricePerUnit: 1.45, unitSize: '500ml', stockQuantity: 450, lowStockThreshold: 100 },
  { name: 'Coca-Cola Zero Sugar', brand: 'Coca-Cola',  category: 'cola',         sku: 'CCZ-500ML',    pricePerUnit: 1.55, unitSize: '500ml', stockQuantity: 300, lowStockThreshold: 80  },
  { name: 'Sprite',               brand: 'Coca-Cola',  category: 'sparkling',    sku: 'SPRITE-500ML', pricePerUnit: 1.50, unitSize: '500ml', stockQuantity: 400, lowStockThreshold: 100 },
  { name: 'Fanta Orange',         brand: 'Coca-Cola',  category: 'sparkling',    sku: 'FANTA-500ML',  pricePerUnit: 1.50, unitSize: '500ml', stockQuantity: 380, lowStockThreshold: 100 },
  { name: '7UP',                  brand: 'PepsiCo',    category: 'sparkling',    sku: '7UP-500ML',    pricePerUnit: 1.45, unitSize: '500ml', stockQuantity: 420, lowStockThreshold: 100 },
  { name: 'Tropicana Orange',     brand: 'Tropicana',  category: 'juice',        sku: 'TROP-1L',      pricePerUnit: 3.99, unitSize: '1L',    stockQuantity: 200, lowStockThreshold: 50  },
  { name: 'Minute Maid Apple',    brand: 'Minute Maid',category: 'juice',        sku: 'MM-APPLE-1L',  pricePerUnit: 3.50, unitSize: '1L',    stockQuantity: 180, lowStockThreshold: 50  },
  { name: 'Dasani Water',         brand: 'Dasani',     category: 'water',        sku: 'DASANI-500ML', pricePerUnit: 0.99, unitSize: '500ml', stockQuantity: 800, lowStockThreshold: 200 },
  { name: 'Aquafina Water',       brand: 'Aquafina',   category: 'water',        sku: 'AQF-500ML',    pricePerUnit: 0.95, unitSize: '500ml', stockQuantity: 750, lowStockThreshold: 200 },
  { name: 'Smartwater',           brand: 'Glaceau',    category: 'water',        sku: 'SMART-1L',     pricePerUnit: 2.50, unitSize: '1L',    stockQuantity: 40,  lowStockThreshold: 50  },
  { name: 'Red Bull',             brand: 'Red Bull',   category: 'energy_drink', sku: 'RB-250ML',     pricePerUnit: 2.99, unitSize: '250ml', stockQuantity: 350, lowStockThreshold: 100 },
  { name: 'Monster Energy',       brand: 'Monster',    category: 'energy_drink', sku: 'MONSTER-500ML',pricePerUnit: 3.25, unitSize: '500ml', stockQuantity: 280, lowStockThreshold: 80  },
  { name: 'Rockstar Energy',      brand: 'Rockstar',   category: 'energy_drink', sku: 'ROCK-500ML',   pricePerUnit: 3.00, unitSize: '500ml', stockQuantity: 30,  lowStockThreshold: 50  },
  { name: 'Lipton Iced Tea',      brand: 'Lipton',     category: 'other',        sku: 'LIPTON-500ML', pricePerUnit: 1.75, unitSize: '500ml', stockQuantity: 250, lowStockThreshold: 60  },
  { name: 'Gatorade Lemon-Lime',  brand: 'Gatorade',   category: 'other',        sku: 'GATOR-500ML',  pricePerUnit: 2.25, unitSize: '500ml', stockQuantity: 220, lowStockThreshold: 60  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const seedUsers = async () => {
  console.log('\n👤 Seeding users…')
  let created = 0, skipped = 0

  for (const u of USERS) {
    const exists = await User.findOne({ email: u.email })
    if (exists) { console.log(`  ⚠️  Skip  ${u.email}`); skipped++; continue }
    await User.create(u)
    console.log(`  ✅ Created  [${u.role}]  ${u.email}`)
    created++
  }

  console.log(`  → ${created} created, ${skipped} skipped`)
}

const seedProducts = async () => {
  console.log('\n🥤 Seeding products…')
  let created = 0, skipped = 0

  for (const p of PRODUCTS) {
    const exists = await Product.findOne({ sku: p.sku })
    if (exists) { console.log(`  ⚠️  Skip  ${p.sku}`); skipped++; continue }
    await Product.create({ ...p, isActive: true })
    console.log(`  ✅ Created  [${p.sku}]  ${p.name}`)
    created++
  }

  console.log(`  → ${created} created, ${skipped} skipped`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    if (isFresh) {
      await User.deleteMany({})
      await Product.deleteMany({})
      console.log('🗑️  Wiped users + products (--fresh)')
    }

    await seedUsers()
    await seedProducts()

    // ── Print credentials ──────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(65))
    console.log('  🔑  LOGIN CREDENTIALS')
    console.log('═'.repeat(65))
    console.log('  Role'.padEnd(24) + 'Email'.padEnd(30) + 'Password')
    console.log('─'.repeat(65))
    for (const u of USERS) {
      console.log(`  ${u.role.padEnd(22)}${u.email.padEnd(30)}${u.password}`)
    }
    console.log('═'.repeat(65))
    console.log('  ⚠️  Change all passwords before going to production!\n')

    await mongoose.disconnect()
    console.log('🔌 Disconnected. Seed complete.')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Seed error:', err.message)
    await mongoose.disconnect()
    process.exit(1)
  }
}

run()
