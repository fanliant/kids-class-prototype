import React from 'react';

// 簽名元素:用小圓點顯示「目前等級 / 總等級數」,呼應JMC/JXC的連續晉升邏輯
export default function LevelChips({ levelIndex, totalLevels, levelName }) {
  const dots = Array.from({ length: totalLevels }, (_, i) => i < levelIndex);
  return (
    <div className="level-chips">
      <div className="level-dots">
        {dots.map((filled, i) => (
          <span key={i} className={`level-dot${filled ? ' filled' : ''}`} />
        ))}
      </div>
      <span className="level-dots-label">
        {levelName ? `${levelName} · ` : ''}Level {levelIndex} of {totalLevels}
      </span>
    </div>
  );
}
