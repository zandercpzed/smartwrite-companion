# Plano de Implantação: Integração com LLM Local (Ollama)

Este documento descreve as etapas para a integração de Inteligência Artificial local no SmartWrite Companion. Esta fase visa transformar o plugin de uma ferramenta de análise estatística em um assistente de escrita proativo.

## Premissa

O processamento deve permanecer **100% local**, utilizando o Ollama como backend de inferência para garantir a privacidade e o desempenho.

---

## Fase 1: Fundação e Conectividade

- **Objetivo**: Estabelecer comunicação estável entre o Obsidian e o Ollama.
- **Entregas**:
  - Serviço `OllamaService` para chamadas REST.
  - Validação de conexão e verificação de modelos instalados.
  - Configurações de endpoint e seleção de modelo no plugin.

## Fase 2: Arquitetura de Análise IA

- **Objetivo**: Criar o pipeline de processamento de texto para modelos de linguagem.
- **Entregas**:
  - Extração inteligente de contexto (frase atual, parágrafo, documento).
  - Sistema de Prompts base (System Prompts) para diferentes tarefas.
  - Gerenciamento de tokens e limites de contexto.

## Fase 3: Personas de Escrita (Synthetic Readers)

- **Objetivo**: Fornecer feedback textual baseado em perfis específicos.
- **Entregas**:
  - Implementação de 8 personas iniciais (ex: Editor Acadêmico, Leitor Leigo, SEO Expert).
  - Interface para seleção de persona ativa.
  - Painel de feedback qualitativo gerado pela IA.

## Fase 4: Correção e Refinamento Inteligente

- **Objetivo**: Substituir sugestões baseadas em regras por refinamento semântico.
- **Entregas**:
  - Sugestão de reescrita para clareza e concisão.
  - Ajuste de tom de voz (Formal, Casual, Persuasivo).
  - Explicações detalhadas para erros gramaticais complexos.

## Fase 5: Interface de Chat/Comandos (Opcional)

- **Objetivo**: Permitir interação direta com o texto via comandos de IA.
- **Entregas**:
  - Comando "Ask AI" para seleções de texto.
  - Transformação de texto via prompts customizados (ex: "Traduza para Inglês", "Resuma em tópicos").

## Fase 6: Otimização e Cache

- **Objetivo**: Garantir que a IA não degrade a experiência do usuário.
- **Entregas**:
  - Sistema de cache local para análises recorrentes.
  - Feedback visual de "pensamento" (loading states) não intrusivo.
  - Suporte a streaming de texto para respostas rápidas.
