import { DialogflowResponse } from '../types';

const API_BASE_URL = '/api';

class DialogflowService {
  private sessionId: string;

  constructor() {
    // Generate a unique session ID for this conversation
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  async detectIntent(text: string): Promise<DialogflowResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/dialogflow/detect-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          text,
          languageCode: 'en-US',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling Dialogflow:', error);
      throw error;
    }
  }

  async detectIntentFromAudio(audioData: Blob): Promise<DialogflowResponse> {
    try {
      const formData = new FormData();
      formData.append('audio', audioData, 'audio.wav');
      formData.append('sessionId', this.sessionId);
      formData.append('languageCode', 'en-US');

      const response = await fetch(`${API_BASE_URL}/dialogflow/detect-intent-audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling Dialogflow with audio:', error);
      throw error;
    }
  }

  resetSession(): void {
    this.sessionId = this.generateSessionId();
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

// Export a singleton instance
export const dialogflowService = new DialogflowService();
export default dialogflowService;
