let editar = false
let id = null
let title = 'teste'
let idDelete = null
let listaContatos = []
let participantes = []
let idEdit = null

// api comunication
const apiEventos = 'http://localhost:3000/eventos'
const apiContatos = 'http://localhost:3000/contatos'
//Tabela

const gerarTabela = async (page, paginar, pesquisa) => {
  const dados = await buscarEventos(page, pesquisa)
  limparTabela()
  if (paginar) {
    gerarPagination(dados.count)
  }
  dados.rows.forEach(criarNovaLinha)
}

const limparTabela = () => {
  const linhas = document.querySelectorAll('#eventos>tbody tr')
  linhas.forEach((linha) => linha.parentNode.removeChild(linha))
}

criarNovaLinha = (evento) => {
  const novaLinha = document.createElement('tr')
  novaLinha.innerHTML = `
        <td>${evento.nome_evento}</td>
        <td>${formataData(evento.data_evento)}</td>
        <td id="button-action">
            <button class="btn btn-custom" title="Participantes" onClick="gerenciarParticipantes(${
              evento.id
            })"><i class="bi bi-person-plus-fill"></i></button>      
            <button type="button" class="btn btn-edit" id="edit-${
              evento.id
            }"  title="Editar Evento" onClick="editarEvento(${
    evento.id
  })"><i class="bi bi-pencil-square"></i></button>                    
            <button type="button" class="btn btn-exclude" id="delete-${
              evento.id
            }" title="Excluir Evento" onClick="abrirModalDelete(${
    evento.id
  })"><i class="bi bi-trash"></i></button>          
        </td>
    `
  document.querySelector('#eventos>tbody').appendChild(novaLinha)
}

buscarEventos = async (page, pesquisa = '') => {
  let limit = 10
  return await axios
    .get(apiEventos + '/paginacao', { params: { limit, page, pesquisa } })
    .then((res) => res.data)
    .catch((err) => {
      console.log(err)
    })
}

const salvarEvento = async () => {
  if (editar) {
    evento = { nome_evento: document.getElementById('nome').value }
    await axios.put(apiEventos + '/' + id, evento).then(async () => {
      await gerarTabela(1, true)
      $('#myModal').modal('hide')
    })
  } else {
    if (validarCampos()) {
      const evento = {
        nome_evento: document.getElementById('nome').value,
        data_evento: document.getElementById('data').value,
      }
      await axios.post(apiEventos, evento).then(async () => {
        await gerarTabela(1, true)
        $('#myModal').modal('hide')
      })
    }
  }
}
editarEvento = async (idx) => {
  const evento = await axios.get(apiEventos + '/' + idx).then((res) => res.data)
  let nome = document.getElementById('nome')
  let data = document.getElementById('data')
  data.style.display = 'none'
  nome.value = evento.nome_evento
  editar = true
  id = evento.id
  $('#myModal').modal('show')
}

deletarEvento = async () => {
  await axios.delete(apiEventos + '/' + idDelete)
  gerarTabela(1, true)
  fecharModalDelete()
}

//Util
const validarCampos = () => {
  return document.getElementById('form').reportValidity()
}

const botaoTabela = async (e) => {
  if (e.target.type == 'button') {
    const [action, index] = e.target.id.split('-')
    if (action == 'edit') {
      editarEvento(index)
    }
  }
}

formataData = (data) => {
  const dt = new Date(data)
  //   return dt.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  const options = {
    second: '2-digit',
    minute: '2-digit',
    hour: '2-digit',
    timeZone: 'UTC',
  }
  return dt.toLocaleDateString('pt-BR', options)
}
const gerarPagination = (qtd) => {
  excluirPaginacao()
  qtdPage = 10
  qtd = Math.ceil(qtd / 10)
  if (qtd > 1) {
    let primeiroValor = document.createElement('li')
    let novaPaginacao = document.querySelector('#paginacao')
    primeiroValor.innerHTML = `
  <li class="page-item disabled">
              <a class="page-link" href="#" tabindex="-1">Paginação</a>
            </li>
  `
    novaPaginacao.appendChild(primeiroValor)
    for (let i = 0; i < qtd; i++) {
      let linha = document.createElement('li')
      linha.onclick = () => paginacao(i + 1)
      linha.classList.add('page-item')
      linha.id = `pag-${i + 1}`
      linha.innerHTML = `
    <a class="page-link" >${i + 1}</a>
    `
      if (i == 0) linha.classList.add('active')
      novaPaginacao.appendChild(linha)
    }
  }
}

paginacao = (e) => {
  const pesquisa = document.getElementById('pesquisa').value
  let pagina = document.getElementById(`pag-${e}`)
  const ativado = document.querySelectorAll('.active')
  ativado.forEach((el) => el.classList.remove('active'))
  pagina.classList.add('active')
  if (pesquisa) {
    gerarTabela(e, true, pesquisa)
  } else {
    gerarTabela(e)
  }
}
excluirPaginacao = () => {
  const div = document.querySelector('#paginacao')
  div.innerHTML = ''
}

