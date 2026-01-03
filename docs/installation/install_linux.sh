#!/bin/bash

# SmartWrite Companion Installer (Linux)
# v0.7.0

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}   SmartWrite Companion Installer (Linux)${NC}"
echo -e "${BLUE}==============================================${NC}"

# 1. Detect Vaults
echo -e "\n${YELLOW}🔍 Scanning for Obsidian Vaults...${NC}"

# Standard config location
OBSIDIAN_CONFIG="$HOME/.config/obsidian/obsidian.json"
declare -a VAULT_PATHS

if [ -f "$OBSIDIAN_CONFIG" ]; then
    # Simple grep extraction for paths
    while IFS= read -r line; do
        if [[ "$line" == *"path"* ]]; then
            # Extract path value
            raw_path=$(echo "$line" | grep -oP '"path":\s*"\K[^"]+')
            # Verify if it wasn't empty and file exists
            if [ -n "$raw_path" ]; then
                # Expand ~ if present
                full_path="${raw_path/#\~/$HOME}"
                VAULT_PATHS+=("$full_path")
            fi
        fi
    done < "$OBSIDIAN_CONFIG"
fi

# Fallback / Flatpak check (optional/basic)
FLATPAK_CONFIG="$HOME/.var/app/md.obsidian.Obsidian/config/obsidian/obsidian.json"
if [ -f "$FLATPAK_CONFIG" ]; then
      while IFS= read -r line; do
        if [[ "$line" == *"path"* ]]; then
            raw_path=$(echo "$line" | grep -oP '"path":\s*"\K[^"]+')
            if [ -n "$raw_path" ]; then
                full_path="${raw_path/#\~/$HOME}"
                VAULT_PATHS+=("$full_path")
            fi
        fi
    done < "$FLATPAK_CONFIG"
fi

if [ ${#VAULT_PATHS[@]} -eq 0 ]; then
    echo -e "${RED}❌ No vaults found automatically.${NC}"
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

if [ ! -d "$TARGET_VAULT" ]; then
    echo -e "${RED}❌ Error: Directory does not exist: $TARGET_VAULT${NC}"
    exit 1
fi

echo -e "Selected: ${YELLOW}$TARGET_VAULT${NC}"

# 3. Install Plugin
PLUGIN_DIR="$TARGET_VAULT/.obsidian/plugins/smartwrite-companion"
echo -e "\n${BLUE}📦 Installing plugin files...${NC}"
mkdir -p "$PLUGIN_DIR"

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
    read -p "Do you want to install Ollama? (Requires sudo) (y/n) " -n 1 -r
    echo 
    if [[ $REPLY =~ ^[Yy]$ ]]; then
         curl -fsSL https://ollama.com/install.sh | sh
         if [ $? -eq 0 ]; then
             echo -e "${GREEN}✅ Ollama installed!${NC}"
         else 
             echo -e "${RED}❌ Installation failed.${NC}"
         fi
    else
         echo -e "${YELLOW}Skipping Ollama setup.${NC}"
    fi
else
    echo -e "${GREEN}✅ Ollama is installed.${NC}"
    # Ensure service is running is generally managed by systemd on Linux, assume running or user knows
    if ! pgrep -x "ollama" > /dev/null; then
        echo -e "${YELLOW}Starting Ollama serve in background...${NC}"
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
         echo -e "${YELLOW}📉 Model not found. Downloading $MODEL...${NC}"
         ollama pull $MODEL
    fi
fi

echo -e "\n${BLUE}==============================================${NC}"
echo -e "${GREEN}🎉 Installation Complete!${NC}"
echo -e "1. Open Obsidian"
echo -e "2. Enable 'SmartWrite Companion' in Settings > Community Plugins"
echo -e "${BLUE}==============================================${NC}"
