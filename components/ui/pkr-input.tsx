import React, { useState, useEffect } from 'react'
import { Input } from './input'
import { Label } from './label'
import { formatPKR, parsePKR, validatePKRAmount } from '@/lib/currency'

interface PKRInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  min?: number
  max?: number
  label?: string
  error?: string
  disabled?: boolean
  required?: boolean
  id?: string
  className?: string
  showFormattedValue?: boolean
}

export function PKRInput({
  value,
  onChange,
  placeholder = "Enter amount in PKR",
  min = 0,
  max,
  label,
  error,
  disabled = false,
  required = false,
  id,
  className,
  showFormattedValue = true
}: PKRInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Update input value when external value changes
  useEffect(() => {
    if (!isFocused) {
      if (value === 0) {
        setInputValue('')
      } else if (showFormattedValue) {
        setInputValue(formatPKR(value, { showSymbol: false }))
      } else {
        setInputValue(value.toString())
      }
    }
  }, [value, isFocused, showFormattedValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    setInputValue(rawValue)
    
    // Clear validation error when user starts typing
    setValidationError(null)
    
    // Parse the input value
    const parsedValue = parsePKR(rawValue)
    
    // Validate the amount
    const validation = validatePKRAmount(parsedValue, min, max)
    
    if (!validation.isValid && rawValue !== '') {
      setValidationError(validation.error || 'Invalid amount')
    } else {
      setValidationError(null)
      onChange(parsedValue)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    // Show raw number when focused for easier editing
    if (value > 0) {
      setInputValue(value.toString())
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    // Format value when focus is lost
    if (value > 0 && showFormattedValue) {
      setInputValue(formatPKR(value, { showSymbol: false }))
    }
  }

  const displayError = error || validationError

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
          {label}
        </Label>
      )}
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
          ₨
        </div>
        <Input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`pl-8 ${displayError ? 'border-red-500' : ''} ${className || ''}`}
        />
      </div>
      
      {displayError && (
        <p className="text-sm text-red-500">{displayError}</p>
      )}
      
      {min > 0 && !displayError && (
        <p className="text-xs text-muted-foreground">
          Minimum amount: {formatPKR(min)}
        </p>
      )}
      
      {value > 0 && showFormattedValue && !isFocused && (
        <p className="text-xs text-muted-foreground">
          Amount: {formatPKR(value)}
        </p>
      )}
    </div>
  )
}
