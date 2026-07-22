# Requirements Document

## Introduction

Este documento descreve os requisitos para migrar o aplicativo de Ponto Eletrônico (PWA de registro de ponto) de uma arquitetura em Vanilla TypeScript com manipulação direta de DOM para React na versão 19.2, aproveitando as melhorias introduzidas nessa versão (React Compiler, Actions/`useActionState`, `useOptimistic`, `useFormStatus`, hook `use()`, melhorias de Suspense, `ref` como prop e Document Metadata).

A migração é uma reescrita da camada de apresentação e de orquestração (atualmente baseada em controllers e serviços) para componentes React, mantendo intactas as capacidades funcionais existentes: autenticação Google via Supabase, registro de ponto, listagem e agrupamento de pontos por dia com cálculo de totais, exclusão individual e em massa, suporte offline com fila e sincronização, badge de pendências, atualização ao focar a aba, indicador de status de conexão, notificações (toasts), tema escuro e comportamento de PWA instalável.

O objetivo é preservar 100% do comportamento observável pelo usuário final, mantendo a stack de suporte (Vite, TailwindCSS v4, Supabase, vite-plugin-pwa) e reduzindo a manipulação manual de DOM em favor do modelo declarativo do React.

## Glossary

- **Aplicativo**: O PWA de Ponto Eletrônico como um todo, após a migração para React 19.2.
- **Sistema_React**: A camada de interface e orquestração reescrita em React 19.2 que substitui os controllers e a manipulação direta de DOM.
- **Serviço_Autenticacao**: Módulo responsável pela integração de autenticação com o Supabase (equivalente ao atual `AuthService`).
- **Serviço_Batidas**: Módulo responsável pelas operações CRUD de pontos e processamento da fila (equivalente ao atual `BatidaServices`).
- **Serviço_Fila_Offline**: Módulo responsável pela fila de registros pendentes em `localStorage` (equivalente ao atual `OfflineQueueService`).
- **Cache_Pontos**: Módulo de cache local de pontos (equivalente ao atual `pontosCache`).
- **Ponto**: Um registro de batida composto por data (dd/mm/yyyy) e hora (HH:mm) associado a um usuário.
- **Fila_Offline**: Conjunto de Pontos pendentes armazenados em `localStorage` aguardando sincronização.
- **Badge_Pendencias**: Indicador visual que exibe a quantidade de Pontos pendentes na Fila_Offline.
- **Tela_Carregamento**: Tela inicial exibida enquanto a sessão de autenticação é verificada.
- **Tela_Login**: Tela que apresenta o botão de login com Google.
- **Tela_Principal**: Tela exibida após autenticação, contendo cabeçalho de boas-vindas, formulário de registro e lista de pontos.
- **React_Compiler**: Compilador otimizador do React 19.2 que memoiza automaticamente componentes e valores.
- **Ambiente_Build**: Conjunto de ferramentas de compilação e empacotamento (Vite 8, TailwindCSS v4, vite-plugin-pwa, Biome).
- **PWA**: Progressive Web App instalável, com service worker e capacidade offline.

## Requirements

### Requirement 1: Integração do React 19.2 ao Ambiente de Build

**User Story:** Como desenvolvedor, quero que o React 19.2 seja integrado ao Ambiente_Build existente, para que a aplicação seja compilada e empacotada com React mantendo as ferramentas atuais.

#### Acceptance Criteria

1. THE Aplicativo SHALL usar React na versão 19.2 e React DOM na versão 19.2 como dependências de runtime.
2. THE Ambiente_Build SHALL compilar e empacotar componentes React usando Vite na versão 8.
3. THE Ambiente_Build SHALL preservar o uso de TailwindCSS versão 4 para estilização.
4. THE Ambiente_Build SHALL preservar a configuração do vite-plugin-pwa para geração do service worker.
5. WHERE o React_Compiler estiver habilitado, THE Ambiente_Build SHALL aplicar as otimizações do React_Compiler durante a compilação.
6. WHEN o comando de build for executado, THE Ambiente_Build SHALL concluir a verificação de tipos TypeScript e a geração dos artefatos de produção sem erros.
7. THE Ambiente_Build SHALL manter o Biome como ferramenta de lint e formatação para arquivos de código, incluindo arquivos de componentes React.
8. THE Ambiente_Build SHALL preservar o alias de importação `@` apontando para o diretório `src`.

