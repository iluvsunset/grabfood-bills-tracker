# 🍔 GrabFood Bills Portal

A comprehensive dashboard to track, analyze, and manage your GrabFood (and other Grab services) spending. This project syncs your Grab receipts from Gmail to Firebase and presents them in a beautiful, sci-fi themed web interface.

## ✨ Features

- **🔄 Gmail Sync:** Automatically fetches Grab receipts from your Gmail account and parses them for details.
- **📊 Analytics Dashboard:**
  - Visualize spending trends over time.
  - Heatmap of ordering intensity.
  - Top stores and most ordered items.
  - Spending breakdown by day of week and time of day.
- **📋 Smart Bill Management:**
  - Search by store, date, or specific food items.
  - Filter by service type (Food, Bike, Car, Mart, Express).
  - Sort by date, price, or store name.
- **💰 Budget Tracking:** Set monthly budgets and track your progress with visual alerts and history.
- **⭐ Favorites & Lists:** Save your favorite stores and create custom collections (e.g., "Work Lunches").
- **🔮 AI Cravings Predictor:** A fun "AI Pick" feature to help you decide what to eat based on your history.
- **📥 Export Data:** Export your bill history to CSV or JSON formats.
- **🌗 Modern UI:** Responsive, dark-mode interface with particle effects and smooth animations.

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla ES6+)
- **Backend (Scripts):** Node.js
- **Database:** Firebase Firestore
- **Authentication:** Google OAuth 2.0 (Client-side)
- **APIs:** Gmail API (for fetching emails)

## 🚀 Setup Guide

### Prerequisites
1.  **Node.js** installed on your machine.
2.  A **Firebase Project** with Firestore enabled.
3.  A **Google Cloud Project** with the Gmail API enabled.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd grabfood-bills
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configuration:**

    *   **Firebase Admin SDK:**
        *   Go to your Firebase Project Settings > Service Accounts.
        *   Generate a new private key.
        *   Save the JSON file as `serviceAccountKey.json` in the root directory.

    *   **Gmail API:**
        *   Go to your Google Cloud Console > APIs & Services > Credentials.
        *   Create OAuth 2.0 Client ID credentials (download as `credentials.json`).
        *   Save `credentials.json` in the root directory.
    
    *   **Frontend Configuration:**
        *   Update the Firebase config object in `app-with-auth.js` (or wherever the client-side init happens) with your project's details.

### 🏃‍♂️ Running the Project

1.  **Sync Data:**
    Run the sync script to fetch emails from Gmail and save them to Firestore.
    ```bash
    node sync-gmail-to-firebase.js
    ```
    *Note: The first time you run this, you will be prompted to authorize access to your Gmail account via a browser.*

2.  **Start the Web App:**
    Since this is a client-side app using ES modules, you need to serve it using a local web server (opening `index.html` directly might not work due to CORS/module policies).
    
    You can use a simple tool like `serve` or `http-server`:
    ```bash
    npx serve .
    ```
    or simply:
    ```bash
    python3 -m http.server
    ```

3.  **Access the Dashboard:**
    Open your browser and navigate to `http://localhost:3000` (or whatever port your server uses). Sign in with your Google account to view your data.

## 📂 Project Structure

- `index.html`: Main entry point for the web application.
- `styles.css`: Global styles and UI themes.
- `app-with-auth.js`: Main frontend logic, including Firebase auth and UI interactions.
- `sync-gmail-to-firebase.js`: Node.js script to fetch and parse Gmail emails.
- `setup-gmail-auth.js`: Helper script to handle initial Gmail API authentication.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests for new features or bug fixes.

## 📄 License

This project is licensed under the ISC License.
