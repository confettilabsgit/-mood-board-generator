// AI-powered mood board generation service
const AI_API_URL = 'https://api.openai.com/v1/chat/completions'

// Color psychology and style mapping
const colorPsychology = {
  red: ['passion', 'energy', 'bold', 'dramatic', 'powerful'],
  orange: ['warm', 'friendly', 'energetic', 'creative', 'optimistic'],
  yellow: ['cheerful', 'bright', 'sunny', 'playful', 'intellectual'],
  green: ['natural', 'peaceful', 'growth', 'harmony', 'fresh'],
  blue: ['calm', 'trustworthy', 'serene', 'professional', 'cool'],
  purple: ['luxury', 'creative', 'mysterious', 'spiritual', 'elegant'],
  pink: ['romantic', 'feminine', 'gentle', 'playful', 'sweet'],
  brown: ['earthy', 'warm', 'natural', 'rustic', 'grounded'],
  black: ['sophisticated', 'dramatic', 'modern', 'powerful', 'elegant'],
  white: ['clean', 'pure', 'minimal', 'fresh', 'spacious'],
  gray: ['neutral', 'balanced', 'professional', 'timeless', 'sophisticated']
}

export const generateAIKeywords = (color, style) => {
  const colorHex = color.toLowerCase()
  const hsl = hexToHsl(colorHex)
  const dominantColor = getDominantColorName(hsl)
  
  const colorWords = colorPsychology[dominantColor] || ['beautiful', 'aesthetic']
  const styleKeywords = getStyleKeywords(style)
  
  return [...colorWords, ...styleKeywords].slice(0, 8)
}

export const generateSmartLayout = (imageCount, canvasWidth, canvasHeight, style) => {
  const layouts = {
    modern: generateGridLayout(imageCount, canvasWidth, canvasHeight),
    vintage: generateVintageLayout(imageCount, canvasWidth, canvasHeight),
    bohemian: generateOrganicLayout(imageCount, canvasWidth, canvasHeight),
    industrial: generateAngularLayout(imageCount, canvasWidth, canvasHeight),
    nature: generateFlowingLayout(imageCount, canvasWidth, canvasHeight),
    luxury: generateSymmetricalLayout(imageCount, canvasWidth, canvasHeight)
  }
  
  return layouts[style] || layouts.modern
}

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

const getDominantColorName = ([h, s, l]) => {
  if (s < 10) return l > 50 ? 'white' : l > 20 ? 'gray' : 'black'
  
  if (h >= 0 && h < 15) return 'red'
  if (h >= 15 && h < 45) return 'orange'
  if (h >= 45 && h < 75) return 'yellow'
  if (h >= 75 && h < 150) return 'green'
  if (h >= 150 && h < 250) return 'blue'
  if (h >= 250 && h < 300) return 'purple'
  if (h >= 300 && h < 330) return 'pink'
  if (h >= 330 && h < 360) return 'red'
  
  return 'blue'
}

const getStyleKeywords = (style) => {
  const styleMap = {
    modern: ['minimalist', 'contemporary', 'clean', 'geometric'],
    vintage: ['retro', 'antique', 'classic', 'nostalgic'],
    bohemian: ['artistic', 'eclectic', 'free-spirited', 'creative'],
    industrial: ['urban', 'raw', 'concrete', 'metallic'],
    nature: ['organic', 'botanical', 'natural', 'earthy'],
    luxury: ['elegant', 'sophisticated', 'premium', 'refined']
  }
  
  return styleMap[style] || ['aesthetic', 'beautiful']
}

const generateGridLayout = (count, w, h) => {
  const layouts = []
  const cols = Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / cols)
  
  for (let i = 0; i < count; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    
    layouts.push({
      x: (col * w) / cols + 20,
      y: (row * h) / rows + 20,
      width: w / cols - 40,
      height: h / rows - 40,
      rotation: 0
    })
  }
  
  return layouts
}

const generateVintageLayout = (count, w, h) => {
  const layouts = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const radius = Math.min(w, h) * 0.3
    
    layouts.push({
      x: w/2 + Math.cos(angle) * radius - 100,
      y: h/2 + Math.sin(angle) * radius - 75,
      width: 200 + Math.random() * 100,
      height: 150 + Math.random() * 100,
      rotation: (Math.random() - 0.5) * 20
    })
  }
  
  return layouts
}

const generateOrganicLayout = (count, w, h) => {
  const layouts = []
  for (let i = 0; i < count; i++) {
    layouts.push({
      x: Math.random() * (w - 250) + 50,
      y: Math.random() * (h - 200) + 50,
      width: 150 + Math.random() * 200,
      height: 100 + Math.random() * 150,
      rotation: (Math.random() - 0.5) * 45
    })
  }
  
  return layouts
}

const generateAngularLayout = (count, w, h) => {
  const layouts = []
  const angles = [0, 15, -15, 30, -30]
  
  for (let i = 0; i < count; i++) {
    layouts.push({
      x: (i % 2) * (w/2) + Math.random() * 100,
      y: Math.floor(i/2) * (h/3) + Math.random() * 50,
      width: 200 + Math.random() * 100,
      height: 150 + Math.random() * 75,
      rotation: angles[i % angles.length]
    })
  }
  
  return layouts
}

const generateFlowingLayout = (count, w, h) => {
  const layouts = []
  for (let i = 0; i < count; i++) {
    const wave = Math.sin((i / count) * Math.PI * 4) * 100
    
    layouts.push({
      x: (i / count) * w + wave,
      y: h/2 + wave * 0.5 - 75,
      width: 180 + Math.random() * 80,
      height: 120 + Math.random() * 60,
      rotation: Math.sin(i) * 10
    })
  }
  
  return layouts
}

const generateSymmetricalLayout = (count, w, h) => {
  const layouts = []
  const centerX = w / 2
  const centerY = h / 2
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const radius = Math.min(w, h) * 0.25
    
    layouts.push({
      x: centerX + Math.cos(angle) * radius - 100,
      y: centerY + Math.sin(angle) * radius - 75,
      width: 200,
      height: 150,
      rotation: 0
    })
  }
  
  return layouts
}