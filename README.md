# Click Game

Planejamento de um jogo web minimalista de risco progressivo. A cada clique bem-sucedido, a pontuação sobe em `1` e a chance de falha do próximo clique também sobe em `1%`. A partida termina na primeira falha.

## 1. Visão do produto

O jogo deve criar uma decisão simples e crescente: continuar clicando para buscar um recorde maior, sabendo que cada novo clique fica mais arriscado.

### Objetivo do jogador

Obter a maior pontuação possível antes de falhar.

### Público e plataforma

- Jogo casual para qualquer pessoa.
- Experiência rápida, sem cadastro e sem tutorial longo.
- Site responsivo, priorizando celular, mas igualmente funcional no desktop.
- Uma única página e uma única ação principal.

## 2. Escopo da primeira versão

### Incluído

- Botão vermelho como ação central do jogo.
- Pontuação atual.
- Chance atual de sucesso e de falha.
- Aumento de `1%` na chance de falha após cada sucesso.
- Encerramento imediato da rodada quando ocorre uma falha.
- Tela de resultado com pontuação final, recorde local e opção de reiniciar.
- Recorde salvo no navegador do próprio dispositivo.
- Layout responsivo, navegação por teclado e respeito à preferência de movimento reduzido.

### Fora do escopo

- Login ou contas de usuário.
- Ranking online ou sincronização entre dispositivos.
- Backend ou banco de dados.
- Compras, anúncios, conquistas, níveis ou itens.
- Compartilhamento social.
- Sons na primeira versão.

Esses itens podem ser avaliados depois que a mecânica principal estiver validada.

## 3. Regras do jogo

O número mostrado como pontuação também define a chance de falha do próximo clique.

| Pontuação antes do clique | Chance de sucesso | Chance de falha | Resultado em caso de sucesso |
| ---: | ---: | ---: | ---: |
| 0 | 100% | 0% | Pontuação 1 |
| 1 | 99% | 1% | Pontuação 2 |
| 25 | 75% | 25% | Pontuação 26 |
| 99 | 1% | 99% | Pontuação 100 |
| 100 | 0% | 100% | Falha obrigatória |

### Fluxo de cada clique

1. Ler a pontuação atual, limitada ao intervalo de `0` a `100`.
2. Usar esse valor como a porcentagem de falha.
3. Sortear um número aleatório no intervalo `[0, 100)`.
4. Se o número sorteado for menor que a chance de falha, a rodada termina.
5. Caso contrário, aumentar a pontuação em `1`.
6. Atualizar imediatamente as probabilidades exibidas.

Pseudocódigo:

```ts
const failureChance = Math.min(score, 100)
const failed = Math.random() * 100 < failureChance

if (failed) {
  finishGame(score)
} else {
  setScore(score + 1)
}
```

### Limites e decisões de regra

- O primeiro clique nunca falha, pois começa com `0%` de chance de falha.
- A pontuação final é a quantidade de cliques bem-sucedidos.
- Ao chegar a `100`, o jogador vê `100%` de falha; o próximo clique encerra a partida obrigatoriamente.
- Cliques adicionais durante o processamento de um clique devem ser ignorados, evitando resultados duplicados.
- Reiniciar zera apenas a rodada atual; o recorde permanece salvo.

## 4. Jornada do jogador

### Estado: jogando

A página já abre pronta para jogar, sem uma tela introdutória intermediária.

Elementos visíveis:

- Nome curto do jogo: `Click Game`.
- Pontuação atual em grande destaque.
- Texto `Chance de falha: X%`.
- Texto secundário `Chance de sucesso: Y%`.
- Botão vermelho grande com o rótulo `CLIQUE`.
- Recorde local em posição secundária.

Interação:

- O clique/toque faz o sorteio.
- Em caso de sucesso, a pontuação e as chances mudam com uma transição curta.
- A tecla `Enter` ou `Espaço` ativa o botão quando ele está em foco.

### Estado: fim de jogo

Após uma falha, a área principal é substituída por um painel de resultado:

- Título: `Você falhou`.
- Pontuação final.
- Recorde local atualizado.
- Mensagem `Novo recorde!` somente quando a rodada supera o recorde anterior.
- Botão principal `Tentar novamente`.

Ao reiniciar:

- A pontuação volta para `0`.
- As chances voltam para `100%` de sucesso e `0%` de falha.
- O foco retorna ao botão de clique para permitir uma nova rodada imediata.

## 5. Direção visual

### Conceito

