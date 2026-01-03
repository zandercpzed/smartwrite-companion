#!/bin/bash

# SmartWrite Companion - Desktop Installation Package Creator
# For Windows, macOS, and Linux desktop systems

echo "🖥️  SmartWrite Companion - Desktop Installation"
echo "=============================================="
echo ""

# Build the plugin first
echo "📦 Building plugin..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Create desktop package
echo "💻 Creating desktop package..."
PLUGIN_DIR="smartwrite-companion-desktop"
ZIP_FILE="docs/versions/SmartWrite-Companion-Desktop-v0.8.0.zip"

# Clean up previous builds
rm -rf "$PLUGIN_DIR" "$ZIP_FILE"

# Create plugin directory
mkdir -p "$PLUGIN_DIR"

# Copy essential files
cp main.js "$PLUGIN_DIR/"
cp manifest.json "$PLUGIN_DIR/"
cp styles.css "$PLUGIN_DIR/"
cp README.md "$PLUGIN_DIR/"
cp LICENSE "$PLUGIN_DIR/"

# Create zip for easy transfer
zip -r "$ZIP_FILE" "$PLUGIN_DIR"

echo "✅ Desktop package created: $ZIP_FILE"
echo ""

echo "📋 Desktop Installation Instructions:"
echo "====================================="
echo ""
echo "1. 📁 Extract the files:"
echo "   - Unzip '$ZIP_FILE' to a temporary location"
echo "   - You should have a folder named '$PLUGIN_DIR'"
echo ""
echo "2. 🗂️  Install the plugin:"
echo "   - Open Obsidian on your desktop"
echo "   - Go to Settings → Community plugins"
echo "   - Click 'Turn on community plugins'"
echo "   - Click 'Browse' and search for 'SmartWrite Companion'"
echo "   - OR manually install:"
echo "     • Navigate to your vault's .obsidian/plugins/ folder"
echo "     • Create a folder named 'smartwrite-companion'"
echo "     • Copy main.js, manifest.json, and styles.css into it"
echo ""
echo "3. ⚙️ Enable and Configure:"
echo "   - Enable the plugin in Community plugins"
echo "   - For AI features, install Ollama from https://ollama.ai"
echo "   - Download models like 'llama3.2' or 'qwen2.5' in plugin settings"
echo ""
echo "📂 Files created:"
echo "   • $ZIP_FILE (ready for distribution)"
echo "   • $PLUGIN_DIR/ (plugin files)"
echo ""
echo "🔗 Quick Access:"
echo "   - Plugin files are in: ./$PLUGIN_DIR/"
echo "   - ZIP for distribution: ./$ZIP_FILE"
echo ""
echo "✅ Ready for desktop installation!"
echo ""

# Show file sizes
echo "📊 File sizes:"
ls -lh main.js manifest.json styles.css README.md LICENSE "$ZIP_FILE" 2>/dev/null | head -5

echo ""
echo "💡 Tip: Desktop version includes full AI features with Ollama integration!"
echo ""