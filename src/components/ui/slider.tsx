"use client"

import React, { useState, useEffect } from "react"

interface SliderProps {
  id?: string;
  value: number[];
  min: number;
  max: number;
  step?: number;
  className?: string;
  onValueChange?: (value: number[]) => void;
  disabled?: boolean;
}

// Vereinfachte Slider-Komponente
export function Slider({ 
  value = [0], 
  min = 0, 
  max = 100, 
  step = 1, 
  className = "", 
  onValueChange 
}: SliderProps) {
  const [currentValue, setCurrentValue] = useState(value[0])

  // Synchronisiere mit externem Wert
  useEffect(() => {
    setCurrentValue(value[0])
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    setCurrentValue(newValue)
    
    if (onValueChange) {
      onValueChange([newValue])
    }
  }

  // Berechne die Position des Füllbalkens (0-100%)
  const fillPercentage = ((currentValue - min) / (max - min)) * 100
  
  return (
    <div className={`relative w-full py-2 ${className}`}>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 rounded-full"
          style={{ width: `${fillPercentage}%` }}
        />
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={currentValue}
        onChange={handleChange}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  )
}
