# Regras de Desenvolvimento e Ações Obrigatórias

Este documento define os protocolos estritos que devem ser seguidos durante o desenvolvimento do projeto **SmartWrite Companion**.

## 1. Controle de Versão (Incremental)

**Sempre que houver interação com o código**, o último dígito da versão do plugin deve ser incrementado em 1.

- Arquivos afetados: `package.json` e `manifest.json`.
- Exemplo: `0.3.13` -> `0.3.14`.

## 2. Backup e Histórico

**Após cada interação/alteração**:

1. Criar uma cópia completa dos arquivos do plugin em `/docs/versions/[nova-versao]`.
2. Compactar esta pasta em um arquivo `.zip`.
    - Formato: `/docs/versions/[nova-versao].zip`.
3. A pasta original em `/docs/versions/[nova-versao]` pode ser mantida ou removida após a compactação (preferencialmente mantida para fácil acesso, ou removida para economizar espaço se o zip bastar - _Definição atual: manter ambos ou zipar a pasta_).

## 3. Atualização da Vault

O diretório de desenvolvimento atual **É** a pasta de plugins da vault.

- Caminho: `/Users/zander/Library/CloudStorage/GoogleDrive-zander.cattapreta@zedicoes.com/My Drive/_ programação/_ smartwrite_companion`
- Ação: Garantir que o build (`main.js`, `manifest.json`, `styles.css`) esteja sempre atualizado neste diretório após as alterações.

## 4. Preservação da Documentação

- O diretório `/docs`, seus conteúdos e subdiretórios **NUNCA** devem ser apagados.
- Eles servem como memória do projeto e local de backup.

---

**Observação para o Assistente (AI):**
Use scripts de automação para garantir que esses passos jamais sejam esquecidos. Não confie na execução manual.