### Requirement 2: Estrutura de Componentes e Ponto de Entrada React

**User Story:** Como desenvolvedor, quero que a aplicação seja inicializada por uma árvore de componentes React, para que a interface seja renderizada de forma declarativa em vez de manipulação direta de DOM.

#### Acceptance Criteria

1. WHEN o Aplicativo for carregado, THE Sistema_React SHALL montar a árvore de componentes React em um único elemento raiz do documento HTML.
2. THE Sistema_React SHALL renderizar a interface por meio de componentes React em vez de manipulação direta de DOM via `document.getElementById`, `querySelector` ou `innerHTML`.
3. THE Sistema_React SHALL gerenciar a exibição entre Tela_Carregamento, Tela_Login e Tela_Principal por meio de estado de componente em vez de alternância manual de classes CSS de visibilidade.
4. THE Sistema_React SHALL preservar a estrutura visual e as classes de estilo TailwindCSS equivalentes às telas atuais.
5. THE Sistema_React SHALL manter o suporte ao tema escuro equivalente ao comportamento atual.

### Requirement 3: Autenticação com Google via Supabase

**User Story:** Como usuário, quero fazer login com minha conta Google, para que eu possa acessar meus registros de ponto de forma segura.

#### Acceptance Criteria

1. WHILE a sessão inicial de autenticação estiver sendo verificada, THE Sistema_React SHALL exibir a Tela_Carregamento.
2. IF nenhuma sessão de usuário for encontrada na verificação inicial, THEN THE Sistema_React SHALL exibir a Tela_Login.
3. WHEN uma sessão de usuário válida for encontrada na verificação inicial, THE Sistema_React SHALL exibir a Tela_Principal com o nome do usuário obtido dos metadados da sessão.
4. WHEN o usuário acionar o botão de login com Google, THE Serviço_Autenticacao SHALL iniciar o fluxo OAuth do Google com redirecionamento para a origem atual da aplicação.
5. WHILE o fluxo de login estiver em andamento, THE Sistema_React SHALL exibir o estado de carregamento no controle de login.
6. IF ocorrer erro durante o login com Google, THEN THE Sistema_React SHALL exibir uma notificação de erro e restaurar o controle de login ao estado interativo.
7. WHEN o Serviço_Autenticacao emitir o evento de autenticação `SIGNED_IN` para um usuário ainda não processado, THE Sistema_React SHALL exibir a Tela_Principal e carregar os Pontos do usuário.
8. WHEN o Serviço_Autenticacao emitir o evento de autenticação `SIGNED_OUT`, THE Sistema_React SHALL exibir a Tela_Login.
9. THE Sistema_React SHALL ignorar os eventos de autenticação `TOKEN_REFRESHED`, `INITIAL_SESSION` e `USER_UPDATED` para evitar recarregamentos desnecessários.
10. WHEN uma sessão de usuário for confirmada, THE Serviço_Autenticacao SHALL garantir a existência do perfil do usuário na base de dados, criando-o quando ausente.

### Requirement 4: Registro de Ponto

**User Story:** Como usuário, quero registrar um ponto informando data e hora, para que meus horários de trabalho sejam armazenados.

#### Acceptance Criteria

