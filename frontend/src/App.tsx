import { Header, VoiceAgent } from './components';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        bankName="Retail Bank"
        agentName="Branch Support Voice Agent"
      />
      <main>
        <VoiceAgent />
      </main>
    </div>
  );
}

export default App;
