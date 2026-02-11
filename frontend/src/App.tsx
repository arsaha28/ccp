import { Header, VoiceAgent } from './components';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        bankName="PS Agentic Voice Banking"
        agentName="Virtual Branch Assistant"
      />
      <main>
        <VoiceAgent />
      </main>
    </div>
  );
}

export default App;
