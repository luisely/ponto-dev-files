# Implementation Plan: Migração para React 19.2

## Overview

Este plano converte o desenho técnico da migração para React 19.2 em uma sequência incremental de tarefas de código. A estratégia preserva a camada de serviços e as funções puras de domínio (`AuthService`, `BatidaServices`, `OfflineQueueService`, `pontosCache`, `agruparPontos`, `computeTotalMinutesFromTimes`, `formatMinutesToHHMM` e conversões de data/hora) e reescreve as camadas de apresentação e orquestração como componentes e hooks React.

A ordem começa pela configuração do build (React + Vite 8 + React Compiler), extração/isolamento das funções puras reusáveis (com testes de propriedade), construção dos hooks de orquestração, depois os componentes de UI, e por fim a fiação no ponto de entrada. Linguagem de implementação: **TypeScript/React** (definida no design).

## Tasks

- [x] 1. Configurar o Ambiente_Build para React 19.2
  - Adicionar dependências de runtime `react@19.2` e `react-dom@19.2`; remover `lucide` e `toastify-js`; adicionar `lucide-react` e `sonner`
  - Adicionar dependências de dev: `@vitejs/plugin-react` (com Babel habilitado) ou `@vitejs/plugin-react-swc`, `@types/react`, `@types/react-dom`, `babel-plugin-react-compiler`, regras do compiler no `eslint-plugin-react-hooks`
  - Atualizar `vite.config.ts` para registrar o plugin React **antes** de `tailwindcss()`, habilitando explicitamente o React Compiler (`babel: { plugins: [['babel-plugin-react-compiler', { target: '19' }]] }`), preservando `VitePWA` e o alias `@`
  - Atualizar `tsconfig.json` com `"jsx": "react-jsx"` (incluir `"DOM.Iterable"` se necessário), mantendo `strict`, `moduleResolution: bundler`, `noEmit`
  - Manter Biome como lint/format geral
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 1.8_

- [x] 2. Configurar o runner de testes e infraestrutura de PBT
  - [x] 2.1 Configurar Vitest com ambiente `jsdom`, React Testing Library, `@testing-library/user-event` e `fast-check`
    - Adicionar dependências de teste e configuração do Vitest integrada ao alias `@`
    - Adicionar mocks utilitários para cliente Supabase e `localStorage`
    - Configurar `fc.assert(..., { numRuns: 100 })` como padrão para testes de propriedade
    - _Requirements: 1.2, 1.8_

- [x] 3. Isolar e preparar as funções puras de domínio
  - [x] 3.1 Garantir exports puros e reutilizáveis das funções de domínio
    - Confirmar/expor `agruparPontos`, `computeTotalMinutesFromTimes`, `formatMinutesToHHMM` como funções puras importáveis
    - Extrair as conversões de data `dd/mm/yyyy ↔ yyyy-mm-dd` e o record de exclusão `"dd/mm/yyyy&HH:mm"` para utilitários puros reusáveis
    - Extrair a função de merge (pontos da API × Fila_Offline) para utilitário puro reusável
    - _Requirements: 5.1, 5.2, 5.3, 6.2, 12.2_

  - [ ]* 3.2 Escrever teste de propriedade para preservação de batidas no agrupamento
    - **Property 1: Preservação de batidas no agrupamento**
    - **Validates: Requirements 5.1**

  - [ ]* 3.3 Escrever teste de propriedade para ordenação de dias e horas
    - **Property 2: Ordenação de dias e horas**
    - **Validates: Requirements 5.1**

  - [ ]* 3.4 Escrever teste de propriedade para o total do dia
    - **Property 3: Total do dia é a soma dos pares de horários**
    - **Validates: Requirements 5.2**

  - [ ]* 3.5 Escrever teste de propriedade para formatação de minutos em HH:MM
    - **Property 4: Formatação de minutos em HH:MM**
    - **Validates: Requirements 5.3**

  - [ ]* 3.6 Escrever teste de propriedade para round-trip de conversão de data
    - **Property 5: Round-trip de conversão de data dd/mm/yyyy ↔ ISO**
    - **Validates: Requirements 12.2**

  - [ ]* 3.7 Escrever teste de propriedade para round-trip do record de exclusão
    - **Property 6: Round-trip do record de exclusão**
    - **Validates: Requirements 6.2, 12.2**

  - [ ]* 3.8 Escrever teste de propriedade para o merge com a fila offline
    - **Property 7: Merge com a fila offline não duplica nem perde batidas**
    - **Validates: Requirements 5.1, 7.1**

