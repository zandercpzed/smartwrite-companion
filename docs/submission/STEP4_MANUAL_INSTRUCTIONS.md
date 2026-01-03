## 🎯 PASSO-A-PASSO: Como Submeter o PR (Manual)

### ⏱️ Tempo Total: 10 minutos

---

## 📍 PASSO 1: Abrir o Arquivo
**Link**: https://github.com/obsidianmd/obsidian-releases/blob/master/community-plugins.json

- [ ] Clique no link acima
- [ ] Você verá um arquivo JSON com centenas de plugins

---

## ✏️ PASSO 2: Editar o Arquivo
**Localização do botão**: Canto superior direito

- [ ] Clique no ícone de **lápis** (Edit this file)
- [ ] Ou procure por "Edit this file"

---

## 🔍 PASSO 3: Encontrar Onde Adicionar

**Na página de edição:**

- [ ] Use **Ctrl+F** (ou **Cmd+F** no Mac) para procurar
- [ ] Procure por: `]` (último colchete) ou `],` 
- [ ] Você quer a **última entrada** antes do `]` que fecha o array

**Exemplo do que você verá:**
```json
  {
    "id": "some-plugin",
    "name": "Some Plugin",
    "author": "Author Name",
    "description": "...",
    "repo": "username/repo"
  }    ← AQUI! (logo antes do ])
]
```

---

## ➕ PASSO 4: Adicionar o SmartWrite Companion

**Localize a última entrada** (como no exemplo acima)

**Coloque o cursor DEPOIS do `}` final e ANTES do `]`**

**ADICIONE ISTO** (com atenção às vírgulas):

```json
  {
    "id": "smartwrite-companion",
    "name": "SmartWrite Companion",
    "author": "Zander Catta Preta",
    "description": "Real-time writing statistics, readability analysis, and AI-powered feedback for Obsidian.",
    "repo": "zandercpzed/smartwrite-companion"
  },
```

⚠️ **IMPORTANTE - 3 Checagens:**

1. ✅ Há uma **vírgula** após o `}` final?
2. ✅ O `]` de fechamento está ainda lá?
3. ✅ A descrição tem menos de 250 caracteres?

---

## 💾 PASSO 5: Fazer Commit

**Scroll down** até encontrar a seção **"Commit changes"**

**Preencha:**

### Commit message:
```
Add plugin: SmartWrite Companion
```

### Extended description (opcional):
```
Submitting SmartWrite Companion v0.8.0 for review.

Repository: https://github.com/zandercpzed/smartwrite-companion
Release: https://github.com/zandercpzed/smartwrite-companion/releases/tag/v0.8.0
```

- [ ] Clique em: **"Create a new branch for this commit and start a pull request"**

- [ ] Clique em: **"Propose changes"**

---

## 📝 PASSO 6: Preencher o Pull Request

Você será levado para a tela de **Create Pull Request**

### Title:
```
Add plugin: SmartWrite Companion
```

### Description:

**Copie e cole exatamente isto:**

```markdown
## Submitting: SmartWrite Companion

### Plugin Information
- **ID**: smartwrite-companion
- **Version**: 0.8.0
- **Repository**: https://github.com/zandercpzed/smartwrite-companion
- **Release**: https://github.com/zandercpzed/smartwrite-companion/releases/tag/v0.8.0

### What This Plugin Does
SmartWrite Companion is an intelligent writing assistant that provides:
- Real-time writing statistics (word count, reading time, writing pace)
- Readability analysis using 10+ formulas (Flesch, Gunning Fog, SMOG, etc.)
- AI-powered feedback from 8 synthetic personas via local Ollama
- Writing suggestions (repeated words, long sentences, passive voice)
- Support for English, Portuguese, Spanish, French, and German

### Requirements
- Obsidian 1.0.0 or higher
- Ollama (for AI features) - runs locally, no cloud services

### Features
✅ Real-time statistics
✅ Session tracking (daily goals, WPM)
✅ Readability analysis
✅ Writing suggestions
✅ AI personas feedback (local only)
✅ Multilingual support
✅ 100% privacy (no data collection)

### Checklist
- [x] Manifest is valid
- [x] Repository is public
- [x] README.md is complete
- [x] LICENSE file included
- [x] Version follows semver (0.8.0)
- [x] No sample code
- [x] isDesktopOnly set correctly
- [x] minAppVersion specified

Looking forward to your review!
```

---

## 🚀 PASSO 7: Criar o PR

- [ ] Revise a mudança (diff) mostrada na tela
- [ ] Clique: **"Create pull request"** (último botão verde)

---

## ✅ Pronto!

**Você acabou de submeter o PR!**

---

## 🤖 O Que Acontece Agora

### **Em 5-30 minutos:**
O bot `obsidian-bot` fará validação automática:
- ✅ JSON é válido
- ✅ ID é único
- ✅ Repositório existe
- ✅ Release existe com binários

**Se passar**: Você verá label **"Ready for review"** 🟢
**Se falhar**: Você verá label **"Validation failed"** 🔴

### **Se Falhar:**
Não se preocupe! O bot dirá exatamente o que corrigir nos comentários.
- Faça as correções
- Deixe um comentário: "Fixed - please revalidate"
- Bot rodará novamente em poucos minutos

### **Se Passar:**
Agora é só aguardar a revisão manual da equipe Obsidian:
- Timeline: 1-4 semanas
- Podem pedir ajustes
- Se aprovado: plugin é publicado automaticamente

---

## 📊 Resumo Visual

```
1. Abrir arquivo JSON
         ↓
2. Clicar em editar
         ↓
3. Encontrar última entrada
         ↓
4. Adicionar seu plugin
         ↓
5. Commit com mensagem
         ↓
6. Preencher PR
         ↓
7. Clicar "Create pull request"
         ↓
🎊 PRONTO! Bot valida automaticamente
```

---

## 🔗 Links Rápidos

| Ação | Link |
|------|------|
| **Editar JSON** | https://github.com/obsidianmd/obsidian-releases/blob/master/community-plugins.json |
| **Seu Repo** | https://github.com/zandercpzed/smartwrite-companion |
| **Release** | https://github.com/zandercpzed/smartwrite-companion/releases/tag/v0.8.0 |
| **PRs** | https://github.com/obsidianmd/obsidian-releases/pulls |

---

**Quer ajuda em algum passo? Deixe uma mensagem!** 🚀