# Desafio Full-stack — Dokimos Lite (ObraFlow)

## Contexto

O **ObraFlow** é uma plataforma para empresas do setor de construção civil, com arquitetura **multi-tenant**: cada empresa (tenant) enxerga apenas os seus próprios dados.

O **Dokimos** é o serviço de aprovações do ObraFlow: pedidos de compra circulam por uma **alçada** (cadeia de aprovadores) definida por obra e por valor. Em produção, uma regra simples é:

```text
Obra 1 — valor até R$ 10.000,00  → Maria aprova sozinha
Obra 1 — valor acima de R$ 10.000 → Maria aprova e, em seguida, João aprova
```

Neste desafio você vai construir a **versão simplificada** desse fluxo: as telas de um sistema de pedidos de compra com aprovação por alçada.

> **O back-end é obrigatório e deve ser desenvolvido por você.** Não entregaremos API, banco de dados, mock ou regras de alçada prontos. A solução precisa implementar o fluxo completo: persistência, regras de aprovação, isolamento por tenant e as telas que o consomem.

---

# Tecnologias

A stack é **livre**. Escolha as tecnologias de front-end, back-end, banco de dados, ORM, biblioteca de estilos, testes e infraestrutura que considerar mais adequadas.

A única exigência é que a aplicação possa ser executada localmente conforme as instruções do seu `README.md`, sem depender de serviços pagos ou de credenciais externas.

Testes são desejáveis, mas não obrigatórios.

---

# O que você vai construir

Três telas. O layout é livre — **não entregamos Figma, API ou implementação de referência**. O desenho das telas e as decisões de produto são parte da avaliação.

## 1. Cadastro de pedido de compra

```text
┌──────────────────────────────────────────────┐
│  Novo pedido de compra          Tenant: [▾]  │
├──────────────────────────────────────────────┤
│  Obra:            [ Portobelo          ▾ ]   │
│  Fornecedor:      [ Material Norte     ▶ ]   │
│  Descrição:       [ Cimento CP-II 50kg  ▶ ]  │
│  Valor (R$):      [ 12500,00           ▶ ]   │
│  Data:            [ 15/10/2026         ▶ ]   │
│                                              │
│  ⚠ Valor acima de R$ 10.000 — esta obra      │
│  exige aprovação de Maria e João             │
│                                              │
│  [ Cadastrar pedido ]                        │
└──────────────────────────────────────────────┘
```

**Aprovadores previstos** para o valor digitado. A informação deve ser calculada a partir das regras persistidas e exposta pela sua aplicação.

## 2. Aprovação

```text
┌─────────────────────────────────────────────────────┐
│  Pedidos pendentes                                  │
├─────────────────────────────────────────────────────┤
│  #42  Portobelo    R$ 12.500,00    15/10            │
│  Cimento CP-II — Material Norte                     │
│  Alçada: Maria ✓  →  João (aguardando)   [✓] [✗]    │
│                                                     │
│  #43  Alphaville   R$  3.200,00    16/10            │
│  Aço CA-50 — Sider Norte                            │
│  Alçada: Aguardando Maria               [✓] [✗]     │
├─────────────────────────────────────────────────────┤
│  Histórico: #41 aprovado por Maria — 14/10          │
└─────────────────────────────────────────────────────┘
```

* lista de pedidos **pendentes** (sua aplicação deve calcular e persistir em qual nível da alçada cada pedido está);
* aprovar / rejeitar (rejeição exige motivo);
* visualizar a cadeia de aprovadores e quem já passou;
* histórico.

## 3. Regras da alçada

```text
┌─────────────────────────────────────────────────────────────┐
│  Regras da alçada                       Obra: [ Portobelo ▾]│
├─────────────────────────────────────────────────────────────┤
│  Até R$ 10.000,00                                            │
│  Aprovador(es): [ Maria   ▾ ]  [ + adicionar ]              │
│                                                             │
│  Acima de R$ 10.000,00                                       │
│  Aprovador(es): [ Maria   ▾ ]  [ João  ▾ ]  [ + adicionar ] │
│                                                             │
│  [ Salvar regra ]                                           │
├─────────────────────────────────────────────────────────────┤
│  Usuários disponíveis: Maria, João, Carlos, Ana             │
└─────────────────────────────────────────────────────────────┘
```

