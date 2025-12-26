const admin = require('firebase-admin');
const { google } = require('googleapis');
const fs = require('fs');

// Load Firebase service account
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 🔑 Get user ID by email
async function getUserIdByEmail(email) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return userRecord.uid;
  } catch (error) {
    console.error('❌ Error finding user:', error.message);
    console.log('💡 Make sure you sign in to the web app at least once first!');
    return null;
  }
}

// 🕒 Format date to "YYYY-MM-DD | HH:MM"
function formatToCustomDateString(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} | ${hh}:${min}`;
}

// 🔍 Extract bill data from email body
function extractBillData(body, emailDate, threadId) {
  try {
    // Clean up HTML entities
    const cleanBody = body
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');

    // Extract total amount
    const amountMatch = cleanBody.match(/BẠN TRẢ\s+([\d,.]+)(?:₫|VND)/) || 
                        cleanBody.match(/Tổng cộng\s+([\d,.]+)(?:₫|VND)/);
    
    // Extract store name
    let storeMatch = cleanBody.match(/Đặt từ\s+([^]+?)\s+(?:[A-ZĐÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ][a-zđáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]+\s+)*Giao đến/);
    
    if (!storeMatch) {
      storeMatch = cleanBody.match(/Đặt từ\s+([^]+?)\s+Hồ sơ/);
    }
    
    // Extract food items
    const itemsSection = cleanBody.match(/Số lượng:(.*?)Tổng tạm tính/s);
    let foodMatches = null;
    
    if (itemsSection) {
      foodMatches = itemsSection[1].match(/\d+x\s+([^\d₫V]+?)(?=\s+\d+(?:₫|VND)|\s+\d+x|$)/g);
      if (foodMatches) {
        foodMatches = foodMatches.map(item => item.trim().replace(/\s+/g, ' '));
      }
    }

    const totalAmount = amountMatch ? (amountMatch[0].includes('₫') ? '₫ ' : 'VND ') + amountMatch[1] : null;
    const storeName = storeMatch ? storeMatch[1].trim() : null;
    const foodItems = foodMatches ? foodMatches.join(", ") : null;
    const emailLink = `https://mail.google.com/mail/u/0/#inbox/${threadId}`;
    const formattedDate = formatToCustomDateString(emailDate);
    
    // Extract date and month for filtering
    const yyyy = emailDate.getFullYear();
    const mm = String(emailDate.getMonth() + 1).padStart(2, '0');
    const dd = String(emailDate.getDate()).padStart(2, '0');
    const date = `${yyyy}-${mm}-${dd}`;
    const month = `${yyyy}-${mm}`;

    if (formattedDate && totalAmount && storeName && foodItems) {
      return {
        datetime: formattedDate,
        date: date,
        month: month,
        store: storeName,
        items: foodItems,
        total: totalAmount,
        link: emailLink,
        valid: true
      };
    }

    return { valid: false };
  } catch (error) {
    console.error('Error extracting bill data:', error.message);
    return { valid: false };
  }
}

// 📧 Get Gmail client
async function getGmailClient() {
  const credentials = JSON.parse(fs.readFileSync('gmail-credentials.json'));
  const token = JSON.parse(fs.readFileSync('gmail-token.json'));
  
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  
  oAuth2Client.setCredentials(token);
  
  return google.gmail({ version: 'v1', auth: oAuth2Client });
}

// 🏷️ Get or create "Processed" label
async function getProcessedLabelId(gmail) {
  try {
    const response = await gmail.users.labels.list({ userId: 'me' });
    const labels = response.data.labels || [];
    
    const processedLabel = labels.find(label => label.name === 'Processed');
    
    if (processedLabel) {
      return processedLabel.id;
    }
    
    const newLabel = await gmail.users.labels.create({
      userId: 'me',
      requestBody: {
        name: 'Processed',
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show'
      }
    });
    
    console.log('✅ Created "Processed" label in Gmail\n');
    return newLabel.data.id;
    
  } catch (error) {
    console.error('Error with label:', error.message);
    return null;
  }
}

// Get Gmail address from token
function getGmailFromToken() {
  try {
    const token = JSON.parse(fs.readFileSync('gmail-token.json'));
    // Gmail token might have email info
    return null; // We'll get it from Gmail API instead
  } catch {
    return null;
  }
}

