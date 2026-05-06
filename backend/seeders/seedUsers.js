/**
 * seedUsers.js
 * Creates one sample user per role.
 *
 * Usage:
 *   node backend/seeders/seedUsers.js
 *
 * Options:
 *   --fresh   Wipe ALL existing users before seeding
 */

const mongoose = require('mongoose')
const dotenv   = require('dotenv')
const path     = require('path')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const User = require('../models/User')

// ─── Sample users ─────────────────────────────────────────────────────────────
const SAMPLE_USERS = [
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

// ─── Run ──────────────────────────────────────────────────────────────────────
const seed = async () => {
  const isFresh = process.argv.includes('--fresh')

  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB:', process.env.MONGO_URI)

    if (isFresh) {
      await User.deleteMany({})
      console.log('🗑️  Cleared existing users (--fresh flag)')
    }

    const results = []

    for (const userData of SAMPLE_USERS) {
      const exists = await User.findOne({ email: userData.email })

      if (exists) {
        console.log(`⚠️  Skipped  [${userData.role.padEnd(20)}] ${userData.email} — already exists`)
        results.push({ ...userData, skipped: true })
        continue
      }

      // Password is hashed automatically by the User model pre-save hook
      await User.create(userData)
      console.log(`✅ Created  [${userData.role.padEnd(20)}] ${userData.email}`)
      results.push({ ...userData, skipped: false })
    }

    // ── Summary table ──────────────────────────────────────────────────────
    console.log('\n' + '─'.repeat(60))
    console.log('  SEED SUMMARY — Login Credentials')
    console.log('─'.repeat(60))
    console.log(
      '  Role'.padEnd(24) +
      'Email'.padEnd(30) +
      'Password'
    )
    console.log('─'.repeat(60))

    for (const u of SAMPLE_USERS) {
      console.log(
        `  ${u.role.padEnd(22)}` +
        `${u.email.padEnd(30)}` +
        `${u.password}`
      )
    }

    console.log('─'.repeat(60))
    console.log('  All passwords should be changed in production.\n')

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
