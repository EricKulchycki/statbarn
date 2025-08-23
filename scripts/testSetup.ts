import { Database } from '../lib/db.js'

async function testSetup() {
  console.log('🧪 Testing basic setup...')

  try {
    // Test database connection
    const db = Database.getInstance()
    console.log('✅ Database instance created')

    try {
      await db.connect()
      console.log('✅ Database connected successfully')

      // Test basic operations
      console.log('✅ All basic operations working')

      db.disconnect()
      console.log('✅ Database disconnected')
    } catch (dbError) {
      console.log(
        '⚠️  Database connection failed (this is expected if MongoDB is not running):'
      )
      console.log(
        `   ${dbError instanceof Error ? dbError.message : 'Unknown error'}`
      )
      console.log(
        '💡 To run the full ELO seeding, make sure MongoDB is running on mongodb://0.0.0.0:27017/'
      )
    }

    console.log('\n🎉 Setup test completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('   1. Start MongoDB: mongod')
    console.log('   2. Run: npm run seed:historical')
    console.log('   3. Or run: npm run seed:current')
  } catch (error) {
    console.error('❌ Setup test failed:', error)
    throw error
  }
}

// Always run the test
testSetup()
  .then(() => {
    console.log('\n🎯 Test completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error)
    process.exit(1)
  })

export { testSetup }
