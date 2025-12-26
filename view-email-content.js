const { google } = require('googleapis');
const fs = require('fs');

// 📧 Get Gmail client
async function getGmailClient() {
  const credentials = JSON.parse(fs.readFileSync('gmail-credentials.json'));
  const token = JSON.parse(fs.readFileSync('gmail-token.json'));
  
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  
  oAuth2Client.setCredentials(token);
  
  return google.gmail({ version: 'v1', auth: oAuth2Client });
}

// 🔍 View email content from Dec 25, 2025 only
async function viewEmailContent() {
  console.log('🔍 Viewing GrabFood email content from Dec 25, 2025 ONLY...\n');

  try {
    const gmail = await getGmailClient();

    // Search for emails ONLY from Dec 25, 2025
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'from:no-reply@grab.com subject:"Your Grab E-Receipt" after:2025/12/24 before:2025/12/26',
      maxResults: 50
    });

    const messages = response.data.messages || [];
    console.log(`📧 Found ${messages.length} emails from Dec 25, 2025\n`);

    if (messages.length === 0) {
      console.log('📭 No emails found for Dec 25, 2025.');
      return;
    }

    // Group messages by thread to show which are in the same conversation
    const threadMap = {};
    for (const msg of messages) {
      const fullMsg = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'metadata',
        metadataHeaders: ['Subject']
      });
      const threadId = fullMsg.data.threadId;
      if (!threadMap[threadId]) {
        threadMap[threadId] = [];
      }
      threadMap[threadId].push(msg.id);
    }

    console.log('🧵 THREAD GROUPING:');
    let threadNum = 1;
    for (const [threadId, msgIds] of Object.entries(threadMap)) {
      console.log(`  Thread ${threadNum}: ${msgIds.length} message(s) - Thread ID: ${threadId}`);
      threadNum++;
    }
    console.log('');

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      
      try {
        const fullMessage = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });

        const payload = fullMessage.data.payload;
        
        // Get email date
        const dateHeader = payload.headers.find(h => h.name.toLowerCase() === 'date');
        const emailDate = dateHeader ? new Date(dateHeader.value) : new Date();
        
        // Extract email body
        function extractBody(part) {
          if (part.body && part.body.data) {
            return Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
          
          if (part.parts) {
            // Try text/html first
            let textPart = part.parts.find(p => p.mimeType === 'text/html');
            if (textPart && textPart.body && textPart.body.data) {
              const html = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
              // Strip HTML tags to get plain text
              return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
            }
            
            // Fallback to text/plain
            textPart = part.parts.find(p => p.mimeType === 'text/plain');
            if (textPart && textPart.body && textPart.body.data) {
              return Buffer.from(textPart.body.data, 'base64').toString('utf-8');
            }
            
            // Recursively check all parts
            for (const subPart of part.parts) {
              const result = extractBody(subPart);
              if (result) return result;
            }
          }
          
          return '';
        }
        
        const body = extractBody(payload);
        
        // Clean up HTML entities for better readability
        const cleanBody = body
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"');

        console.log('='.repeat(80));
        console.log(`📧 EMAIL #${i + 1} of ${messages.length}`);
        console.log(`📅 Date: ${emailDate.toLocaleString()}`);
        console.log(`🔗 Message ID: ${message.id}`);
        console.log(`🧵 Thread ID: ${fullMessage.data.threadId}`);
        console.log('='.repeat(80));
        console.log('\n📄 FULL EMAIL CONTENT:\n');
        console.log(cleanBody);
        console.log('\n' + '='.repeat(80) + '\n\n');

      } catch (error) {
        console.error(`❌ Error processing message ${message.id}:`, error.message);
      }
    }

    console.log('✅ Finished viewing all emails from Dec 25, 2025');

  } catch (error) {
    console.error('\n❌ Failed:', error.message);
  }
}

// Run the viewer
viewEmailContent()
  .then(() => {
    console.log('\n✅ Script finished');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });