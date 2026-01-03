#!/bin/bash

# SmartWrite Companion - Android Installation Script
# For Android devices (requires file access)

echo "🚀 SmartWrite Companion - Android Installation"
echo "==============================================="
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

# Create Android package
echo "📱 Creating Android package..."
PLUGIN_DIR="smartwrite-companion-android"
ZIP_FILE="docs/versions/SmartWrite-Companion-Android-v0.8.0m.zip"

# Clean up previous builds
rm -rf "$PLUGIN_DIR" "$ZIP_FILE"

# Create plugin directory
mkdir -p "$PLUGIN_DIR"

# Copy essential files
cp main.js "$PLUGIN_DIR/"
cp manifest.json "$PLUGIN_DIR/"
cp styles.css "$PLUGIN_DIR/"
cp "docs/versions/Android_install.md" "$PLUGIN_DIR/README.md"

# Create zip for easy transfer
zip -r "$ZIP_FILE" "$PLUGIN_DIR"

echo "✅ Android package created: $ZIP_FILE"
echo ""

echo "📋 Android Installation Instructions:"
echo "====================================="
echo ""
echo "1. 📁 Transfer the plugin files to your Android device:"
echo "   - Option A: Bluetooth transfer from computer to Android"
echo "   - Option B: Google Drive or Dropbox"
echo "   - Option C: Email the ZIP file to yourself"
echo "   - Option D: USB cable transfer"
echo ""
echo "2. 📂 Extract the files:"
echo "   - Unzip '$ZIP_FILE' on your Android device"
echo "   - You should have a folder named '$PLUGIN_DIR'"
echo ""
echo "3. 📱 Access Obsidian vault on Android:"
echo "   - Open Obsidian app on your Android device"
echo "   - Go to Settings → About → Advanced"
echo "   - Enable 'Show hidden files' (if available)"
echo "   - Or use a file manager app like 'Files', 'Google Files', or 'Total Commander'"
echo ""
echo "4. 🔧 Install the plugin:"
echo "   - Navigate to your vault folder"
echo "   - Go to: .obsidian/plugins/"
echo "   - Create folder: smartwrite-companion"
echo "   - Copy the 3 files into this folder:"
echo "     • main.js"
echo "     • manifest.json"
echo "     • styles.css"
echo "   - 📖 Check README.md for detailed installation instructions!"
echo ""
echo "5. ⚙️ Enable in Obsidian:"
echo "   - Open Obsidian Settings"
echo "   - Go to 'Community plugins'"
echo "   - Find 'SmartWrite Companion' in the list"
echo "   - Toggle it ON"
echo ""
echo "6. 🎯 Configure (Optional):"
echo "   - The plugin works without AI on mobile"
echo "   - For AI features, you'll need Ollama on a computer"
echo "   - AI analysis can be done on desktop and synced"
echo ""
echo "📂 Files created:"
echo "   • $ZIP_FILE (ready to transfer - includes README.md with instructions)"
echo "   • $PLUGIN_DIR/ (plugin files + installation guide)"
echo ""
echo "🔗 Quick Access:"
echo "   - Plugin files are in: ./$PLUGIN_DIR/"
echo "   - ZIP for transfer: ./$ZIP_FILE"
echo ""
echo "✅ Ready for Android installation!"
echo ""

# Show file sizes
echo "📊 File sizes:"
ls -lh main.js manifest.json styles.css "$ZIP_FILE" 2>/dev/null | head -4

echo ""
echo "💡 Tip: The mobile version (0.8.0m) is optimized for touch interfaces!"
echo ""