Minimalismo de alto contraste: uma página silenciosa e neutra em que o botão vermelho concentra toda a tensão do jogo. Conforme o risco aumenta, a interface comunica isso pelos números, sem adicionar elementos decorativos desnecessários.

### Composição

- Conteúdo centralizado vertical e horizontalmente.
- Largura máxima aproximada de `480px`.
- Fundo quase branco no tema claro e quase preto no tema escuro.
- Tipografia sem serifa, usando a fonte padrão otimizada do projeto.
- Pontuação muito grande e com numerais tabulares.
- Botão circular ou quase circular, entre `160px` e `220px`, adaptando-se à tela.
- Área clicável mínima de `44px`, já superada pelo botão principal.
- Cantos, sombras e bordas discretos; o vermelho é reservado à ação e à falha.

### Paleta inicial

| Uso | Tema claro | Tema escuro |
| --- | --- | --- |
| Fundo | `#FAFAFA` | `#0A0A0A` |
| Texto principal | `#111111` | `#F5F5F5` |
| Texto secundário | `#666666` | `#A3A3A3` |
| Botão | `#E11D2E` | `#F02D3A` |
| Botão pressionado | `#B91424` | `#D91F2D` |
| Foco | `#2563EB` | `#60A5FA` |

### Movimento e feedback

- Redução sutil de escala enquanto o botão estiver pressionado.
- Pequeno pulso na pontuação após um sucesso.
- Transição curta para a tela final.
- Nenhuma animação essencial para entender o resultado.
- Com `prefers-reduced-motion: reduce`, remover pulsos e deslocamentos.
- Não usar vibração, tremores fortes ou flashes.

## 6. Arquitetura técnica

### Stack

- Next.js com App Router.
- TypeScript.
- React para estado e interação.
- CSS global ou CSS Modules, sem biblioteca visual externa.
- `localStorage` para o recorde local.
- Implantação estática; não há necessidade de servidor para a primeira versão.

### Estrutura proposta

```text
click-game/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── click-game.tsx
├── lib/
│   └── game.ts
├── public/
├── tests/
│   └── game.test.ts
├── package.json
├── next.config.ts
└── README.md
```

### Responsabilidades

- `app/page.tsx`: composição da página e metadados básicos.
- `components/click-game.tsx`: estado da rodada, interações e renderização dos estados.
- `lib/game.ts`: função pura que calcula sucesso ou falha e limita as probabilidades.
- `app/globals.css`: tokens visuais, layout, responsividade e estados de interação.
- `tests/game.test.ts`: testes determinísticos da regra principal.

### Modelo de estado

```ts
type GameStatus = "playing" | "game-over"

type GameState = {
  status: GameStatus
  score: number
  bestScore: number
  isNewRecord: boolean
}
```

Estado derivado, sem armazenamento duplicado:

```ts
const failureChance = Math.min(score, 100)
const successChance = 100 - failureChance
```

### Persistência do recorde

- Chave: `click-game:best-score:v1`.
- Ler o valor apenas no cliente, depois da montagem, para evitar divergência de renderização entre servidor e navegador.
- Aceitar somente inteiros entre `0` e `100`; valores inválidos voltam para `0`.
- Ao terminar a rodada, salvar apenas se `score > bestScore`.
- Se o navegador bloquear o armazenamento, o jogo continua normalmente e mantém o recorde apenas durante a sessão aberta.

### Sorteio testável

A função de regra deve receber o valor aleatório como dependência. Assim, produção usa `Math.random()`, enquanto os testes passam valores conhecidos.

```ts
export function resolveClick(score: number, randomValue: number) {
  const safeScore = Math.max(0, Math.min(Math.trunc(score), 100))
  const failed = randomValue * 100 < safeScore
  return failed
    ? { outcome: "failure" as const, score: safeScore }
    : { outcome: "success" as const, score: safeScore + 1 }
}
```

## 7. Acessibilidade e usabilidade

- Usar um elemento HTML `<button>` real.
- Exibir foco de teclado claramente visível.
- Manter contraste mínimo compatível com WCAG 2.1 AA.
- Associar um `aria-live="polite"` às mudanças de pontuação e um anúncio assertivo ao fim da rodada.
- Não depender somente de cor: sucesso, risco e falha sempre aparecem em texto e números.
- Preservar zoom do navegador e funcionar com texto ampliado a `200%`.
- Garantir uso sem rolagem horizontal a partir de `320px` de largura.
- Considerar as áreas seguras de aparelhos móveis.