1. THE Tela_Principal SHALL exibir um campo de data no formato dd/mm/yyyy e um campo de hora no formato HH:mm.
2. WHEN a Tela_Principal for exibida, THE Sistema_React SHALL preencher o campo de data com a data atual e o campo de hora com a hora atual no fuso local em formato de 24 horas.
3. THE Sistema_React SHALL fornecer um seletor de data em português para o campo de data.
4. IF o campo de data ou o campo de hora estiver vazio quando o registro for acionado, THEN THE Sistema_React SHALL exibir uma notificação informando que data e hora devem ser preenchidas e não realizar o registro.
5. IF nenhum usuário autenticado estiver disponível quando o registro for acionado, THEN THE Sistema_React SHALL exibir uma notificação informando que o login é necessário e não realizar o registro.
6. WHEN o usuário acionar o registro com data e hora válidas e usuário autenticado, THE Serviço_Batidas SHALL persistir o Ponto associado ao usuário.
7. WHILE o registro estiver em processamento, THE Sistema_React SHALL exibir o estado de carregamento no botão de registrar e impedir novos acionamentos.
8. WHEN um registro for concluído com sucesso e houver conexão de rede, THE Sistema_React SHALL exibir uma notificação de sucesso e atualizar a lista de Pontos.
9. IF o registro falhar, THEN THE Sistema_React SHALL exibir uma notificação de erro solicitando nova tentativa.
10. WHEN um registro for realizado sem conexão de rede, THE Sistema_React SHALL exibir uma notificação informando que o Ponto será sincronizado ao voltar online.

### Requirement 5: Listagem e Agrupamento de Pontos

**User Story:** Como usuário, quero visualizar meus pontos agrupados por dia com o total de horas, para que eu acompanhe minhas jornadas.

#### Acceptance Criteria

1. WHEN os Pontos do usuário forem carregados, THE Sistema_React SHALL exibir os Pontos agrupados por dia.
2. THE Sistema_React SHALL calcular o total de minutos trabalhados por dia a partir das horas registradas naquele dia.
3. THE Sistema_React SHALL exibir o total de tempo por dia formatado no padrão HH:MM.
4. WHILE os Pontos estiverem sendo carregados, THE Sistema_React SHALL exibir um estado de carregamento do tipo esqueleto (skeleton) na área da lista.
5. WHEN a lista de Pontos não contiver registros, THE Sistema_React SHALL exibir a área de lista vazia sem erro.
6. THE Sistema_React SHALL exibir, para cada Ponto, um controle de exclusão associado ao registro correspondente.

### Requirement 6: Exclusão de Pontos

**User Story:** Como usuário, quero excluir um registro específico ou apagar todos os registros, para que eu corrija lançamentos indevidos.

#### Acceptance Criteria

1. WHEN o usuário acionar a exclusão de um Ponto específico, THE Sistema_React SHALL exibir um modal de confirmação antes de excluir.
2. WHEN o usuário confirmar a exclusão de um Ponto específico, THE Serviço_Batidas SHALL remover o Ponto correspondente.
3. WHEN uma exclusão individual for concluída com sucesso, THE Sistema_React SHALL exibir uma notificação de sucesso e atualizar a lista de Pontos.
4. IF a exclusão individual falhar, THEN THE Sistema_React SHALL exibir uma notificação de erro e restaurar a lista de Pontos ao estado anterior à exclusão.
5. WHEN o usuário acionar o menu de opções, THE Sistema_React SHALL exibir um modal com a opção de apagar todos os Pontos.
6. WHEN o usuário confirmar a exclusão de todos os Pontos, THE Serviço_Batidas SHALL remover todos os Pontos do usuário.
7. WHERE atualizações otimistas forem aplicadas na exclusão, THE Sistema_React SHALL remover o Ponto da interface imediatamente e reverter a remoção caso a operação falhe.

### Requirement 7: Suporte Offline e Sincronização

**User Story:** Como usuário, quero registrar pontos mesmo sem conexão, para que meus horários não sejam perdidos e sejam sincronizados automaticamente ao voltar online.

#### Acceptance Criteria

1. WHEN um Ponto for registrado sem conexão de rede, THE Serviço_Fila_Offline SHALL armazenar o Ponto na Fila_Offline em `localStorage`.
2. WHEN a conexão de rede for restabelecida, THE Serviço_Batidas SHALL processar a Fila_Offline sincronizando os Pontos pendentes.
3. WHEN a sincronização concluir com um ou mais Pontos sincronizados com sucesso, THE Sistema_React SHALL exibir uma notificação com a quantidade sincronizada e atualizar a lista de Pontos.
4. IF um ou mais Pontos falharem na sincronização, THEN THE Sistema_React SHALL exibir uma notificação de falha e reagendar nova tentativa de sincronização enquanto houver conexão.
5. WHEN a Fila_Offline for alterada, THE Sistema_React SHALL atualizar o Badge_Pendencias com a quantidade de Pontos pendentes do usuário.
6. WHILE não houver Pontos pendentes, THE Sistema_React SHALL ocultar o Badge_Pendencias.
7. THE Serviço_Fila_Offline SHALL limitar as tentativas de sincronização de um Ponto a um máximo de 3 tentativas antes de marcá-lo como erro permanente.

