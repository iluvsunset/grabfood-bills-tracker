const { google } = require('googleapis');
const fs = require('fs');
const http = require('http');
const url = require('url');

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify'
];

const TOKEN_PATH = 'gmail-token.json';
const CREDENTIALS_PATH = 'gmail-credentials.json';
const PORT = 3000;

async function authorize() {
  // Check if credentials file exists
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ Error: gmail-credentials.json not found!');
    console.log('\n📋 To create it:');
    console.log('1. Go to https://console.cloud.google.com');
    console.log('2. Enable Gmail API');
    console.log('3. Create OAuth 2.0 credentials (WEB APPLICATION)');
    console.log('4. Add redirect URI: http://localhost:3000/oauth2callback');
    console.log('5. Download and save as gmail-credentials.json\n');
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const keys = credentials.web || credentials.installed;
  
  if (!keys) {
    throw new Error('Invalid credentials file. Expected "web" or "installed" key.');
  }

  const { client_secret, client_id, redirect_uris } = keys;
  
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    `http://localhost:${PORT}/oauth2callback`
  );

  // Check if we already have a token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    console.log('✅ Already authenticated!');
    console.log('✅ You can now run: node sync-gmail-to-firebase.js');
    return;
  }

  // Get new token via local server
  return getNewToken(oAuth2Client);
}

function getNewToken(oAuth2Client) {
  return new Promise((resolve, reject) => {
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    console.log('\n' + '='.repeat(60));
    console.log('🔐 GMAIL AUTHENTICATION SETUP');
    console.log('='.repeat(60));
    console.log('\n✅ Opening browser for authentication...');
    console.log('📍 If browser doesn\'t open, visit:\n');
    console.log(authorizeUrl);
    console.log('\n⏳ Waiting for authorization...\n');

    // Create local server to receive OAuth callback
    const server = http.createServer(async (req, res) => {
      try {
        if (req.url.indexOf('/oauth2callback') > -1) {
          const qs = new url.URL(req.url, `http://localhost:${PORT}`).searchParams;
          const code = qs.get('code');

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: Arial; text-align: center; padding: 50px; background: #0a0e27; color: #00ffff;">
                <h1>✅ Authentication Successful!</h1>
                <p style="font-size: 18px; margin-top: 20px;">You can close this window and return to the terminal.</p>
                <script>setTimeout(() => window.close(), 3000);</script>
              </body>
            </html>
          `);

          server.close();

          // Exchange code for tokens
          const { tokens } = await oAuth2Client.getToken(code);
          oAuth2Client.setCredentials(tokens);

          // Save token
          fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

          console.log('✅ Authentication successful!');
          console.log('✅ Token saved to gmail-token.json');
          console.log('\n📧 Next step: node sync-gmail-to-firebase.js\n');

          resolve(oAuth2Client);
        }
      } catch (e) {
        console.error('❌ Error during authentication:', e.message);
        reject(e);
      }
    });

    server.listen(PORT, async () => {
      // Open browser automatically
      const { default: open } = await import('open');
      open(authorizeUrl, { wait: false }).catch(() => {
        console.log('💡 Could not open browser automatically. Please open the URL manually.');
      });
    });
  });
}

authorize().catch(console.error);