const DEFAULT_STATE = 0;
const ALPHABET_SIZE = 26;

let matrix;
let wordList = [];
let automata_length = 0;
let table_length = 0;
let finalStates = [];

let STATE = DEFAULT_STATE;

$( function() {

  initializeMatrix();

  $("#insert-input").val("");
  $("#search-input").val("");

    $("#insert-button").click(function() {
      const word = $("#insert-input").val().toLowerCase();
      insertWord(word);
    })

    $('#insert-input').keypress(function (e) {
      if (e.which != 13) return;

      const word = $("#insert-input").val().toLowerCase();
      insertWord(word);
    });

    $("#search-input").keyup(function() {
      const word = $("#search-input").val().toLowerCase();
      search(word);
    });

    
})

function initializeMatrix() {
  matrix = [];
}

function insertWord(word) {
  console.log(word)
      
  if(wordList.includes(word) || word == "") return;

  if(!/^[a-z]+$/.test(word)) return;

  insertToList(word);

  appendToMatrix(word);

  updateTable(word);

  $("#insert-input").val("");
}

function insertToList(word) {
    
  wordList.push(word)
  let wordList_length = wordList.length-1;

  let _container = $("#word-list").append(`<div class='word-list-container' id='word-list-container-${wordList_length}'></div>`)
  let _word = $(`#word-list-container-${wordList_length}`).append(`<p class='word-in-list' id='word-${wordList_length}'>${wordList[wordList_length]}</p>`)

}

function findElementInArray(word) {
  return wordList.includes(word);
}

function updateTable() {

  $("#table-body").empty();

  console.log("MATRIX LENGTH =", matrix.length);

  for(let matrix_row = 0; matrix_row < matrix.length; matrix_row++) {

    let current_position = matrix_row;
    let row_instance = `matrix-instance-${matrix_row}`
    
    $('#table-body').append(`<tr id=${row_instance}></tr>`)
    let current_state = `q${matrix_row}`;
    
    finalStates.map(val => {
      if(matrix_row == val) {
        current_state = `*` + current_state
      }
    })
    
    $(`#${row_instance}`).append(`<td class='table-terminal-head'>${current_state}</td>`);

    for(let i = 0; i < ALPHABET_SIZE; i++) {
 
      let state;
      let letter = String.fromCharCode('a'.charCodeAt(0) + i);
      let table_cell;

      if(!matrix[current_position] || !matrix[current_position][letter]) {
        state = `-`
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

function appendToMatrix(word) {

  let same_word = true;
  let length = word.length
  let current_position = DEFAULT_STATE;

  for(let i = 0; i < length; i++) {
    automata_length = matrix.length
   
    let letter = word[i];

    if(!matrix[current_position]) {
      same_word = false;
      matrix.push([]);
      current_position = matrix.length-1;
      matrix[current_position][letter] = current_position+1;
    } else if(!matrix[current_position][letter]) {
      same_word = false;
      matrix[current_position][letter] = matrix.length;
    }

    automata_length = matrix.length
    if(!same_word)  current_position = automata_length;
    else current_position = matrix[current_position][letter];
  }

  const final_state = matrix.length-1;
  matrix.push([]); 
  finalStates.push(final_state+1)
  automata_length++;
  console.log(automata_length);
  console.log(finalStates);

}

function search(word) {
  let selected_state = STATE = 0;

  $("#lexical-table tbody tr td").removeClass("correct-cell");
  $("#lexical-table tbody tr td").removeClass("wrong-cell");
  $("#lexical-table tbody tr td").removeClass("selection-cell");

      
  for(let i = 0; i < word.length; i++) {
    $("#lexical-table tbody tr td").removeClass("correct-cell");
    $("#lexical-table tbody tr td").removeClass("wrong-cell");
    $("#lexical-table tbody tr td").removeClass("selection-cell");

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

  $("#insert-input").val("");
}

function processInput(input) {
    return input.split(' ').filter(word => word.length > 0);
}
