-- AppleScript para instalar o plugin SmartWrite Companion no Obsidian
-- Compatível com macOS Sonoma (anteriormente Tahoe)

-- Perguntar ao usuário o caminho do vault
set vaultPath to choose folder with prompt "Selecione o diretório do seu vault do Obsidian onde deseja instalar o plugin SmartWrite Companion:"

-- Converter o alias para string
set vaultPathString to POSIX path of vaultPath

-- Caminho do diretório do plugin no vault
set pluginDir to vaultPathString & ".obsidian/plugins/smartwrite-companion/"

-- Criar o diretório do plugin se não existir
do shell script "mkdir -p " & quoted form of pluginDir

-- Caminho do projeto (assumindo que o script está em docs/instalador, então ../../../ é a raiz do projeto)
set projectRoot to "/Users/zander/Library/CloudStorage/GoogleDrive-zander.cattapreta@zedicoes.com/My Drive/_ programação/_ smartwrite_companion/"

-- Arquivos a copiar (principais arquivos do plugin)
set filesToCopy to {"manifest.json", "main.js", "styles.css"}

-- Copiar cada arquivo
repeat with fileName in filesToCopy
    set sourceFile to projectRoot & fileName
    set destFile to pluginDir & fileName
    do shell script "cp " & quoted form of sourceFile & " " & quoted form of destFile
end repeat

-- Mensagem de sucesso
display dialog "Plugin SmartWrite Companion instalado com sucesso no vault selecionado!" buttons {"OK"} default button "OK"