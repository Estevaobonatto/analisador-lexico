# Documentacao do Projeto: Analisador Lexico

## 1. Visao Geral

Este projeto e um **analisador lexico** que constroi um **Automato Finito Deterministico (DFA)** em tempo real. Conforme o usuario insere palavras, o sistema cria automaticamente a estrutura de estados e transicoes e exibe uma tabela visual do automato.

**Tecnologias:**
- HTML5 + CSS3 (interface visual)
- jQuery 3.7.1 (manipulacao do DOM)
- JavaScript puro (logica do automato)

**Conceito chave:** O automato e implementado como uma **trie** (arvore de prefixos). Palavras que compartilham prefixos tambem compartilham estados na matriz, evitando duplicacao.

---

## 2. Estrutura da Matriz (Trie)

A matriz e a estrutura central do projeto. E um array de objetos onde:

- Cada **indice do array** = um **estado** (q0, q1, q2...)
- Cada **chave do objeto** = uma **letra** ('a' a 'z')
- Cada **valor** = o **numero do proximo estado**

```
matriz = [
   0: { 'c': 1 },           ← q0: ao ler 'c', vai pra q1
   1: { 'a': 2 },           ← q1: ao ler 'a', vai pra q2
   2: { 's': 3, 'r': 5 },  ← q2: 's' vai pra q3, 'r' vai pra q5
   3: { 'a': 4 },           ← q3: ao ler 'a', vai pra q4
   4: {},                   ← q4: estado final (vazio, aponta pra ninguem)
   5: { 'r': 6, 'o': 7 }   ← q5 em diante...
]
```

**Regras:**
- `q0` (indice 0) e sempre o estado inicial
- Se a linha tiver um indice em `estadosFinais`, aquele estado tem um `*` na tabela
- Se nao existe transicao para uma letra, o valor e `-` na tabela (indefinido na matriz)

---

## 3. Exemplo Passo a Passo

### Inserir "casa"

**Antes:** matriz vazia `[]`

**Passo 1 — letra 'c':**
```
q0 nao existe → cria q0 como array vazio
q0['c'] = 1 (aponta pro final da matriz, que sera o novo estado)
matriz vira: [ { 'c': 1 } ]
posicao_atual = 1 (proximo estado)
```

**Passo 2 — letra 'a':**
```
q1 nao existe → cria q1 como array vazio
q1['a'] = 2
matriz vira: [ { 'c': 1 }, { 'a': 2 } ]
posicao_atual = 2
```

**Passo 3 — letra 's':**
```
q2 nao existe → cria q2 como array vazio
q2['s'] = 3
matriz vira: [ { 'c': 1 }, { 'a': 2 }, { 's': 3 } ]
posicao_atual = 3
```

**Passo 4 — letra 'a':**
```
q3 nao existe → cria q3 como array vazio
q3['a'] = 4
matriz vira: [ { 'c': 1 }, { 'a': 2 }, { 's': 3 }, { 'a': 4 } ]
posicao_atual = 4
```

**Final:**
```
cria linha q4 (vazia) → q4 vira estado final
matriz final: [ { 'c': 1 }, { 'a': 2 }, { 's': 3 }, { 'a': 4 }, {} ]
estadosFinais = [4]
```

**Tabela gerada:**

| δ | a | b | c | d | ... | s | ... | z |
|---|---|---|---|---|---|---|---|---|
| q0 | - | - | q1 | - | ... | - | ... | - |
| q1 | q2 | - | - | - | ... | - | ... | - |
| q2 | - | - | - | - | ... | q3 | ... | - |
| q3 | q4 | - | - | - | ... | - | ... | - |
| *q4 | - | - | - | - | ... | - | ... | - |

---

### Inserir "carro" (depois de "casa")

Agora "ca" ja existe. A insercao vai bifurcar a partir de q2:

**Passo 1 — letra 'c':**
```
q0 ja existe e q0['c'] ja existe → mesma_palavra = true
posicao_atual = q0['c'] = 1 (segue o caminho existente)
```

