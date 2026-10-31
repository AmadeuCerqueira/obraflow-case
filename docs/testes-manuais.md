# Roteiro de testes manuais

Testes feitos à mão, nas três telas, para conferir as regras de alçada e as validações exigidas no desafio.

**Ambiente:** Windows 11, Google Chrome, Node.js 22, em 31/10/2026.
**Antes de começar:** rodar `npm run seed` na pasta `backend`, para os dados voltarem ao estado de demonstração.

**Status:** ✅ passou · ❌ falhou · ⏳ não executado

## 1. Instalação

| ID | Cenário | Passos | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|---|
| CT01 | Instalar e rodar seguindo o README | Clonar a branch `desafio` numa pasta nova e seguir os comandos do README | Back sobe na porta 1036, os 16 testes passam e o front sobe na porta 5173 | Na primeira tentativa, `prisma migrate deploy` falhou: o `.env.example` tinha um texto a mais depois do endereço do banco. Arquivo corrigido; na segunda tentativa, tudo subiu | ✅ |

## 2. Novo pedido

| ID | Cenário | Passos | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|---|
| CT02 | Tela inicial | Abrir a aba Novo pedido | Formulário com um item em branco e a data de hoje preenchida | Conforme esperado | ✅ |
| CT03 | Campos obrigatórios vazios | Sem preencher nada, clicar em "Ver o que falta preencher" | Erro em Obra, Fornecedor, Descrição, Quantidade e Preço. Botão Cadastrar desabilitado | | ⏳ |
| CT04 | Quantidade não numérica | Digitar `abc` na quantidade e sair do campo | Erro "Informe um número válido." no item | | ⏳ |
| CT05 | Quantidade zero ou negativa | Digitar `0` e depois `-5` na quantidade | Erro "Deve ser maior que zero." no item | | ⏳ |
| CT06 | Preço negativo | Digitar `-10` no preço | Erro "Não pode ser negativo." no item | | ⏳ |
| CT07 | Preço zero | Quantidade `5`, preço `0` | Aceito sem erro, total do item R$ 0,00 | | ⏳ |
| CT08 | Quantidade decimal | Quantidade `2,5`, unidade `kg`, preço `10` | Total do item R$ 25,00 | | ⏳ |
| CT09 | Pedido sem itens | Clicar em Remover no único item | Mensagem "O pedido precisa ter pelo menos um item." e botão desabilitado | | ⏳ |
| CT10 | Vários itens | Adicionar 3 itens válidos e remover o do meio | O item some e o total do pedido é recalculado | | ⏳ |
| CT11 | Prévia de quem aprova | Edifício Sol Nascente com total de R$ 12.000. Depois trocar a obra para Edifício Mar Azul | Mostra "Amanda Souza → João Lima" e, depois da troca, "João Lima → Carla Mendes" | | ⏳ |
| CT12 | Cadastrar pedido válido | Sol Nascente, Cimentos Bahia, item Cimento CP-II 50kg, 300 un a R$ 40. Cadastrar | Mensagem de sucesso com o número do pedido e o valor. O formulário volta ao início. Na aba Aprovações, o pedido aparece com a fila Amanda → João | | ⏳ |

## 3. Aprovação

