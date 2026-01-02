import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export function Readability() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedFormula, setSelectedFormula] =
    useState("flesch-reading");

  const readabilityData = {
    "flesch-reading": {
      score: 72,
      label: "Easy",
      secondaryScores: [
        { name: "Grade level", value: "7th grade" },
        { name: "Avg sentence length", value: "14 words" },
        { name: "Avg syllables/word", value: "1.4" },
      ],
    },
    "flesch-kincaid": {
      score: 6.8,
      label: "Grade 7",
      secondaryScores: [
        { name: "Avg sentence length", value: "14 words" },
        { name: "Avg syllables/word", value: "1.4" },
      ],
    },
    "gunning-fog": {
      score: 8.2,
      label: "Grade 8",
      secondaryScores: [
        { name: "Complex words", value: "12%" },
        { name: "Avg sentence length", value: "14 words" },
      ],
    },
  };

  const currentData =
    readabilityData[
      selectedFormula as keyof typeof readabilityData
    ];

  return (
    <div className="module">
      <button
        className="module-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown size={14} />
        ) : (
          <ChevronRight size={14} />
        )}
        <span>Readability</span>
      </button>

      {isExpanded && (
        <div className="module-content">
          <div className="readability-primary">
            <div className="readability-score">
              <span className="score-value">
                {currentData.score}
              </span>
              <span className="score-label">
                {currentData.label}
              </span>
            </div>
            <div className="readability-bar">
              <div
                className="readability-indicator"
                style={{
                  left: `${Math.min(currentData.score, 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="formula-selector">
            <select
              value={selectedFormula}
              onChange={(e) =>
                setSelectedFormula(e.target.value)
              }
              className="formula-dropdown"
            >
              <option value="flesch-reading">
                Flesch Reading Ease
              </option>
              <option value="flesch-kincaid">
                Flesch-Kincaid Grade
              </option>
              <option value="gunning-fog">
                Gunning Fog Index
              </option>
            </select>
          </div>

          <div className="secondary-scores">
            {currentData.secondaryScores.map((item, index) => (
              <div key={index} className="metric-row">
                <span className="stat-label">{item.name}</span>
                <span className="stat-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}