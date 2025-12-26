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
    const gmailToken = credential.accessToken;
    
    console.log('✅ User signed in:', currentUser.email);
    console.log('📧 Gmail token obtained');
    
    // Show sync UI
    showSyncScreen(gmailToken);
    
  } catch (error) {
    console.error('❌ Sign in error:', error);
    showToast('✗ Sign in failed: ' + error.message);
    showLoading(false);
  }
}

async function handleSignOut() {
  try {
    await signOut(auth);
    showLoginScreen();
    showToast('✓ Signed out');
  } catch (error) {
    console.error('❌ Sign out error:', error);
    showToast('✗ Sign out failed');
  }
}

// ============================================
// SYNC FUNCTION (Extract Gmail Bills)
// ============================================

async function syncGmailBills(gmailToken) {
  try {
    showToast('🔄 Extracting bills from Gmail...');
    
    // Call Gmail API to fetch emails
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:no-reply@grab.com subject:"Your Grab E-Receipt"&maxResults=100', {
      headers: {
        'Authorization': `Bearer ${gmailToken}`
      }
    });
    
    const data = await response.json();
    const messages = data.messages || [];
    
    console.log(`📧 Found ${messages.length} GrabFood emails`);
    showToast(`Found ${messages.length} receipts. Processing...`);
    
    const bills = [];
    let processed = 0;
    
    for (const message of messages) {
      try {
        // Get full message
        const msgResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`, {
          headers: {
            'Authorization': `Bearer ${gmailToken}`
          }
        });
        
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
          processed++;
        }
        
        // Update progress
        if (processed % 10 === 0) {
          showToast(`Processed ${processed}/${messages.length}...`);
        }
        
      } catch (error) {
        console.error('Error processing message:', error);
      }
    }
    
    console.log(`✅ Successfully extracted ${bills.length} bills`);
    
    // Save to Firestore under user's collection
    await saveBillsToFirestore(bills);
    
    showToast(`✓ Synced ${bills.length} bills!`);
    
    // Load and display bills
    await loadUserBills();
    showMainApp();
    
  } catch (error) {
    console.error('❌ Sync error:', error);
    showToast('✗ Sync failed: ' + error.message);
    showLoading(false);
  }
}

// Extract email body from Gmail API response
function extractEmailBody(payload) {
  if (payload.body && payload.body.data) {
    return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
  }
  
  if (payload.parts) {
    // Try text/html first
    let part = payload.parts.find(p => p.mimeType === 'text/html');
    if (part && part.body && part.body.data) {
      const html = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      // Strip HTML tags
      return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    }
    
    // Try text/plain
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
    
    // Extract store name - handle delivery and pickup
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
    
    // Format date
    const yyyy = emailDate.getFullYear();
    const mm = String(emailDate.getMonth() + 1).padStart(2, '0');
    const dd = String(emailDate.getDate()).padStart(2, '0');
    const hh = String(emailDate.getHours()).padStart(2, '0');
    const min = String(emailDate.getMinutes()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd} | ${hh}:${min}`;

    if (formattedDate && totalAmount && storeName && foodItems) {
      return {
        datetime: formattedDate,
        date: `${yyyy}-${mm}-${dd}`,
        month: `${yyyy}-${mm}`,
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
  const userEmail = currentUser.email;
  const userId = currentUser.uid;
  
  console.log(`💾 Saving ${bills.length} bills to Firestore for user ${userEmail}...`);
  
  // Save to user's collection
  const userBillsRef = collection(db, 'grabfood_bills');
  
  for (const bill of bills) {
    try {
      // Check if bill already exists (by datetime)
      const q = query(userBillsRef, where('datetime', '==', bill.datetime));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Add new bill
        await addDoc(userBillsRef, {
          ...bill,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error saving bill:', error);
    }
  }
  
  console.log('✅ Bills saved to Firestore');
}

// ============================================
// UI FUNCTIONS
// ============================================

function showLoginScreen() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('syncScreen').style.display = 'none';
  document.getElementById('mainApp').style.display = 'none';
  showLoading(false);
}

function showSyncScreen(gmailToken) {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('syncScreen').style.display = 'flex';
  document.getElementById('mainApp').style.display = 'none';
  
  // Auto-start sync after 1 second
  setTimeout(() => {
    syncGmailBills(gmailToken);
  }, 1000);
}

function showMainApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('syncScreen').style.display = 'none';
  document.getElementById('mainApp').style.display = 'block';
  showLoading(false);
  
  // Show user info
  if (currentUser) {
    document.getElementById('userEmail').textContent = currentUser.email;
  }
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
    const userId = currentUser.uid;
    const userBillsRef = collection(db, `users/${userId}/grabfood_bills`);
    const q = query(userBillsRef, orderBy("datetime", "desc"));
    const snapshot = await getDocs(q);
    
    const bills = [];
    const monthSet = new Set();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.datetime) {
        const bill = {
          id: doc.id,
          ...data
        };
        bills.push(bill);
        monthSet.add(bill.month);
      }
    });
    
    allBillsCache = bills;
    allBillsCount = bills.length;
    months = Array.from(monthSet).sort().reverse();
    
    populateMonths();
    updateStats(0);
    
    console.log(`✅ Loaded ${bills.length} bills for user`);
    
  } catch (error) {
    console.error("Error loading bills:", error);
    showToast('✗ Failed to load bills');
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

// Check auth state on page load
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    console.log('✅ User already signed in:', user.email);
    
    // Load existing bills
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