- [~] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Criar tipos da camada React e wrappers de feedback
  - [x] 5.1 Definir tipos novos da camada React
    - Definir `SessionUser`, `AuthStatus` e `RegisterOutcome`
    - Preservar os tipos de domínio (`PontoRaw`, `PontoPendente`, `TotalDia`, `DiaAgrupado`) sem alterar a estrutura de `localStorage`
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 5.2 Implementar `ToastProvider` e wrappers de toast com `sonner`
    - Montar `<Toaster/>` e reescrever `toastSuccess/toastError/toastInfo` preservando mensagens em pt-BR e o visual equivalente
    - _Requirements: 10.1, 10.3, 12.4_

  - [ ]* 5.3 Escrever testes de exemplo para os wrappers de toast
    - Verificar mensagens pt-BR equivalentes às atuais
    - _Requirements: 10.3, 12.4_

- [x] 6. Implementar os hooks de orquestração
  - [x] 6.1 Implementar `useConnectionStatus`
    - Listeners `online`/`offline`, estado `isOnline`, toasts de reconexão/offline e disparo de sincronização ao voltar online
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 6.2 Escrever testes de exemplo para `useConnectionStatus`
    - Transições online/offline e toasts correspondentes
    - _Requirements: 8.2, 8.3_

  - [x] 6.3 Implementar `usePendingBadge`
    - Contagem de pendências do usuário via `offlineQueueService.getPendingCount(userId)` com `refresh`
    - _Requirements: 7.5, 7.6_

  - [ ]* 6.4 Escrever teste de propriedade para o Badge_Pendencias
    - **Property 8: Badge reflete a contagem de pendências do usuário**
    - **Validates: Requirements 7.5, 7.6**

  - [x] 6.5 Implementar `useAuth`
    - `getSession()` inicial, `ensureUserProfile`, `signIn`/`signOut`, assinatura de `onAuthStateChange` reagindo só a `SIGNED_IN`/`SIGNED_OUT`, ignorando `TOKEN_REFRESHED`/`INITIAL_SESSION`/`USER_UPDATED`, com dedupe por `lastProcessedUserId`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.7, 3.8, 3.9, 3.10_

  - [ ]* 6.6 Escrever testes de exemplo para `useAuth`
    - Dedupe de `SIGNED_IN`, ignorar eventos irrelevantes, transição para `signedOut`
    - _Requirements: 3.7, 3.8, 3.9_

  - [x] 6.7 Implementar `usePoints`
    - Render de cache imediato ou skeleton, fetch em 2º plano com throttle de 10s, merge com a fila offline, gravação de cache, agrupamento via `agruparPontos`; ações `refetch`, `registrar`, `excluir`, `excluirTodos` retornando `RegisterOutcome`
    - _Requirements: 4.6, 4.8, 4.9, 4.10, 5.1, 5.2, 5.3, 6.2, 6.6_

  - [ ]* 6.8 Escrever testes de exemplo para `usePoints`
    - Registro online/offline, atualização de lista, exclusão e merge com fila
    - _Requirements: 4.8, 4.10, 6.2, 6.6_

  - [x] 6.9 Implementar `useOfflineSync`
    - Chamar `batidaPontoService.processQueue()`, toasts de sucesso/falha, reagendamento em 30s enquanto online, refetch e atualização do badge após sync
    - _Requirements: 7.2, 7.3, 7.4_

  - [ ]* 6.10 Escrever teste de propriedade para o limite de tentativas de sincronização
    - **Property 9: Limite de tentativas de sincronização**
    - **Validates: Requirements 7.7**

  - [x] 6.11 Implementar `useRefetchOnFocus`
    - Em `visibilitychange` visível, com online e usuário, refetch + badge, respeitando throttle de 60s via `useRef`
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 6.12 Escrever testes de exemplo para `useRefetchOnFocus`
    - Throttle de 60s e no-op quando offline
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 6.13 Implementar `useDatepicker`
    - Wrapper de `vanillajs-datepicker` via `ref` como prop, preservando `language: 'pt'` e `format: 'dd/mm/yyyy'`
    - _Requirements: 4.1, 4.3_

