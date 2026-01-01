import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function PersonaAnalysis() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState('academic');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [isResultExpanded, setIsResultExpanded] = useState(true);
  const [ollamaConnected, setOllamaConnected] = useState(true);

  const personas = [
    { value: 'academic', label: 'Academic Writer' },
    { value: 'journalist', label: 'Journalist' },
    { value: 'creative', label: 'Creative Writer' },
    { value: 'technical', label: 'Technical Writer' },
    { value: 'business', label: 'Business Professional' }
  ];

  const handleAnalyze = () => {
    if (!ollamaConnected) return;
    
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setAnalysisResult(
        `Your writing aligns well with the ${personas.find(p => p.value === selectedPersona)?.label.toLowerCase()} style. The tone is appropriately formal with clear argumentation. Consider varying sentence structure to enhance readability and engage your academic audience more effectively.`
      );
      setIsAnalyzing(false);
      setIsResultExpanded(true);
    }, 1500);
  };

  return (
    <div className="module">
      <button 
        className="module-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span>Persona Analysis</span>
      </button>
      
      {isExpanded && (
        <div className="module-content">
          <div className="persona-controls">
            <select 
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value)}
              className="persona-dropdown"
              disabled={!ollamaConnected}
            >
              {personas.map(persona => (
                <option key={persona.value} value={persona.value}>
                  {persona.label}
                </option>
              ))}
            </select>

            <button 
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={!ollamaConnected || isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>

          <div className="ollama-status">
            <span className={`status-indicator ${ollamaConnected ? 'connected' : 'offline'}`} />
            <span className="status-text">
              {ollamaConnected ? 'Ollama connected' : 'Ollama offline'}
            </span>
            {!ollamaConnected && (
              <button 
                className="connect-link"
                onClick={() => setOllamaConnected(true)}
              >
                Connect
              </button>
            )}
          </div>

          {analysisResult && (
            <div className="analysis-results">
              <button 
                className="results-header"
                onClick={() => setIsResultExpanded(!isResultExpanded)}
              >
                {isResultExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <span>Analysis Results</span>
              </button>
              {isResultExpanded && (
                <div className="results-content">
                  {analysisResult}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
