# Retail Bank Branch Support Voice Agent

A modern web application that provides voice-enabled customer support for retail bank branches, powered by Google Dialogflow.

## Features

- **Voice Interaction**: Speak to the virtual agent using your microphone
- **Text Input**: Type messages if voice is unavailable or preferred
- **Text-to-Speech**: Agent responses are spoken aloud
- **Quick Actions**: Pre-defined banking queries for common tasks
- **Dialogflow Integration**: Connects to your Google Dialogflow agent for natural language understanding
- **Banking-Themed UI**: Professional design with bank branding
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│    Backend      │────▶│   Dialogflow    │
│    (React)      │     │   (Express)     │     │   (GCP)         │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       │
       │  Web Speech API
       ▼
┌─────────────────┐
│  Browser STT/TTS│
└─────────────────┘
```

## Prerequisites

- Node.js 18+
- A Google Cloud Platform account
- A Dialogflow agent configured in GCP
- Service account credentials with Dialogflow API access

## Project Structure

```
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom React hooks (speech recognition/synthesis)
│   │   ├── services/   # API services
│   │   └── types/      # TypeScript types
│   └── public/
├── backend/            # Express backend server
│   └── src/
│       └── routes/     # API routes (Dialogflow integration)
└── README.md
```

## Setup Instructions

### 1. Configure Dialogflow Agent

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable the Dialogflow API
4. Create a Dialogflow agent or use your existing one
5. Create a service account with "Dialogflow API Client" role
6. Download the service account JSON key file

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# - Set DIALOGFLOW_PROJECT_ID to your GCP project ID
# - Set GOOGLE_APPLICATION_CREDENTIALS to the path of your service account key file
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Optionally create environment file for customization
cp .env.example .env
```

### 4. Run the Application

**Development Mode (run both simultaneously):**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Configuration

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3001) | No |
| `DIALOGFLOW_PROJECT_ID` | Your GCP Project ID | Yes |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | No |

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | No |
| `VITE_BANK_NAME` | Custom bank name | No |
| `VITE_AGENT_NAME` | Custom agent name | No |

## Demo Mode

If `DIALOGFLOW_PROJECT_ID` is not set, the backend will run in demo mode with mock responses for common banking queries.

## Dialogflow Agent Setup

Your Dialogflow agent should include intents for:

- **Welcome Intent**: Greeting messages
- **Account Balance**: Check account balance
- **Recent Transactions**: View transaction history
- **Branch Hours**: Branch operating hours
- **Lost Card**: Report lost/stolen cards
- **Loan Information**: Loan products and rates
- **Transfer to Agent**: Escalate to human support
- **Fallback Intent**: Handle unrecognized queries

### Sample Training Phrases

Add these training phrases to your Dialogflow intents:

**Account Balance:**
- "What's my balance"
- "Check my account"
- "How much money do I have"

**Branch Hours:**
- "What are your hours"
- "When are you open"
- "Branch schedule"

**Lost Card:**
- "I lost my card"
- "My card was stolen"
- "Report lost card"

## Browser Compatibility

Voice features require browser support for Web Speech API:
- Chrome (desktop & Android) - Full support
- Safari (iOS 14.5+) - Full support
- Edge - Full support
- Firefox - Limited support (speech synthesis only)

Text input is available as fallback on all browsers.

## API Endpoints

### Health Check
```
GET /api/health
```

### Detect Intent (Text)
```
POST /api/dialogflow/detect-intent
Content-Type: application/json

{
  "sessionId": "unique-session-id",
  "text": "What is my balance?",
  "languageCode": "en-US"
}
```

## Security Considerations

- Never expose your service account credentials in the frontend
- Use environment variables for sensitive configuration
- The backend acts as a secure proxy to Dialogflow
- Consider implementing authentication for production use
- Enable HTTPS in production

## License

MIT License
