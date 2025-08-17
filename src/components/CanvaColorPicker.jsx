import React, { useState, useRef, useEffect } from 'react'

const CanvaColorPicker = ({ selectedColor, onColorChange }) => {
  const [colorMode, setColorMode] = useState('complementary')
  const [hue, setHue] = useState(340) // Default to red-ish
  const [saturation, setSaturation] = useState(80)
  const [lightness, setLightness] = useState(55)
  const canvasRef = useRef(null)
  const hueCanvasRef = useRef(null)

  const colorModes = [
    'complementary',
    'analogous', 
    'triadic',
    'split-complementary',
    'tetradic',
    'monochromatic'
  ]

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    h /= 360
    s /= 100
    l /= 100
    
    const a = s * Math.min(l, 1 - l)
    const f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
  }

  // Convert RGB to Hex
  const rgbToHex = (r, g, b) => {
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`
  }

  // Get current color as hex
  const getCurrentColor = () => {
    const [r, g, b] = hslToRgb(hue, saturation, lightness)
    return rgbToHex(r, g, b)
  }

  // Generate color combinations
  const getColorCombination = () => {
    const currentHsl = [hue, saturation, lightness]
    
    switch (colorMode) {
      case 'complementary':
        return [
          currentHsl,
          [(hue + 180) % 360, saturation, lightness]
        ]
      case 'analogous':
        return [
          currentHsl,
          [(hue + 30) % 360, saturation, lightness],
          [(hue - 30 + 360) % 360, saturation, lightness]
        ]
      case 'triadic':
        return [
          currentHsl,
          [(hue + 120) % 360, saturation, lightness],
          [(hue + 240) % 360, saturation, lightness]
        ]
      case 'split-complementary':
        return [
          currentHsl,
          [(hue + 150) % 360, saturation, lightness],
          [(hue + 210) % 360, saturation, lightness]
        ]
      case 'tetradic':
        return [
          currentHsl,
          [(hue + 90) % 360, saturation, lightness],
          [(hue + 180) % 360, saturation, lightness],
          [(hue + 270) % 360, saturation, lightness]
        ]
      case 'monochromatic':
        return [
          currentHsl,
          [hue, saturation, Math.max(20, lightness - 20)],
          [hue, saturation, Math.min(80, lightness + 20)]
        ]
      default:
        return [currentHsl]
    }
  }

  // Draw color wheel
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw saturation/lightness gradient
    const imageData = ctx.createImageData(canvas.width, canvas.height)
    const data = imageData.data

    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        const dx = x - centerX
        const dy = y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance <= radius) {
          const sat = (distance / radius) * 100
          const light = ((centerY - y) / radius) * 50 + 50
          
          const [r, g, b] = hslToRgb(hue, sat, light)
          
          const index = (y * canvas.width + x) * 4
          data[index] = r
          data[index + 1] = g
          data[index + 2] = b
          data[index + 3] = 255
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)

    // Draw selection indicator
    const selectionRadius = (saturation / 100) * radius
    const selectionAngle = ((lightness - 50) / 50) * Math.PI
    const selX = centerX + selectionRadius * Math.cos(selectionAngle)
    const selY = centerY - selectionRadius * Math.sin(selectionAngle)

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(selX, selY, 8, 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(selX, selY, 8, 0, Math.PI * 2)
    ctx.stroke()

  }, [hue, saturation, lightness])

  // Draw hue ring
  useEffect(() => {
    const canvas = hueCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const outerRadius = Math.min(centerX, centerY) - 5
    const innerRadius = outerRadius - 15

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw hue ring
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * Math.PI / 180
      const endAngle = angle * Math.PI / 180
      
      ctx.fillStyle = `hsl(${angle}, 100%, 50%)`
      ctx.beginPath()
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle)
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true)
      ctx.fill()
    }

    // Draw hue indicator
    const hueAngle = (hue - 90) * Math.PI / 180
    const indicatorRadius = (outerRadius + innerRadius) / 2
    const indicatorX = centerX + indicatorRadius * Math.cos(hueAngle)
    const indicatorY = centerY + indicatorRadius * Math.sin(hueAngle)

    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(indicatorX, indicatorY, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

  }, [hue])

  // Handle canvas clicks
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10
    
    const dx = x - centerX
    const dy = y - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance <= radius) {
      const newSaturation = Math.min(100, (distance / radius) * 100)
      const newLightness = Math.max(0, Math.min(100, ((centerY - y) / radius) * 50 + 50))
      
      setSaturation(newSaturation)
      setLightness(newLightness)
    }
  }

  const handleHueCanvasClick = (e) => {
    const canvas = hueCanvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
    const dx = x - centerX
    const dy = y - centerY
    const angle = Math.atan2(dy, dx) * 180 / Math.PI + 90
    const newHue = (angle + 360) % 360
    
    setHue(newHue)
  }

  // Update parent component when color changes
  useEffect(() => {
    const currentColor = getCurrentColor()
    if (currentColor !== selectedColor) {
      onColorChange(currentColor)
    }
  }, [hue, saturation, lightness])

  // Parse incoming color changes
  useEffect(() => {
    if (selectedColor && selectedColor !== getCurrentColor()) {
      // Convert hex to HSL (simplified)
      const r = parseInt(selectedColor.slice(1, 3), 16) / 255
      const g = parseInt(selectedColor.slice(3, 5), 16) / 255
      const b = parseInt(selectedColor.slice(5, 7), 16) / 255
      
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const diff = max - min
      
      let h = 0
      if (diff !== 0) {
        if (max === r) h = ((g - b) / diff) % 6
        else if (max === g) h = (b - r) / diff + 2
        else h = (r - g) / diff + 4
        h *= 60
        if (h < 0) h += 360
      }
      
      const l = (max + min) / 2
      const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1))
      
      setHue(h)
      setSaturation(s * 100)
      setLightness(l * 100)
    }
  }, [selectedColor])

  const combinations = getColorCombination()

  return (
    <div className="space-y-4">
      {/* Color Wheel */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          className="cursor-crosshair"
          onClick={handleCanvasClick}
        />
        <canvas
          ref={hueCanvasRef}
          width={200}
          height={200}
          className="absolute top-0 left-0 cursor-pointer"
          onClick={handleHueCanvasClick}
        />
      </div>

      {/* Current Color Display */}
      <div className="flex items-center space-x-3">
        <div 
          className="w-8 h-8 rounded-full border-2 border-gray-300"
          style={{ backgroundColor: getCurrentColor() }}
        />
        <input
          type="text"
          value={getCurrentColor()}
          onChange={(e) => {
            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
              onColorChange(e.target.value)
            }
          }}
          className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm font-mono"
        />
      </div>

      {/* Color Combination Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color Combination
        </label>
        <select
          value={colorMode}
          onChange={(e) => setColorMode(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          {colorModes.map(mode => (
            <option key={mode} value={mode}>
              {mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Color Combination Preview */}
      <div className="grid grid-cols-2 gap-2 min-h-[60px]">
        {combinations.map((color, index) => {
          const [h, s, l] = color
          const [r, g, b] = hslToRgb(h, s, l)
          const hex = rgbToHex(r, g, b)
          
          return (
            <div 
              key={index}
              className="h-12 rounded cursor-pointer border border-gray-200 flex items-end"
              style={{ backgroundColor: hex }}
              onClick={() => onColorChange(hex)}
            >
              <span className="text-xs text-white bg-black bg-opacity-50 px-1 py-0.5 rounded-br">
                {hex}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CanvaColorPicker