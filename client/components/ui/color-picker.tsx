import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Check, Palette, X } from 'lucide-react';

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

// Color wheel component
function ColorWheel({ hue, saturation, lightness, onHueChange, onSaturationChange, onLightnessChange }: {
  hue: number;
  saturation: number;
  lightness: number;
  onHueChange: (hue: number) => void;
  onSaturationChange: (saturation: number) => void;
  onLightnessChange: (lightness: number) => void;
}) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleWheelClick = (e: React.MouseEvent) => {
    if (!wheelRef.current) return;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    const hue = (angle + 360) % 360;
    
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = Math.min(centerX, centerY) - 20;
    const saturation = Math.min(100, Math.max(0, (distance / maxDistance) * 100));
    
    onHueChange(hue);
    onSaturationChange(saturation);
  };

  const handleLightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onLightnessChange(parseInt(e.target.value));
  };

  const currentColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {/* Color Wheel */}
        <div className="relative">
          <div
            ref={wheelRef}
            className="w-32 h-32 rounded-full cursor-pointer border-2 border-gray-300 dark:border-gray-600"
            style={{
              background: `conic-gradient(from 0deg, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))`,
            }}
            onClick={handleWheelClick}
          >
            <div
              className="absolute inset-4 rounded-full bg-white dark:bg-gray-800"
              style={{
                background: `radial-gradient(circle, transparent 0%, ${currentColor} 100%)`,
              }}
            />
            {/* Saturation/Lightness indicator */}
            <div
              className="absolute w-3 h-3 bg-white border-2 border-gray-800 rounded-full pointer-events-none"
              style={{
                left: `${50 + (saturation / 100) * 40 * Math.cos((hue * Math.PI) / 180)}%`,
                top: `${50 + (saturation / 100) * 40 * Math.sin((hue * Math.PI) / 180)}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          </div>
        </div>

        {/* Lightness Slider */}
        <div className="flex-1 space-y-2">
          <Label className="text-xs">Lightness</Label>
          <div className="relative">
            <div
              className="w-full h-8 rounded-lg border border-gray-300 dark:border-gray-600"
              style={{
                background: `linear-gradient(to top, hsl(${hue}, ${saturation}%, 0%), hsl(${hue}, ${saturation}%, 50%), hsl(${hue}, ${saturation}%, 100%))`,
              }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={lightness}
              onChange={handleLightnessChange}
              className="absolute inset-0 w-full h-8 opacity-0 cursor-pointer"
            />
            <div
              className="absolute w-2 h-8 bg-white border border-gray-800 rounded pointer-events-none"
              style={{
                left: `${lightness}%`,
                transform: 'translateX(-50%)',
              }}
            />
          </div>
          <div className="text-xs text-gray-500">{lightness}%</div>
        </div>
      </div>

      {/* Color Preview */}
      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <div
          className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm"
          style={{ backgroundColor: currentColor }}
        />
        <div className="flex-1">
          <div className="text-sm font-mono">{currentColor}</div>
          <div className="text-xs text-gray-500">
            HSL: {Math.round(hue)}°, {Math.round(saturation)}%, {Math.round(lightness)}%
          </div>
        </div>
      </div>
    </div>
  );
}

// Convert HSL to Hex
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Convert Hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [lightness, setLightness] = useState(100);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  useEffect(() => {
    setCustomColor(value);
    const hsl = hexToHsl(value);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
  }, [value]);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setIsOpen(false);
    setShowCustomPicker(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
      setCustomColor(color);
      onChange(color);
      const hsl = hexToHsl(color);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
    } else {
      setCustomColor(color);
    }
  };

  const handleHSLChange = (h: number, s: number, l: number) => {
    setHue(h);
    setSaturation(s);
    setLightness(l);
    const hex = hslToHex(h, s, l);
    setCustomColor(hex);
    onChange(hex);
  };

  const handleCustomColorSubmit = () => {
    if (customColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      onChange(customColor);
      setIsOpen(false);
      setShowCustomPicker(false);
    }
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
        
        <PopoverContent className="w-96 p-4" align="start">
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

            {/* Custom Color Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Custom Color</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomPicker(!showCustomPicker)}
                  className="text-xs"
                >
                  {showCustomPicker ? 'Hide Picker' : 'Show Picker'}
                </Button>
              </div>

              {/* Hex Input */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={customColor}
                  onChange={handleCustomColorChange}
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
                  disabled={!customColor.match(/^#[0-9A-Fa-f]{6}$/)}
                >
                  Apply
                </Button>
              </div>

              {/* Custom Color Picker */}
              {showCustomPicker && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <ColorWheel
                    hue={hue}
                    saturation={saturation}
                    lightness={lightness}
                    onHueChange={(h) => handleHSLChange(h, saturation, lightness)}
                    onSaturationChange={(s) => handleHSLChange(hue, s, lightness)}
                    onLightnessChange={(l) => handleHSLChange(hue, saturation, l)}
                  />
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 