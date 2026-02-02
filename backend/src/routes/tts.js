import express from 'express';
import textToSpeech from '@google-cloud/text-to-speech';

const router = express.Router();

// Initialize TTS client
const ttsClient = new textToSpeech.TextToSpeechClient();

// POST /api/tts - Convert text to speech
router.post('/', async (req, res) => {
  try {
    const { text, voiceName, languageCode } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Configure the TTS request
    const request = {
      input: { text },
      voice: {
        languageCode: languageCode || 'en-US',
        // Neural2 voices sound much more natural
        name: voiceName || 'en-US-Neural2-F', // Female Neural2 voice
        ssmlGender: 'FEMALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0,
        volumeGainDb: 0,
      },
    };

    console.log('TTS Request:', { text: text.substring(0, 50) + '...', voice: request.voice.name });

    // Call Google Cloud TTS API
    const [response] = await ttsClient.synthesizeSpeech(request);

    // Return audio as base64
    res.json({
      audioContent: response.audioContent.toString('base64'),
      contentType: 'audio/mpeg',
    });
  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({
      error: 'Failed to synthesize speech',
      details: error.message,
    });
  }
});

// GET /api/tts/voices - List available voices
router.get('/voices', async (req, res) => {
  try {
    const [result] = await ttsClient.listVoices({ languageCode: 'en' });

    // Filter to Neural2 and Studio voices (highest quality)
    const voices = result.voices
      .filter(v => v.name.includes('Neural2') || v.name.includes('Studio'))
      .map(v => ({
        name: v.name,
        languageCodes: v.languageCodes,
        ssmlGender: v.ssmlGender,
        naturalSampleRateHertz: v.naturalSampleRateHertz,
      }));

    res.json({ voices });
  } catch (error) {
    console.error('List Voices Error:', error);
    res.status(500).json({
      error: 'Failed to list voices',
      details: error.message,
    });
  }
});

export { router as ttsRouter };
