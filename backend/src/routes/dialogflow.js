import express from 'express';
import dialogflow from '@google-cloud/dialogflow';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get project ID from environment
const projectId = process.env.DIALOGFLOW_PROJECT_ID;

// Create session client
// Note: Authentication is handled via GOOGLE_APPLICATION_CREDENTIALS environment variable
// which should point to your service account JSON key file
let sessionClient;
try {
  sessionClient = new dialogflow.SessionsClient();
} catch (error) {
  console.error('Failed to initialize Dialogflow client:', error.message);
  console.log('Make sure GOOGLE_APPLICATION_CREDENTIALS is set to your service account key file path');
}

/**
 * Detect intent from text input
 * POST /api/dialogflow/detect-intent
 */
router.post('/detect-intent', async (req, res, next) => {
  try {
    const { sessionId, text, languageCode = 'en-US' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!projectId) {
      // Return a mock response for development/demo purposes
      console.log('DIALOGFLOW_PROJECT_ID not set, returning mock response');
      return res.json(getMockResponse(text));
    }

    if (!sessionClient) {
      return res.status(500).json({ error: 'Dialogflow client not initialized' });
    }

    // Use provided sessionId or generate a new one
    const session = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId || uuidv4()
    );

    const request = {
      session,
      queryInput: {
        text: {
          text,
          languageCode,
        },
      },
    };

    const [response] = await sessionClient.detectIntent(request);
    const result = response.queryResult;

    res.json({
      queryText: result.queryText,
      fulfillmentText: result.fulfillmentText,
      intent: {
        displayName: result.intent?.displayName || 'Unknown',
        confidence: result.intentDetectionConfidence || 0,
      },
      parameters: result.parameters?.fields || {},
      outputContexts: result.outputContexts?.map(ctx => ({
        name: ctx.name,
        lifespanCount: ctx.lifespanCount,
        parameters: ctx.parameters?.fields || {},
      })) || [],
    });
  } catch (error) {
    console.error('Dialogflow detect intent error:', error);
    next(error);
  }
});

/**
 * Detect intent from audio input
 * POST /api/dialogflow/detect-intent-audio
 */
router.post('/detect-intent-audio', async (req, res, next) => {
  try {
    // This endpoint would handle audio file uploads
    // For now, return a not implemented response
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