Aqui você **associa usuários a uma obra e a qual nível da alçada** eles pertencem — a mesma ideia da regra hierárquica do Dokimos. A UI pode ser a que você desenhar (lista de níveis, tabela, etc.), desde que seja clara e permita:

* criar / editar / remover níveis e aprovadores;
* definir o valor-limite de cada nível;
* listar as regras já salvas por obra.

---

# Backend e persistência

Você deve projetar e implementar a API (ou outro mecanismo de comunicação entre front-end e servidor) e a persistência necessários para suportar o desafio. O contrato, as rotas e o formato dos dados são livres, desde que atendam aos comportamentos abaixo:

* cadastrar e listar tenants, obras, usuários, pedidos e regras de alçada;
* criar pedidos e determinar a cadeia de aprovadores conforme a obra e o valor;
* registrar aprovações e rejeições, incluindo o motivo obrigatório de rejeição;
* impedir decisões fora da ordem da alçada e preservar o histórico;
* criar, editar, remover e consultar níveis e aprovadores das regras por obra;
* garantir que todas as leituras e escritas sejam isoladas por tenant.

Inclua dados de demonstração suficientes para avaliar o fluxo e o isolamento: ao menos 2 tenants, 2 obras por tenant, usuários, regras e pedidos em diferentes estados.

Documente no `README.md` como iniciar a aplicação, popular os dados (quando aplicável) e consumir a API. Se optar por expor uma API HTTP, documente também os principais endpoints e payloads.

---

# Multi-tenancy

Herdado do ObraFlow e **obrigatório na tela**:

```text
construtora-a → Portobelo, Alphaville      (pedidos e regras próprios)
construtora-b → Reserva do Parque, Jardim Central
```

* O seletor de tenant está visível nas três telas;
* trocar de tenant recarrega obras, pedidos e regras do tenant novo;
* **um tenant nunca pode exibir nem alterar dados do outro**. Esse isolamento deve ser garantido no back-end, e não apenas pela filtragem da interface.

---

# Validações e erros (exigidos)

| Situação | Comportamento esperado |
|---|---|
| Valor inválido / negativo / não-numérico | erro no campo, mensagem compreensível, não envia |
| Campos vazios (obra, fornecedor, descrição) | idem |
| `tenant` sem obras | empty state amigável, não tela branca |
| API fora do ar / 500 | estado de erro com opção de tentar novamente |
| Rejeitar sem motivo | validação antes do submit |
| Cadeia de alçada já concluída | botão de decisão desabilitado + explicação |

Loading state é obrigatório em toda lista.

---

# Entrega

O repositório deve conter instruções claras para instalar dependências, configurar o ambiente e iniciar a solução completa (front-end, back-end e banco de dados, quando aplicável). O método de execução é livre; `docker compose` é aceito, mas não obrigatório.

Repositório deve conter:

* código-fonte do front-end e do back-end;
* dados de demonstração e instruções para criá-los ou carregá-los;
* `README.md` com **"## Decisões técnicas"** explicando:
  * as tecnologias escolhidas e os motivos da escolha;
  * como a regra de alçada é modelada, calculada e persistida;
  * como o front-end se comunica com o back-end;
  * como o isolamento de tenant é garantido no servidor;
  * o que mudaria em produção;
* 3 a 5 min de **Loom** (ou prints) percorrendo as três telas e o fluxo completo de aprovação.

---

# Avaliação

| Critério | Peso |
|---|---:|
| Funcionamento completo: front-end, back-end e persistência | 25% |
| Modelagem e implementação das regras de alçada e do isolamento por tenant | 20% |
| Qualidade de código, organização e decisões técnicas | 15% |
| **Desenho de UI: hierarquia, clareza, consistência** | 15% |
| Estados (loading / empty / erro), responsividade e validações | 10% |
| Documentação (`## Decisões técnicas`) | 10% |
| Testes (diferencial) | 5% |

**Tempo estimado: 5 a 8 horas.** IA é permitida — mas você precisará explicar cada decisão na entrevista de 30 min.

---

## Contato

Envie o link do repositório + Loom em até 5 dias. Boa sorte! 🚀
