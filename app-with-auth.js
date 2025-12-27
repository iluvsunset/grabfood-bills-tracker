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
  query, 
  where,
  orderBy 
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

// Configure Google provider with Gmail scope
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');

// ============================================
// GLOBAL STATE
// ============================================
let currentUser = null;
let months = [];
let currentBills = [];
let allBillsCount = 0;
let allBillsCache = [];
let gmailAccessToken = null;

// ============================================
// AUTH FUNCTIONS
// ============================================

async function handleGoogleSignIn() {
  try {
    showLoading(true);
    showToast('Signing in...');
    
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    
    // Get Gmail OAuth token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    gmailAccessToken = credential?.accessToken;
    
    console.log('✅ User signed in:', currentUser.email);
    console.log('📧 Gmail token:', gmailAccessToken ? 'Available' : 'Not available');
    
    // Load existing bills first
    await loadUserBills();
    
    // If user has no bills, offer to sync
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
    showLoginScreen();
    showToast('✓ Signed out');
  } catch (error) {
    console.error('❌ Sign out error:', error);
    showToast('✗ Sign out failed');
  }
}

// ============================================
// GMAIL SYNC FUNCTIONS
// ============================================

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
    
    // Fetch Gmail messages
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:no-reply@grab.com subject:"Your Grab E-Receipt"&maxResults=50',
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status}`);
    }
    
    const data = await response.json();
    const messages = data.messages || [];
    
    console.log(`📧 Found ${messages.length} GrabFood emails`);
    showToast(`Found ${messages.length} receipts. Processing...`);
    
    const bills = [];
    
    for (let i = 0; i < messages.length; i++) {
      try {
        // Get full message
        const msgResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messages[i].id}?format=full`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        const fullMessage = await msgResponse.json();
        const payload = fullMessage.payload;
        
        // Extract body
        const body = extractEmailBody(payload);
        
        // Get email date
        const dateHeader = payload.headers.find(h => h.name.toLowerCase() === 'date');
        const emailDate = dateHeader ? new Date(dateHeader.value) : new Date();
        
        // Extract bill data
        const billData = extractBillData(body, emailDate, fullMessage.threadId);
        
        if (billData.valid) {
          bills.push(billData);
        }
        
        // Update progress
        if ((i + 1) % 10 === 0) {
          showToast(`Processed ${i + 1}/${messages.length}...`);
        }
        
      } catch (error) {
        console.error('Error processing message:', error);
      }
    }
    
    console.log(`✅ Successfully extracted ${bills.length} bills`);
    
    // Save to Firestore
    await saveBillsToFirestore(bills);
    
    showToast(`✓ Synced ${bills.length} bills!`);
    
    // Reload bills
    await loadUserBills();
    
  } catch (error) {
    console.error('❌ Sync error:', error);
    showToast('✗ Sync failed: ' + error.message);
  } finally {
    showLoading(false);
  }
}

