# 🎯 PASSO 4 - Guia Rápido Visual

## O Que Fazer (Resumido)

### 1️⃣ Abra Este Link
```
https://github.com/obsidianmd/obsidian-releases/blob/master/community-plugins.json
```

### 2️⃣ Clique no Lápis (Edit)
No canto superior direito do arquivo

### 3️⃣ Role até o Final
Procure por: `},` (última entrada antes do `]`)

### 4️⃣ Adicione Antes da Última Entrada

**Copie e Cole Exatamente Isto:**

```json
  {
    "id": "smartwrite-companion",
    "name": "SmartWrite Companion",
    "author": "Zander Catta Preta",
    "description": "Real-time writing statistics, readability analysis, and AI-powered feedback for Obsidian.",
    "repo": "zandercpzed/smartwrite-companion"
  },
```

⚠️ **NÃO ESQUEÇA A VÍRGULA NO FINAL** (`,`)

### 5️⃣ Scroll Down → "Commit changes"

**Mensagem**:
```
Add plugin: SmartWrite Companion
```

**Selecione**: "Create a new branch for this commit and start a pull request"

**Botão**: "Propose changes"

### 6️⃣ Preencha o PR

**Title**:
```
Add plugin: SmartWrite Companion
```

**Description** (copie do arquivo `OBSIDIAN_SUBMISSION_STEP4.md`):
(Há um template pronto lá)

### 7️⃣ Clique: "Create pull request"

---

## ✅ Pronto!

O bot do Obsidian vai validar em alguns minutos.

Se tudo OK → "Ready for review" 🟢
Se erro → "Validation failed" 🔴 (corrigir e comentar "Fixed")

---

## 📊 Checklist Antes de Submeter

- [ ] JSON está válido (sem erros de sintaxe)
- [ ] Vírgula após seu plugin
- [ ] ID é único (não procura em todo arquivo)
- [ ] ID não contém "obsidian"
- [ ] Repo está no formato: `usuario/repo`
- [ ] Descrição tem menos de 250 caracteres
- [ ] Release `v0.8.0` existe com os binários

---

## 🎬 Ready? 

Go to: https://github.com/obsidianmd/obsidian-releases/blob/master/community-plugins.json

Good luck! 🚀