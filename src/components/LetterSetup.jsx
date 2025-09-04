import React, { useEffect, useState } from 'react';
import { validateAndAutoFix } from '../utils/letters';

export default function LetterSetup({ initialCenter = '', initialSurrounding = '' , onChange }) {
  const [center, setCenter] = useState(initialCenter);
  const [surroundingStr, setSurroundingStr] = useState(initialSurrounding);
  const [surrounding, setSurrounding] = useState([]);

  useEffect(() => {
    const result = validateAndAutoFix(center, surroundingStr);
    setCenter(result.center);
    setSurrounding(result.surrounding);
    // optional: notify parent that letters changed (fixed or original)
    if (onChange) onChange({ center: result.center, surrounding: result.surrounding, fixed: result.fixed });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount; call again where you need re-validation

  // call this when user updates inputs (e.g., Save button)
  function handleApply() {
    const result = validateAndAutoFix(center, surroundingStr);
    setCenter(result.center);
    setSurrounding(result.surrounding);
    if (onChange) onChange({ center: result.center, surrounding: result.surrounding, fixed: result.fixed });
  }

  return (
    <div>
      <div>
        <label>மைய எழுத்து</label>
        <input value={center} onChange={e => setCenter(e.target.value)} />
      </div>

      <div>
        <label>சுற்றெழுத்து (கமா-பிரித்து 6)</label>
        <input value={surroundingStr} onChange={e => setSurroundingStr(e.target.value)} />
      </div>

      <button onClick={handleApply}>சரிபார் & பொருத்து</button>

      <div>
        <h4>தற்போதைய தொகுப்பு:</h4>
        <div>மையம்: {center}</div>
        <div>சுற்றுகள்: {surrounding.join(', ')}</div>
      </div>
    </div>
  );
}