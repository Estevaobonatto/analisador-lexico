const DEFAULT_STATE = 0;
const ALPHABET_SIZE = 26;

let matrix; // (string "abc"): M[0]["a"] = 1, M[1]["b"] = 2, M[2]["c"] = 3 (final),
let wordList = []; // Lista de palavras que estarão presentes no automato
let automata_length = 0; // tamanho matrix
let table_length = 0; // tamanho tabela
let finalStates = []; // listados na tabela

let STATE = DEFAULT_STATE;

$( function() {

  initializeMatrix(); // Array vazio []

  $("#insert-input").val(""); // clear
  $("#search-input").val(""); // clear

  // inserir a palavra no automato e na tabela
    $("#insert-button").click(function() {
      const word = $("#insert-input").val().toLowerCase();
      insertWord(word);
    })

    // Enter
    $('#insert-input').keypress(function (e) {
      if (e.which != 13) return;

      const word = $("#insert-input").val().toLowerCase();
      insertWord(word);
    });

    //buscar palavras
    $("#search-input").keyup(function() {
      const word = $("#search-input").val().toLowerCase();
      search(word);
    });

    
})

function initializeMatrix() {
  matrix = [];
}

// Insere palavra na lista de palavras->automato->tabela
function insertWord(word) {
  console.log(word)
      
  if(wordList.includes(word) || word == "") return;

  if(!/^[a-z]+$/.test(word)) return; //interrompe se tiver letra maiuscula/caracter especial

  //PALAVRAS EXISTENTES
  insertToList(word);

  //MATRIZ DO AUTOMATO FINITO
  appendToMatrix(word);

  //TABELA VISUAL
  updateTable(word);

  $("#insert-input").val("");
}

function insertToList(word) {
    
  wordList.push(word)
  let wordList_length = wordList.length-1; //indice da ultima palavra inserida

  //Containers das palavras visualmente down inserção 
  let _container = $("#word-list").append(`<div class='word-list-container' id='word-list-container-${wordList_length}'></div>`) // div nova no word list
  let _word = $(`#word-list-container-${wordList_length}`).append(`<p class='word-in-list' id='word-${wordList_length}'>${wordList[wordList_length]}</p>`) //id exclusivo cada palavra

}

function findElementInArray(word) { // busca se a palavra existe na lista
  return wordList.includes(word);
}

// Deleta a tabela->search todos os estados e letras na matriz construir a tabela
function updateTable() {

  $("#table-body").empty(); // Limpa tabela anterior se existe

  console.log("MATRIX LENGTH =", matrix.length);

  for(let matrix_row = 0; matrix_row < matrix.length; matrix_row++) { //percorre indices matriz

    let current_position = matrix_row; //armazena a linha processada
    let row_instance = `matrix-instance-${matrix_row}` // vai ser o id da primeira coluna de cada linha da matriz δ

    //////////////////////////////////////////////////////////////
    // Renderizar estados, atribui o id `matrix-instance-{NUMERO}` por celula
    /////////////////////////////////////////////////////////////
    
    $('#table-body').append(`<tr id=${row_instance}></tr>`) // atribui o id da primeira coluna a cada linha novamente
    let current_state = `q${matrix_row}`;
    
    // Itera pelos estados finais se eles correspondem à variavel matrix_row
    finalStates.map(val => {
      if(matrix_row == val) {
        current_state = `*` + current_state
      }
    })
    
    $(`#${row_instance}`).append(`<td class='table-terminal-head'>${current_state}</td>`); // atribui variavel do q{ESTADO}
    
    //////////////////////////////////////////////////////////////
    //Renderizar o resto das colunas da linha do estado da matriz, seguindo o alfabeto inteiro
    //////////////////////////////////////////////////////////////

    for(let i = 0; i < ALPHABET_SIZE; i++) {
 
      let state;
      let letter = String.fromCharCode('a'.charCodeAt(0) + i);
      let table_cell;

      if(!matrix[current_position] || !matrix[current_position][letter]) {
        state = `-` //hífen
        table_cell = `<td class='table-cell cell-q${current_position}-${letter}'> ${state} </td>`;
      }
      else {
        state = `q${matrix[current_position][letter]}`;
        table_cell = `<td class='table-cell cell-q${current_position}-${letter}' id='table-state-${state}'> ${state} </td>`;
      }

      $(`#${row_instance}`).append(table_cell);
    }
  }
}

