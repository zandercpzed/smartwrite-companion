import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function TextMetrics() {
  const [isExpanded, setIsExpanded] = useState(true);

  const metrics = {
    characters: 6842,
    charactersNoSpaces: 5691,
    sentences: 89,
    paragraphs: 12,
    readingTime: 5,
    uniqueWords: 412
  };

  return (
    <div className="module">
      <button 
        className="module-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span>Text Metrics</span>
      </button>
      
      {isExpanded && (
        <div className="module-content">
          <div className="metrics-list">
            <div className="metric-row">
              <span className="stat-label">Characters</span>
              <span className="stat-mono">{metrics.characters.toLocaleString()}</span>
            </div>
            <div className="metric-row metric-indent">
              <span className="stat-label">No spaces</span>
              <span className="stat-mono">{metrics.charactersNoSpaces.toLocaleString()}</span>
            </div>
            <div className="metric-row">
              <span className="stat-label">Sentences</span>
              <span className="stat-mono">{metrics.sentences}</span>
            </div>
            <div className="metric-row">
              <span className="stat-label">Paragraphs</span>
              <span className="stat-mono">{metrics.paragraphs}</span>
            </div>
            <div className="metric-row">
              <span className="stat-label">Reading time</span>
              <span className="stat-mono">{metrics.readingTime} min</span>
            </div>
            <div className="metric-row">
              <span className="stat-label">Unique words</span>
              <span className="stat-mono">{metrics.uniqueWords}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
