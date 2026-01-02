import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function Suggestions() {
  const [isExpanded, setIsExpanded] = useState(true);

  const suggestions = [
    { type: 'Grammar', description: 'Missing comma after introductory phrase', severity: 'error' },
    { type: 'Style', description: 'Consider using active voice', severity: 'warning' },
    { type: 'Clarity', description: 'Sentence may be too complex', severity: 'info' },
    { type: 'Grammar', description: 'Subject-verb agreement issue', severity: 'error' },
    { type: 'Redundancy', description: 'Repeated word in paragraph', severity: 'warning' },
    { type: 'Style', description: 'Weak verb usage', severity: 'info' },
    { type: 'Clarity', description: 'Ambiguous pronoun reference', severity: 'warning' }
  ];

  return (
    <div className="module">
      <button 
        className="module-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span>Suggestions</span>
        <span className="count-badge">{suggestions.length}</span>
      </button>
      
      {isExpanded && (
        <div className="module-content">
          <div className="suggestions-list">
            {suggestions.map((item, index) => (
              <button 
                key={index} 
                className="suggestion-item"
                onClick={() => console.log('Navigate to issue:', item)}
              >
                <span className={`severity-dot severity-${item.severity}`} />
                <div className="suggestion-content">
                  <div className="suggestion-type">{item.type}</div>
                  <div className="suggestion-description">{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
