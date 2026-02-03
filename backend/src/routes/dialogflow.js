import express from 'express';
import { SessionsClient } from '@google-cloud/dialogflow-cx';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get configuration from environment
const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const location = process.env.DIALOGFLOW_LOCATION || 'us-central1';
const defaultAgentId = process.env.DIALOGFLOW_AGENT_ID;
const languageCode = process.env.DIALOGFLOW_LANGUAGE_CODE || 'en';

// Available agents configuration
const availableAgents = {
  'transaction': {
    id: '41436240-476e-49bf-829c-9a3ecc310ac0',
    name: 'Transaction Agent',
    description: 'Handles account balances, transactions, and general banking inquiries'
  },
  'mortgage': {
    id: 'd3672fbb-3aa1-4dbf-b736-8fb9f800e080',
    name: 'Mortgage Agent',
    description: 'Specializes in mortgage and home loan inquiries'
  }
};

// Create session client for Dialogflow CX
let sessionClient;
try {
  if (projectId && agentId) {
    sessionClient = new SessionsClient({
      apiEndpoint: `${location}-dialogflow.googleapis.com`,
    });
    console.log(`Dialogflow CX client initialized for project: ${projectId}, agent: ${agentId}, location: ${location}`);
  }
} catch (error) {
  console.error('Failed to initialize Dialogflow CX client:', error.message);
  console.log('Make sure GOOGLE_APPLICATION_CREDENTIALS is set to your service account key file path');
}

/**
 * Detect intent from text input using Dialogflow CX
 * POST /api/dialogflow/detect-intent
 */
router.post('/detect-intent', async (req, res, next) => {
  try {
    const { sessionId, text, languageCode: reqLanguageCode, agentId: requestAgentId } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Use requested agent ID, or fall back to default
    const agentId = requestAgentId || defaultAgentId;

    // Check if Dialogflow CX is configured
    if (!projectId || !agentId) {
      console.log('Dialogflow CX not configured, returning mock response');
      console.log('Required env vars: DIALOGFLOW_PROJECT_ID, DIALOGFLOW_AGENT_ID');
      return res.json(getMockResponse(text));
    }

    console.log(`Using agent: ${agentId}`);

    if (!sessionClient) {
      return res.status(500).json({ error: 'Dialogflow CX client not initialized' });
    }

    // Build the session path for CX
    const sessionPath = sessionClient.projectLocationAgentSessionPath(
      projectId,
      location,
      agentId,
      sessionId || uuidv4()
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text,
        },
        languageCode: reqLanguageCode || languageCode,
      },
    };

    const [response] = await sessionClient.detectIntent(request);
    const queryResult = response.queryResult;

    // Extract response messages from CX format
    let fulfillmentText = '';
    if (queryResult.responseMessages && queryResult.responseMessages.length > 0) {
      for (const message of queryResult.responseMessages) {
        if (message.text && message.text.text) {
          fulfillmentText += message.text.text.join('\n');
        }
      }
    }

    // Get intent information
    const intentInfo = queryResult.match?.intent;
    const intentDisplayName = intentInfo?.displayName || queryResult.match?.matchType || 'Unknown';
    const confidence = queryResult.match?.confidence || 0;

    res.json({
      queryText: queryResult.text || text,
      fulfillmentText: fulfillmentText || "I didn't understand that. Could you please rephrase?",
      intent: {
        displayName: intentDisplayName,
        confidence: confidence,
      },
      parameters: queryResult.parameters?.fields || {},
      currentPage: queryResult.currentPage?.displayName || null,
      outputContexts: [],
    });
  } catch (error) {
    console.error('Dialogflow CX detect intent error:', error);

    // Return mock response on error for better UX
    if (error.code === 5) { // NOT_FOUND
      console.log('Agent not found. Check DIALOGFLOW_AGENT_ID');
    }

    next(error);
  }
});

/**
 * List available agents
 * GET /api/dialogflow/agents
 */