**Passo 2 — letra 'a':**
```
q1 ja existe e q1['a'] ja existe → mesma_palavra = true
posicao_atual = q1['a'] = 2
```

**Passo 3 — letra 'r':**
```
q2 ja existe mas q2['r'] nao existe → mesma_palavra = false
q2['r'] = matriz.length (que e 5)
posicao_atual = 5
```

**Matriz apos inserir "carro":**
```
[ { 'c': 1 },
  { 'a': 2 },
  { 's': 3, 'r': 5 },   ← q2 agora tem duas saidas
  { 'a': 4 },
  {},
  { 'r': 6 },            ← q5 (nova)
  { 'o': 7 },            ← q6 (nova)
  {} ]                   ← q7 (estado final de "carro")

estadosFinais = [4, 7]
```

---

## 4. Variaveis Globais

| Variavel | Tipo | Descricao |
|---|---|---|
| `ESTADO_PADRAO` | const (0) | Estado inicial do automato |
| `TAMANHO_ALFABETO` | const (26) | Quantidade de letras (a-z) |
| `matriz` | array | Estrutura principal do automato (trie) |
| `listaPalavras` | array | Lista de palavras inseridas pelo usuario |
| `tamanho_automato` | number | Comprimento atual da matriz |
| `tamanho_tabela` | number | Tamanho da tabela renderizada |
| `estadosFinais` | array | Indices dos estados que sao finais |
| `ESTADO` | number | Estado atual (usado na busca) |

---

## 5. Funcoes

### `iniciarMatriz()`

**O que faz:** Reinicia a matriz como um array vazio.

**Quando e chamada:** Logo no inicio, quando a pagina carrega.

**Codigo:**
```js
function iniciarMatriz() {
    matriz = [];
}
```

**Explicacao:** Sempre que a pagina e carregada, a matriz precisa comecar vazia. Nao ha estados nem transicoes. Conforme o usuario for inserindo palavras, a matriz cresce dinamicamente.

---

### `inserirPalavra(palavra)`

**O que faz:** Ponto de entrada para adicionar uma nova palavra ao sistema. Valida a palavra, depois coordena as tres etapas: inserir na lista visual, inserir na matriz, atualizar a tabela.

**Parametro:** `palavra` — string digitada pelo usuario.

**Fluxo:**
```
1. Valida se palavra ja existe na lista → se sim, cancela
2. Valida se palavra esta vazia → se sim, cancela
3. Valida se palavra tem apenas letras a-z → se nao, cancela
4. Chama inserirNaLista(palavra)
5. Chama adicionarNaMatriz(palavra)
6. Chama atualizarTabela()
7. Limpa o input
```

**Validacoes:**
```js
if(listaPalavras.includes(palavra) || palavra == "") return;
if(!/^[a-z]+$/.test(palavra)) return;
```
- A primeira linha verifica duplicata e string vazia
- A segunda linha usa regex: `^[a-z]+$` significa "do inicio ao fim, apenas letras minusculas"

---

### `inserirNaLista(palavra)`

**O que faz:** Adiciona a palavra visualmente na lista de palavras inseridas, abaixo dos inputs.

**Parametro:** `palavra` — string para exibir.

**Como funciona:**
```js
listaPalavras.push(palavra)
let tamanho_lista = listaPalavras.length - 1;

let _container = $("#word-list").append(
    `<div class='word-list-container' id='word-list-container-${tamanho_lista}'></div>`
)

let _palavra = $(`#word-list-container-${tamanho_lista}`).append(
    `<p class='word-in-list' id='word-${tamanho_lista}'>${listaPalavras[tamanho_lista]}</p>`
)
```

**Passo a passo:**
1. Adiciona `palavra` ao array `listaPalavras`
2. Calcula o indice da palavra recem inserida (`tamanho_lista`)
3. Cria uma div com ID unico: `word-list-container-{indice}`
4. Dentro dela, cria um paragrafo com a palavra: `word-{indice}`

**Exemplo visual gerado:**
```html
<div id="word-list">
  <div class="word-list-container" id="word-list-container-0">
    <p class="word-in-list" id="word-0">casa</p>
  </div>
  <div class="word-list-container" id="word-list-container-1">
    <p class="word-in-list" id="word-1">carro</p>
  </div>
