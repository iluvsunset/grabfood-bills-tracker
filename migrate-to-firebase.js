const admin = require('firebase-admin');
const { google } = require('googleapis');

// Load service account
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateFromGoogleSheets() {
  console.log('🚀 Starting migration from Google Sheets to Firebase...\n');

  try {
    // Set up Google Sheets API
    const auth = new google.auth.GoogleAuth({
      keyFile: './serviceAccountKey.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // ⚠️ REPLACE THIS WITH YOUR ACTUAL SPREADSHEET ID
    const spreadsheetId = '1Jq06UtVwUgzwJIaMBCG9TW2haHUIaEMs5Ghxg4iiKEU';
    
    // 🎯 ONLY read from "GrabFood Bills" sheet, starting at row 3
    const sheetName = 'GrabFood Bills';
    const range = `${sheetName}!A3:E`; // Only columns A-E, starting from row 3
    
    console.log(`📊 Fetching data from sheet: "${sheetName}"...`);
    console.log(`📍 Reading range: ${range}\n`);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: range,
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      console.log(`❌ No data found in sheet "${sheetName}".`);
      console.log('💡 Make sure the sheet name is exactly "GrabFood Bills" (case-sensitive)');
      return;
    }

    console.log(`✅ Found ${rows.length} rows in "${sheetName}" sheet\n`);

    let successCount = 0;
    let skipCount = 0;
    let batchCount = 0;
    let batch = db.batch();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const [datetime, store, items, total, link] = row;
      
      // Skip rows that don't have both datetime AND store
      if (!datetime || !store) {
        console.log(`⚠️  Row ${i + 3}: Skipping (missing date or store) - ${datetime || 'NO DATE'} | ${store || 'NO STORE'}`);
        skipCount++;
        continue;
      }
      
      // Create document in Firestore
      const docRef = db.collection('grabfood_bills').doc();
      batch.set(docRef, {
        datetime: String(datetime).trim(),
        store: String(store).trim(),
        items: items ? String(items).trim() : '',
        total: total ? String(total).trim() : '',
        link: link ? String(link).trim() : '',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      successCount++;
      batchCount++;
      
      // Commit every 500 documents (Firestore batch limit)
      if (batchCount >= 500) {
        await batch.commit();
        console.log(`✅ Batch committed: ${successCount} bills migrated so far...`);
        batch = db.batch();
        batchCount = 0;
      }
      
      // Progress indicator every 50 rows
      if ((i + 1) % 50 === 0) {
        console.log(`📈 Progress: ${i + 1}/${rows.length} rows processed`);
      }
    }
    
    // Commit any remaining documents
    if (batchCount > 0) {
      await batch.commit();
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Migration Complete!');
    console.log('='.repeat(60));
    console.log(`📊 Sheet processed: "${sheetName}"`);
    console.log(`✅ Successfully migrated: ${successCount} bills`);
    console.log(`⚠️  Skipped (invalid): ${skipCount} rows`);
    console.log(`📊 Total rows processed: ${rows.length}`);
    console.log('='.repeat(60) + '\n');
    
    // Show sample of migrated data
    if (successCount > 0) {
      console.log('📋 Sample of migrated bills:');
      const sampleQuery = await db.collection('grabfood_bills')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();
      
      sampleQuery.forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. ${data.datetime} | ${data.store}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed with error:');
    console.error(error.message);
    
    if (error.code === 404) {
      console.error('\n💡 Possible issues:');
      console.error('   1. Sheet name is wrong (must be exactly "GrabFood Bills")');
      console.error('   2. Spreadsheet ID is incorrect');
      console.error('   3. Sheet not shared with service account email');
    }
    
    if (error.message.includes('Unable to parse range')) {
      console.error('\n💡 Sheet name might be incorrect. Check if it\'s exactly "GrabFood Bills"');
    }
  }
}

// Run the migration
migrateFromGoogleSheets()
  .then(() => {
    console.log('✅ Script finished successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });