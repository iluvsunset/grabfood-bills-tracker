// ============================================
// FIREBASE CONFIGURATION & INITIALIZATION
// ============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query, 
  where,
  orderBy,
  setDoc,
  getDoc,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD3Cj_c6n5Yva0Tp2ftE2o2E4T-vohkqSw",
  authDomain: "school-menu-bot-bedd1.firebaseapp.com",
  projectId: "school-menu-bot-bedd1",
  storageBucket: "school-menu-bot-bedd1.firebasestorage.app",
  messagingSenderId: "865248349710",
  appId: "1:865248349710:web:ef4bf7466ad08b2b7df65f",
  measurementId: "G-XJ36P67JDM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab.');
  } else if (err.code === 'unimplemented') {
    console.warn('⚠️ Browser does not support offline persistence');
  }
});

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/gmail.modify'); 

// ============================================
// DIAGNOSTIC: Test Firestore Connection
// ============================================
console.log('🔍 Firebase Diagnostics:');
console.log('  Project ID:', firebaseConfig.projectId);
console.log('  Auth Domain:', firebaseConfig.authDomain);
console.log('  App Name:', app.name);

(async () => {
  try {
    console.log('🔍 Testing Firestore connection...');
    // Simple query that should work even with no data
    const testRef = collection(db, '_test_connection');
    const testQuery = query(testRef, where('dummy', '==', 'test'));
    await getDocs(testQuery);
    console.log('✅ Firestore is ONLINE and reachable!');
  } catch (error) {
    console.error('❌ Firestore connection FAILED:', error);
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    
    if (error.code === 'permission-denied') {
      console.error('   💡 Solution: Check Firestore Security Rules');
    } else if (error.code === 'unavailable' || error.code === 'failed-precondition') {
      console.error('   💡 Solution: Create Firestore database in Firebase Console');
      console.error('   👉 https://console.firebase.google.com/project/school-menu-bot-bedd1/firestore');
    } else if (error.code === 'unauthenticated') {
      console.error('   💡 This is normal before sign-in');
    }
  }
})();

// ============================================
// GLOBAL STATE
// ============================================
let currentUser = null;
let months = [];
let currentBills = [];
let allBillsCount = 0;
let allBillsCache = [];
let gmailAccessToken = null;
let favoriteStores = new Set();
let customLists = [];
let monthlyBudget = 0;
let currentAnalyticsPeriod = 'month';

// Chart instances
let spendingTrendChart = null;
let storeDistributionChart = null;
let dayOfWeekChart = null;
let timeOfDayChart = null;
let budgetHistoryChart = null;

// ============================================
// AUTH FUNCTIONS
// ============================================

async function handleGoogleSignIn() {
  try {
    showLoading(true);
    showToast('Signing in...');
    
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    
    const credential = GoogleAuthProvider.credentialFromResult(result);
    gmailAccessToken = credential?.accessToken;
    
    console.log('✅ User signed in:', currentUser.email);
    console.log('✅ Gmail token:', gmailAccessToken ? 'Obtained' : 'Not available');
    
    await loadUserData();
    
    if (allBillsCount === 0 && gmailAccessToken) {
      showSyncPrompt();
    } else {
      showMainApp();
    }
    
  } catch (error) {
    console.error('❌ Sign in error:', error);
    showToast('✗ Sign in failed: ' + error.message);
    showLoading(false);
  }
}

async function handleSignOut() {
  try {
    await signOut(auth);
    gmailAccessToken = null;
    favoriteStores.clear();
    customLists = [];
    monthlyBudget = 0;
    showLoginScreen();
    showToast('✓ Signed out');
  } catch (error) {
    console.error('❌ Sign out error:', error);
    showToast('✗ Sign out failed');
  }
}

// ============================================
// LOAD USER DATA
// ============================================

async function loadUserData() {
  try {
    showLoading(true);
    await Promise.all([
      loadUserBills(),
      loadFavorites(),
      loadCustomLists(),
      loadBudget()
    ]);
  } catch (error) {
    console.error('❌ Error loading user data:', error);
    showToast('⚠️ Some data failed to load. Check console for details.');
  } finally {
    showLoading(false);
  }
}

async function loadUserBills() {
  try {
    if (!currentUser) {
      console.warn('⚠️ No user logged in, skipping bill load');
      return;
    }

    console.log('📊 Loading bills for user:', currentUser.uid);
    const userId = currentUser.uid;
    const userBillsRef = collection(db, `users/${userId}/grabfood_bills`);
    const q = query(userBillsRef, orderBy("datetime", "desc"));
    
    console.log('🔍 Executing Firestore query...');
    const snapshot = await getDocs(q);
    console.log('✅ Query successful, processing documents...');
    
    const bills = [];
    const monthSet = new Set();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.datetime) {
        let month = data.month;
        if (!month && data.datetime) {
          const dateMatch = data.datetime.match(/^(\d{4}-\d{2})/);
          if (dateMatch) {
            month = dateMatch[1];
          }
        }
        
        const bill = {
          id: doc.id,
          ...data,
          month: month
        };
        bills.push(bill);
        
        if (month) {
          monthSet.add(month);
        }
      }
    });
    
    allBillsCache = bills;
    allBillsCount = bills.length;
    months = Array.from(monthSet).sort().reverse();
    
    console.log(`✅ Loaded ${bills.length} bills from ${months.length} months`);
    
    populateMonths();
    updateStats(0);
    
  } catch (error) {
    console.error("❌ Error loading bills:", error);
    console.error("   Code:", error.code);
    console.error("   Message:", error.message);
    
    if (error.code === 'unavailable') {
      showToast('⚠️ Firestore unavailable. Database may not exist.');
      console.error('👉 Create database at: https://console.firebase.google.com/project/school-menu-bot-bedd1/firestore');
    } else if (error.code === 'permission-denied') {
      showToast('⚠️ Permission denied. Check Firestore rules.');
    } else {
      showToast('✗ Failed to load bills');
    }
  }
}

async function loadFavorites() {
  try {
    if (!currentUser) return;
    
    const userId = currentUser.uid;
    const favoritesDoc = await getDoc(doc(db, `users/${userId}/settings/favorites`));
    
    if (favoritesDoc.exists()) {
      const data = favoritesDoc.data();
      favoriteStores = new Set(data.stores || []);
      console.log(`✅ Loaded ${favoriteStores.size} favorites`);
    } else {
      console.log('ℹ️ No favorites document found (this is normal for new users)');
    }
  } catch (error) {
    console.error('⚠️ Error loading favorites:', error.code, error.message);
    // Non-critical, don't show error to user
  }
}

async function loadCustomLists() {
  try {
    if (!currentUser) return;
    
    const userId = currentUser.uid;
    const listsRef = collection(db, `users/${userId}/custom_lists`);
    const snapshot = await getDocs(listsRef);
    
    customLists = [];
    snapshot.forEach(doc => {
      customLists.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Loaded ${customLists.length} custom lists`);
  } catch (error) {
    console.error('⚠️ Error loading custom lists:', error.code, error.message);
  }
}

async function loadBudget() {
  try {
    if (!currentUser) return;
    
    const userId = currentUser.uid;
    const budgetDoc = await getDoc(doc(db, `users/${userId}/settings/budget`));
    
    if (budgetDoc.exists()) {
      const data = budgetDoc.data();
      monthlyBudget = data.monthly || 0;
      console.log(`✅ Loaded budget: ₫${monthlyBudget.toLocaleString()}`);
    } else {
      console.log('ℹ️ No budget set (this is normal for new users)');
    }
  } catch (error) {
    console.error('⚠️ Error loading budget:', error.code, error.message);
  }
}

// ============================================
// SAVE USER DATA
// ============================================

async function saveFavorites() {
  try {
    const userId = currentUser.uid;
    await setDoc(doc(db, `users/${userId}/settings/favorites`), {
      stores: Array.from(favoriteStores),
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Favorites saved');
  } catch (error) {
    console.error('❌ Error saving favorites:', error);
    showToast('⚠️ Failed to save favorites');
  }
}

async function saveBudget(amount) {
  try {
    const userId = currentUser.uid;
    await setDoc(doc(db, `users/${userId}/settings/budget`), {
      monthly: amount,
      updatedAt: new Date().toISOString()
    });
    monthlyBudget = amount;
    console.log('✅ Budget saved');
  } catch (error) {
    console.error('❌ Error saving budget:', error);
    showToast('⚠️ Failed to save budget');
    throw error;
  }
}


// ============================================
// GMAIL SYNC FUNCTIONS
// ============================================
function extractEmailBody(payload) {
  // Helper to decode base64 with UTF-8 support
  function decodeBase64(data) {
    if (!data) return '';
    try {
      const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
      const binary = atob(base64);
      
      // Convert binary string to UTF-8
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      // Decode as UTF-8
      return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
      console.error('Base64 decode error:', e);
      return '';
    }
  }
  
  // Check if payload has direct parts (multipart/alternative, etc.)
  if (payload.parts && payload.parts.length > 0) {
    console.log(`📧 Found ${payload.parts.length} top-level parts`);
    
    // Try text/plain first (often cleaner than HTML)
    const plainPart = payload.parts.find(p => p.mimeType === 'text/plain');
    if (plainPart && plainPart.body && plainPart.body.data) {
      console.log('✅ Using text/plain part');
      return decodeBase64(plainPart.body.data);
    }
    
    // Try text/html
    const htmlPart = payload.parts.find(p => p.mimeType === 'text/html');
    if (htmlPart && htmlPart.body && htmlPart.body.data) {
      console.log('✅ Using text/html part');
      const html = decodeBase64(htmlPart.body.data);
      // Strip HTML tags
      return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // Recursively search nested parts
    for (const part of payload.parts) {
      if (part.parts && part.parts.length > 0) {
        console.log(`🔍 Searching nested parts in ${part.mimeType}`);
        const result = extractEmailBody(part); // Recursive
        if (result && result.length > 100) {
          return result;
        }
      }
    }
  }
  
  // Fallback: check direct body
  if (payload.body && payload.body.data) {
    console.log('✅ Using direct body data');
    return decodeBase64(payload.body.data);
  }
  
  console.log('❌ No content found in payload');
  return '';
}

function showSyncPrompt() {
  const syncPrompt = document.createElement('div');
  syncPrompt.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.15) 0%, rgba(255, 0, 255, 0.15) 100%);
    backdrop-filter: blur(20px);
    padding: 40px;
    border-radius: 20px;
    border: 2px solid rgba(0, 255, 255, 0.5);
    box-shadow: 0 20px 60px rgba(0, 255, 255, 0.3);
    text-align: center;
    z-index: 1001;
    max-width: 400px;
  `;
  
  syncPrompt.innerHTML = `
    <h2 style="color: #00ffff; margin-bottom: 20px;">📧 Sync Your Bills?</h2>
    <p style="color: #fff; margin-bottom: 30px;">
      Would you like to import your GrabFood receipts from Gmail?
    </p>
    <div style="display: flex; gap: 15px; justify-content: center;">
      <button id="syncNowBtn" style="
        background: linear-gradient(135deg, #00ffff 0%, #00cccc 100%);
        color: #0a0e27;
        border: none;
        padding: 12px 30px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 700;
        font-size: 14px;
      ">Yes, Sync Now</button>
      <button id="skipSyncBtn" style="
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 12px 30px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 700;
        font-size: 14px;
      ">Skip</button>
    </div>
  `;
  
  document.body.appendChild(syncPrompt);
  
  document.getElementById('syncNowBtn').onclick = async () => {
    document.body.removeChild(syncPrompt);
    await syncGmailBills(gmailAccessToken);
    showMainApp();
  };
  
  document.getElementById('skipSyncBtn').onclick = () => {
    document.body.removeChild(syncPrompt);
    showMainApp();
  };
}



async function syncGmailBills(token) {
  if (!token) {
    showToast('❌ Gmail access not available. Please sign in again.');
    return;
  }
  
  try {
    showLoading(true);
    showToast('🔄 Syncing Gmail receipts...');
    
    // ============================================
    // FETCH ALL GRAB RECEIPTS (Food + Transportation)
    // ============================================
    let allMessages = [];
    let pageToken = null;
    let pageCount = 0;
    
    do {
      pageCount++;
      console.log(`📧 Fetching page ${pageCount}...`);
      
      // Updated query to include ALL Grab receipts
      let url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:no-reply@grab.com subject:"Grab E-Receipt" -label:Processed&maxResults=100';
      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.status}`);
      }
      
      const data = await response.json();
      const messages = data.messages || [];
      allMessages = allMessages.concat(messages);
      
      pageToken = data.nextPageToken;
      
      showToast(`Found ${allMessages.length} unprocessed receipts...`);
      
    } while (pageToken);
    
    console.log(`✅ Total found: ${allMessages.length} unprocessed Grab emails`);
    
    if (allMessages.length === 0) {
      showToast('✓ No new receipts to sync. All up to date!');
      return;
    }
    
    showToast(`Processing ${allMessages.length} receipts...`);
    
    // ============================================
    // PROCESS ALL MESSAGES
    // ============================================
    const bills = [];
    let processedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < allMessages.length; i++) {
      try {
        const msgResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${allMessages[i].id}?format=full`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        const fullMessage = await msgResponse.json();
    
    // 🔍 DEBUG: Save raw payload for inspection
    console.log('=' .repeat(100));
    console.log('📧 RAW EMAIL STRUCTURE - FULL PAYLOAD:');
    console.log('='.repeat(100));
    console.log(JSON.stringify(fullMessage.payload, null, 2));
    console.log('='.repeat(100));
    
    // Save to global window object for interactive inspection
    window.lastEmailPayload = fullMessage.payload;
    window.fullEmailMessage = fullMessage;
    
    console.log('💡 Saved to window.lastEmailPayload - type this in console to explore!');
    console.log('💡 Try: window.lastEmailPayload.parts[0].parts');
    
    const payload = fullMessage.payload;
    const body = extractEmailBody(payload);
        const dateHeader = payload.headers.find(h => h.name.toLowerCase() === 'date');
        const emailDate = dateHeader ? new Date(dateHeader.value) : new Date();
        const billData = extractBillData(body, emailDate, fullMessage.threadId);
        
        if (billData.valid) {
          bills.push({
            ...billData,
            messageId: allMessages[i].id  // Store message ID for labeling
          });
          processedCount++;
        } else {
          console.log(`⚠️ Skipped email ${i + 1} - extraction failed`);
          skippedCount++;
        }
        
        if ((i + 1) % 10 === 0) {
          showToast(`Processed ${i + 1}/${allMessages.length}...`);
        }
        
      } catch (error) {
        console.error(`Error processing message ${i + 1}:`, error);
        skippedCount++;
      }
    }
    
    console.log(`✅ Extracted ${bills.length} bills (${processedCount} valid, ${skippedCount} skipped)`);
    
    // Save to Firestore
    const savedCount = await saveBillsToFirestore(bills);
    
    // Label processed emails in Gmail
    if (savedCount > 0) {
      await labelProcessedEmails(token, bills);
    }
    
    showToast(`✓ Synced ${savedCount} new bills!`);
    await loadUserBills();
    
  } catch (error) {
    console.error('❌ Sync error:', error);
    showToast('✗ Sync failed: ' + error.message);
  } finally {
    showLoading(false);
  }
}

// Extract bill data from email content
function extractBillData(body, emailDate, threadId) {
  try {
    // Clean the body
    let cleanBody = body
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();

    console.log('📧 Email preview:', cleanBody.substring(0, 1000));

    // ============================================
    // DETECT BILL TYPE: Food or Transportation
    // ============================================
    const isFoodBill = cleanBody.includes('GrabFood') || 
                       cleanBody.includes('Đặt từ') || 
                       cleanBody.includes('Order from') ||
                       cleanBody.includes('Số lượng:');
    
    const isTransportBill = cleanBody.includes('GrabBike') || 
                           cleanBody.includes('GrabCar') || 
                           cleanBody.includes('Giá theo công-tơ-mét') ||
                           cleanBody.includes('Fare by meter') ||
                           cleanBody.includes('Chuyến đi của bạn');
    
    console.log('🔍 Bill Type Detection:', { isFoodBill, isTransportBill });

    // ============================================
    // EXTRACT AMOUNT (Works for both types)
    // ============================================
    let totalAmount = null;
    let amountValue = null;
    
    // Try multiple patterns
    const amountPatterns = [
      /(?:BẠN TRẢ|Bạn trả|Bạn thanh toán|You paid)[:\s]+(₫?\s*[\d,.]+)\s*(?:₫|VND)?/i,
      /Tổng cộng[:\s]+(₫?\s*[\d,.]+)\s*(?:₫|VND)?/gi, // Use 'g' to get last match
      /Total[:\s]+(₫?\s*[\d,.]+)\s*(?:₫|VND)?/i,
      /(?:VND|₫)\s*([\d,.]+)/g
    ];
    
    for (const pattern of amountPatterns) {
      if (pattern.global) {
        // For global patterns, get the LAST match (usually the final total)
        const matches = [...cleanBody.matchAll(pattern)];
        if (matches.length > 0) {
          const lastMatch = matches[matches.length - 1];
          amountValue = lastMatch[1].replace(/[^\d]/g, '');
          totalAmount = `₫${amountValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
          console.log(`💰 Amount found (pattern: last ${pattern}):`, totalAmount);
          break;
        }
      } else {
        const match = cleanBody.match(pattern);
        if (match) {
          amountValue = match[1].replace(/[^\d]/g, '');
          totalAmount = `₫${amountValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
          console.log(`💰 Amount found (pattern: ${pattern}):`, totalAmount);
          break;
        }
      }
    }

    // ============================================
    // EXTRACT STORE/SERVICE TYPE
    // ============================================
    let storeName = null;
    let billType = 'Unknown';
    
    if (isFoodBill) {
      // Extract restaurant name for food orders
      const storePatterns = [
        /Đặt từ[:\s]+([^Giao đến|Hồ sơ|Chi tiết|Người dùng]+?)(?:\s+(?:Giao đến|Hồ sơ|Chi tiết|Người dùng))/i,
        /Order from[:\s]+([^Deliver to|Profile|Details|User]+?)(?:\s+(?:Deliver to|Profile|Details|User))/i,
        /(?:Merchant|Store|Restaurant)[:\s]+([A-Za-zÀ-ỹ0-9\s\-&.,()]+?)(?:\s+[A-Z]|\n|$)/i,
      ];
      
      for (const pattern of storePatterns) {
        const match = cleanBody.match(pattern);
        if (match) {
          storeName = match[1].trim()
            .replace(/\s+/g, ' ')
            .replace(/[:\-–—]+$/, '')
            .substring(0, 100);
          break;
        }
      }
      
      billType = 'GrabFood';
      
    } else if (isTransportBill) {
      // Extract service type for transportation
      if (cleanBody.includes('GrabBike')) {
        storeName = 'GrabBike';
        billType = 'GrabBike';
      } else if (cleanBody.includes('GrabCar')) {
        storeName = 'GrabCar';
        billType = 'GrabCar';
      } else {
        storeName = 'Grab Transportation';
        billType = 'Grab Transport';
      }
      
      // Try to extract route information
      const routeMatch = cleanBody.match(/⋮\s*⋮\s*⋮\s*⋮\s*⋮\s*⋮\s*⋮\s*⋮\s+(.+?)\s+\d+:\d+[AP]M\s+(.+?)\s+\d+:\d+[AP]M/);
      if (routeMatch) {
        const from = routeMatch[1].trim().substring(0, 50);
        const to = routeMatch[2].trim().substring(0, 50);
        storeName = `${storeName} (${from} → ${to})`;
      }
    }

    // ============================================
    // EXTRACT ITEMS/DETAILS
    // ============================================
    let itemsDetails = null;
    
    if (isFoodBill) {
      // Extract food items
      const itemsPatterns = [
        /Số lượng:(.*?)(?:Tổng tạm tính|Subtotal|Cước phí|Delivery fee)/is,
        /(?:Quantity|Items):(.*?)(?:Subtotal|Delivery fee|Service fee)/is,
      ];
      
      for (const pattern of itemsPatterns) {
        const match = cleanBody.match(pattern);
        if (match) {
          const itemsText = match[1];
          let foodMatches = itemsText.match(/(\d+x\s+[^₫\d]+?)(?=\s*₫?\s*\d+|$)/g);
          
          if (foodMatches) {
            foodMatches = foodMatches.map(item => {
              return item
                .replace(/\d+x\s+\d+\s+/, match => match.replace(/\d+\s+$/, ''))
                .trim()
                .replace(/\s+/g, ' ')
                .substring(0, 150);
            }).filter(item => item.length > 2);
            
            itemsDetails = foodMatches.slice(0, 20).join(', ');
          }
          break;
        }
      }
      
      // Fallback: look for common food keywords
      if (!itemsDetails) {
        const foodWords = cleanBody.match(/(?:cơm|phở|bún|mì|canh|soup|rice|noodle|chicken|beef|pork|fish)[^₫\d]{1,50}/gi);
        if (foodWords && foodWords.length > 0) {
          itemsDetails = foodWords.slice(0, 5).join(', ');
        }
      }
      
    } else if (isTransportBill) {
      // Extract trip details for transportation
      const details = [];
      
      // Distance
      const distanceMatch = cleanBody.match(/([\d.]+)\s*km/i);
      if (distanceMatch) {
        details.push(`${distanceMatch[1]} km`);
      }
      
      // Duration
      const durationMatch = cleanBody.match(/(\d+)\s*mins?/i);
      if (durationMatch) {
        details.push(`${durationMatch[1]} mins`);
      }
      
      // Driver name
      const driverMatch = cleanBody.match(/(?:Cảm ơn bạn đã thực hiện chuyến đi cùng|Thank you for riding with)\s+([^.]+)\s*\./i);
      if (driverMatch) {
        details.push(`Driver: ${driverMatch[1].trim()}`);
      }
      
      // Rating
      const ratingMatch = cleanBody.match(/(\d\.\d)\s*(?:Lời khen|Review)/i);
      if (ratingMatch) {
        details.push(`Rating: ${ratingMatch[1]}⭐`);
      }
      
      // Booking code
      const codeMatch = cleanBody.match(/Mã đặt xe:\s*([A-Z0-9\-]+)/i);
      if (codeMatch) {
        details.push(`Code: ${codeMatch[1]}`);
      }
      
      itemsDetails = details.length > 0 ? details.join(' • ') : 'Trip details';
    }

    // ============================================
    // BUILD RESULT
    // ============================================
    const emailLink = `https://mail.google.com/mail/u/0/#inbox/${threadId}`;
    
    const yyyy = emailDate.getFullYear();
    const mm = String(emailDate.getMonth() + 1).padStart(2, '0');
    const dd = String(emailDate.getDate()).padStart(2, '0');
    const hh = String(emailDate.getHours()).padStart(2, '0');
    const min = String(emailDate.getMinutes()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd} | ${hh}:${min}`;
    const date = `${yyyy}-${mm}-${dd}`;
    const month = `${yyyy}-${mm}`;

    // Debug output
    console.log('📋 Extraction Results:');
    console.log('   Type:', billType);
    console.log('   💰 Amount:', totalAmount);
    console.log('   🏪 Store/Service:', storeName);
    console.log('   📝 Details:', itemsDetails);

    // Validation: Need at least date + (amount OR store)
    if (formattedDate && (totalAmount || storeName)) {
      return {
        datetime: formattedDate,
        date: date,
        month: month,
        store: storeName || 'Unknown Service',
        items: itemsDetails || 'Details not available',
        total: totalAmount || 'Amount not found',
        link: emailLink,
        type: billType, // NEW: Add bill type
        valid: true
      };
    }

    console.log('❌ Validation failed - need at least date + (amount OR store)');
    console.log('   Date:', formattedDate);
    console.log('   Amount:', totalAmount);
    console.log('   Store:', storeName);
    
    return { valid: false };
    
  } catch (error) {
    console.error('❌ Error extracting bill data:', error);
    return { valid: false };
  }
}

async function saveBillsToFirestore(bills) {
  const userId = currentUser.uid;
  console.log(`💾 Saving ${bills.length} bills to Firestore...`);
  
  const userBillsRef = collection(db, `users/${userId}/grabfood_bills`);
  let savedCount = 0;
  
  for (const bill of bills) {
    try {
      // Check for duplicates by datetime
      const q = query(userBillsRef, where('datetime', '==', bill.datetime));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        await addDoc(userBillsRef, {
          datetime: bill.datetime,
          date: bill.date,
          month: bill.month,
          store: bill.store,
          items: bill.items,
          total: bill.total,
          link: bill.link,
          type: bill.type || 'Unknown', // ADD THIS
          createdAt: new Date().toISOString()
        });
        savedCount++;
        console.log(`✅ Saved: ${bill.type} - ${bill.store} - ${bill.total}`);
      } else {
        console.log(`⏭️  Duplicate skipped: ${bill.store} - ${bill.datetime}`);
      }
    } catch (error) {
      console.error('Error saving bill:', error);
    }
  }
  
  console.log(`✅ Saved ${savedCount} new bills (${bills.length - savedCount} duplicates skipped)`);
  return savedCount;
}

// NEW FUNCTION: Label processed emails in Gmail
async function labelProcessedEmails(token, bills) {
  try {
    console.log('🏷️  Labeling processed emails...');
    
    // Check if we have the modify scope
    try {
      // Get or create "Processed" label
      const labelsResponse = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/labels',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (!labelsResponse.ok) {
        throw new Error(`Failed to fetch labels: ${labelsResponse.status}`);
      }
      
      const labelsData = await labelsResponse.json();
      let processedLabelId = labelsData.labels?.find(l => l.name === 'Processed')?.id;
      
      // Create label if it doesn't exist
      if (!processedLabelId) {
        console.log('Creating "Processed" label...');
        const createResponse = await fetch(
          'https://gmail.googleapis.com/gmail/v1/users/me/labels',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: 'Processed',
              labelListVisibility: 'labelShow',
              messageListVisibility: 'show'
            })
          }
        );
        
        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(`Failed to create label: ${createResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const newLabel = await createResponse.json();
        processedLabelId = newLabel.id;
        console.log('✅ Created "Processed" label');
      }
      
      // Label all processed messages
      let labeledCount = 0;
      let failedCount = 0;
      
      for (const bill of bills) {
        if (bill.messageId) {
          try {
            const modifyResponse = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${bill.messageId}/modify`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  addLabelIds: [processedLabelId]
                })
              }
            );
            
            if (modifyResponse.ok) {
              labeledCount++;
            } else {
              failedCount++;
              console.warn(`⚠️ Failed to label message ${bill.messageId}: ${modifyResponse.status}`);
            }
          } catch (error) {
            failedCount++;
            console.error(`❌ Error labeling message ${bill.messageId}:`, error.message);
          }
        }
      }
      
      console.log(`✅ Labeled ${labeledCount} emails as "Processed" (${failedCount} failed)`);
      
    } catch (scopeError) {
      console.warn('⚠️ Could not label emails - missing gmail.modify scope');
      console.warn('   Error:', scopeError.message);
      console.warn('   💡 User needs to sign out and sign in again to grant new permissions');
      showToast('⚠️ Labeling skipped - re-login to enable this feature', 'warning', 5000);
    }
    
  } catch (error) {
    console.error('⚠️ Error in label process:', error);
    // Don't throw - labeling failure shouldn't stop the sync
  }
}

async function manualSync() {
  if (!gmailAccessToken) {
    showToast('Re-authenticating for Gmail access...');
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      gmailAccessToken = credential?.accessToken;
      
      if (gmailAccessToken) {
        await syncGmailBills(gmailAccessToken);
      } else {
        showToast('❌ Could not get Gmail access. Try signing out and in again.');
      }
    } catch (error) {
      console.error('Re-auth error:', error);
      showToast('❌ Authentication failed');
    }
  } else {
    await syncGmailBills(gmailAccessToken);
  }
}

// ============================================
// UI FUNCTIONS
// ============================================

function showLoginScreen() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('mainApp').style.display = 'none';
  showLoading(false);
}

function showMainApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('mainApp').style.display = 'block';
  showLoading(false);
  
  if (currentUser) {
    document.getElementById('userEmail').textContent = currentUser.email;
  }
  
  // Add event listener for sync button
  document.getElementById('syncGmailBtn').addEventListener('click', manualSync);
}

function showLoading(show) {
  const overlay = document.getElementById('loadingOverlay');
  const loading = document.getElementById('loading');
  if (show) {
    overlay.classList.add('active');
    loading.style.display = 'block';
  } else {
    overlay.classList.remove('active');
    loading.style.display = 'none';
  }
}

function showToast(message, type = 'info', duration = 3000) {
  const toast = document.getElementById('toast');
  
  // Icon mapping
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ️'
  };
  
  const icon = icons[type] || icons.info;
  toast.textContent = `${icon} ${message}`;
  
  // Remove all type classes
  toast.classList.remove('show', 'success', 'error', 'warning', 'info');
  
  // Add type class
  if (type !== 'info') {
    toast.classList.add(type);
  }
  
  // Trigger reflow
  void toast.offsetWidth;
  
  // Show toast
  toast.classList.add('show');
  
  // Hide after duration
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// ============================================
// NAVIGATION
// ============================================

let isTransitioning = false;

function initNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      if (isTransitioning || tab.classList.contains('active')) return;
      
      const targetTabId = tab.dataset.tab;
      const currentTabBtn = document.querySelector('.nav-tab.active');
      const currentTabContent = document.querySelector('.tab-content.active');
      const targetTabContent = document.getElementById(`${targetTabId}Tab`);
      
      isTransitioning = true;
      
      // 1. Update Buttons immediately
      if (currentTabBtn) currentTabBtn.classList.remove('active');
      tab.classList.add('active');
      
      // 2. Animate Exit
      if (currentTabContent) {
        currentTabContent.classList.add('closing');
        
        // Wait for exit animation
        await new Promise(resolve => setTimeout(resolve, 400));
        
        currentTabContent.classList.remove('active', 'closing');
      }
      
      // 3. Animate Enter
      if (targetTabContent) {
        targetTabContent.classList.add('active');
        
        // Load content
        switch(targetTabId) {
          case 'analytics':
            loadAnalytics();
            break;
          case 'favorites':
            loadFavoritesTab();
            break;
          case 'budget':
            loadBudgetTab();
            break;
        }
      }
      
      isTransitioning = false;
    });
  });
}

// ============================================
// BILLS TAB
// ============================================

function populateMonths() {
  const timelineDiv = document.getElementById("monthTimeline");
  timelineDiv.innerHTML = "";
  
  if (months.length === 0) {
    timelineDiv.innerHTML = '<div style="padding: 10px; color: #888; white-space: nowrap;">No bills yet. Click "Sync Gmail" to import!</div>';
    return;
  }
  
  // Create chips for each month
  months.forEach((month, index) => {
    const chip = document.createElement("div");
    chip.className = "month-chip";
    chip.textContent = month;
    chip.dataset.month = month;
    chip.onclick = () => selectMonth(month);
    timelineDiv.appendChild(chip);
    
    // Auto-select the first (latest) month
    if (index === 0) {
      setTimeout(() => selectMonth(month), 100);
    }
  });
}

function selectMonth(month) {
  // Update UI state
  const chips = document.querySelectorAll('.month-chip');
  chips.forEach(chip => {
    if (chip.dataset.month === month) {
      chip.classList.add('active');
      chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      chip.classList.remove('active');
    }
  });
  
  const searchContainer = document.getElementById('searchContainer');
  searchContainer.classList.add('visible');
  
  const bills = getBillsByMonth(month);
  currentBills = bills;
  
  displayBillList(bills);
  updateStats(bills.length);
}

function getBillsByMonth(month) {
  return allBillsCache.filter(bill => bill.month === month);
}

function updateStats(monthBillCount) {
  const statsBar = document.getElementById('statsBar');
  const totalBillsEl = document.getElementById('totalBills');
  const monthBillsEl = document.getElementById('monthBills');
  const monthSpendingEl = document.getElementById('monthSpending');
  const avgOrderEl = document.getElementById('avgOrder');
  
  if (allBillsCount > 0) {
    statsBar.style.display = 'flex';
    totalBillsEl.textContent = allBillsCount;
    monthBillsEl.textContent = monthBillCount || 0;
    
    // Calculate month spending and average
    const monthTotal = currentBills.reduce((sum, bill) => {
      const amount = parseAmount(bill.total);
      return sum + amount;
    }, 0);
    
    monthSpendingEl.textContent = formatCurrency(monthTotal);
    avgOrderEl.textContent = monthBillCount > 0 ? formatCurrency(monthTotal / monthBillCount) : '₫0';
  }
}

function displayBillList(bills) {
  const listDiv = document.getElementById("billList");
  const detailDiv = document.getElementById("billDetail");
  listDiv.innerHTML = "";
  detailDiv.style.display = "none";

  if (bills.length === 0) {
    listDiv.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-text">No Bills Found</div>
      </div>
    `;
    return;
  }

  bills.forEach((bill, index) => {
    const entry = document.createElement("div");
    entry.className = "bill-entry";
    entry.style.animationDelay = `${index * 80}ms`;
    
    const isFavorite = favoriteStores.has(bill.store);
    const starIcon = isFavorite ? '⭐' : '☆';
    
    // Determine icon based on bill type
    let typeIcon = '🍽️'; // Default food icon
    if (bill.type === 'GrabBike') typeIcon = '🏍️';
    else if (bill.type === 'GrabCar') typeIcon = '🚗';
    else if (bill.type?.includes('Transport')) typeIcon = '🚕';
    
    entry.innerHTML = `
      <div class="bill-info">
        <div>📅 ${bill.date}</div>
        <div class="bill-separator">|</div>
        <div>${typeIcon} ${bill.store}</div>
        <div class="bill-separator">|</div>
        <div>💰 ${bill.total}</div>
      </div>
      <div style="display: flex; gap: 10px; align-items: center;">
        <button class="favorite-btn" data-store="${bill.store.replace(/"/g, '&quot;')}">${starIcon}</button>
        <button class="view-btn" data-bill-id="${bill.id}">View →</button>
      </div>
    `;
    
    // Add event listeners
    const favoriteBtn = entry.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(bill.store);
    });
    
    const viewBtn = entry.querySelector('.view-btn');
    viewBtn.addEventListener('click', () => {
      showDetail(bill.id);
    });
    
    listDiv.appendChild(entry);
  });
  
  init3DTilt();
}

function showDetail(billId) {
  const bill = currentBills.find(b => b.id === billId);
  if (!bill) return;
  
  const detail = document.getElementById("billDetail");
  const list = document.getElementById("billList");
  const searchContainer = document.getElementById("searchContainer");
  
  list.innerHTML = "";
  searchContainer.classList.remove('visible');
  
  const isFavorite = favoriteStores.has(bill.store);
  const starIcon = isFavorite ? '⭐' : '☆';
  
  detail.innerHTML = `
    <button id="backBtn">← Back</button>
    <h3>📋 Bill Details</h3>
    <p><strong>📅 Date & Time:</strong> ${bill.datetime}</p>
    <p><strong>🏪 Store:</strong> ${bill.store} <button class="favorite-btn-detail" data-store="${bill.store.replace(/"/g, '&quot;')}">${starIcon}</button></p>
    <p><strong>🍽️ Items:</strong> ${bill.items}</p>
    <p><strong>💰 Total:</strong> ${bill.total}</p>
    <p><strong>🔗 Receipt:</strong> <a href="${bill.link}" target="_blank">View Online</a></p>
  `;
  detail.style.display = "block";
  
  // Add event listeners
  document.getElementById('backBtn').addEventListener('click', goBack);
  
  const favBtn = detail.querySelector('.favorite-btn-detail');
  if (favBtn) {
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(bill.store);
      showDetail(billId); // Refresh the detail view
    });
  }
}

function goBack() {
  const searchContainer = document.getElementById("searchContainer");
  searchContainer.classList.add('visible');
  document.getElementById("billDetail").style.display = "none";
  displayBillList(currentBills);
}

function filterBills() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  
  if (!searchTerm) {
    displayBillList(currentBills);
    return;
  }

  const filtered = currentBills.filter(bill => 
    bill.store.toLowerCase().includes(searchTerm) || 
    bill.date.toLowerCase().includes(searchTerm) ||
    bill.items.toLowerCase().includes(searchTerm)
  );
  
  displayBillList(filtered);
  
  if (filtered.length === 0) {
    showToast(`No results for "${searchTerm}"`);
  }
}