- [~] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implementar componentes de tela e cabeçalho
  - [x] 8.1 Implementar `LoadingScreen` e `LoginScreen`
    - Réplica visual do `#loadingScreen` (spinner + "Carregando...") e do `#loginScreen` (logo, card, botão Google) com classes Tailwind equivalentes e tema escuro
    - `LoginScreen` exibe estado de carregamento durante o OAuth e restaura o botão em erro
    - _Requirements: 2.4, 2.5, 3.1, 3.2, 3.4, 3.5, 3.6_

  - [x] 8.2 Implementar `ConnectionStatus`, `PendingBadge` e `MenuButton`
    - `ConnectionStatus` exibe online/offline; `PendingBadge` exibe a contagem e fica oculto quando `count === 0`
    - Usar ícones `lucide-react` (`Menu`, etc.)
    - _Requirements: 7.5, 7.6, 8.1, 10.2_

  - [x] 8.3 Implementar `WelcomeHeader`
    - Card de boas-vindas com nome do usuário, compondo `ConnectionStatus`, `MenuButton` e `PendingBadge`
    - _Requirements: 2.4, 3.3_

- [x] 9. Implementar formulário de registro
  - [x] 9.1 Implementar `DateField`, `TimeField` e `SubmitButton`
    - `DateField` (dd/mm/yyyy com datepicker via `useDatepicker`), `TimeField` (`<input type="time">` HH:mm 24h), `SubmitButton` consumindo `useFormStatus`
    - _Requirements: 4.1, 4.3, 4.7_

  - [x] 9.2 Implementar `RegisterForm` com `useActionState`
    - Preencher data/hora atuais na montagem; validar campos vazios (toastInfo) e usuário ausente (toastInfo); acionar `onRegister` e dirigir toasts de sucesso/offline/erro; estado de loading do botão via `useFormStatus`
    - _Requirements: 4.2, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

  - [ ]* 9.3 Escrever testes de exemplo para `RegisterForm`
    - Preenchimento inicial de data/hora; validações de campos vazios e usuário ausente; estado de loading do botão
    - _Requirements: 4.2, 4.4, 4.5, 4.7_

- [x] 10. Implementar lista de pontos e exclusão
  - [x] 10.1 Implementar `PointItem`, `DayGroup`, `PointsSkeleton` e `EmptyState`
    - `PointItem` (`•HH:mm` clicável + badge de status `Clock`/`AlertCircle`), `DayGroup` (cabeçalho `date - weekday` + total `HH:MM` com `!` em `isPlus8h` e classes de cor por `less8h/plus8h/ok`)
    - _Requirements: 5.1, 5.2, 5.3, 5.6, 10.2_

  - [x] 10.2 Implementar `PointsList` com `useOptimistic`
    - Alternar entre `PointsSkeleton` (carregando), `EmptyState` (vazio, sem erro) e a lista de `DayGroup`; remoção otimista de item com rollback em falha
    - _Requirements: 5.1, 5.4, 5.5, 5.6, 6.7_

  - [ ]* 10.3 Escrever testes de exemplo para `PointsList`
    - Alternância skeleton/vazio/grupos e renderização de badges de status
    - _Requirements: 5.4, 5.5, 5.6_

  - [x] 10.4 Implementar `DeleteModal` e `MenuModal`
    - `DeleteModal` (confirmação individual sobre `<dialog>` acionando `onConfirm`), `MenuModal` ("SAIR" e "APAGAR TUDO" com `confirm()` de segurança)
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.6_

  - [ ]* 10.5 Escrever testes de exemplo para exclusão otimista e rollback
    - Remoção otimista imediata e reversão do estado em falha, com toast de erro
    - _Requirements: 6.1, 6.4, 6.7_

