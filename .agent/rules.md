# SmartWrite Companion - Project Rules

This document outlines critical operational rules for any AI agent working on this project.

## 1. Vault Synchronization Rule

Whenever the plugin is built or a version is incremented, the artifacts (`main.js`, `manifest.json`, `styles.css`) **MUST** be synchronized to the following repositories/vaults:

1.  **Z•Edições Shared Vault**:
    `/Users/zander/Library/CloudStorage/GoogleDrive-zander.cattapreta@zedicoes.com/Shared drives/Z•Edições/~ livros/~ Zander Catta Preta/_ rascunhos/.obsidian/plugins/smartwrite-companion/`

2.  **SmartWriter Analyzer Vault**:
    `/Users/zander/Library/CloudStorage/GoogleDrive-zander.cattapreta@zedicoes.com/My Drive/_ programação/_ smartwriter-analyzer/.obsidian/plugins/smartwrite-companion/`

### Implementation Detail

- Use the `scripts/dev-workflow.mjs` script to automate this.
- If performing manual file copies, ensure both paths are updated concurrently.

## 2. Versioning and Backups

- Every minor/major feature completion should trigger a version increment.
- A backup of the entire project source must be stored in `docs/versions/v[VERSION]/` before the bump.

## 3. Privacy and Locality

- All AI processing must remain 100% local via Ollama.
- No external APIs or telemetry are allowed.
