import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function SessionStats() {
  const [isExpanded, setIsExpanded] = useState(true);

  const wordCount = 1247;
  const goalCount = 2000;
  const sessionTime = 45;
  const writingPace = 28;
  const progress = (wordCount / goalCount) * 100;

  return (
    <div className="module">
      <button 
        className="module-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span>Session Stats</span>
      </button>
      
      {isExpanded && (
        <div className="module-content">
          <div className="stat-large">
            <div className="stat-value">{wordCount.toLocaleString()}</div>
            <div className="stat-label">words</div>
          </div>

          <div className="stat-item">
            <div className="stat-row">
              <span className="stat-label">Today's goal</span>
              <span className="stat-mono">{wordCount.toLocaleString()} / {goalCount.toLocaleString()}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Session time</span>
              <span className="stat-mono">{sessionTime} min</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Writing pace</span>
              <span className="stat-mono">{writingPace} wpm</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
