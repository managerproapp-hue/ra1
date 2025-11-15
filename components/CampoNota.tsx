import React from 'react';

interface CampoNotaProps {
  value: number | null;
  onChange: (value: number | null) => void;
  max: number;
  disabled?: boolean;
}

const CampoNota: React.FC<CampoNotaProps> = ({ value, onChange, max, disabled }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange(null);
      return;
    }
    const numericValue = parseFloat(inputValue.replace(',', '.'));
    if (!isNaN(numericValue) && numericValue >= 0) {
      onChange(Math.min(numericValue, max));
    }
  };

  return (
    <input
      type="number"
      step="0.1"
      min="0"
      max={max}
      value={value ?? ''}
      onChange={handleInputChange}
      disabled={disabled}
      placeholder={`max: ${max.toFixed(2)}`}
      className="w-full text-center p-1.5 text-xs rounded-md border-gray-300 placeholder-gray-300 disabled:bg-gray-100 focus:ring-blue-500 focus:border-blue-500"
    />
  );
};

export default CampoNota;
