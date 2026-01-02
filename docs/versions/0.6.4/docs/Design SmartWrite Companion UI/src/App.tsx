import React, { useState } from 'react';
import { SessionStats } from './components/SessionStats';
import { TextMetrics } from './components/TextMetrics';
import { Readability } from './components/Readability';
import { Suggestions } from './components/Suggestions';
import { PersonaAnalysis } from './components/PersonaAnalysis';
import { Settings } from 'lucide-react';

export default function App() {
  const [moduleStates, setModuleStates] = useState({
    sessionStats: true,
    textMetrics: true,
    readability: true,
    suggestions: true,
    personaAnalysis: true,
  });

  const [showSettings, setShowSettings] = useState(false);

  const toggleModule = (module: keyof typeof moduleStates) => {
    setModuleStates(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
  };

  return (
    <div className="obsidian-sidebar">
      <div className="sidebar-header">
        <h2>SmartWrite Companion</h2>
        <button 
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <h3>Module Visibility</h3>
          <label>
            <input 
              type="checkbox" 
              checked={moduleStates.sessionStats}
              onChange={() => toggleModule('sessionStats')}
            />
            <span>Session Stats</span>
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={moduleStates.textMetrics}
              onChange={() => toggleModule('textMetrics')}
            />
            <span>Text Metrics</span>
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={moduleStates.readability}
              onChange={() => toggleModule('readability')}
            />
            <span>Readability</span>
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={moduleStates.suggestions}
              onChange={() => toggleModule('suggestions')}
            />
            <span>Suggestions</span>
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={moduleStates.personaAnalysis}
              onChange={() => toggleModule('personaAnalysis')}
            />
            <span>Persona Analysis</span>
          </label>
        </div>
      )}

      <div className="modules-container">
        {moduleStates.sessionStats && <SessionStats />}
        {moduleStates.textMetrics && <TextMetrics />}
        {moduleStates.readability && <Readability />}
        {moduleStates.suggestions && <Suggestions />}
        {moduleStates.personaAnalysis && <PersonaAnalysis />}
      </div>
    </div>
  );
}
