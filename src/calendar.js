const { google } = require('googleapis'); // pull in google library
const fs = require('fs'); // pull in file system (let us read file on computer)
const path = require('path');
const { app } = require('electron')

//Path to the credentials file
const CREDENTIALS_PATH = path.join(process.resourcesPath, 'credentials.json');
const TOKEN_PATH = path.join(app.getPath('userData'), 'token.json');

// The scope defines what we're allowed to access
// This one is READ ONLY - we can see events but cannot modify them
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];


// This function loads our credentials and returns an authenticated Google client
async function authenticate() {
    // Read the credentials file we downloaded from Google Console
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));

    // Pull out the client details from credentials
    const { client_secret, client_id, redirect_uris } = credentials.installed;

    // Create an OAuth2 client with our credentials
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        'http://localhost:3333'
    );

    // Check if we already have a saved token from a previous login
    if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
        oAuth2Client.setCredentials(token);
        return oAuth2Client;
    }

    // If no token exists, we need to get one (eg. handle first time login)
    return getNewToken(oAuth2Client);
}

// This function handles the first time login
async function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        redirect_uri: 'http://localhost:3333',
    });

    const code = await new Promise((resolve, reject) => {
        const http = require('http');

        const server = http.createServer((req, res) => {
            const url = new URL(req.url, 'http://localhost:3333');
            const code = url.searchParams.get('code');

            if (code) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                    <body style="
                        font-family: Arial;
                        text-align: center;
                        padding: 50px;
                        background: #f0f0f0;
                    ">
                        <h2>Connected successfully!</h2>
                        <p>You can close this tab and go back to Desktop Friend.</p>
                        <p style="color: #888; font-size: 12px;">
                            Your calendar is now connected.
                        </p>
                    </body>
                    </html>
                `);

                server.close();
                resolve(code);
            }
        });

        server.listen(3333, async () => {
            console.log('Opening browser for Google authorization...');
            const open = (await import('open')).default;
            open(authUrl);
        });

        // Timeout after 5 minutes
        setTimeout(() => {
            server.close();
            reject(new Error('Authorization timed out after 5 minutes'));
        }, 5 * 60 * 1000);
    });

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log('Token saved! You won\'t need to log in again.');

    return oAuth2Client;
}

// Helper function to get input from the user in the terminal
async function getCodeFromUser() {
    return new Promise((resolve) => {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        readline.question('Enter the code from the page: ', (code) => {
            readline.close();
            resolve(code.trim());
        });
    });
}

// This function fetches your upcoming calendar events
async function getUpcomingEvents(auth) {
    const calendar = google.calendar({ version: 'v3', auth });

    // Get current time and 24 hours from now
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: tomorrow.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
    });

    return response.data.items;
}

// This function checks if any meetings are starting soon
async function checkUpcomingMeetings(callback) {
    try {
        // Authenticate with Google
        const auth = await authenticate();

        // Get all events in the next 24 hours
        const events = await getUpcomingEvents(auth);

        if (!events || events.length === 0) {
            console.log('No upcoming events found.');
            return;
        }

        const now = new Date();

        // Loop through each event and check if it starts within 5 minutes
        events.forEach((event) => {
            const eventStart = new Date(event.start.dateTime || event.start.date);
            const minutesUntilEvent = (eventStart - now) / (1000 * 60);

            console.log(`Event: ${event.summary} starts in ${Math.round(minutesUntilEvent)} minutes`);

            // If the event starts within 5 minutes, trigger the reminder
            if (minutesUntilEvent > 0 && minutesUntilEvent <= 5) {
                console.log(`REMINDER: ${event.summary} is starting soon!`);
                // Call the callback function to trigger the animation
                if (callback) {
                    callback({
                        title: event.summary,
                        startTime: eventStart,
                        minutesUntil: Math.round(minutesUntilEvent),
                    });
                }
            }
        });

    } catch (error) {
        console.error('Error checking calendar:', error);
    }
}

// Export functions so other files can use them
module.exports = {
  checkUpcomingMeetings,
};