## 8. Tratamento de casos especiais

- `localStorage` ausente ou indisponível: continuar sem persistência durável.
- Valor salvo corrompido: ignorar e usar `0`.
- Clique duplo ou toque muito rápido: processar cada evento aceito de forma sequencial; bloquear reentrada durante a atualização.
- Página em segundo plano: nenhuma ação automática; a partida permanece no mesmo estado.
- Atualização da página durante a rodada: a rodada recomeça em `0`, mas o recorde permanece.
- Pontuação `100`: próximo clique sempre falha.

## 9. Plano de implementação

### Etapa 1 — Fundação

- Inicializar o projeto Next.js com TypeScript e App Router.
- Configurar scripts de desenvolvimento, build, lint e teste.
- Criar metadados: título `Click Game` e descrição curta.
- Definir tokens de cor, espaçamento e tipografia.

### Etapa 2 — Motor do jogo

- Implementar `resolveClick` como função pura.
- Cobrir limites de `0%`, `1%`, `99%` e `100%`.
- Definir os estados `playing` e `game-over`.
- Impedir processamento duplicado de cliques.

### Etapa 3 — Interface

- Montar a área principal com pontuação, probabilidades e botão.
- Montar a tela final e o fluxo de reinício.
- Adicionar feedback visual curto para sucesso e falha.
- Ajustar comportamento em celular e desktop.

### Etapa 4 — Recorde local

- Ler, validar e exibir o recorde salvo.
- Atualizar o recorde somente ao superar a melhor pontuação.
- Tratar indisponibilidade do armazenamento sem quebrar o jogo.

### Etapa 5 — Qualidade

- Executar testes automatizados da regra.
- Validar build de produção.
- Testar teclado, foco, leitor de tela e movimento reduzido.
- Testar manualmente nos tamanhos `320px`, `768px` e `1440px`.
- Confirmar ausência de erros no console e rolagem horizontal.

## 10. Estratégia de testes

### Testes unitários

- Pontuação `0` nunca falha para qualquer valor aleatório válido.
- Pontuação `1` falha quando o sorteio está abaixo de `0.01`.
- Pontuação `1` tem sucesso quando o sorteio é igual ou superior a `0.01`.
- Pontuação `99` só tem sucesso no último `1%` do intervalo.
- Pontuação `100` sempre falha.
- Valores de pontuação fora do intervalo são normalizados.

### Testes de interface

- Clique bem-sucedido incrementa a pontuação e atualiza ambas as chances.
- Falha abre a tela final sem incrementar a pontuação.
- Novo recorde é salvo e sinalizado.
- Pontuação igual ao recorde não mostra `Novo recorde!`.
- Reiniciar preserva o recorde e restaura a rodada.
- Teclado consegue jogar e reiniciar sem uso do mouse.

### Teste estatístico opcional

Executar muitas simulações apenas como verificação auxiliar de distribuição. Esse teste deve usar tolerância e não substituir os testes determinísticos de fronteira.

## 11. Critérios de aceite

A primeira versão está concluída quando:

- O jogo abre diretamente com pontuação `0`, sucesso `100%` e falha `0%`.
- O primeiro clique é sempre bem-sucedido.
- Cada sucesso adiciona exatamente `1` ponto e `1%` de chance de falha.
- Uma falha encerra a rodada e mostra a pontuação correta.
- O melhor resultado fica salvo localmente após recarregar a página.
- `Tentar novamente` inicia uma nova rodada sem apagar o recorde.
- O jogo funciona por toque, mouse e teclado.
- A interface funciona a partir de `320px`, sem conteúdo cortado.
- O projeto passa pelos testes, lint e build de produção.
- Não há dependência de backend, conta ou conexão após o carregamento inicial.

## 12. Evoluções futuras

Somente depois da primeira versão estar validada:

- Sequência atual e estatísticas locais de partidas.
- Modos alternativos de progressão de risco.
- Sons e feedback tátil opcionais.
- Compartilhamento de resultado.
- Ranking online com identidade e mecanismos antifraude.
- Instalação como PWA e funcionamento offline completo.

## 13. Ordem recomendada de entrega

1. Mecânica funcional sem animações.
2. Persistência do recorde.
3. Interface responsiva e acessível.
4. Testes e validação de produção.
5. Polimento visual mínimo.

Essa ordem mantém o risco técnico concentrado na regra do jogo e garante que o visual seja refinado somente depois de a experiência principal estar correta.
