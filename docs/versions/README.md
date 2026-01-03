# 📂 Pasta /versions - Regras Gerais

## 🎯 Propósito
Esta pasta contém **todas as versões** do SmartWrite Companion, incluindo:
- Pacotes de instalação (.zip)
- Arquivos de documentação de instalação
- Scripts de geração de pacotes
- Histórico de versões

## 📦 Estrutura dos Pacotes ZIP

### Regras Gerais para Pacotes ZIP:
1. **Localização**: Todos os arquivos `.zip` devem ficar nesta pasta `/versions`
2. **Nomeação**: Seguir padrão `SmartWrite-Companion-{Plataforma}-v{Versão}.zip`
3. **Conteúdo**: Incluir arquivos essenciais + documentação (README.md)

### Tipos de Pacotes:
- **Desktop**: `SmartWrite-Companion-Desktop-v{Versão}.zip`
- **Mobile (iOS)**: `SmartWrite-Companion-Mobile-v{Versão}m.zip`
- **Android**: `SmartWrite-Companion-Android-v{Versão}m.zip`
- **Complete**: `SmartWrite-Companion-Complete-v{Versão}m.zip`

## 📋 Scripts de Geração

### Scripts Disponíveis:
- `install_desktop.sh` → Gera pacote desktop
- `install_mobile.sh` → Gera pacote iOS
- `install_android.sh` → Gera pacote Android
- `install_complete.sh` → Gera pacote master com tudo

### Como Usar:
```bash
# Gerar todos os pacotes
./install_desktop.sh
./install_mobile.sh
./install_android.sh
./install_complete.sh
```

## 📖 Documentação de Instalação

### Arquivos de Instruções:
- `iOS_install.md` → Guia completo para iOS
- `Android_install.md` → Guia completo para Android
- `README.md` → Documentação geral do projeto

### Inclusão nos Pacotes:
- **Pacotes Mobile**: Incluem `README.md` (instruções específicas)
- **Pacote Desktop**: Inclui `README.md` (documentação geral)
- **Pacote Complete**: Inclui todos os documentos

## 🔄 Processo de Release

### Passos para Nova Versão:
1. Atualizar versão em `manifest.json` e `package.json`
2. Executar scripts de build: `npm run build`
3. Gerar pacotes: `./install_*.sh`
4. Verificar arquivos em `/versions`
5. Testar instalações
6. Fazer commit e push

### Versionamento:
- **Desktop**: `0.8.0`, `0.9.0`, etc.
- **Mobile**: `0.8.0m`, `0.9.0m`, etc.
- **Complete**: Sempre usar versão mobile (`0.8.0m`)

## 📊 Histórico de Versões

### Versões Anteriores:
- `0.3.x` até `0.7.x` → Versões antigas (mantidas para referência)
- `0.8.0` → Primeira versão organizada nesta estrutura

### Limpeza:
- Manter últimas 3-5 versões principais
- Arquivos antigos podem ser removidos se necessário
- Sempre manter backup antes de limpar

## 🚨 Regras Importantes

### ❌ NÃO fazer:
- Criar pacotes ZIP fora da pasta `/versions`
- Misturar arquivos de diferentes versões
- Esquecer de incluir documentação nos pacotes

### ✅ SEMPRE fazer:
- Verificar se pacotes foram criados corretamente
- Testar instalação em pelo menos uma plataforma
- Atualizar documentação quando necessário
- Manter consistência na nomeação

## 📞 Manutenção

Para manter esta pasta organizada:
1. Execute scripts regularmente para gerar pacotes atualizados
2. Remova versões muito antigas quando necessário
3. Mantenha documentação atualizada
4. Teste pacotes antes de distribuir

---

**Última atualização**: Janeiro 2026
**Mantenedor**: SmartWrite Companion Team