<div align="center">

# 🍔 𝔾ℝ𝔸𝔹 𝔹𝕀𝕃𝕃𝕊 𝕋ℝ𝔸ℂ𝕂𝔼ℝ
### ᴛʜᴇ ᴄʏʙᴇʀᴘᴜɴᴋ ꜱᴘᴇɴᴅɪɴɢ ᴘᴏʀᴛᴀʟ

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Gmail API](https://img.shields.io/badge/Gmail_API-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](https://developers.google.com/gmail/api)
[![Status](https://img.shields.io/badge/Status-OPERATIONAL-00ffff?style=for-the-badge)](https://github.com/)

<p align="center">
  <b>Visualize your Grab spending in a fully immersive, 3D holographic interface.</b><br>
  <i>No more boring spreadsheets. Welcome to the future of expense tracking.</i>
</p>

</div>

---

## 🌌 ʜᴏʟᴏɢʀᴀᴘʜɪᴄ ᴇxᴘᴇʀɪᴇɴᴄᴇ
This isn't just a bill tracker; it's a **visual experience**. The application features a custom-built rendering engine including:

*   **✨ Particle Core System:** A living, breathing background that reacts to the environment.
*   **💠 3D Tilt-Cards:** "Holo-cards" that respond to your mouse movement with realistic depth and lighting.
*   **🔮 Neon Glassmorphism:** A UI designed with semi-transparent, blur-filtered panels and glowing accents.
*   **⚡ Reactive Animations:** Smooth transitions, scanning beams, and cyber-entry effects.

---

## 🚀 ᴄᴏʀᴇ ꜰᴇᴀᴛᴜʀᴇꜱ

### 🔄 **Neural Sync Protocol (Gmail Integration)**
Automatically connects to your Gmail account to extract, parse, and categorize every Grab receipt.
*   **Smart Parsing:** Distinguishes between `GrabFood`, `GrabBike`, `GrabCar`, `GrabExpress`, and `GrabMart`.
*   **Deep Extraction:** Pulls item details, driver names, pickup/drop-off locations, and total costs.

### 📊 **Analytics Dashboard**
*   **🔥 Heatmaps:** Visualize your spending intensity across the year.
*   **📈 Trend Lines:** Track your monthly spending velocity.
*   **🏆 Top Merchants:** Identify your most frequented stores and favorite meals.

### 🔮 **AI Cravings Predictor**
Unsure what to eat? Let the **AI Oracle** analyze your history and summon a suggestion from your past favorites.

### 💰 **Budget Enforcer**
Set a monthly cap. The system visualizes your remaining budget with dynamic progress bars and alert states.

---

## 🛠️ ɪɴꜱᴛᴀʟʟᴀᴛɪᴏɴ & ꜱᴇᴛᴜᴘ

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/grab-bills.git
cd grab-bills
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Credentials
This system requires two security keys to function.

#### **🅰 Firebase Admin SDK**
1.  Go to **Firebase Console > Project Settings > Service Accounts**.
2.  Generate a new Private Key.
3.  Save the file as `serviceAccountKey.json` in the root directory.

#### **🅱 Gmail API OAuth**
1.  Go to **Google Cloud Console > APIs & Services > Credentials**.
2.  Create OAuth 2.0 Client ID (Application Type: **Desktop App** or **Web App**).
3.  Download the JSON and save it as `gmail-credentials.json` in the root directory.

### 4️⃣ Initialize the Database
Ensure your Firestore database is created in the Firebase Console.

---

## 🕹️ ᴏᴘᴇʀᴀᴛɪᴏɴ ᴍᴀɴᴜᴀʟ

### 🔄 Phase 1: Data Sync
Run the Node.js script to pull data from the Gmail matrix into Firestore.
```bash
node sync-gmail-to-firebase.js
```
*On first run, this will launch a browser window for Google Authentication.*

### 🖥️ Phase 2: Launch Interface
Since this is a modern ES6 module application, it requires a local server.
```bash
# Using Python
python3 -m http.server 3000

# OR using npx
npx serve .
```
Open your browser to `http://localhost:3000`.

---

## 📂 ꜱʏꜱᴛᴇᴍ ᴀʀᴄʜɪᴛᴇᴄᴛᴜʀᴇ

| File | Designation | Description |
| :--- | :--- | :--- |
| `index.html` | **Core UI** | The main viewport for the application. |
| `styles.css` | **Visuals** | Contains the CSS for particle effects, animations, and neon styling. |
| `app-with-auth.js` | **Controller** | Handles Firebase Auth, UI logic, and data rendering. |
| `sync-gmail-to-firebase.js` | **Ingestor** | Node.js script for deep-parsing emails and syncing to DB. |
| `setup-gmail-auth.js` | **Auth** | Standalone script to refresh or generate Gmail tokens. |

---

<div align="center">

### ⚠️ ᴅɪꜱᴄʟᴀɪᴍᴇʀ
*This tool parses sensitive financial data from your emails. Ensure you keep your `serviceAccountKey.json` and `gmail-credentials.json` secure and never commit them to public repositories.*

<br>

**[ 𝙴𝙽𝙳 𝙾Phi 𝚃𝚁𝙰𝙽𝚂𝙼𝙸𝚂𝚂𝙸𝙾𝙽 ]**

</div>