# Mood Board Generator

A professional mood board creation tool inspired by Milanote, featuring drag-and-drop canvas, smart color-based image curation, and automated layout generation. Create beautiful mood boards with just a color and style choice.

## Features

- **🎨 Milanote-Inspired Interface**: Professional left sidebar with drag-and-drop canvas workspace
- **🤖 Smart Image Curation**: AI-powered mix of B&W, neutral, and color-pop images
- **🌈 Enhanced Color Search**: Lummi.ai integration for superior color-based image matching  
- **📐 Grid-Based Layout**: Clean alignment system with snap-to-grid positioning
- **🎯 Drag & Drop**: Intuitive image, color swatch, and typography placement
- **📊 Color Analysis**: Automatic color palette extraction and labeling with hex values
- **✨ Auto-Generation**: One-click mood board creation with smart layouts
- **💾 Export & Share**: Download as PNG or share directly from browser

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mood-board-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Add your Unsplash API access key to `.env`:
   ```
   VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## How to Use

1. **Select a Color**: Use the color picker to choose your base color, or select from preset colors
2. **Choose a Style**: Pick from 6 curated styles that match your aesthetic
3. **Generate**: Click "Generate Mood Board" to create your unique collage
4. **Download/Share**: Save your mood board or share it directly

## API Setup

To get the best experience with fresh images:

1. Sign up for a free [Unsplash Developer Account](https://unsplash.com/developers)
2. Create a new application
3. Copy your Access Key
4. Add it to your `.env` file

Without an API key, the app will use fallback images.

## Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Canvas**: HTML5 Canvas API
- **Images**: Unsplash API
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/
│   ├── ColorPicker.jsx    # HSL color picker component
│   ├── StyleSelector.jsx  # Style selection interface
│   └── MoodBoard.jsx      # Canvas-based mood board generator
├── services/
│   └── unsplashApi.js     # Unsplash API integration
├── App.jsx                # Main application component
└── main.jsx              # Entry point
```

## Deployment

### Vercel (Recommended)
```bash
npm run build
npx vercel --prod
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Other Platforms
```bash
npm run build
# Serve the dist/ folder
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Future Enhancements

- [ ] More layout algorithms (spiral, organic, scattered)
- [ ] Color harmony suggestions
- [ ] Save mood boards to local storage
- [ ] Social media integration
- [ ] Advanced filtering by image content
- [ ] Custom image uploads
- [ ] Mood board templates

---

Built with ❤️ using React and Tailwind CSS
