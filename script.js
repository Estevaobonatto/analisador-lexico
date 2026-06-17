const ESTADO_PADRAO = 0;
const TAMANHO_ALFABETO = 26;

let matriz; // matriz de transicao
let listaPalavras = []; // palavras inseridas
let tamanho_automato = 0; // tamanho do automato
let tamanho_tabela = 0; // tamanho da tabela
let estadosFinais = []; // estados finais

let ESTADO = ESTADO_PADRAO;

// quando a pagina carrega
$( function() {

  iniciarMatriz(); // inicia matriz vazia

  $("#insert-input").val(""); // limpa input
  $("#search-input").val("");

    // botao de inserir
    $("#insert-button").click(function() {
      const palavra = $("#insert-input").val().toLowerCase();
      inserirPalavra(palavra);
    })

    // tecla enter no input
    $('#insert-input').keypress(function (e) {
      if (e.which != 13) return; // so continua se for enter

      const palavra = $("#insert-input").val().toLowerCase();
      inserirPalavra(palavra);
    });

    // busca enquanto digita
    $("#search-input").keyup(function() {
      const palavra = $("#search-input").val().toLowerCase();
      buscar(palavra);
    });

    
})

function iniciarMatriz() {
  matriz = [];
}

// insere palavra na lista, matriz e tabela
function inserirPalavra(palavra) {
  console.log(palavra)
      
  if(listaPalavras.includes(palavra) || palavra == "") return; // ja existe ou vazia

  if(!/^[a-z]+$/.test(palavra)) return; // so aceita letras minusculas

  inserirNaLista(palavra); // coloca na lista visual

  adicionarNaMatriz(palavra); // coloca na matriz do automato

  atualizarTabela(palavra); // recria a tabela

  $("#insert-input").val("");
}

// adiciona a palavra na lista visual
function inserirNaLista(palavra) {
    
  listaPalavras.push(palavra)
  let tamanho_lista = listaPalavras.length-1;

  let _container = $("#word-list").append(`<div class='word-list-container' id='word-list-container-${tamanho_lista}'></div>`)
  let _palavra = $(`#word-list-container-${tamanho_lista}`).append(`<p class='word-in-list' id='word-${tamanho_lista}'>${listaPalavras[tamanho_lista]}</p>`)

}

function buscarNaLista(palavra) {
  return listaPalavras.includes(palavra);
}

// recria a tabela baseado na matriz
function atualizarTabela() {

  $("#table-body").empty(); // limpa a tabela

  console.log("MATRIX LENGTH =", matriz.length);

  for(let linha = 0; linha < matriz.length; linha++) {

    let posicao_atual = linha;
    let id_linha = `matrix-instance-${linha}`
    
    $('#table-body').append(`<tr id=${id_linha}></tr>`)
    let estado_atual = `q${linha}`;
    
    // verifica se eh estado final
    estadosFinais.map(v => {
      if(linha == v) {
        estado_atual = `*` + estado_atual // asterisco nos estados finais
      }
    })
    
    $(`#${id_linha}`).append(`<td class='table-terminal-head'>${estado_atual}</td>`);

    for(let i = 0; i < TAMANHO_ALFABETO; i++) {
  
      let estado;
      let letra = String.fromCharCode('a'.charCodeAt(0) + i);
      let celula;

      if(!matriz[posicao_atual] || !matriz[posicao_atual][letra]) {
        estado = `-` // sem transicao
        celula = `<td class='table-cell cell-q${posicao_atual}-${letra}'> ${estado} </td>`;
      }
      else {
        estado = `q${matriz[posicao_atual][letra]}`; // tem transicao
        celula = `<td class='table-cell cell-q${posicao_atual}-${letra}' id='table-state-${estado}'> ${estado} </td>`;
      }

      $(`#${id_linha}`).append(celula);
    }
  }
}

// constroi a matriz de transicao do automato
function adicionarNaMatriz(palavra) {

  let mesma_palavra = true; // ja existe caminho?
  let tamanho = palavra.length
  let posicao_atual = ESTADO_PADRAO;

  for(let i = 0; i < tamanho; i++) {
    tamanho_automato = matriz.length
   
    let letra = palavra[i];

    if(!matriz[posicao_atual]) {
      mesma_palavra = false;
      matriz.push([]); // nova linha
      posicao_atual = matriz.length-1;
      matriz[posicao_atual][letra] = posicao_atual+1;
    } else if(!matriz[posicao_atual][letra]) {
      mesma_palavra = false;
      matriz[posicao_atual][letra] = matriz.length; // novo estado
    }

    tamanho_automato = matriz.length
    if(!mesma_palavra)  posicao_atual = tamanho_automato; // vai pro fim
    else posicao_atual = matriz[posicao_atual][letra]; // segue o caminho
  }

  const estado_final = matriz.length-1;
  matriz.push([]); // linha do estado final
  estadosFinais.push(estado_final+1)
  tamanho_automato++;
  console.log(tamanho_automato);
  console.log(estadosFinais);

}

// busca palavra e pinta a tabela
function buscar(palavra) {
  let estado_selecionado = ESTADO = 0;

  // limpa cores antigas
  $("#lexical-table tbody tr td").removeClass("correct-cell");
  $("#lexical-table tbody tr td").removeClass("wrong-cell");
  $("#lexical-table tbody tr td").removeClass("selection-cell");

      
  for(let i = 0; i < palavra.length; i++) {
    $("#lexical-table tbody tr td").removeClass("correct-cell");
    $("#lexical-table tbody tr td").removeClass("wrong-cell");
    $("#lexical-table tbody tr td").removeClass("selection-cell");

    if(matriz[estado_selecionado][palavra[i]] !== undefined) {
      console.log($(`#table-state-q${matriz[estado_selecionado][palavra[i]]}`));
      let celula = $(`#table-state-q${matriz[estado_selecionado][palavra[i]]}`)

      celula.addClass("correct-cell"); // pinta de verde a transicao correta

      // pinta a linha toda
      for(let j = 0; j < TAMANHO_ALFABETO; j++) {
        const letra = String.fromCharCode('a'.charCodeAt(0) + j);
            
        $(`.cell-q${estado_selecionado}-${letra}`).addClass("selection-cell"); 
      }

      // pinta a coluna toda
      let qtd_estados = matriz.length;
      for(let j = 0; j < qtd_estados; j++) {
            
        console.log(`.cell-q${j}-${palavra[i]}`);
        $(`.cell-q${j}-${palavra[i]}`).addClass("selection-cell"); 
      }

      estado_selecionado = matriz[estado_selecionado][palavra[i]]; // avanca estado

    }
    else {
      console.log(`cell-q${estado_selecionado}-${palavra[i]}`);
      $(`.cell-q${estado_selecionado}-${palavra[i]}`).addClass("wrong-cell"); // pinta de vermelho
      break; // para no erro
    }
  }

  $("#insert-input").val(""); // limpa o input
}

function processarEntrada(entrada) {
    return entrada.split(' ').filter(palavra => palavra.length > 0);
}