- [~] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Compor `MainScreen` e integrar hooks
  - [x] 12.1 Implementar `MainScreen`
    - Compor `WelcomeHeader`, `RegisterForm`, `PointsList`, `DeleteModal` e `MenuModal`; hospedar modais controlados por estado; consumir `usePoints`, `useOfflineSync` e `useRefetchOnFocus`
    - _Requirements: 2.3, 2.4, 4.6, 5.1, 6.1, 6.5, 7.2, 9.1_

- [x] 13. Implementar ponto de entrada e fiação final
  - [x] 13.1 Implementar `App` e `ErrorBoundary`
    - `App` consome `useAuth` e deriva a tela por `status` (loading/signedOut/signedIn), instala `useConnectionStatus`, renderiza `ToastProvider` e a Document Metadata (`<title>Ponto Eletrônico</title>`); `ErrorBoundary` na raiz envolvendo `MainScreen`
    - _Requirements: 2.1, 2.3, 3.1, 3.2, 3.3, 3.7, 3.8_

  - [x] 13.2 Criar `src/main.tsx` e atualizar `index.html`
    - `createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>)`, importar `index.css` e o CSS do datepicker; remover markup das telas do `index.html`, adicionar `<div id="root">`, preservar `preconnect`/fontes/gtag e o registro do service worker; remover `src/main.ts`
    - _Requirements: 2.1, 2.2, 11.2_

  - [ ]* 13.3 Escrever testes de integração/smoke
    - Build de produção sem erros de tipos (`tsc -b && vite build`) com React Compiler aplicado; verificação de que o manifesto/ícones e service worker (autoUpdate) e runtime caching NetworkFirst do Supabase/fontes permanecem; 1–3 exemplos de `add`/`get`/`remove` com Supabase mockado validando conversões de formato
    - _Requirements: 1.5, 1.6, 11.1, 11.2, 11.3, 11.4, 11.5_

- [~] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tarefas marcadas com `*` são opcionais (testes) e podem ser puladas para um MVP mais rápido.
- Cada tarefa referencia requisitos específicos para rastreabilidade.
- Testes de propriedade validam as 9 propriedades de correção do design (funções puras de domínio) usando `fast-check` com no mínimo 100 iterações; cada teste referencia sua propriedade com a tag `Feature: react-19-migration, Property {número}`.
- Testes de exemplo/unidade validam componentes, hooks e casos de erro; testes de integração/smoke cobrem build e PWA.
- A camada de serviços e as funções puras de domínio são preservadas; a estrutura de `localStorage` da Fila_Offline não muda (backward compat).

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "5.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "5.2", "6.13"] },
    { "id": 3, "tasks": ["5.3", "6.1", "6.3", "6.5", "9.1"] },
    { "id": 4, "tasks": ["6.2", "6.4", "6.6", "6.7", "8.1", "8.2"] },
    { "id": 5, "tasks": ["6.8", "6.9", "6.11", "8.3", "9.2", "10.1"] },
    { "id": 6, "tasks": ["6.10", "6.12", "9.3", "10.2", "10.4"] },
    { "id": 7, "tasks": ["10.3", "10.5", "12.1"] },
    { "id": 8, "tasks": ["13.1"] },
    { "id": 9, "tasks": ["13.2"] },
    { "id": 10, "tasks": ["13.3"] }
  ]
}
```