</div>
```

---

### `buscarNaLista(palavra)`

**O que faz:** Verifica se uma palavra ja existe na lista.

**Parametro:** `palavra` — string para buscar.

**Retorno:** `true` se existe, `false` se nao.

```js
function buscarNaLista(palavra) {
    return listaPalavras.includes(palavra);
}
```

**Nota:** Esta funcao existe mas nao e usada ativamente no codigo. A verificacao de duplicata e feita diretamente em `inserirPalavra` com `listaPalavras.includes(palavra)`.

---

### `adicionarNaMatriz(palavra)`

**O que faz:** Coracao do projeto. Constroi a matriz de transicao (trie) a partir da palavra.

**Parametro:** `palavra` — string para adicionar ao automato.

**Explicacao detalhada:**

```js
function adicionarNaMatriz(palavra) {
    let mesma_palavra = true; // sera que ja existe caminho?
    let tamanho = palavra.length
    let posicao_atual = ESTADO_PADRAO; // comeca em q0
```

**`mesma_palavra`:** Esta flag e CRUCIAL para o funcionamento correto. Ela comeca como `true`, assumindo que a palavra ja existe. Se em qualquer letra for necessario criar um novo estado, ela vira `false` e, a partir dai, todas as letras seguintes vao para o final da matriz.

```js
    for(let i = 0; i < tamanho; i++) {
        tamanho_automato = matriz.length
        let letra = palavra[i];
```

O loop percorre cada letra da palavra. A cada iteracao:
1. `tamanho_automato` recebe o tamanho atual da matriz
2. `letra` recebe o caractere atual

```js
        if(!matriz[posicao_atual]) {
```

**Cenario 1 — Estado nao existe:** Se `matriz[posicao_atual]` e `undefined`, significa que o estado atual nao foi criado ainda. Isso acontece quando a palavra e a primeira a ser inserida.

```js
            mesma_palavra = false;
            matriz.push([]);
            posicao_atual = matriz.length - 1;
            matriz[posicao_atual][letra] = posicao_atual + 1;
```

O que acontece aqui:
1. `mesma_palavra = false` — acabamos de criar algo novo
2. `matriz.push([])` — cria uma nova linha (o estado atual agora existe)
3. `posicao_atual = matriz.length - 1` — atualiza para o indice do estado que acabamos de criar
4. `matriz[posicao_atual][letra] = posicao_atual + 1` — aponta a letra para o PROXIMO estado (que sera criado na proxima iteracao)

```js
        } else if(!matriz[posicao_atual][letra]) {
```

**Cenario 2 — Estado existe mas a letra nao:** O estado ja foi criado (por uma palavra anterior), mas a letra especifica ainda nao tem transicao.

```js
            mesma_palavra = false;
            matriz[posicao_atual][letra] = matriz.length;
```

1. `mesma_palavra = false` — estamos criando um caminho novo
2. `matriz[posicao_atual][letra] = matriz.length` — aponta a letra para o final da matriz (onde o novo estado sera criado)

```js
        // Avanca a posicao para o proximo estado
        tamanho_automato = matriz.length
        if(!mesma_palavra)
            posicao_atual = tamanho_automato; // vai pro fim
        else
            posicao_atual = matriz[posicao_atual][letra]; // segue o caminho existente
```

Aqui a magica acontece:
- Se `mesma_palavra` e `false`, a proxima posicao e sempre o final da matriz (criando novos estados)
- Se `mesma_palavra` e `true`, a proxima posicao segue o caminho ja existente na matriz

```js
    // Apos o loop, cria o estado final
    const estado_final = matriz.length - 1;
    matriz.push([]); // linha vazia para o estado final
    estadosFinais.push(estado_final + 1)
    tamanho_automato++;
}
```

Depois que todas as letras foram processadas:
1. `estado_final` guarda o ultimo indice antes de adicionar a nova linha
2. `matriz.push([])` — adiciona uma linha vazia (ninguem aponta pra ela, ela e apenas um marcador)
3. `estadosFinais.push(estado_final + 1)` — registra que o estado recem-criado e final

---

### `atualizarTabela()`

**O que faz:** Reconstrói toda a tabela HTML a partir dos dados da matriz.

**Como funciona:**

```js
$("#table-body").empty();
```

1. **Limpa a tabela:** Remove todas as linhas anteriores do `tbody`.

```js
for(let linha = 0; linha < matriz.length; linha++) {
    let posicao_atual = linha;
    let id_linha = `matrix-instance-${linha}`;

    $('#table-body').append(`<tr id=${id_linha}></tr>`);
    let estado_atual = `q${linha}`;
```

2. **Para cada estado (linha da matriz):**
   - Cria um ID unico: `matrix-instance-{indice}`
   - Cria uma nova linha `<tr>` na tabela
   - O nome do estado e `q{indice}` (ex: q0, q1, q2)

```js
    estadosFinais.map(v => {
        if(linha == v) {
            estado_atual = `*` + estado_atual;
        }
    });
```

3. **Verifica se e estado final:** Se o indice atual esta em `estadosFinais`, adiciona `*` na frente (ex: `*q4`).

```js
    $(`#${id_linha}`).append(`<td class='table-terminal-head'>${estado_atual}</td>`);
```

4. **Primeira coluna (δ):** Insere o nome do estado.

```js
    for(let i = 0; i < TAMANHO_ALFABETO; i++) {
        let letra = String.fromCharCode('a'.charCodeAt(0) + i);
        let celula;

        if(!matriz[posicao_atual] || !matriz[posicao_atual][letra]) {
            estado = `-`;
            celula = `<td class='table-cell cell-q${posicao_atual}-${letra}'> ${estado} </td>`;
        } else {
            estado = `q${matriz[posicao_atual][letra]}`;
            celula = `<td class='table-cell cell-q${posicao_atual}-${letra}' id='table-state-${estado}'> ${estado} </td>`;
        }

        $(`#${id_linha}`).append(celula);
    }
```

5. **Colunas de 'a' a 'z':**
   - Gera cada letra com `String.fromCharCode`
   - Se a matriz nao tem transicao para aquela letra → mostra `-`
   - Se tem → mostra o estado destino (`q{numero}`)
   - Cada celula recebe a classe `cell-q{linha}-{letra}` para identificacao na busca

---

### `buscar(palavra)`

**O que faz:** Percorre a palavra na matriz e destaca as transicoes na tabela com cores.

**Parametro:** `palavra` — string digitada no campo de busca.

```js
let estado_selecionado = ESTADO = 0;

$("#lexical-table tbody tr td").removeClass("correct-cell");
$("#lexical-table tbody tr td").removeClass("wrong-cell");
$("#lexical-table tbody tr td").removeClass("selection-cell");
```

1. **Preparacao:**
   - Comeca do estado 0
   - Remove todas as cores antigas da tabela

```js
for(let i = 0; i < palavra.length; i++) {
    // Remove cores novamente (necessario a cada letra)
    ...
```

2. **Para cada letra da palavra:**
   - As classes sao removidas novamente a cada iteracao (para "redesenhar" o caminho)

```js
    if(matriz[estado_selecionado][palavra[i]] !== undefined) {
```

3. **Transicao valida:** Se existe um caminho para esta letra no estado atual:
   - Pega a celula de destino (`#table-state-q{numero}`)
   - Adiciona `correct-cell` (verde) — a celula que mostra o estado para onde vai

```js
        for(let j = 0; j < TAMANHO_ALFABETO; j++) {
            const letra = String.fromCharCode('a'.charCodeAt(0) + j);
            $(`.cell-q${estado_selecionado}-${letra}`).addClass("selection-cell");
        }
```

4. **Destaca a linha inteira:** Todas as celulas da linha atual recebem `selection-cell` (cinza claro).

```js
        let qtd_estados = matriz.length;
        for(let j = 0; j < qtd_estados; j++) {
            $(`.cell-q${j}-${palavra[i]}`).addClass("selection-cell");
        }
```

5. **Destaca a coluna inteira:** Todas as celulas da mesma letra em todos os estados recebem `selection-cell`.

```js
        estado_selecionado = matriz[estado_selecionado][palavra[i]];
```

6. **Avança:** Atualiza o estado atual para o proximo na matriz.

```js
    } else {
        $(`.cell-q${estado_selecionado}-${palavra[i]}`).addClass("wrong-cell");
        break;
    }
```

7. **Transicao invalida:** Se nao existe caminho, pinta a celula de vermelho (`wrong-cell`) e **para** o loop com `break`.

---

### `processarEntrada(entrada)`

**O que faz:** Divide uma string por espacos e retorna um array de palavras.

**Parametro:** `entrada` — string com palavras separadas por espaco.

**Retorno:** Array de palavras (strings nao vazias).

```js
function processarEntrada(entrada) {
    return entrada.split(' ').filter(palavra => palavra.length > 0);
}
```

**Exemplo:**
```js
processarEntrada("casa carro bola")
// retorna: ["casa", "carro", "bola"]
```

**Nota:** Esta funcao nao e usada atualmente no projeto, mas existe para futura implementacao de insercao em lote.

---

## 6. Mapa de Classes CSS

Cada classe CSS tem um papel especfico na interacao com o JavaScript:

| Classe CSS | Onde e usada no JS | Efeito visual |
|---|---|---|
| `correct-cell` | `buscar()` — quando a transicao existe | Fundo verde claro, texto verde escuro, borda verde |
| `wrong-cell` | `buscar()` — quando a transicao nao existe | Fundo vermelho claro, texto vermelho escuro, borda vermelha |
| `selection-cell` | `buscar()` — linha e coluna da letra atual | Fundo cinza claro |
| `table-terminal-head` | `atualizarTabela()` — primeira coluna | Fundo cinza, negrito |
| `table-cell` | `atualizarTabela()` — celulas normais | Borda fina cinza |
| `cell-q{n}-{letra}` | `buscar()` — selecionar celula especifica | Usada como seletor jQuery |

**Exemplo de seletor:**
```js
// Marca a celula da linha 3, coluna 's' como errada
$(`.cell-q3-s`).addClass("wrong-cell");
```

---

## 7. Fluxograma Completo

```
Pagina carrega
       ↓
iniciarMatriz() → matriz = []
       ↓
Aguardando interacao do usuario
       ↓
┌─────────────────────────────────────┐
│ Usuario digita "casa" e aperta Enter │
└─────────────┬───────────────────────┘
              ↓
         inserirPalavra("casa")
              ↓
         Valida: vazia? ja existe? caracteres validos?
              ↓
         ┌────┴────┐
         │ INVALIDA │ → cancela (console.log apenas)
         └────┬────┘
              ↓ VALIDA
         inserirNaLista("casa")
              ↓
         Adiciona na lista visual + array listaPalavras
              ↓
         adicionarNaMatriz("casa")
              ↓
         Percorre c → a → s → a
         Cria estados na matriz
         Marca ultimo estado como final
              ↓
         atualizarTabela()
              ↓
         Apaga tabela velha, le a matriz,
         desenha cada estado e cada letra
              ↓
         Input limpo, pronto pra proxima
              ↓
┌─────────────────────────────────────┐
│ Usuario digita "c" no campo de busca │
└─────────────┬───────────────────────┘
              ↓
         buscar("c")
              ↓
         Remove todas as cores da tabela
              ↓
         Procura 'c' em q0 → existe!
              ↓
         Pinta celula destino de verde
         Pinta linha q0 inteira de cinza
         Pinta coluna 'c' inteira de cinza
              ↓
         Avanca para o estado q1
              ↓
         Fim da busca (so tinha 1 letra)
```

---

## 8. Exemplo Completo de Execucao

### Entrada 1: "ab"

```
1. inserirPalavra("ab")
2. Valida: "ab" nao esta vazia, so tem letras, nao existe ainda
3. inserirNaLista → mostra "ab" na lista visual
4. adicionarNaMatriz:

   i=0: letra='a', q0 nao existe → cria q0, q0['a'] = 1
   i=1: letra='b', q1 nao existe → cria q1, q1['b'] = 2
   fim: cria q2 (vazio) → estadoFinal = 2

   matriz = [ {'a': 1}, {'b': 2}, {} ]
   estadosFinais = [2]

5. atualizarTabela():

| δ | a | b | c | d | ... |
|---|---|---|---|---|---|
| q0 | q1 | - | - | - | ... |
| q1 | - | q2 | - | - | ... |
| *q2 | - | - | - | - | ... |
```

### Entrada 2: "ac"

```
1. inserirPalavra("ac")
2. Valida: "ac" nao e duplicata
3. adicionarNaMatriz:

   i=0: letra='a', q0['a'] ja existe → mesma_palavra = true, segue pra q1
   i=1: letra='c', q1['c'] nao existe → q1['c'] = 3 (matriz.length)

   matriz = [ {'a': 1}, {'b': 2, 'c': 3}, {}, {} ]
   estadosFinais = [2, 3]
```

### Busca: "ac"

```
1. buscar("ac")

   i=0: letra='a', q0['a'] = 1 → existe
        → pinta celula q1 de verde
        → pinta linha q0 inteira de cinza
        → pinta coluna 'a' inteira de cinza
        → avanca pra q1

   i=1: letra='c', q1['c'] = 3 → existe
        → pinta celula q3 de verde
        → pinta linha q1 inteira de cinza
        → pinta coluna 'c' inteira de cinza
        → avanca pra q3

   Fim da palavra. Todas as transicoes validas!
```

### Busca: "ad"

```
1. buscar("ad")

   i=0: letra='a', q0['a'] = 1 → existe
        → pinta celula q1 de verde
        → pinta linha q0 inteira de cinza
        → pinta coluna 'a' inteira de cinza
        → avanca pra q1

   i=1: letra='d', q1['d'] = undefined → NAO existe
        → pinta celula q1-d de vermelho
        → break (para)

   Resultado: primeira letra ok, segunda letra errada!
```

---

## 9. Diagrama da Estrutura de Dados

```
         MATRIZ (array de objetos)
         ─────────────────────────

  Indice  |  Conteudo              |  Representacao
  ────────┼────────────────────────┼────────────────
    0     |  { 'a': 1 }            |  q0 --a--> q1
    1     |  { 'b': 2, 'c': 3 }   |  q1 --b--> q2
          |                        |  q1 --c--> q3
    2     |  {}                    | *q2 (final)
    3     |  {}                    | *q3 (final)


         GRAFICO DO AUTOMATO
         ────────────────────

              a         b
    [q0] ────────> [q1] ────> [*q2]
                      |
                      | c
                      ↓
                    [*q3]


         TABELA VISUAL (HTML)
         ────────────────────

    ┌────┬─────┬─────┬─────┬─────┐
    │ δ  │  a  │  b  │  c  │ ... │
    ├────┼─────┼─────┼─────┼─────┤
    │ q0 │ q1  │  -  │  -  │ ... │
    ├────┼─────┼─────┼─────┼─────┤
    │ q1 │  -  │ q2  │ q3  │ ... │
    ├────┼─────┼─────┼─────┼─────┤
    │*q2 │  -  │  -  │  -  │ ... │
    ├────┼─────┼─────┼─────┼─────┤
    │*q3 │  -  │  -  │  -  │ ... │
    └────┴─────┴─────┴─────┴─────┘
```

---

## 10. Resumo

| Conceito | Como o projeto implementa |
|---|---|
| Automato Finito Deterministico | Array de objetos onde cada indice e um estado |
| Trie (arvore de prefixos) | Palavras que compartilham letras iniciais compartilham estados |
| Estado inicial | Sempre q0 (indice 0) |
| Estado final | Indices guardados em `estadosFinais`, mostrados com `*` |
| Transicao | `matriz[estado][letra] = proximoEstado` |
| Busca | Percorre letra por letra, destaca verde/vermelho na tabela |
| Tabela | Renderizada do zero a cada insercao via jQuery |
