/**
 * seedProducts.js
 * Creates sample soft drink products.
 *
 * Usage:
 *   node backend/seeders/seedProducts.js
 *
 * Options:
 *   --fresh   Wipe ALL existing products before seeding
 */

const mongoose = require('mongoose')
const dotenv   = require('dotenv')
const path     = require('path')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const Product = require('../models/Product')

// ─── Sample products ──────────────────────────────────────────────────────────
const SAMPLE_PRODUCTS = [
  // Cola
  {
    name: 'Coca-Cola Classic',
    brand: 'Coca-Cola',
    category: 'cola',
    sku: 'CC-500ML',
    description: 'The original Coca-Cola taste',
    pricePerUnit: 1.50,
    unitSize: '500ml',
    stockQuantity: 500,
    lowStockThreshold: 100,
    isActive: true,
  },
  {
    name: 'Pepsi Cola',
    brand: 'Pepsi',
    category: 'cola',
    sku: 'PEPSI-500ML',
    description: 'Bold cola flavor',
    pricePerUnit: 1.45,
    unitSize: '500ml',
    stockQuantity: 450,
    lowStockThreshold: 100,
    isActive: true,
  },
  {
    name: 'Coca-Cola Zero Sugar',
    brand: 'Coca-Cola',
    category: 'cola',
    sku: 'CCZ-500ML',
    description: 'Zero sugar, same great taste',
    pricePerUnit: 1.55,
    unitSize: '500ml',
    stockQuantity: 300,
    lowStockThreshold: 80,
    isActive: true,
  },

  // Juice
  {
    name: 'Tropicana Orange Juice',
    brand: 'Tropicana',
    category: 'juice',
    sku: 'TROP-1L',
    description: 'Pure premium orange juice',
    pricePerUnit: 3.99,
    unitSize: '1L',
    stockQuantity: 200,
    lowStockThreshold: 50,
    isActive: true,
  },
  {
    name: 'Minute Maid Apple Juice',
    brand: 'Minute Maid',
    category: 'juice',
    sku: 'MM-APPLE-1L',
    description: 'Fresh apple juice',
    pricePerUnit: 3.50,
    unitSize: '1L',
    stockQuantity: 180,
    lowStockThreshold: 50,
    isActive: true,
  },

  // Water
  {
    name: 'Dasani Purified Water',
    brand: 'Dasani',
    category: 'water',
    sku: 'DASANI-500ML',
    description: 'Purified drinking water',
    pricePerUnit: 0.99,
    unitSize: '500ml',
    stockQuantity: 800,
    lowStockThreshold: 200,
    isActive: true,
  },
  {
    name: 'Aquafina Water',
    brand: 'Aquafina',
    category: 'water',
    sku: 'AQF-500ML',
    description: 'Pure water, perfect taste',
    pricePerUnit: 0.95,
    unitSize: '500ml',
    stockQuantity: 750,
    lowStockThreshold: 200,
    isActive: true,
  },
  {
    name: 'Smartwater',
    brand: 'Glaceau',
    category: 'water',
    sku: 'SMART-1L',
    description: 'Vapor-distilled water with electrolytes',
    pricePerUnit: 2.50,
    unitSize: '1L',
    stockQuantity: 40,  // Low stock example
    lowStockThreshold: 50,
    isActive: true,
  },

  // Energy Drinks
  {
    name: 'Red Bull Energy Drink',
    brand: 'Red Bull',
    category: 'energy_drink',
    sku: 'RB-250ML',
    description: 'Gives you wings',
    pricePerUnit: 2.99,
    unitSize: '250ml',
    stockQuantity: 350,
    lowStockThreshold: 100,
    isActive: true,
  },
  {
    name: 'Monster Energy',
    brand: 'Monster',
    category: 'energy_drink',
    sku: 'MONSTER-500ML',
    description: 'Unleash the beast',
    pricePerUnit: 3.25,
    unitSize: '500ml',
    stockQuantity: 280,
    lowStockThreshold: 80,
    isActive: true,
  },
  {
    name: 'Rockstar Energy',
    brand: 'Rockstar',
    category: 'energy_drink',
    sku: 'ROCK-500ML',
    description: 'Party like a rockstar',
    pricePerUnit: 3.00,
    unitSize: '500ml',
    stockQuantity: 30,  // Low stock example
    lowStockThreshold: 50,
    isActive: true,
  },

  // Sparkling
  {
    name: 'Sprite',
    brand: 'Coca-Cola',
    category: 'sparkling',
    sku: 'SPRITE-500ML',
    description: 'Lemon-lime flavored sparkling drink',
    pricePerUnit: 1.50,
    unitSize: '500ml',
    stockQuantity: 400,
    lowStockThreshold: 100,
    isActive: true,
  },
  {
    name: 'Fanta Orange',
    brand: 'Coca-Cola',
    category: 'sparkling',
    sku: 'FANTA-500ML',
    description: 'Orange flavored sparkling drink',
    pricePerUnit: 1.50,
    unitSize: '500ml',
    stockQuantity: 380,
    lowStockThreshold: 100,
    isActive: true,
  },
  {
    name: '7UP',
    brand: 'PepsiCo',
    category: 'sparkling',
    sku: '7UP-500ML',
    description: 'Crisp lemon-lime taste',
    pricePerUnit: 1.45,
    unitSize: '500ml',
    stockQuantity: 420,
    lowStockThreshold: 100,
    isActive: true,
  },

  // Other
  {
    name: 'Lipton Iced Tea',
    brand: 'Lipton',
    category: 'other',
    sku: 'LIPTON-500ML',
    description: 'Refreshing iced tea',
    pricePerUnit: 1.75,
    unitSize: '500ml',
    stockQuantity: 250,
    lowStockThreshold: 60,
    isActive: true,
  },
  {
    name: 'Gatorade Lemon-Lime',
    brand: 'Gatorade',
    category: 'other',
    sku: 'GATOR-500ML',
    description: 'Sports drink with electrolytes',
    pricePerUnit: 2.25,
    unitSize: '500ml',
    stockQuantity: 220,
    lowStockThreshold: 60,
    isActive: true,
  },
]

// ─── Run ──────────────────────────────────────────────────────────────────────
const seed = async () => {
  const isFresh = process.argv.includes('--fresh')

  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    if (isFresh) {
      await Product.deleteMany({})
      console.log('🗑️  Cleared existing products (--fresh flag)')
    }

    let created = 0
    let skipped = 0

    for (const productData of SAMPLE_PRODUCTS) {
      const exists = await Product.findOne({ sku: productData.sku })

      if (exists) {
        console.log(`⚠️  Skipped  [${productData.sku.padEnd(15)}] ${productData.name}`)
        skipped++
        continue
      }

      await Product.create(productData)
      console.log(`✅ Created  [${productData.sku.padEnd(15)}] ${productData.name}`)
      created++
    }

    console.log('\n' + '─'.repeat(60))
    console.log(`  ✅ Created: ${created} products`)
    console.log(`  ⚠️  Skipped: ${skipped} products (already exist)`)
    console.log('─'.repeat(60) + '\n')

    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seed failed:', err.message)
    await mongoose.disconnect()
    process.exit(1)
  }
}

seed()
