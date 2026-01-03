#!/bin/bash

# SmartWrite Companion Installer (v0.6.0)
# - Detects Obsidian Vaults
# - Installs Plugin
# - Sets up Ollama & Models

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}   SmartWrite Companion Installer ${GREEN}v0.6.0${NC}"
echo -e "${BLUE}==============================================${NC}"

# 1. Detect Vaults
echo -e "\n${YELLOW}🔍 Scanning for Obsidian Vaults...${NC}"
OBSIDIAN_CONFIG="$HOME/Library/Application Support/obsidian/obsidian.json"
declare -a VAULTS
VAULT_PATHS=()

if [ -f "$OBSIDIAN_CONFIG" ]; then
    # Parse vaults using grep/awk hack (JSON parsing in bash is hard without jq)
    # This extracts paths from the "vaults" object in obsidian.json
    while IFS= read -r line; do
        if [[ "$line" == *"path"* ]]; then
            # Clean up path string
            raw_path=$(echo "$line" | sed -E 's/.*"path":"([^"]+)".*/\1/')
            # Resolve potential tilde or relative paths
            full_path="${raw_path/#\~/$HOME}"
            VAULT_PATHS+=("$full_path")
        fi
    done < "$OBSIDIAN_CONFIG"
fi

if [ ${#VAULT_PATHS[@]} -eq 0 ]; then
    echo -e "${RED}❌ No vaults found in Obsidian config.${NC}"
else
    echo -e "${GREEN}✅ Found ${#VAULT_PATHS[@]} vault(s).${NC}"
fi

# 2. Select Vault
echo -e "\n${BLUE}📂 Where should we install the plugin?${NC}"
PS3="Select a number (or enter custom path): "

select opt in "${VAULT_PATHS[@]}" "Custom Path" "Quit"; do
    case $opt in
        "Custom Path")
            read -p "Enter full path to vault: " TARGET_VAULT
            break
            ;;
        "Quit")
            exit 0
            ;;
        *)
            if [ -n "$opt" ]; then
                TARGET_VAULT="$opt"
                break
            else
                echo "Invalid selection."
            fi
            ;;
    esac
done

# Validate target
if [ ! -d "$TARGET_VAULT" ]; then
    echo -e "${RED}❌ Error: Directory does not exist: $TARGET_VAULT${NC}"
    exit 1
fi

echo -e "Selected: ${YELLOW}$TARGET_VAULT${NC}"

# 3. Install Plugin
PLUGIN_DIR="$TARGET_VAULT/.obsidian/plugins/smartwrite-companion"
echo -e "\n${BLUE}📦 Installing plugin files...${NC}"
mkdir -p "$PLUGIN_DIR"

# Copy files
if [ -f "main.js" ] && [ -f "manifest.json" ] && [ -f "styles.css" ]; then
    cp main.js manifest.json styles.css "$PLUGIN_DIR/"
    echo -e "${GREEN}✅ Plugin files copied to: $PLUGIN_DIR${NC}"
else
    echo -e "${RED}❌ Error: Build files missing. Run 'npm run build' first.${NC}"
    exit 1
fi

# 4. Ollama Setup
echo -e "\n${BLUE}🤖 Checking AI Environment...${NC}"

if ! command -v ollama &> /dev/null; then
    echo -e "${YELLOW}⚠️ Ollama not found.${NC}"
    read -p "Do you want to install Ollama via Homebrew? (y/n) " -n 1 -r
    echo 
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if ! command -v brew &> /dev/null; then
             echo -e "${RED}❌ Homebrew not found. Please install Ollama manually: https://ollama.ai${NC}"
        else
             brew install ollama
             brew services start ollama
             echo -e "${GREEN}✅ Ollama installed!${NC}"
             sleep 2
        fi
    else
        echo -e "${YELLOW}Skipping Ollama setup. AI features will not work until installed.${NC}"
    fi
else
    echo -e "${GREEN}✅ Ollama is installed.${NC}"
    # Check if running
    if ! pgrep -x "ollama" > /dev/null; then
        echo -e "${YELLOW}⚠️ Ollama is not running. Starting service...${NC}"
        ollama serve > /dev/null 2>&1 &
        sleep 3
    fi
fi

# 5. Model Setup
MODEL="qwen2.5:latest"
echo -e "\n${BLUE}🧠 Checking for model: $MODEL...${NC}"

if command -v ollama &> /dev/null; then
    if ollama list | grep -q "qwen2.5"; then
         echo -e "${GREEN}✅ Model $MODEL is ready.${NC}"
    else
         echo -e "${YELLOW}📉 Model not found. Downloading $MODEL (this may take a while)...${NC}"
         ollama pull $MODEL
         if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Model downloaded successfully!${NC}"
         else
            echo -e "${RED}❌ Failed to download model.${NC}"
         fi
    fi
fi

echo -e "\n${BLUE}==============================================${NC}"
echo -e "${GREEN}🎉 Installation Complete!${NC}"
echo -e "1. Open Obsidian"
echo -e "2. Enable 'SmartWrite Companion' in Settings > Community Plugins"
echo -e "3. Enjoy writing! 🚀"
echo -e "${BLUE}==============================================${NC}"