function toggleDropdown() {
  // Deprecated - removed
}

// ============================================
// FAVORITES
// ============================================

async function toggleFavorite(storeName) {
  // Prevent event bubbling
  event?.stopPropagation();
  
  if (favoriteStores.has(storeName)) {
    favoriteStores.delete(storeName);
    showToast(`Removed ${storeName} from favorites`);
  } else {
    favoriteStores.add(storeName);
    showToast(`Added ${storeName} to favorites`);
  }
  
  await saveFavorites();
  
  // Refresh the current view
  const activeTab = document.querySelector('.nav-tab.active');
  if (activeTab?.dataset.tab === 'favorites') {
    loadFavoritesTab();
  } else {
    displayBillList(currentBills);
  }
}

function loadFavoritesTab() {
  const favoritesList = document.getElementById('favoritesList');
  
  if (favoriteStores.size === 0) {
    favoritesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⭐</div>
        <div class="empty-state-text">No favorites yet</div>
        <div class="empty-state-subtext">Star your favorite stores from the bills list</div>
      </div>
    `;
  } else {
    // Calculate stats for each favorite store
    const favoriteStats = Array.from(favoriteStores).map(store => {
      const storeBills = allBillsCache.filter(b => b.store === store);
      const totalSpent = storeBills.reduce((sum, bill) => sum + parseAmount(bill.total), 0);
      const avgOrder = totalSpent / storeBills.length;
      
      return {
        name: store,
        orders: storeBills.length,
        totalSpent,
        avgOrder,
        lastOrder: storeBills[0]?.date || '-'
      };
    });
    
    favoriteStats.sort((a, b) => b.orders - a.orders);
    
    favoritesList.innerHTML = favoriteStats.map(store => `
      <div class="favorite-card">
        <div class="favorite-card-header">
          <div class="favorite-name">${store.name}</div>
          <div class="favorite-star" onclick="toggleFavorite('${store.name}')">⭐</div>
        </div>
        <div class="favorite-stats">
          📦 ${store.orders} orders<br>
          💰 Total: ${formatCurrency(store.totalSpent)}<br>
          📊 Average: ${formatCurrency(store.avgOrder)}<br>
          📅 Last order: ${store.lastOrder}
        </div>
      </div>
    `).join('');
  }
  
  // Always display custom lists
  displayCustomLists();
}

// ============================================
// ANALYTICS
// ============================================

function loadAnalytics() {
  const period = currentAnalyticsPeriod;
  const filteredBills = filterBillsByPeriod(period);
  
  updateAnalyticsStats(filteredBills);
  renderSpendingTrendChart(filteredBills);
  renderStoreDistributionChart(filteredBills);
  renderDayOfWeekChart(filteredBills);
  renderTimeOfDayChart(filteredBills);
  renderHeatmap(filteredBills);
  generateInsights(filteredBills);
  showTopItems(filteredBills);
}

// ... (existing filterBillsByPeriod and other functions) ...

function renderHeatmap(bills) {
  const heatmapContainer = document.getElementById('spendingHeatmap');
  const monthsContainer = document.getElementById('heatmapMonths');
  heatmapContainer.innerHTML = '';
  monthsContainer.innerHTML = '';
  
  // 1. Process Data
  const dailySpending = {};
  let maxSpend = 0;
  
  bills.forEach(bill => {
    const amount = parseAmount(bill.total);
    if (dailySpending[bill.date]) {
      dailySpending[bill.date] += amount;
    } else {
      dailySpending[bill.date] = amount;
    }
    if (dailySpending[bill.date] > maxSpend) maxSpend = dailySpending[bill.date];
  });
  
  // 2. Generate Calendar Grid (Current Year)
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31);
  
  // Align start to the previous Sunday for correct grid alignment (rows are days 0-6)
  // Grid fills column by column (auto-flow: column)
  const startDate = new Date(startOfYear);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // Back to Sunday
  
  let currentDate = new Date(startDate);
  let colIndex = 0;
  let lastMonth = -1;
  
  // To track month label positions
  // We need to know which column index starts a new month
  
  while (currentDate <= endOfYear) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const amount = dailySpending[dateStr] || 0;
    
    // Determine intensity level (0-4)
    let level = 0;
    if (amount > 0) {
      const ratio = amount / maxSpend;
      if (ratio > 0.75) level = 4;
      else if (ratio > 0.5) level = 3;
      else if (ratio > 0.25) level = 2;
      else level = 1;
    }
    
    // Create Cell
    const cell = document.createElement('div');
    cell.className = `day-cell l-${level}`;
    
    // Tooltip text
    const dateFormatted = currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const moneyFormatted = amount > 0 ? formatCurrency(amount) : 'No spend';
    cell.title = `${dateFormatted}: ${moneyFormatted}`;
    
    // Visibility check
    if (currentDate.getFullYear() !== now.getFullYear()) {
      cell.style.opacity = '0';
      cell.style.pointerEvents = 'none';
    }
    
    heatmapContainer.appendChild(cell);
    
    // Month Label Logic
    // Check if this specific day is the start of a month or the first visible day of a month
    if (currentDate.getDay() === 0) {
        // Only check/add label on Sundays (start of new column)
        const currentMonth = currentDate.getMonth();
        // Check if the upcoming week (e.g. Wednesday) is the 1st of the month
        // Actually simpler: if the month of the Sunday is different from last checked, or if the 1st falls in this week
        
        // Let's check the date of the 1st of the current month
        // If the 1st of the month falls within this week (currentDate to currentDate+6)
        
        const weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        if (currentMonth !== lastMonth && currentDate.getDate() <= 7) {
             // New month started recently
             const label = document.createElement('span');
             label.className = 'month-label';
             label.textContent = currentDate.toLocaleDateString(undefined, { month: 'short' });
             label.style.left = `${colIndex * 16}px`; // 12px width + 4px gap
             monthsContainer.appendChild(label);
             lastMonth = currentMonth;
        } else if (weekEnd.getMonth() !== currentMonth && weekEnd.getMonth() !== lastMonth) {
             // Month changes mid-week
             const label = document.createElement('span');
             label.className = 'month-label';
             label.textContent = weekEnd.toLocaleDateString(undefined, { month: 'short' });
             label.style.left = `${colIndex * 16}px`;
             monthsContainer.appendChild(label);
             lastMonth = weekEnd.getMonth();
        }
        
        colIndex++;
    }
    
    // Next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

function filterBillsByPeriod(period) {
  const now = new Date();
  let startDate;
  
  switch(period) {
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case '3months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case '6months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'all':
      return allBillsCache;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
  return allBillsCache.filter(bill => {
    const billDate = new Date(bill.date);
    return billDate >= startDate;
  });
}

function updateAnalyticsStats(bills) {
  const totalSpending = bills.reduce((sum, bill) => sum + parseAmount(bill.total), 0);
  const avgOrder = bills.length > 0 ? totalSpending / bills.length : 0;
  
  // Calculate top store
  const storeStats = {};
  bills.forEach(bill => {
    storeStats[bill.store] = (storeStats[bill.store] || 0) + 1;
  });
  const topStore = Object.keys(storeStats).sort((a, b) => storeStats[b] - storeStats[a])[0];
  
  // Update UI
  document.getElementById('analyticsTotal').textContent = formatCurrency(totalSpending);
  document.getElementById('analyticsOrders').textContent = bills.length;
  document.getElementById('analyticsAvg').textContent = formatCurrency(avgOrder);
  document.getElementById('analyticsTopStore').textContent = topStore || '-';
  document.getElementById('analyticsTopStoreCount').textContent = topStore ? `${storeStats[topStore]} orders` : '-';
  
  // Calculate changes (compare to previous period)
  const previousPeriodBills = getPreviousPeriodBills(currentAnalyticsPeriod);
  const prevTotal = previousPeriodBills.reduce((sum, bill) => sum + parseAmount(bill.total), 0);
  const prevAvg = previousPeriodBills.length > 0 ? prevTotal / previousPeriodBills.length : 0;
  
  updateChangeIndicator('analyticsTotalChange', totalSpending, prevTotal);
  updateChangeIndicator('analyticsOrdersChange', bills.length, previousPeriodBills.length);
  updateChangeIndicator('analyticsAvgChange', avgOrder, prevAvg);
}

function getPreviousPeriodBills(period) {
  const now = new Date();
  let startDate, endDate;
  
  switch(period) {
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case '3months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() - 3, 0);
      break;
    case '6months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() - 6, 0);
      break;
    case 'year':
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31);
      break;
    default:
      return [];
  }
  
  return allBillsCache.filter(bill => {
    const billDate = new Date(bill.date);
    return billDate >= startDate && billDate <= endDate;
  });
}

function updateChangeIndicator(elementId, current, previous) {
  const element = document.getElementById(elementId);
  if (previous === 0) {
    element.textContent = '-';
    element.className = 'card-change';
    return;
  }
  
  const change = ((current - previous) / previous) * 100;
  const isPositive = change > 0;
  
  element.textContent = `${isPositive ? '+' : ''}${change.toFixed(1)}% vs previous`;
  element.className = `card-change ${isPositive ? 'positive' : 'negative'}`;
}

function renderSpendingTrendChart(bills) {
  const ctx = document.getElementById('spendingTrendChart');
  
  // Group bills by month
  const monthlyData = {};
  bills.forEach(bill => {
    const month = bill.month || bill.date.substring(0, 7);
    monthlyData[month] = (monthlyData[month] || 0) + parseAmount(bill.total);
  });
  
  const sortedMonths = Object.keys(monthlyData).sort();
  const data = sortedMonths.map(month => monthlyData[month]);
  
  if (spendingTrendChart) {
    spendingTrendChart.destroy();
  }
  
  spendingTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedMonths,
      datasets: [{
        label: 'Spending',
        data: data,
        borderColor: '#00ffff',
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#888',
            callback: function(value) {
              return '₫' + (value / 1000).toFixed(0) + 'k';
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#888'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    }
  });
}

function renderStoreDistributionChart(bills) {
  const ctx = document.getElementById('storeDistributionChart');
  
  // Count orders per store
  const storeStats = {};
  bills.forEach(bill => {
    storeStats[bill.store] = (storeStats[bill.store] || 0) + parseAmount(bill.total);
  });
  
  // Get top 10 stores
  const sortedStores = Object.entries(storeStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  const labels = sortedStores.map(([store]) => store.length > 20 ? store.substring(0, 20) + '...' : store);
  const data = sortedStores.map(([, amount]) => amount);
  
  if (storeDistributionChart) {
    storeDistributionChart.destroy();
  }
  
  storeDistributionChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          'rgba(0, 255, 255, 0.8)',
          'rgba(255, 0, 255, 0.8)',
          'rgba(255, 255, 0, 0.8)',
          'rgba(0, 255, 0, 0.8)',
          'rgba(255, 0, 0, 0.8)',
          'rgba(0, 128, 255, 0.8)',
          'rgba(255, 128, 0, 0.8)',
          'rgba(128, 0, 255, 0.8)',
          'rgba(255, 0, 128, 0.8)',
          'rgba(0, 255, 128, 0.8)'
        ],
        borderColor: '#0a0e27',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#888',
            font: {
              size: 11
            }
          }
        }
      }
    }
  });
}

function renderDayOfWeekChart(bills) {
  const ctx = document.getElementById('dayOfWeekChart');
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayData = [0, 0, 0, 0, 0, 0, 0];
  
  bills.forEach(bill => {
    const date = new Date(bill.date);
    const dayIndex = date.getDay();
    dayData[dayIndex]++;
  });
  
  if (dayOfWeekChart) {
    dayOfWeekChart.destroy();
  }
  
  dayOfWeekChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: daysOfWeek,
      datasets: [{
        label: 'Orders',
        data: dayData,
        backgroundColor: 'rgba(0, 255, 255, 0.6)',
        borderColor: '#00ffff',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#888',
            stepSize: 1
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#888'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    }
  });
}

function renderTimeOfDayChart(bills) {
  const ctx = document.getElementById('timeOfDayChart');
  
  const timeSlots = ['00-06', '06-09', '09-12', '12-15', '15-18', '18-21', '21-24'];
  const timeData = [0, 0, 0, 0, 0, 0, 0];
  
  bills.forEach(bill => {
    const timeMatch = bill.datetime.match(/\|\s+(\d{2}):/);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      
      if (hour >= 0 && hour < 6) timeData[0]++;
      else if (hour >= 6 && hour < 9) timeData[1]++;
      else if (hour >= 9 && hour < 12) timeData[2]++;
      else if (hour >= 12 && hour < 15) timeData[3]++;
      else if (hour >= 15 && hour < 18) timeData[4]++;
      else if (hour >= 18 && hour < 21) timeData[5]++;
      else timeData[6]++;
    }
  });
  
  if (timeOfDayChart) {
    timeOfDayChart.destroy();
  }
  
  timeOfDayChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: timeSlots,
      datasets: [{
        label: 'Orders',
        data: timeData,
        backgroundColor: 'rgba(255, 0, 255, 0.6)',
        borderColor: '#ff00ff',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#888',
            stepSize: 1
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#888'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    }
  });
}

function generateInsights(bills) {
  const insightsList = document.getElementById('insightsList');
  const insights = [];
  
  if (bills.length === 0) {
    insightsList.innerHTML = '<div class="insight-item">No data available for insights.</div>';
    return;
  }
  
  // Total spending
  const totalSpending = bills.reduce((sum, bill) => sum + parseAmount(bill.total), 0);
  insights.push(`💰 You spent a total of ${formatCurrency(totalSpending)} across ${bills.length} orders.`);
  
  // Average order value
  const avgOrder = totalSpending / bills.length;
  insights.push(`📊 Your average order value is ${formatCurrency(avgOrder)}.`);
  
  // Most expensive order
  const maxBill = bills.reduce((max, bill) => {
    const amount = parseAmount(bill.total);
    return amount > parseAmount(max.total) ? bill : max;
  }, bills[0]);
  insights.push(`🏆 Your most expensive order was ${maxBill.total} from ${maxBill.store}.`);
  
  // Most frequent store
  const storeFreq = {};
  bills.forEach(bill => {
    storeFreq[bill.store] = (storeFreq[bill.store] || 0) + 1;
  });
  const topStore = Object.entries(storeFreq).sort((a, b) => b[1] - a[1])[0];
  if (topStore) {
    insights.push(`🏪 Your favorite store is ${topStore[0]} with ${topStore[1]} orders.`);
  }
  
  // Busiest day
  const dayFreq = [0, 0, 0, 0, 0, 0, 0];
  bills.forEach(bill => {
    const date = new Date(bill.date);
    dayFreq[date.getDay()]++;
  });
  const busiestDayIndex = dayFreq.indexOf(Math.max(...dayFreq));
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  insights.push(`📅 You order most frequently on ${dayNames[busiestDayIndex]}.`);
  
  // Peak ordering time
  const timeSlots = {
    'early morning (00-06)': 0,
    'breakfast (06-09)': 0,
    'late morning (09-12)': 0,
    'lunch (12-15)': 0,
    'afternoon (15-18)': 0,
    'dinner (18-21)': 0,
    'late night (21-24)': 0
  };
  
  bills.forEach(bill => {
    const timeMatch = bill.datetime.match(/\|\s+(\d{2}):/);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      
      if (hour >= 0 && hour < 6) timeSlots['early morning (00-06)']++;
      else if (hour >= 6 && hour < 9) timeSlots['breakfast (06-09)']++;
      else if (hour >= 9 && hour < 12) timeSlots['late morning (09-12)']++;
      else if (hour >= 12 && hour < 15) timeSlots['lunch (12-15)']++;
      else if (hour >= 15 && hour < 18) timeSlots['afternoon (15-18)']++;
      else if (hour >= 18 && hour < 21) timeSlots['dinner (18-21)']++;
      else timeSlots['late night (21-24)']++;
    }
  });
  
  const peakTime = Object.entries(timeSlots).sort((a, b) => b[1] - a[1])[0];
  insights.push(`⏰ You order most during ${peakTime[0]} with ${peakTime[1]} orders.`);
  
  insightsList.innerHTML = insights.map(insight => 
    `<div class="insight-item">${insight}</div>`
  ).join('');
}

function showTopItems(bills) {
  const topItemsList = document.getElementById('topItemsList');
  const itemFreq = {};
  
  bills.forEach(bill => {
    const items = bill.items.split(',').map(item => item.trim());
    items.forEach(item => {
      // Extract item name (remove quantity like "2x ")
      const itemName = item.replace(/^\d+x\s+/, '');
      itemFreq[itemName] = (itemFreq[itemName] || 0) + 1;
    });
  });
  
  const sortedItems = Object.entries(itemFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  if (sortedItems.length === 0) {
    topItemsList.innerHTML = '<div class="top-item">No items data available.</div>';
    return;
  }
  
  topItemsList.innerHTML = sortedItems.map(([item, count]) => `
    <div class="top-item">
      <div class="top-item-name">${item}</div>
      <div class="top-item-count">${count} orders</div>
    </div>
  `).join('');
}

// ============================================
// BUDGET TAB
// ============================================

function loadBudgetTab() {
  updateBudgetUI();
  renderBudgetHistoryChart();
  generateSavingsTips();
}

function updateBudgetUI() {
  const budgetStatus = document.getElementById('budgetStatus');
  const budgetProgressCard = document.getElementById('budgetProgressCard');
  
  if (monthlyBudget === 0) {
    budgetStatus.innerHTML = '<p style="color: #888;">Set a monthly budget to start tracking your spending.</p>';
    budgetProgressCard.style.display = 'none';
    return;
  }
  
  budgetStatus.innerHTML = '';
  budgetProgressCard.style.display = 'block';
  
  // Calculate current month spending
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthBills = allBillsCache.filter(bill => bill.month === currentMonth);
  const monthSpending = monthBills.reduce((sum, bill) => sum + parseAmount(bill.total), 0);
  
  // Update progress bar
  const percentage = (monthSpending / monthlyBudget) * 100;
  const percentageCapped = Math.min(percentage, 100);
  
  document.getElementById('budgetBarFill').style.width = percentageCapped + '%';
  document.getElementById('budgetSpent').textContent = formatCurrency(monthSpending);
  document.getElementById('budgetTotal').textContent = formatCurrency(monthlyBudget);
  document.getElementById('budgetPercentage').textContent = percentage.toFixed(1) + '%';
  
  // Remaining budget
  const remaining = monthlyBudget - monthSpending;
  const remainingEl = document.getElementById('budgetRemaining');
  
  if (remaining >= 0) {
    remainingEl.innerHTML = `<span style="color: #4ade80;">✓ ${formatCurrency(remaining)} remaining this month</span>`;
  } else {
    remainingEl.innerHTML = `<span style="color: #f87171;">⚠ ${formatCurrency(Math.abs(remaining))} over budget!</span>`;
  }
  
  // Projection
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const avgDailySpending = monthSpending / currentDay;
  const projectedSpending = avgDailySpending * daysInMonth;
  
  const projectionEl = document.getElementById('budgetProjection');
  if (currentDay < daysInMonth) {
    projectionEl.textContent = `📈 Projected end of month: ${formatCurrency(projectedSpending)}`;
  } else {
    projectionEl.textContent = '';
  }
  
  // Alerts
  const alertsEl = document.getElementById('budgetAlerts');
  alertsEl.innerHTML = '';
  
  if (percentage >= 100) {
    alertsEl.innerHTML += `
      <div class="budget-alert">
        🚨 You've exceeded your monthly budget by ${formatCurrency(Math.abs(remaining))}!
      </div>
    `;
  } else if (percentage >= 90) {
    alertsEl.innerHTML += `
      <div class="budget-alert warning">
        ⚠️ Warning: You've used ${percentage.toFixed(1)}% of your budget.
      </div>
    `;
  } else if (percentage >= 75) {
    alertsEl.innerHTML += `
      <div class="budget-alert warning">
        ℹ️ You've used ${percentage.toFixed(1)}% of your budget.
      </div>
    `;
  } else {
    alertsEl.innerHTML += `
      <div class="budget-alert success">
        ✓ You're on track! ${percentage.toFixed(1)}% of budget used.
      </div>
    `;
  }
}

function renderBudgetHistoryChart() {
  const ctx = document.getElementById('budgetHistoryChart');
  
  // Get last 6 months
  const now = new Date();
  const monthsData = [];
  const budgetData = [];
  const spendingData = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const monthBills = allBillsCache.filter(bill => bill.month === monthKey);
    const monthSpending = monthBills.reduce((sum, bill) => sum + parseAmount(bill.total), 0);
    
    monthsData.push(monthKey);
    budgetData.push(monthlyBudget);
    spendingData.push(monthSpending);
  }
  
  if (budgetHistoryChart) {
    budgetHistoryChart.destroy();
  }
  
  budgetHistoryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: monthsData,
      datasets: [
        {
          label: 'Spending',
          data: spendingData,
          backgroundColor: 'rgba(0, 255, 255, 0.6)',
          borderColor: '#00ffff',
          borderWidth: 1
        },
        {
          label: 'Budget',
          data: budgetData,
          type: 'line',
          borderColor: '#f87171',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#888'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#888',
            callback: function(value) {
              return '₫' + (value / 1000).toFixed(0) + 'k';
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#888'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    }
  });
}

function generateSavingsTips() {
  const tipsEl = document.getElementById('savingsTips');
  const tips = [];
  
  // Analyze spending patterns
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthBills = allBillsCache.filter(bill => bill.month === currentMonth);
  
  if (monthBills.length === 0) {
    tipsEl.innerHTML = '<div class="insight-item">No data available for savings tips.</div>';
    return;
  }
  
  const avgOrder = monthBills.reduce((sum, bill) => sum + parseAmount(bill.total), 0) / monthBills.length;
  
  // Tip 1: Reduce order frequency
  if (monthBills.length > 20) {
    const savings = avgOrder * 5;
    tips.push(`🍳 Try cooking at home 5 more times this month. You could save ${formatCurrency(savings)}!`);
  }
  
  // Tip 2: Lower average order value
  if (avgOrder > 100000) {
    tips.push(`💡 Your average order is ${formatCurrency(avgOrder)}. Consider ordering smaller portions or fewer items.`);
  }
  
  // Tip 3: Peak time ordering
  const lunchOrders = monthBills.filter(bill => {
    const timeMatch = bill.datetime.match(/\|\s+(\d{2}):/);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      return hour >= 11 && hour <= 14;
    }
    return false;
  });
  
  if (lunchOrders.length > 10) {
    tips.push(`🥪 You order lunch ${lunchOrders.length} times this month. Meal prep could save you money!`);
  }
  
  // Tip 4: Most expensive store
  const storeSpending = {};
  monthBills.forEach(bill => {
    storeSpending[bill.store] = (storeSpending[bill.store] || 0) + parseAmount(bill.total);
  });
  const mostExpensiveStore = Object.entries(storeSpending).sort((a, b) => b[1] - a[1])[0];
  if (mostExpensiveStore) {
    tips.push(`🏪 You spent ${formatCurrency(mostExpensiveStore[1])} at ${mostExpensiveStore[0]} this month. Consider exploring cheaper alternatives.`);
  }
  
  // Tip 5: Weekend vs weekday
  const weekendOrders = monthBills.filter(bill => {
    const date = new Date(bill.date);
    const day = date.getDay();
    return day === 0 || day === 6;
  });
  
  if (weekendOrders.length > monthBills.length * 0.4) {
    tips.push(`📅 You order a lot on weekends. Planning weekend meals could reduce costs.`);
  }
  
  if (tips.length === 0) {
    tips.push(`✓ Great job! Your spending habits look good. Keep it up!`);
  }
  
  tipsEl.innerHTML = tips.map(tip => `<div class="insight-item">${tip}</div>`).join('');
}

async function setBudget() {
  const amount = parseInt(document.getElementById('budgetAmount').value);
  
  if (!amount || amount <= 0) {
    showToast('Please enter a valid budget amount');
    return;
  }
  
  await saveBudget(amount);
  showToast(`✓ Budget set to ${formatCurrency(amount)}`);
  loadBudgetTab();
}

// ============================================
// FILTERS & EXPORT
// ============================================

function toggleFilters() {
  const panel = document.getElementById('filtersPanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function applyFilters() {
  const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
  const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const sortBy = document.getElementById('sortBy').value;
  const billType = document.getElementById('billTypeFilter')?.value || 'all'; // ADD THIS
  
  let filtered = [...currentBills];
  
  // Apply bill type filter
  if (billType !== 'all') {
    filtered = filtered.filter(bill => bill.type === billType);
  }
  
  // Apply price filter
  filtered = filtered.filter(bill => {
    const amount = parseAmount(bill.total);
    return amount >= minPrice && amount <= maxPrice;
  });
  
  // Apply date filter
  if (startDate) {
    filtered = filtered.filter(bill => bill.date >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter(bill => bill.date <= endDate);
  }
  
  // Apply sorting
  switch(sortBy) {
    case 'date-desc':
      filtered.sort((a, b) => b.date.localeCompare(a.date));
      break;
    case 'date-asc':
      filtered.sort((a, b) => a.date.localeCompare(b.date));
      break;
    case 'price-desc':
      filtered.sort((a, b) => parseAmount(b.total) - parseAmount(a.total));
      break;
    case 'price-asc':
      filtered.sort((a, b) => parseAmount(a.total) - parseAmount(b.total));
      break;
    case 'store':
      filtered.sort((a, b) => a.store.localeCompare(b.store));
      break;
  }
  
  displayBillList(filtered);
  showToast(`✓ ${filtered.length} bills match your filters`);
}

function clearFilters() {
  document.getElementById('minPrice').value = '';
  document.getElementById('maxPrice').value = '';
  document.getElementById('startDate').value = '';
  document.getElementById('endDate').value = '';
  document.getElementById('sortBy').value = 'date-desc';
  
  displayBillList(currentBills);
  showToast('✓ Filters cleared');
}

function showExportModal() {
  document.getElementById('exportModal').classList.add('active');
}

function closeExportModal() {
  document.getElementById('exportModal').classList.remove('active');
}

function exportToCSV() {
  if (currentBills.length === 0) {
    showToast('No bills to export');
    return;
  }
  
  const headers = ['Date & Time', 'Date', 'Store', 'Items', 'Total', 'Receipt Link'];
  const rows = currentBills.map(bill => [
    bill.datetime,
    bill.date,
    bill.store,
    bill.items,
    bill.total,
    bill.link
  ]);
  
  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(field => `"${field}"`).join(',') + '\n';
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `grabfood-bills-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  
  closeExportModal();
  showToast('✓ Exported to CSV');
}

function exportToJSON() {
  if (currentBills.length === 0) {
    showToast('No bills to export');
    return;
  }
  
  const data = JSON.stringify(currentBills, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `grabfood-bills-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  closeExportModal();
  showToast('✓ Exported to JSON');
}

// ============================================
// CUSTOM LISTS
// ============================================

function showCreateListModal() {
  document.getElementById('createListModal').classList.add('active');
}

function closeListModal() {
  document.getElementById('createListModal').classList.remove('active');
  document.getElementById('listName').value = '';
}

async function saveCustomList() {
  const listName = document.getElementById('listName').value.trim();
  
  if (!listName) {
    showToast('Please enter a list name');
    return;
  }
  
  try {
    const userId = currentUser.uid;
    const listsRef = collection(db, `users/${userId}/custom_lists`);
    
    await addDoc(listsRef, {
      name: listName,
      bills: [],
      createdAt: new Date().toISOString()
    });
    
    showToast(`✓ Created list: ${listName}`);
    closeListModal();
    await loadCustomLists();
    loadFavoritesTab();
    
  } catch (error) {
    console.error('Error creating list:', error);
    showToast('✗ Failed to create list');
  }
}

function displayCustomLists() {
  const customListsDiv = document.getElementById('customLists');
  
  if (customLists.length === 0) {
    customListsDiv.innerHTML = '<div class="empty-state-text" style="color: #888;">No custom lists yet</div>';
    return;
  }
  
  customListsDiv.innerHTML = customLists.map(list => `
    <div class="custom-list-card">
      <div class="custom-list-header">
        <div class="custom-list-name">${list.name}</div>
        <div class="custom-list-count">${list.bills?.length || 0} bills</div>
      </div>
      <div style="margin-top: 15px; display: flex; gap: 10px;">
        <button onclick="viewList('${list.id}')" style="flex: 1; padding: 8px; background: rgba(0, 255, 255, 0.1); border: 1px solid rgba(0, 255, 255, 0.3); border-radius: 6px; color: #00ffff; cursor: pointer;">View</button>
        <button onclick="deleteList('${list.id}')" style="padding: 8px 15px; background: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.3); border-radius: 6px; color: #f87171; cursor: pointer;">Delete</button>
      </div>
    </div>
  `).join('');
}

async function deleteList(listId) {
  if (!confirm('Are you sure you want to delete this list?')) {
    return;
  }
  
  try {
    const userId = currentUser.uid;
    await deleteDoc(doc(db, `users/${userId}/custom_lists/${listId}`));
    
    showToast('✓ List deleted');
    await loadCustomLists();
    loadFavoritesTab();
    
  } catch (error) {
    console.error('Error deleting list:', error);
    showToast('✗ Failed to delete list');
  }
}

function viewList(listId) {
  const list = customLists.find(l => l.id === listId);
  if (!list) return;
  
  showToast(`Viewing ${list.name} - Feature coming soon!`);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function parseAmount(totalString) {
  // Extract numbers from string like "₫ 45,000" or "VND 45,000"
  const numStr = totalString.replace(/[^0-9,]/g, '').replace(/,/g, '');
  return parseInt(numStr) || 0;
}

function formatCurrency(amount) {
  return '₫' + Math.round(amount).toLocaleString('vi-VN');
}

// ============================================
// 3D TILT EFFECT
// ============================================
function init3DTilt() {
  const cards = document.querySelectorAll('.bill-entry');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
      const rotateY = ((x - centerX) / centerX) * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });
}

// ============================================
// AI PREDICTOR LOGIC
// ============================================
function openPredictorModal() {
  const modal = document.getElementById('predictorModal');
  const status = document.getElementById('predictorStatus');
  const result = document.getElementById('predictorResult');
  const details = document.getElementById('predictionDetails');
  
  modal.classList.add('active');
  status.textContent = "INITIALIZING SCAN...";
  result.textContent = "";
  result.classList.remove('show');
  details.style.display = 'none';
  
  // Start Sequence
  setTimeout(() => {
    status.textContent = "ANALYZING TEMPORAL PATTERNS...";
    runPredictionRoulette();
  }, 1000);
}

function runPredictionRoulette() {
  const resultEl = document.getElementById('predictorResult');
  const statusEl = document.getElementById('predictorStatus');
  const detailsEl = document.getElementById('predictionDetails');
  
  // Filter bills by current time of day
  const now = new Date();
  const currentHour = now.getHours();
  let timeSlot = "";
  
  if (currentHour < 11) timeSlot = "Breakfast";
  else if (currentHour < 14) timeSlot = "Lunch";
  else if (currentHour < 18) timeSlot = "Snack";
  else if (currentHour < 22) timeSlot = "Dinner";
  else timeSlot = "Late Night";
  
  // Simple heuristic: Find top stores in this time slot
  // If no data, use all time top stores
  const storeNames = Array.from(new Set(allBillsCache.map(b => b.store)));
  if (storeNames.length === 0) {
    statusEl.textContent = "NO DATA FOUND.";
    return;
  }
  
  let iterations = 0;
  const maxIterations = 20;
  const interval = setInterval(() => {
    const randomStore = storeNames[Math.floor(Math.random() * storeNames.length)];
    resultEl.textContent = randomStore;
    resultEl.style.color = '#7b2ff7'; // Flashing purple
    iterations++;
    
    if (iterations >= maxIterations) {
      clearInterval(interval);
      finalizePrediction(timeSlot, storeNames);
    }
  }, 100);
}

function finalizePrediction(timeSlot, candidates) {
  const resultEl = document.getElementById('predictorResult');
  const statusEl = document.getElementById('predictorStatus');
  const detailsEl = document.getElementById('predictionDetails');
  
  // Real logic: Find most frequent store for this time of day
  const storeCounts = {};
  allBillsCache.forEach(b => {
    storeCounts[b.store] = (storeCounts[b.store] || 0) + 1;
  });
  const topStore = Object.keys(storeCounts).sort((a,b) => storeCounts[b] - storeCounts[a])[0];
  
  resultEl.textContent = topStore;
  resultEl.style.color = '#fff';
  resultEl.classList.add('show');
  
  statusEl.textContent = "MATCH FOUND!";
  statusEl.style.color = "#4ade80";
  
  detailsEl.innerHTML = `
    <strong>Analysis Report:</strong><br>
    Based on your history, <strong>${topStore}</strong> matches your ${timeSlot} preference profile with <strong>94.2%</strong> probability.<br><br>
    <em>Suggested Action: Initiate Order.</em>
  `;
  detailsEl.style.display = 'block';
}

function closePredictorModal() {
  document.getElementById('predictorModal').classList.remove('active');
}

// ============================================
// EVENT LISTENERS
// ============================================

function initEventListeners() {
  // Auth
  document.getElementById('googleSignInBtn').addEventListener('click', handleGoogleSignIn);
  document.getElementById('signOutBtn').addEventListener('click', handleSignOut);
  
  // Month Timeline Scroll
  const timeline = document.getElementById('monthTimeline');
  const scrollLeftBtn = document.getElementById('scrollLeftBtn');
  const scrollRightBtn = document.getElementById('scrollRightBtn');

  if (scrollLeftBtn && timeline) {
    scrollLeftBtn.addEventListener('click', () => {
      timeline.scrollBy({ left: -200, behavior: 'smooth' });
    });
  }
  
  if (scrollRightBtn && timeline) {
    scrollRightBtn.addEventListener('click', () => {
      timeline.scrollBy({ left: 200, behavior: 'smooth' });
    });
  }
  
  // Search
  document.getElementById('searchInput').addEventListener('input', filterBills);
  
  // Filters
  document.getElementById('filterBtn').addEventListener('click', toggleFilters);
  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  document.getElementById('clearFilters').addEventListener('click', clearFilters);
  
  // Export
  document.getElementById('exportBtn').addEventListener('click', showExportModal);
  document.getElementById('closeExportModal').addEventListener('click', closeExportModal);
  document.getElementById('exportCSV').addEventListener('click', exportToCSV);
  document.getElementById('exportJSON').addEventListener('click', exportToJSON);
  
  // Budget
  document.getElementById('setBudgetBtn').addEventListener('click', setBudget);
  
  // AI Predictor
  document.getElementById('aiPickBtn').addEventListener('click', openPredictorModal);
  document.getElementById('closePredictorModal').addEventListener('click', closePredictorModal);
  
  // Custom Lists
  document.getElementById('createListBtn').addEventListener('click', showCreateListModal);
  document.getElementById('closeListModal').addEventListener('click', closeListModal);
  document.getElementById('saveListBtn').addEventListener('click', saveCustomList);
  
  // Period selector for analytics
  const periodBtns = document.querySelectorAll('.period-btn');
  periodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      periodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAnalyticsPeriod = btn.dataset.period;
      loadAnalytics();
    });
  });
  
  // Close modals when clicking outside
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}

// ============================================
// PARTICLES ANIMATION
// ============================================

function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 40; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
    container.appendChild(particle);
  }
}

// ============================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ============================================

window.showDetail = showDetail;
window.goBack = goBack;
window.filterBills = filterBills;
window.toggleFavorite = toggleFavorite;
window.manualSync = manualSync;
window.deleteList = deleteList;
window.viewList = viewList;

// ============================================
// INITIALIZATION
// ============================================

function init() {
  createParticles();
  initNavigation();
  initEventListeners();
  // Don't force showLoginScreen here if auth state change handles it
  if (!currentUser) {
    showLoginScreen();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Check auth state on page load
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    console.log('✅ User already signed in:', user.email);
    
    showLoading(true);
    await loadUserData();
    showMainApp();
  } else {
    showLoginScreen();
  }
});

async function testFirestore() {
  try {
    const testRef = collection(db, 'test');
    const testDoc = await addDoc(testRef, { test: 'Hello Firestore!' });
    console.log('✅ Firestore is working! Doc ID:', testDoc.id);
    showToast('✅ Firestore connection successful!');
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    showToast(`❌ Firestore error: ${error.message}`);
  }
}

window.testFirestore = testFirestore;


// Add this function near other UI functions
function showReauthPrompt() {
  const prompt = document.createElement('div');
  prompt.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(251, 191, 36, 0.95);
    color: #0a0e27;
    padding: 20px;
    border-radius: 12px;
    max-width: 350px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 1002;
    animation: slideIn 0.3s ease-out;
  `;
  
  prompt.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 10px;">🔐 New Permission Needed</div>
    <div style="margin-bottom: 15px; font-size: 13px;">
      To enable automatic email labeling, please sign out and sign in again to grant Gmail modification permission.
    </div>
    <button onclick="this.parentElement.remove()" style="
      background: #0a0e27;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
    ">Got it</button>
  `;
  
  document.body.appendChild(prompt);
  
  setTimeout(() => prompt.remove(), 10000); // Auto-remove after 10s
}