//Palavra no input na matriz, mapeando ela conforme a logica to automato finito de estados
function appendToMatrix(word) {

  //Estado é nomeado automata_length

  let same_word = true; //Verifica se a palavra inserida ja existe
  let length = word.length
  let current_position = DEFAULT_STATE;

  for(let i = 0; i < length; i++) {
    automata_length = matrix.length
   
    let letter = word[i];

    if(!matrix[current_position]) { //existe uma linha nessa posição? new, define que a palavra não é a mesma
      same_word = false;
      matrix.push([]); // Crio uma nova linha contendo todo o alfabeto, cada letra vai ser inserida ali
      current_position = matrix.length-1;
      matrix[current_position][letter] = current_position+1;
    } else if(!matrix[current_position][letter]) { // Se existe uma linha nessa posição, checar se existe uma letra, se não, então defini como uma palavra diferente
      same_word = false;
      matrix[current_position][letter] = matrix.length;
    }

    // Essa parte define como que a palavra se repete durante a execução da inserção na matriz:
    automata_length = matrix.length
    if(!same_word)  current_position = automata_length; // se  não é a mesma palavra, a posição da inserção vai ser sempre para o fim da matriz 
    else current_position = matrix[current_position][letter];    // se é a mesma palavra, a posição da inserção vai ser sempre para a posição q o estado sendo checado está apontando
  }

  const final_state = matrix.length-1;
  matrix.push([]); 
  finalStates.push(final_state+1)
  automata_length++;
  console.log(automata_length);
  console.log(finalStates);

}

// Função de pesquisa da palavra na tabela visivel
function search(word) {
  let selected_state = STATE = 0; // 0

  $("#lexical-table tbody tr td").removeClass("correct-cell"); // remover todas as instancias de letras corretas no automato
  $("#lexical-table tbody tr td").removeClass("wrong-cell"); // remover todas as instancias de letras incorretas no automato
  $("#lexical-table tbody tr td").removeClass("selection-cell"); // remover cor da coluna selecionada em volta da palavra correta no automato

      
  for(let i = 0; i < word.length; i++) { // iterar sobre a palavra, sempre pegando a ultima palavra e vendo se o caminho dela é correto
    $("#lexical-table tbody tr td").removeClass("correct-cell"); // remover todas as instancias de letras corretas no automato
    $("#lexical-table tbody tr td").removeClass("wrong-cell"); // remover todas as instancias de letras incorretas no automato
    $("#lexical-table tbody tr td").removeClass("selection-cell"); // remover a cor da coluna selecionada da palavra incorreta no automato

    if(matrix[selected_state][word[i]] !== undefined) {
      console.log($(`#table-state-q${matrix[selected_state][word[i]]}`));
      let table = $(`#table-state-q${matrix[selected_state][word[i]]}`)

      table.addClass("correct-cell");

      for(let j = 0; j < ALPHABET_SIZE; j++) {
        const letter = String.fromCharCode('a'.charCodeAt(0) + j);
            
        $(`.cell-q${selected_state}-${letter}`).addClass("selection-cell"); 
      }

      let state_ammount = matrix.length;
      for(let j = 0; j < state_ammount; j++) {
            
        console.log(`.cell-q${j}-${word[i]}`);
        $(`.cell-q${j}-${word[i]}`).addClass("selection-cell"); 
      }

      selected_state = matrix[selected_state][word[i]];

    }
    else {
      console.log(`cell-q${selected_state}-${word[i]}`);
      $(`.cell-q${selected_state}-${word[i]}`).addClass("wrong-cell");
      break;
    }
  }

  // Limba o input de inserção à matriz e o automato
  $("#insert-input").val("");
}

// Processar espaços como separadores explícitos
function processInput(input) {
    return input.split(' ').filter(word => word.length > 0);
}
