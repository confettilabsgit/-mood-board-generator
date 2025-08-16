import { useState } from 'react'

const ColorPicker = ({ selectedColor, onColorChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  const presetColors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffa726',
    '#ab47bc', '#ef5350', '#26a69a', '#42a5f5', '#9ccc65',
    '#ff7043', '#8e24aa', '#ec407a', '#29b6f6', '#66bb6a',
    '#ffa000', '#5c6bc0', '#26c6da', '#d4af37', '#cd5c5c'
  ]

  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return [h * 360, s * 100, l * 100]
  }

  const hslToHex = (h, s, l) => {
    l /= 100
    const a = s * Math.min(l, 1 - l) / 100
    const f = n => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  const [h, s, l] = hexToHsl(selectedColor)

  const handleHueChange = (newH) => {
    const newColor = hslToHex(newH, s, l)
    onColorChange(newColor)
  }

  const handleSaturationChange = (newS) => {
    const newColor = hslToHex(h, newS, l)
    onColorChange(newColor)
  }

  const handleLightnessChange = (newL) => {
    const newColor = hslToHex(h, s, newL)
    onColorChange(newColor)
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Color</h3>
      
      <div className="space-y-4">
        {/* Current Color Display */}
        <div 
          className="w-full h-16 rounded-lg border-2 border-gray-200 cursor-pointer transition-transform hover:scale-105"
          style={{ backgroundColor: selectedColor }}
          onClick={() => setIsOpen(!isOpen)}
        />
        
        <div className="text-center text-sm text-gray-600 font-mono">
          {selectedColor.toUpperCase()}
        </div>

        {/* HSL Sliders */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Hue</label>
            <input
              type="range"
              min="0"
              max="360"
              value={h}
              onChange={(e) => handleHueChange(parseInt(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  hsl(0, ${s}%, ${l}%), hsl(60, ${s}%, ${l}%), 
                  hsl(120, ${s}%, ${l}%), hsl(180, ${s}%, ${l}%), 
                  hsl(240, ${s}%, ${l}%), hsl(300, ${s}%, ${l}%), 
                  hsl(360, ${s}%, ${l}%))`
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Saturation</label>
            <input
              type="range"
              min="0"
              max="100"
              value={s}
              onChange={(e) => handleSaturationChange(parseInt(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  hsl(${h}, 0%, ${l}%), hsl(${h}, 100%, ${l}%))`
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Lightness</label>
            <input
              type="range"
              min="0"
              max="100"
              value={l}
              onChange={(e) => handleLightnessChange(parseInt(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  hsl(${h}, ${s}%, 0%), hsl(${h}, ${s}%, 50%), hsl(${h}, ${s}%, 100%))`
              }}
            />
          </div>
        </div>

        {/* Preset Colors */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Preset Colors</label>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                  selectedColor === color ? 'border-gray-800' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ColorPicker