import { useState } from 'react'
import ColorPicker from './components/ColorPicker'
import StyleSelector from './components/StyleSelector'
import MoodBoard from './components/MoodBoard'

function App() {
  const [selectedColor, setSelectedColor] = useState('#ff6b6b')
  const [selectedStyle, setSelectedStyle] = useState('modern')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    // This will trigger the mood board generation
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Mood Board Generator
          </h1>
          <p className="text-base sm:text-lg text-gray-600 px-4">
            Choose a color and style to create your perfect mood board
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1 space-y-6 lg:space-y-8 order-2 lg:order-1">
            <ColorPicker 
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
            />
            
            <StyleSelector 
              selectedStyle={selectedStyle}
              onStyleChange={setSelectedStyle}
            />
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm sm:text-base"
            >
              {isGenerating ? 'Generating...' : 'Generate Mood Board'}
            </button>
          </div>

          <div className="lg:col-span-2 order-1 lg:order-2">
            <MoodBoard 
              color={selectedColor}
              style={selectedStyle}
              isGenerating={isGenerating}
              onGenerationComplete={() => setIsGenerating(false)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