// Extract email body from Gmail API response
function extractEmailBody(payload) {
  if (payload.body && payload.body.data) {
    return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
  }
  
  if (payload.parts) {
    let part = payload.parts.find(p => p.mimeType === 'text/html');
    if (part && part.body && part.body.data) {
      const html = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    }
    
    part = payload.parts.find(p => p.mimeType === 'text/plain');
    if (part && part.body && part.body.data) {
      return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
  }
  
  return '';
}

// Extract bill data from email body
function extractBillData(body, emailDate, threadId) {
  try {
    const cleanBody = body
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');

    const amountMatch = cleanBody.match(/BẠN TRẢ\s+([\d,.]+)(?:₫|VND)/) || 
                        cleanBody.match(/Tổng cộng\s+([\d,.]+)(?:₫|VND)/);
    
    let storeMatch = cleanBody.match(/Đặt từ\s+([^]+?)\s+(?:[A-ZĐÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ][a-zđáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]+\s+)*Giao đến/);
    
    if (!storeMatch) {
      storeMatch = cleanBody.match(/Đặt từ\s+([^]+?)\s+Hồ sơ/);
    }
    
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
    
    const yyyy = emailDate.getFullYear();
    const mm = String(emailDate.getMonth() + 1).padStart(2, '0');
    const dd = String(emailDate.getDate()).padStart(2, '0');
    const hh = String(emailDate.getHours()).padStart(2, '0');
    const min = String(emailDate.getMinutes()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd} | ${hh}:${min}`;
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
    console.error('Error extracting bill data:', error);
    return { valid: false };
  }
}

// Save bills to Firestore
async function saveBillsToFirestore(bills) {
  const userId = currentUser.uid;
  console.log(`💾 Saving ${bills.length} bills to Firestore...`);
  
  const userBillsRef = collection(db, `users/${userId}/grabfood_bills`);
  let savedCount = 0;
  
  for (const bill of bills) {
    try {
      // Check if bill already exists
      const q = query(userBillsRef, where('datetime', '==', bill.datetime));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        await addDoc(userBillsRef, {
          ...bill,
          createdAt: new Date().toISOString()
        });
        savedCount++;
      }
    } catch (error) {
      console.error('Error saving bill:', error);
    }
  }
  
  console.log(`✅ Saved ${savedCount} new bills`);
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

function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// ============================================
// LOAD USER BILLS
// ============================================

async function loadUserBills() {
  try {
    showLoading(true);
    const userId = currentUser.uid;
    const userBillsRef = collection(db, `users/${userId}/grabfood_bills`);
    const q = query(userBillsRef, orderBy("datetime", "desc"));
    const snapshot = await getDocs(q);
    
    const bills = [];
    const monthSet = new Set();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.datetime) {
        // Extract month if not present
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
    
    console.log(`✅ Loaded ${bills.length} bills for user`);
    console.log('📊 Months:', months);
    
    populateMonths();
    updateStats(0);
    
  } catch (error) {
    console.error("❌ Error loading bills:", error);
    showToast('✗ Failed to load bills: ' + error.message);
  } finally {
    showLoading(false);
  }
}

function getBillsByMonth(month) {
  return allBillsCache.filter(bill => bill.month === month);
}

function updateStats(monthBillCount) {
  const statsBar = document.getElementById('statsBar');
  const totalBillsEl = document.getElementById('totalBills');
  const monthBillsEl = document.getElementById('monthBills');
  
  if (allBillsCount > 0) {
    statsBar.style.display = 'flex';
    totalBillsEl.textContent = allBillsCount;
    monthBillsEl.textContent = monthBillCount || 0;
  }
}

// ============================================
// MONTH SELECTOR & DISPLAY
// ============================================

window.toggleDropdown = function() {
  document.getElementById("monthDropdown").classList.toggle("open");
}

function populateMonths() {
  const optionsDiv = document.getElementById("monthOptions");
  optionsDiv.innerHTML = "";
  
  if (months.length === 0) {
    optionsDiv.innerHTML = '<div style="padding: 14px 24px; color: #888;">No bills yet. Click "Sync Gmail" to import!</div>';
    return;
  }
  
  months.forEach((month) => {
    const opt = document.createElement("div");
    opt.textContent = month;
    opt.onclick = () => selectMonth(month);
    optionsDiv.appendChild(opt);
  });
}

function selectMonth(month) {
  document.getElementById("selectedMonth").textContent = `📅 ${month}`;
  toggleDropdown();
  
  const searchContainer = document.getElementById('searchContainer');
  searchContainer.classList.add('visible');
  
  const bills = getBillsByMonth(month);
  currentBills = bills;
  
  displayBillList(bills);
  updateStats(bills.length);
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
    entry.innerHTML = `
      <div class="bill-info">
        <div>📅 ${bill.date}</div>
        <div class="bill-separator">|</div>
        <div>🏪 ${bill.store}</div>
      </div>
      <button onclick="showDetail('${bill.id}')">View →</button>
    `;
    listDiv.appendChild(entry);
  });
}

window.showDetail = function(billId) {
  const bill = currentBills.find(b => b.id === billId);
  if (!bill) return;
  
  const detail = document.getElementById("billDetail");
  const list = document.getElementById("billList");
  const searchContainer = document.getElementById("searchContainer");
  
  list.innerHTML = "";
  searchContainer.classList.remove('visible');
  
  detail.innerHTML = `
    <button onclick="goBack()">← Back</button>
    <h3>📋 Bill Details</h3>
    <p><strong>📅 Date & Time:</strong> ${bill.datetime}</p>
    <p><strong>🏪 Store:</strong> ${bill.store}</p>
    <p><strong>🍽️ Items:</strong> ${bill.items}</p>
    <p><strong>💰 Total:</strong> ${bill.total}</p>
    <p><strong>🔗 Receipt:</strong> <a href="${bill.link}" target="_blank">View Online</a></p>
  `;
  detail.style.display = "block";
}

window.goBack = function() {
  const searchContainer = document.getElementById("searchContainer");
  searchContainer.classList.add('visible');
  document.getElementById("billDetail").style.display = "none";
  displayBillList(currentBills);
}

window.filterBills = function() {
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

// Add manual sync button handler
window.manualSync = async function() {
  if (!gmailAccessToken) {
    // Need to re-authenticate to get Gmail permission
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
// INITIALIZATION
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

// Attach event listeners
document.getElementById('googleSignInBtn').addEventListener('click', handleGoogleSignIn);
document.getElementById('signOutBtn').addEventListener('click', handleSignOut);
document.getElementById('syncGmailBtn').addEventListener('click', manualSync); // Add this line

// Check auth state on page load
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    console.log('✅ User already signed in:', user.email);
    
    showLoading(true);
    await loadUserBills();
    showMainApp();
  } else {
    showLoginScreen();
  }
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  createParticles();
  showLoginScreen();
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('monthDropdown');
  if (dropdown && !dropdown.contains(e.target)) {
    dropdown.classList.remove('open');
  }
});