### Requirement 8: Indicador de Status de Conexão

**User Story:** Como usuário, quero visualizar meu status de conexão, para que eu saiba se estou online ou offline.

#### Acceptance Criteria

1. WHEN a Tela_Principal for exibida, THE Sistema_React SHALL indicar o status de conexão atual como online ou offline.
2. WHEN a conexão de rede for restabelecida, THE Sistema_React SHALL atualizar o indicador para o estado online e exibir uma notificação de reconexão.
3. WHEN a conexão de rede for perdida, THE Sistema_React SHALL atualizar o indicador para o estado offline e exibir uma notificação informando o modo offline.

### Requirement 9: Atualização ao Focar a Aba

**User Story:** Como usuário, quero que meus pontos sejam atualizados ao retornar à aba, para que eu veja dados recentes sem recarregar manualmente.

#### Acceptance Criteria

1. WHEN a aba do Aplicativo se tornar visível e houver conexão de rede e usuário autenticado, THE Sistema_React SHALL recarregar os Pontos do usuário e atualizar o Badge_Pendencias.
2. IF a última atualização por foco ocorreu há menos de 60 segundos, THEN THE Sistema_React SHALL ignorar a nova atualização por foco.
3. IF não houver conexão de rede quando a aba se tornar visível, THEN THE Sistema_React SHALL não realizar a atualização por foco.

### Requirement 10: Notificações e Ícones

**User Story:** Como usuário, quero receber feedback visual das minhas ações, para que eu entenda o resultado das operações.

#### Acceptance Criteria

1. THE Sistema_React SHALL exibir notificações de sucesso, informação e erro por meio de uma biblioteca de notificações compatível com React.
2. THE Sistema_React SHALL exibir ícones por meio de uma biblioteca de ícones compatível com React equivalente aos ícones atuais.
3. WHEN uma operação resultar em sucesso, informação ou erro, THE Sistema_React SHALL exibir a notificação correspondente com mensagem equivalente ao comportamento atual.

### Requirement 11: Preservação das Capacidades de PWA

**User Story:** Como usuário, quero continuar instalando o aplicativo e usá-lo offline, para que a experiência de PWA seja mantida após a migração.

#### Acceptance Criteria

1. THE Aplicativo SHALL permanecer instalável como PWA com o manifesto e ícones atuais.
2. THE Aplicativo SHALL manter o registro do service worker com estratégia de atualização automática.
3. THE Aplicativo SHALL manter o cache em runtime da API do Supabase com estratégia NetworkFirst equivalente à configuração atual.
4. THE Aplicativo SHALL manter o cache em runtime das fontes do Google equivalente à configuração atual.
5. WHEN o Aplicativo for aberto sem conexão de rede após instalação, THE Aplicativo SHALL carregar a interface a partir do cache do service worker.

### Requirement 12: Paridade Funcional e de Comportamento

**User Story:** Como usuário, quero que o aplicativo se comporte exatamente como antes da migração, para que minha rotina de uso não seja afetada.

#### Acceptance Criteria

1. THE Sistema_React SHALL preservar todas as funcionalidades observáveis pelo usuário existentes antes da migração.
2. THE Sistema_React SHALL preservar os formatos de dados de data (dd/mm/yyyy) e hora (HH:mm) usados na persistência e na exibição.
3. THE Sistema_React SHALL preservar a estrutura de dados da Fila_Offline em `localStorage` de modo que Pontos pendentes registrados antes da migração permaneçam sincronizáveis após a migração.
4. THE Sistema_React SHALL preservar as mensagens de notificação em português equivalentes às mensagens atuais.