router.get('/agents', (req, res) => {
  const agents = Object.entries(availableAgents).map(([key, agent]) => ({
    key,
    ...agent
  }));
  res.json({ agents, defaultAgent: 'transaction' });
});

/**
 * Detect intent from audio input
 * POST /api/dialogflow/detect-intent-audio
 */
router.post('/detect-intent-audio', async (req, res, next) => {
  try {
    res.status(501).json({
      error: 'Audio input not implemented. Please use text input with Web Speech API.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get mock response for development/demo when Dialogflow is not configured
 */
function getMockResponse(text) {
  const lowerText = text.toLowerCase();

  // Banking-specific mock responses
  const responses = {
    balance: {
      fulfillmentText: "I can help you check your account balance. For security purposes, please verify your identity first. Your current checking account balance is $5,432.10 and your savings account balance is $12,890.55. Is there anything else you'd like to know?",
      intent: 'account.balance',
    },
    transaction: {
      fulfillmentText: "Here are your recent transactions:\n1. Amazon.com - $45.99 (Jan 29)\n2. Starbucks - $6.50 (Jan 29)\n3. Direct Deposit - +$2,500.00 (Jan 28)\n4. Electric Company - $125.00 (Jan 27)\n\nWould you like more details on any transaction?",
      intent: 'account.transactions',
    },
    hours: {
      fulfillmentText: "Our branch hours are:\n- Monday to Friday: 9:00 AM - 5:00 PM\n- Saturday: 9:00 AM - 1:00 PM\n- Sunday: Closed\n\nWe also have 24/7 ATM access. Is there anything else I can help you with?",
      intent: 'branch.hours',
    },
    lost: {
      fulfillmentText: "I'm sorry to hear about your lost card. For your security, I've temporarily blocked your card. To get a replacement:\n1. You can order a new card here and it will arrive in 5-7 business days\n2. Or visit any branch with a valid ID for same-day replacement\n\nWould you like me to order a replacement card now?",
      intent: 'card.lost',
    },
    loan: {
      fulfillmentText: "We offer several loan options:\n- Personal Loans: 6.99% APR, up to $50,000\n- Auto Loans: 4.49% APR, new & used vehicles\n- Home Equity: 5.25% APR, flexible terms\n- Mortgage: Starting at 6.125% APR\n\nWhich type of loan would you like to learn more about?",
      intent: 'loan.information',
    },
    agent: {
      fulfillmentText: "I understand you'd like to speak with a human agent. I'm connecting you now. Your estimated wait time is approximately 3 minutes. While you wait, is there anything I can help you with?",
      intent: 'escalate.human',
    },
    hello: {
      fulfillmentText: "Hello! Welcome to Retail Bank. I'm your virtual branch assistant. I can help you with:\n- Account balances and transactions\n- Branch information and hours\n- Card services\n- Loan inquiries\n\nHow can I assist you today?",
      intent: 'greeting',
    },
    thank: {
      fulfillmentText: "You're welcome! Is there anything else I can help you with today?",
      intent: 'thanks',
    },
    bye: {
      fulfillmentText: "Thank you for banking with us! Have a great day. If you need assistance in the future, I'm always here to help.",
      intent: 'goodbye',
    },
  };

  // Match user input to responses
  for (const [key, value] of Object.entries(responses)) {
    if (lowerText.includes(key)) {
      return {
        queryText: text,
        fulfillmentText: value.fulfillmentText,
        intent: {
          displayName: value.intent,
          confidence: 0.95,
        },
        parameters: {},
        outputContexts: [],
      };
    }
  }

  // Default response
  return {
    queryText: text,
    fulfillmentText: "I'm here to help with your banking needs. You can ask me about:\n- Account balances and transactions\n- Branch hours and locations\n- Lost or stolen cards\n- Loan information\n- Or request to speak with a human agent\n\nWhat would you like to know?",
    intent: {
      displayName: 'fallback',
      confidence: 0.5,
    },
    parameters: {},
    outputContexts: [],
  };
}

export { router as dialogflowRouter };