| ID | Cenário | Passos | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|---|
| CT13 | Loading da lista | No DevTools (aba Network), escolher a velocidade "Slow 4G" e recarregar a página | Aparece "Carregando pedidos..." antes da lista | | ⏳ |
| CT14 | Filtros | Clicar em Pendentes, Aprovados, Rejeitados e Todos | Cada filtro mostra só os pedidos daquela situação, com a contagem certa | | ⏳ |
| CT15 | Decisão fora da vez | Como Amanda, abrir o pedido de Ferragens (R$ 12.500) | Botões desabilitados e o aviso "Aguardando a decisão de João Lima" | | ⏳ |
| CT16 | Rejeitar sem motivo | Como Amanda, abrir o pedido de Cimento (R$ 3.200), clicar em Rejeitar e confirmar sem motivo | Erro "Informe o motivo da rejeição." e nada é enviado | | ⏳ |
| CT17 | Rejeitar com motivo | No mesmo pedido, escrever um motivo e confirmar | Pedido fica Rejeitado, o motivo aparece no histórico e os botões ficam desabilitados com explicação | | ⏳ |
| CT18 | Aprovação em ordem | No pedido do CT12: Amanda aprova. Depois, trocar para João Lima e aprovar | Depois da Amanda, continua Pendente e a vez passa para o João. Depois do João, fica Aprovado | | ⏳ |
| CT19 | Cadeia concluída | Abrir um pedido aprovado | Botões desabilitados e o aviso "Cadeia de aprovação concluída..." | | ⏳ |
| CT20 | Histórico | Abrir o pedido do CT18 | Histórico com a criação e as duas aprovações, com data e hora | | ⏳ |

## 4. Regras de alçada

| ID | Cenário | Passos | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|---|
| CT21 | Trocar de obra | Alternar entre Sol Nascente e Mar Azul | A tabela mostra as faixas de cada obra | | ⏳ |
| CT22 | Reordenar aprovadores | Editar a faixa "Acima de R$ 20.000" do Sol Nascente, mover a Carla para o topo com ↑ e salvar | Tabela mostra Carla → Amanda → João | | ⏳ |
| CT23 | Faixa sem aprovador | Nova faixa com teto de R$ 1.000 e nenhum aprovador. Salvar | Erro "Adicione pelo menos um aprovador." | | ⏳ |
| CT24 | Teto repetido | Nova faixa com teto de R$ 5.000 (já existe) e um aprovador. Salvar | Erro "Existem duas faixas com o mesmo valor máximo." | | ⏳ |
| CT25 | Regra mudou, pedido em andamento não | Editar "Até R$ 20.000" do Sol Nascente deixando só a Carla. Abrir o pedido de Ferragens | O pedido continua com a fila antiga: Amanda ✓ → João | | ⏳ |
| CT26 | Remover a faixa sem teto | No Mar Azul, remover "Acima de R$ 10.000" | Faixa removida e alerta de que pedidos acima de R$ 10.000 não poderão ser criados | | ⏳ |
| CT27 | Valor sem regra aplicável | Depois do CT26, novo pedido no Mar Azul de R$ 15.000. Clicar em Cadastrar | Aviso antes do envio e, ao cadastrar, erro "Nenhuma regra de alçada desta obra cobre esse valor..." O pedido não é criado | | ⏳ |

## 5. Estados de erro e vazio

| ID | Cenário | Passos | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|---|
| CT28 | API fora do ar | Parar o back (Ctrl + C) e abrir as três telas. Ligar o back e clicar em "Tentar novamente" | Tela de erro com o botão "Tentar novamente". Depois de ligar o back, os dados carregam | | ⏳ |
| CT29 | Nenhuma obra cadastrada | Parar o back, rodar `npx prisma migrate reset --force` na pasta backend, ligar o back e abrir as três telas | Mensagens amigáveis de "Nenhuma obra cadastrada" e "Nenhum pedido cadastrado", sem tela branca | | ⏳ |

## 6. Celular e tamanho de tela

| ID | Cenário | Passos | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|---|
| CT30 | Telas no celular | DevTools no modo celular (iPhone 16 Pro Max), passar pelas três telas | Menu sem cortar, lista de pedidos em cartões e formulários empilhados | | ⏳ |
| CT31 | Zoom reduzido | Diminuir o zoom do navegador para 50% | O conteúdo fica centralizado com largura máxima, sem esticar de ponta a ponta | | ⏳ |

## Bugs encontrados

| ID | Onde | Problema | Correção |
|---|---|---|---|
| B01 | Instalação (CT01) | O `.env.example` tinha `git add .` grudado no endereço do banco, e o Prisma não conseguia criar o banco em uma instalação nova | Arquivo corrigido para `DATABASE_URL="file:./dev.db"` |