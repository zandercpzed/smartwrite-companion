# 📋 Checklist de Submissão - SmartWrite Companion v0.8.0 (Desktop)

## ✅ Pré-requisitos

### GitHub
- [ ] Repositório público no GitHub
- [ ] Conta GitHub ativa
- [ ] Repositório URL: `https://github.com/zandercpzed/smartwrite-companion`

---

## ✅ Passo 1: Arquivos Necessários na Raiz

- [x] **README.md** - Documentação completa ✅
  - [x] Descreve o propósito
  - [x] Instruções de uso
  - [x] Sem emoji (exceto títulos)
  - [x] < 250 caracteres de descrição

- [x] **LICENSE** - MIT License ✅
  - [x] Arquivo presente na raiz

- [x] **manifest.json** - Metadados do plugin ✅
  - [ ] ⚠️ **PROBLEMA**: `version` é `0.8.0m` (mobile)
  - [ ] ⚠️ **PROBLEMA**: Descrição menciona "Mobile-optimized version"
  - [ ] ⚠️ **PROBLEMA**: `isDesktopOnly` é `false` (deve ser verificado)
  - [x] `id`: "smartwrite-companion" ✅
  - [x] `name`: "SmartWrite Companion" ✅
  - [x] `author`: "Zander Catta Preta" ✅
  - [x] `authorUrl`: URL válida ✅
  - [x] `minAppVersion`: "1.0.0" ✅

---

## ✅ Passo 2: Preparar Release no GitHub

- [ ] **Atualizar versão**
  - [ ] Mudar `manifest.json` `version` de `0.8.0m` para `0.8.0`
  - [ ] Mudar `package.json` `version` de `0.8.0m` para `0.8.0`
  - [ ] Mudar descrição para versão desktop (sem menção a mobile)

- [ ] **Descrição do Plugin** (manifest.json)
  - [ ] Máximo 250 caracteres
  - [ ] Sem emoji ou caracteres especiais
  - [ ] Sem "This is a plugin"
  - [ ] Termina com ponto (.)
  - [ ] Exemplo melhorado:
    ```
    "Real-time writing statistics, readability analysis, and AI-powered feedback. Runs 100% locally with Ollama."
    ```

- [ ] **Atualizar README.md**
  - [ ] Remover referências a mobile (ou criar seção separada)
  - [ ] Clarificar que é versão desktop
  - [ ] Remover links para install_android.sh e install_mobile.sh

- [ ] **Build do Plugin**
  ```bash
  npm run build
  ```

- [ ] **Criar Release no GitHub**
  - [ ] Ir em: https://github.com/zandercpzed/smartwrite-companion/releases
  - [ ] "Draft a new release"
  - [ ] Tag version: `0.8.0`
  - [ ] Release title: (pode ser qualquer coisa, ex: "v0.8.0 - Release")
  - [ ] Description: Descrição do que mudou (extrair de CHANGELOG.md)
  - [ ] Upload dos arquivos:
    - [ ] `main.js`
    - [ ] `manifest.json`
    - [ ] `styles.css`
  - [ ] Publish release

---

## ✅ Passo 3: Requisitos de Submissão (Validation)

- [x] **Remove Sample Code**
  - [x] Sem código de exemplo do template

- [x] **API Usage**
  - [x] Usa APIs do Obsidian
  - [x] Se usar Node.js/Electron → marcar `isDesktopOnly: true`
  - [ ] ⚠️ **VERIFICAR**: O plugin usa APIs que requerem desktop-only?

- [x] **Command IDs**
  - [x] Não inclui plugin ID no command ID

- [x] **Documentation**
  - [x] README.md descreve bem o plugin
  - [x] Documentação em inglês (padrão)

- [ ] **minAppVersion**
  - [x] Está definido como `1.0.0`
  - [ ] ⚠️ **VERIFICAR**: É a versão mínima correta?

- [ ] **fundingUrl** (Opcional)
  - [ ] Se aceita doações → adicionar em manifest.json
  - [ ] Se não → remover da configuração

---

## ✅ Passo 4: Submissão para Revisão

1. [ ] Ir em: https://github.com/obsidianmd/obsidian-releases/blob/master/community-plugins.json
2. [ ] Clicar em botão de edição (lápis)
3. [ ] Adicionar novo entry no JSON:

```json
{
  "id": "smartwrite-companion",
  "name": "SmartWrite Companion",
  "author": "Zander Catta Preta",
  "description": "Real-time writing statistics, readability analysis, and AI-powered feedback.",
  "repo": "zandercpzed/smartwrite-companion"
}
```

4. [ ] Verificar que:
   - [ ] `id` é único (buscar em community-plugins.json)
   - [ ] `id` não contém "obsidian"
   - [ ] `repo` segue formato correto
   - [ ] Vírgula após entry anterior

5. [ ] "Commit changes..."
6. [ ] "Propose changes"
7. [ ] "Create pull request"
8. [ ] Preview → Community Plugin
9. [ ] Título do PR: `Add plugin: SmartWrite Companion`
10. [ ] Descrição: Preencher checklist fornecido pelo Obsidian
11. [ ] "Create pull request"

---

## ✅ Passo 5: Validação Automática

- [ ] Aguardar bot do Obsidian validar
- [ ] **Ready for review**: Passou na validação automática ✅
- [ ] **Validation failed**: Corrigir problemas listados

---

## ✅ Passo 6: Revisão Manual

- [ ] Aguardar revisão da equipe Obsidian
- [ ] Endereçar comentários se houver
- [ ] Atualizar GitHub release com mudanças
- [ ] Deixar comentário no PR informando correções

---

## ⚠️ PROBLEMAS A CORRIGIR IMEDIATAMENTE

### 1. **Versão Errada no manifest.json**
```json
// ATUAL (ERRADO para submissão desktop):
"version": "0.8.0m"

// DEVE SER:
"version": "0.8.0"
```

### 2. **Descrição Menciona Mobile**
```json
// ATUAL (ERRADO):
"description": "An intelligent writing assistant with real-time statistics, readability analysis, and AI-powered persona feedback. Mobile-optimized version."

// DEVE SER:
"description": "Real-time writing statistics, readability analysis, and AI-powered feedback. Runs 100% locally with Ollama."
```

### 3. **isDesktopOnly**
```json
// ATUAL:
"isDesktopOnly": false

// VERIFICAR SE DEVE SER:
"isDesktopOnly": true  // Se usa Ollama (Node.js)
```

### 4. **package.json Version**
```json
// ATUAL:
"version": "0.8.0m"

// DEVE SER:
"version": "0.8.0"
```

---

## 📝 Próximas Ações

1. **Corrigir os 4 problemas acima**
2. **Fazer commit**: `git commit -m "Prepare v0.8.0 for Obsidian submission"`
3. **Build**: `npm run build`
4. **Criar Release no GitHub** com os arquivos compilados
5. **Submeter PR** para community-plugins.json
6. **Aguardar validação** e revisão

---

## 🔗 Links Úteis

- Documentação: https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin
- Requisitos: https://docs.obsidian.md/Plugins/Releasing/Submission+requirements+for+plugins
- Community Plugins JSON: https://github.com/obsidianmd/obsidian-releases/blob/master/community-plugins.json
- Seu Repo: https://github.com/zandercpzed/smartwrite-companion

---

**Status**: 🟡 **Aguardando Correções**
**Última atualização**: Janeiro 2, 2026