// frontend/scripts/cleanup-mock-data.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Starting frontend cleanup - removing all mock data...\n');

// Files/folders to clean up
const filesToClean = [
  // Mock data files
  'src/data/mockData.ts',
  'src/data/mockOrganizations.ts',
  'src/data/mockSubmissions.ts',
  'src/data/mockUsers.ts',
  'src/data/mockStats.ts',
  'src/data/mockIndicators.ts',
  'src/data/mockNotifications.ts',
  'src/data/mockChats.ts',
  
  // Mock services
  'src/services/mockApi.ts',
  
  // If entire data folder is just mocks
  'src/data',
];

let deletedCount = 0;
let notFoundCount = 0;

filesToClean.forEach(relativePath => {
  const fullPath = path.join(__dirname, '..', relativePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        // Delete directory and all contents
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✅ Deleted folder: ${relativePath}`);
        deletedCount++;
      } else {
        // Delete file
        fs.unlinkSync(fullPath);
        console.log(`✅ Deleted file: ${relativePath}`);
        deletedCount++;
      }
    } else {
      console.log(`⚠️  Not found: ${relativePath}`);
      notFoundCount++;
    }
  } catch (error) {
    console.log(`❌ Error deleting ${relativePath}:`, error.message);
  }
});

console.log('\n📊 Cleanup Summary:');
console.log(`   ✅ Deleted: ${deletedCount} items`);
console.log(`   ⚠️  Not found: ${notFoundCount} items`);

console.log('\n🎉 Cleanup complete!');
console.log('\n📝 Next steps:');
console.log('   1. Update src/services/api.ts to use real backend');
console.log('   2. Update components to fetch from API instead of mock data');
console.log('   3. Create .env file with VITE_API_URL=http://localhost:5001/api');
console.log('   4. Run: npm run dev\n');