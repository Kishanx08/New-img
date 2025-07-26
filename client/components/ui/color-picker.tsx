import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Palette } from 'lucide-react';
import { SketchPicker, ColorResult } from 'react-color';

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
  const [currentColor, setCurrentColor] = useState(value);

  useEffect(() => {
    setCurrentColor(value);
  }, [value]);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCurrentColor(color);
    setIsOpen(false);
  };

  const handleSketchChange = (color: ColorResult) => {
    setCurrentColor(color.hex);
    onChange(color.hex);
  };

  const handleSketchComplete = (color: ColorResult) => {
    setCurrentColor(color.hex);
    onChange(color.hex);
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
        
        <PopoverContent className="p-0 border-0 shadow-2xl" align="start">
          <div className="space-y-4">
            {/* Quick Colors */}
            <div className="p-4 pb-2">
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
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full shadow-lg" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity rounded-md" />
                  </button>
                ))}
              </div>
            </div>

            {/* React Color Sketch Picker */}
            <div className="border-t border-gray-200 dark:border-gray-700">
              <SketchPicker
                color={currentColor}
                onChange={handleSketchChange}
                onChangeComplete={handleSketchComplete}
                presetColors={[]} // We're using our own predefined colors above
                disableAlpha={true} // Disable alpha channel for simplicity
                styles={{
                  default: {
                    picker: {
                      boxShadow: 'none',
                      border: 'none',
                      borderRadius: '0',
                      fontFamily: 'inherit',
                    },
                    saturation: {
                      borderRadius: '0',
                    },
                    hue: {
                      borderRadius: '0',
                    },
                    alpha: {
                      borderRadius: '0',
                    },
                  },
                }}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 