// 📧 Sync Gmail to Firebase
async function syncGmailToFirebase() {
  console.log('🚀 Starting Gmail to Firebase sync...\n');

  try {
    const gmail = await getGmailClient();
    
    // Get the Gmail user's email address
    console.log('👤 Getting Gmail user profile...');
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const gmailAddress = profile.data.emailAddress;
    console.log(`📧 Gmail account: ${gmailAddress}\n`);
    
    // Find corresponding Firebase user
    console.log('🔍 Finding Firebase user...');
    const userId = await getUserIdByEmail(gmailAddress);
    
    if (!userId) {
      console.error('❌ Cannot find Firebase user with email:', gmailAddress);
      console.error('💡 Please sign in to the web app first to create your account!');
      return;
    }
    
    console.log(`✅ Found Firebase user ID: ${userId}\n`);
    
    const processedLabelId = await getProcessedLabelId(gmail);

    console.log('📧 Searching for GrabFood receipts in Gmail...');
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'from:no-reply@grab.com subject:"Your Grab E-Receipt" -label:Processed',
      maxResults: 100
    });

    const messages = response.data.messages || [];
    console.log(`✅ Found ${messages.length} unprocessed emails\n`);

    if (messages.length === 0) {
      console.log('📭 No new bills to process.');
      return;
    }

    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      
      try {
        const fullMessage = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });

        const payload = fullMessage.data.payload;
        
        // Extract email body
        function extractBody(part) {
          if (part.body && part.body.data) {
            return Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
          
          if (part.parts) {
            let textPart = part.parts.find(p => p.mimeType === 'text/html');
            if (textPart && textPart.body && textPart.body.data) {
              const html = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
              return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
            }
            
            textPart = part.parts.find(p => p.mimeType === 'text/plain');
            if (textPart && textPart.body && textPart.body.data) {
              return Buffer.from(textPart.body.data, 'base64').toString('utf-8');
            }
            
            for (const subPart of part.parts) {
              const result = extractBody(subPart);
              if (result) return result;
            }
          }
          
          return '';
        }
        
        const body = extractBody(payload);

        // Get email date
        const dateHeader = payload.headers.find(h => h.name.toLowerCase() === 'date');
        const emailDate = dateHeader ? new Date(dateHeader.value) : new Date();

        // Extract bill data
        const billData = extractBillData(body, emailDate, fullMessage.data.threadId);

        if (billData.valid) {
          // Check if bill already exists
          const existingBills = await db
            .collection(`users/${userId}/grabfood_bills`)
            .where('datetime', '==', billData.datetime)
            .get();
          
          if (!existingBills.empty) {
            console.log(`⏭️  [${i + 1}/${messages.length}] Already exists - ${billData.store}`);
            skipCount++;
            continue;
          }
          
          // Save to user's collection
          await db.collection(`users/${userId}/grabfood_bills`).add({
            datetime: billData.datetime,
            date: billData.date,
            month: billData.month,
            store: billData.store,
            items: billData.items,
            total: billData.total,
            link: billData.link,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });

          successCount++;
          console.log(`✅ [${i + 1}/${messages.length}] ${billData.store} - ${billData.total}`);

          // Add "Processed" label to email
          if (processedLabelId) {
            await gmail.users.messages.modify({
              userId: 'me',
              id: message.id,
              requestBody: {
                addLabelIds: [processedLabelId]
              }
            });
          }

        } else {
          skipCount++;
          console.log(`⚠️  [${i + 1}/${messages.length}] Skipped - Missing data`);
        }

      } catch (error) {
        console.error(`❌ Error processing message ${message.id}:`, error.message);
        skipCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Sync Complete!');
    console.log('='.repeat(60));
    console.log(`✅ Successfully synced: ${successCount} bills`);
    console.log(`⚠️  Skipped: ${skipCount} emails`);
    console.log(`📊 Total processed: ${messages.length} emails`);
    console.log(`💾 Saved to: users/${userId}/grabfood_bills`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    
    if (error.code === 'ENOENT') {
      console.error('💡 Missing file. Did you run: node setup-gmail-auth.js first?');
    }
    if (error.code === 401) {
      console.error('💡 Authentication expired. Run: node setup-gmail-auth.js');
    }
  }
}

// Run the sync
syncGmailToFirebase()
  .then(() => {
    console.log('✅ Script finished successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });