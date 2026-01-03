#!/bin/bash

# SmartWrite Companion - Complete Package Creator
# Creates the master ZIP with all installation packages

echo "📦 SmartWrite Companion - Complete Package Creator"
echo "=================================================="
echo ""

# Build the plugin first (if not already built)
echo "📦 Ensuring plugin is built..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Plugin is ready!"
echo ""

# Create complete package directory
PACKAGE_DIR="SmartWrite-Companion-Complete-v0.8.0m"
ZIP_FILE="docs/versions/SmartWrite-Companion-Complete-v0.8.0m.zip"

echo "🔄 Creating complete package..."

# Clean up previous builds
rm -rf "$PACKAGE_DIR" "$ZIP_FILE"

# Create package directory
mkdir -p "$PACKAGE_DIR"

# Copy all installation packages
cp "docs/versions/SmartWrite-Companion-Mobile-v0.8.0m.zip" "$PACKAGE_DIR/"
cp "docs/versions/SmartWrite-Companion-Android-v0.8.0m.zip" "$PACKAGE_DIR/"
cp "docs/versions/SmartWrite-Companion-Desktop-v0.8.0.zip" "$PACKAGE_DIR/"

# Copy documentation
cp "README.md" "$PACKAGE_DIR/"
cp "docs/versions/Android_install.md" "$PACKAGE_DIR/"
cp "docs/versions/iOS_install.md" "$PACKAGE_DIR/"
cp "LICENSE" "$PACKAGE_DIR/"

# Create zip for distribution
zip -r "$ZIP_FILE" "$PACKAGE_DIR"

echo "✅ Complete package created: $ZIP_FILE"
echo ""

echo "📋 Package Contents:"
echo "===================="
echo ""
echo "📦 Installation Packages:"
echo "   • SmartWrite-Companion-Mobile-v0.8.0m.zip (iOS)"
echo "   • SmartWrite-Companion-Android-v0.8.0m.zip (Android)"
echo "   • SmartWrite-Companion-Desktop-v0.8.0.zip (Desktop)"
echo ""
echo "📖 Documentation:"
echo "   • README.md (Main project documentation)"
echo "   • Android_install.md (Android installation guide)"
echo "   • iOS_install.md (iOS installation guide)"
echo "   • LICENSE (MIT License)"
echo ""

echo "📂 Files created:"
echo "   • $ZIP_FILE (complete distribution package)"
echo "   • $PACKAGE_DIR/ (package contents)"
echo ""

echo "🔗 Quick Access:"
echo "   - Package location: ./docs/versions/$ZIP_FILE"
echo "   - Contents: ./$PACKAGE_DIR/"
echo ""

echo "✅ Ready for complete distribution!"
echo ""

# Show file sizes
echo "📊 File sizes:"
ls -lh "docs/versions/SmartWrite-Companion-"*.zip 2>/dev/null

echo ""
echo "💡 Tip: This complete package contains everything needed for all platforms!"
echo ""