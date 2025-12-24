import { config } from 'dotenv';
import { CloudflareAutoRAG } from '../server/cloudflare-rag';
import { Client } from 'pg';

// Load environment variables
config();

async function testAutoRAG() {
  // Initialize CloudflareAutoRAG
  const autoRAG = new CloudflareAutoRAG({
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    apiToken: process.env.CLOUDFLARE_API_TOKEN!,
    indexName: 'hawk-eye-lyrics',
    projectName: 'lyrical-miracles'
  });

  // Test database connection
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Testing Database Connection...');
    await client.connect();
    const dbTest = await client.query('SELECT now() as now');
    console.log('Database connected:', dbTest.rows[0]);

    console.log('\nTesting Cloudflare AutoRAG...');
    // Test semantic search
    const searchResults = await autoRAG.semanticSearch('consciousness awakening');
    console.log('Search Results:', JSON.stringify(searchResults, null, 2));

    // Test lyrical context
    const contextResults = await autoRAG.getLyricalContext('What are the main themes in Swordfish?');
    console.log('Context Results:', JSON.stringify(contextResults, null, 2));

  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await client.end();
  }
}

testAutoRAG().catch(console.error);