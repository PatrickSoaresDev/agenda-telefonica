let editar = false
let id = null
//Tabela

const gerarTabela = async () => {
  const dados = await buscarContatos()
  limparTabela()
  dados.forEach(criarNovaLinha)
}

const limparTabela = () => {
  const linhas = document.querySelectorAll('#contatos>tbody tr')
  linhas.forEach((linha) => linha.parentNode.removeChild(linha))
}

criarNovaLinha = (cliente) => {
  const novaLinha = document.createElement('tr')
  novaLinha.innerHTML = `
        <td>${cliente.nome}</td>
        <td>${cliente.telefone}</td>
        <td>${cliente.email}</td>
        <td>
            <button type="button" class="btn btn-warning " id="edit-${cliente.id}">Editar</button>
            <button type="button" class="btn btn-danger" id="delete-${cliente.id}" >Excluir</button>
        </td>
    `
  document.querySelector('#contatos>tbody').appendChild(novaLinha)
}

// api comunication
const apiContatos = 'http://localhost:3000/contatos'

buscarContatos = async () => {
  return await axios
    .get(apiContatos)
    .then((res) => res.data)
    .catch((err) => {
      console.log(err)
    })
}

const salvarCliente = async () => {
  if (validarCampos()) {
    const cliente = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      telefone: document.getElementById('celular').value,
    }
    if (editar) {
      await axios.put(apiContatos + '/' + id, cliente).then(async () => {
        await gerarTabela()
        $('#myModal').modal('hide')
        editar = false
        id = null
      })
    } else {
      await axios.post(apiContatos, cliente).then(async () => {
        await gerarTabela()
        $('#myModal').modal('hide')
      })
    }
  }
}
editarCliente = async (idx) => {
  const contatos = await buscarContatos()
  const contato = contatos.filter((el) => el.id == idx)[0]
  let name = document.getElementById('name')
  let email = document.getElementById('email')
  let telefone = document.getElementById('celular')
  name.value = contato.name
  email.value = contato.email
  telefone.value = contato.telefone
  editar = true
  id = contato.id
  $('#myModal').modal('show')
}

deletarCliente = async (idx) => {
  await axios.delete(apiContatos + '/' + idx)
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
      editarCliente(index)
    } else {
      deletarCliente(index)
    }
  }
}

// Eventos
document.getElementById('save').addEventListener('click', salvarCliente)

document.querySelector('#contatos>tbody').addEventListener('click', botaoTabela)

$('#myModal').on('hidden.bs.modal', function (e) {
  const campos = document.querySelectorAll('.modal-field')
  campos.forEach((campo) => (campo.value = ''))
})

//Executaveis
gerarTabela()