pesquisar = () => {
  const pesquisa = document.getElementById('pesquisa').value
  gerarTabela(1, true, pesquisa)
}

abrirModalDelete = (id) => {
  idDelete = id
  $('#modal-delete').modal('show')
}

fecharModalDelete = () => {
  $('#modal-delete').modal('hide')
}

// Eventos
document.getElementById('salvar').addEventListener('click', salvarEvento)

document.querySelector('#eventos>tbody').addEventListener('click', botaoTabela)

document
  .querySelector('#cancelar-delete')
  .addEventListener('click', fecharModalDelete)

document
  .querySelector('#continuar-delete')
  .addEventListener('click', deletarEvento)

//Modal Edit / Create

$('#myModal').on('hidden.bs.modal', function (e) {
  const campos = document.querySelectorAll('.modal-field')
  let data = document.getElementById('data')
  data.style.removeProperty('display')
  campos.forEach((campo) => (campo.value = ''))
  editar = false
  id = null
})
$('#myModal').on('shown.bs.modal', function (e) {
  const titulo = document.getElementById('exampleModalLabel')
  if (editar) {
    titulo.innerHTML = 'Editar nome do Evento'
  } else {
    titulo.innerHTML = 'Inserir Evento'
  }
})

//Gerenciar Participantes
const select = document.getElementById('contatos')

buscarEvento = async (id) => {
  return await axios.get(apiEventos + '/' + id).then((res) => res.data)
}

gerenciarParticipantes = async (id) => {
  const evento = await buscarEvento(id)
  const contatos = await axios.get(apiContatos).then((res) => res.data)
  listaContatos = contatos
  participantes = evento.contatos || []
  idEdit = id
  contatos.forEach(criarOption)
  evento.contatos.forEach(criarLinhaContato)
  const titulo = document.getElementById('tituloModalContatos')
  titulo.innerHTML = `Evento: ${evento.nome_evento}`
  $('#modal-contato').modal('show')
}

excluirContatoLista = (id) => {
  participantes = participantes.filter((el) => el.id != id)
  zerarTabelaContato()
  participantes.forEach(criarLinhaContato)
}

salvarEdicaoEventos = async () => {
  const contatos = participantes.map((el) => el.id)
  console.log(contatos)
  const evento = await buscarEvento(idEdit)
  evento.contatos = contatos
  await axios.put(apiEventos + '/' + idEdit, evento).then(() => {
    $('#modal-contato').modal('hide')
  })
}

criarOption = (contato) => {
  const option = document.createElement('option')
  option.value = contato.id
  option.innerHTML = contato.nome
  document.querySelector('#contatos').appendChild(option)
}

const limparOptions = () => {
  const linhas = document.querySelectorAll('#contatos>option')
  linhas.forEach((linha) => linha.parentNode.removeChild(linha))
}

criarLinhaContato = (contato) => {
  const novaLinha = document.createElement('tr')
  novaLinha.innerHTML = `
        <td>${contato.nome}</td>
        <td id="button-action">                             
            <button type="button" class="btn btn-exclude" id="delete-${contato.id}" title="Excluir Contato" onClick=excluirContatoLista(${contato.id})><i class="bi bi-trash"></i></button>          
        </td>
    `
  document.querySelector('#contatosEventos>tbody').appendChild(novaLinha)
}

zerarTabelaContato = () => {
  const linhas = document.querySelector('#contatosEventos>tbody')
  linhas.innerHTML = ''
}

select.addEventListener('change', function handleChange(event) {
  const id = event.target.value
  const nome = select.options[select.selectedIndex].text
  const existe = participantes.findIndex((el) => el.id == id) > -1
  if (existe) {
    setTimeout(() => fecharAlerta(), 5000)
    return mostrarAlerta(`Participante ${nome} já está na lista`)
  }

  const dado = listaContatos.filter((el) => el.id == id)[0]
  criarLinhaContato(dado)
  participantes.push(dado)
})

//Modal Delete
$('#modal-delete').on('hidden.bs.modal', function (e) {
  idDelete = null
})

//Modal Contato Eventos
$('#modal-contato').on('hidden.bs.modal', function (e) {
  $('#contatos').html('')
  listaContatos = []
  participantes = []
  idEdit = null
  zerarTabelaContato()
})

//alert
fecharAlerta = () => {
  const div = document.getElementById('alert')
  div.removeAttribute('role')
  div.classList.remove(
    'alert',
    'alert-danger',
    'alert-dismissibl',
    'fade',
    'show'
  )
  div.innerHTML = ''
}

mostrarAlerta = (msg) => {
  const div = document.getElementById('alert')
  div.setAttribute('role', 'alert')
  div.classList.add('alert', 'alert-danger', 'alert-dismissibl', 'fade', 'show')
  div.innerHTML = msg
}

//Executaveis
gerarTabela(1, true)
