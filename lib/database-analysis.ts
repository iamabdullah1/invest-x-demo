// Database analysis and optimization script
import { analyzeIndexes, testQueryPerformance, createPerformanceIndexes } from '../lib/database-indexes';

async function runDatabaseAnalysis() {
  console.log('📊 Starting comprehensive database analysis...\n');

  try {
    // 1. Analyze existing indexes
    console.log('1️⃣ Analyzing existing database indexes...');
    const indexAnalysis = await analyzeIndexes();
    console.log('Index Analysis Results:');
    console.log(JSON.stringify(indexAnalysis, null, 2));
    
    // 2. Test query performance
    console.log('\n2️⃣ Testing query performance...');
    const performanceResults = await testQueryPerformance();
    console.log('Query Performance Results:');
    console.log(JSON.stringify(performanceResults, null, 2));

    // 3. Create optimized indexes
    console.log('\n3️⃣ Creating performance indexes...');
    await createPerformanceIndexes();

    // 4. Re-test performance after optimization
    console.log('\n4️⃣ Re-testing query performance after optimization...');
    const optimizedResults = await testQueryPerformance();
    console.log('Optimized Query Performance Results:');
    console.log(JSON.stringify(optimizedResults, null, 2));

    // 5. Generate optimization report
    console.log('\n📈 OPTIMIZATION REPORT');
    console.log('='.repeat(50));
    
    Object.keys(performanceResults).forEach(queryName => {
      const before = performanceResults[queryName];
      const after = optimizedResults[queryName];
      
      if (before.executionTime && after.executionTime) {
        const improvement = ((before.executionTime - after.executionTime) / before.executionTime) * 100;
        console.log(`${queryName}:`);
        console.log(`  Before: ${before.executionTime}ms`);
        console.log(`  After: ${after.executionTime}ms`);
        console.log(`  Improvement: ${improvement.toFixed(1)}%\n`);
      }
    });

    console.log('✅ Database optimization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database analysis failed:', error);
    process.exit(1);
  }
}

// Run the analysis
if (require.main === module) {
  runDatabaseAnalysis()
    .then(() => {
      console.log('\n🎉 Database analysis and optimization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database analysis failed:', error);
      process.exit(1);
    });
}
