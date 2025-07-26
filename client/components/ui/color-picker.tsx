import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Check, Palette } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

const predefinedColors = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
  '#008000', '#ffc0cb', '#a52a2a', '#808080', '#c0c0c0',
  '#ffd700', '#32cd32', '#ff1493', '#00ced1', '#ff4500',
  '#9400d3', '#228b22', '#ff69b4', '#4169e1', '#dc143c'
];

export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCustomColor(value);
  }, [value]);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onChange(color);
  };

  const handleCustomColorSubmit = () => {
    onChange(customColor);
    setIsOpen(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-12 flex items-center justify-between p-3 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-md border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                style={{ backgroundColor: value }}
              />
              <span className="text-sm font-mono">{value.toUpperCase()}</span>
            </div>
            <Palette className="h-4 w-4 text-gray-500" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            {/* Predefined Colors */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Quick Colors</Label>
              <div className="grid grid-cols-5 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className="w-8 h-8 rounded-md border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors relative group"
                    style={{ backgroundColor: color }}
                    title={color.toUpperCase()}
                  >
                    {value.toLowerCase() === color.toLowerCase() && (
                      <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-lg" />
                    )}
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity rounded-md" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Custom Color</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    type="color"
                    value={customColor}
                    onChange={handleCustomColorChange}
                    className="w-full h-10 p-1 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
                  />
                </div>
                <Input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1 font-mono text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCustomColorSubmit();
                    }
                  }}
                />
                <Button
                  onClick={handleCustomColorSubmit}
                  size="sm"
                  className="px-3"
                >
                  Apply
                </Button>
              </div>
            </div>

            {/* Color Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                  style={{ backgroundColor: customColor }}
                />
                <div className="flex-1">
                  <div className="text-sm font-mono">{customColor.toUpperCase()}</div>
                  <div className="text-xs text-gray-500">
                    RGB: {(() => {
                      const r = parseInt(customColor.slice(1, 3), 16);
                      const g = parseInt(customColor.slice(3, 5), 16);
                      const b = parseInt(customColor.slice(5, 7), 16);
                      return `${r}, ${g}, ${b}`;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 