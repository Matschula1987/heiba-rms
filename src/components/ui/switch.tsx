"use client"

import React, { useState, useEffect } from "react"

interface SwitchProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked = false,
  onCheckedChange,
  disabled = false,
  className = ""
}: SwitchProps) {
  const [isChecked, setIsChecked] = useState(checked)
  
  // Synchronisiere mit externem Wert
  useEffect(() => {
    setIsChecked(checked)
  }, [checked])
  
  const handleToggle = () => {
    if (disabled) return
    
    const newValue = !isChecked
    setIsChecked(newValue)
    
    if (onCheckedChange) {
      onCheckedChange(newValue)
    }
  }
  
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={handleToggle}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 rounded-full 
        ${isChecked ? 'bg-[var(--primary-dark)]' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transition-colors duration-200 ease-in-out
        ${className}
      `}
    >
      <span className="sr-only">Toggle</span>
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full 
          bg-white shadow ring-0 transition duration-200 ease-in-out
          ${isChecked ? 'translate-x-5' : 'translate-x-0.5'}
        `}
      />
    </button>
  )
}
