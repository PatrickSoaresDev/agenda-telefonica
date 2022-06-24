let editar = false
let id = null
//Tabela

const gerarTabela = async () => {
  const dados = await buscarEventos()
  limparTabela()
  dados.forEach(criarNovaLinha)
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
        <td>
            <button type="button" class="btn btn-warning " id="edit-${
              evento.id
            }">Editar</button>
           <a href="#" class="btn btn-primary btn-custom">
            <span class="glyphicon glyphicon-ok img-circle text-primary btn-icon"></span>
            Acessar
            </a>
            <a class="btn-user"><img src="./img/users.svg" width="30"/></a>
        </td>
    `
  document.querySelector('#eventos>tbody').appendChild(novaLinha)
}

// api comunication
const apiEventos = 'http://localhost:3000/eventos'

buscarEventos = async () => {
  return await axios
    .get(apiEventos)
    .then((res) => res.data)
    .catch((err) => {
      console.log(err)
    })
}

const salvarEvento = async () => {
  if (validarCampos()) {
    const evento = {
      nome_evento: document.getElementById('nome').value,
      data_evento: document.getElementById('data').value,
    }
    if (editar) {
      await axios.put(apiEventos + '/' + id, evento).then(async () => {
        await gerarTabela()
        $('#myModal').modal('hide')
        editar = false
        id = null
      })
    } else {
      await axios.post(apiEventos, evento).then(async () => {
        await gerarTabela()
        $('#myModal').modal('hide')
      })
    }
  }
}
editarEvento = async (idx) => {
  const eventos = await buscarEventos()
  const evento = eventos.filter((el) => el.id == idx)[0]
  let nome = document.getElementById('nome')
  let data = document.getElementById('data')
  nome.value = evento.nome
  data.value = evento.data
  editar = true
  id = evento.id
  $('#myModal').modal('show')
}

deletarEvento = async (idx) => {
  await axios.delete(apiEventos + '/' + idx)
  gerarTabela()
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
    } else {
      deletarEvento(index)
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

// Eventos
document.getElementById('salvar').addEventListener('click', salvarEvento)

document.querySelector('#eventos>tbody').addEventListener('click', botaoTabela)

$('#myModal').on('hidden.bs.modal', function (e) {
  const campos = document.querySelectorAll('.modal-field')
  campos.forEach((campo) => (campo.value = ''))
})

//Executaveis
gerarTabela()
