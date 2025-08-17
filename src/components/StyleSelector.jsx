const StyleSelector = ({ selectedStyle, onStyleChange }) => {
  const styles = [
    { id: 'modern', name: 'Modern', preview: '🏢' },
    { id: 'vintage', name: 'Vintage', preview: '📻' },
    { id: 'bohemian', name: 'Bohemian', preview: '🌺' },
    { id: 'industrial', name: 'Industrial', preview: '🏗️' },
    { id: 'nature', name: 'Nature', preview: '🌿' },
    { id: 'luxury', name: 'Luxury', preview: '💎' }
  ]

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Choose Style
      </label>
      <select
        value={selectedStyle}
        onChange={(e) => onStyleChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {styles.map((style) => (
          <option key={style.id} value={style.id}>
            {style.preview} {style.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default StyleSelector