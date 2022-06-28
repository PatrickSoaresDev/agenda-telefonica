// Estados
let edit = false
let id = null
let idDelete = null
let contacts = []

//Tabela
const generateTable = async (page, pagination, search) => {
  const data = await getContactsPagination(page, search)
  contacts = data.rows
  clearTable()
  if (pagination) {
    generatePagination(data.count)
  }
  await createTable()
  data.rows.forEach(createNewLine)
}

const createTable = async () => {
  let div = document.getElementById('table-div')
  let warning = document.getElementById('warning')
  let table = document.getElementById('contacts')
  if (contacts.length && !document.body.contains(table)) {
    if (document.body.contains(warning)) warning.remove()
    const table = document.createElement('table')
    table.id = 'contacts'
    table.classList.add(
      'table',
      'table-striped',
      'table-bordered',
      'mydatatable'
    )

    table.innerHTML = `<thead>
              <tr>
                <th width="40%">Nome</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody></tbody>`

    div.appendChild(table)
  } else if (!contacts.length) {
    if (document.body.contains(table)) table.remove()
    const warning = document.createElement('h3')
    warning.classList.add('text-center', 'mt-5')
    warning.innerHTML = 'Nenhum contato cadastrado'
    warning.id = 'warning'
    div.appendChild(warning)
  } else return
}
const clearTable = () => {
  const lines = document.querySelectorAll('#contacts>tbody tr')
  lines.forEach((line) => line.parentNode.removeChild(line))
}

createNewLine = (client) => {
  const line = document.createElement('tr')
  line.innerHTML = `
        <td>${client.name}</td>
        <td>${client.phone}</td>
        <td>${client.email}</td>
        <td class="d-flex justify-content-around">
            <button type="button" class="btn btn-warning btn-edit" id="edit-${client.id}" onClick="editClient(${client.id})"><i class="bi bi-pencil-square"></i></button>
            <button type="button" class="btn btn-danger btn-exclude" id="delete-${client.id}" onClick="openModalDelete(${client.id})"><i class="bi bi-trash"></i></button>
        </td>
    `
  document.querySelector('#contacts>tbody').appendChild(line)
}

// api comunication
const apiContacts = 'http://localhost:3000/contacts'

getContactsPagination = async (page, search) => {
  const limit = 10
  return await axios
    .get(apiContacts + '/pagination', { params: { limit, page, search } })
    .then((res) => res.data)
    .catch((err) => {
      console.log(err)
    })
}

getContactList = async () => {
  return await axios.get(apiContacts).then((res) => res.data)
}

const saveClient = async () => {
  if (validateFields()) {
    const client = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
    }
    if (edit) {
      await axios.put(apiContacts + '/' + id, client).then(async () => {
        await generateTable(1, true)
        $('#myModal').modal('hide')
        edit = false
        id = null
      })
    } else {
      await axios.post(apiContacts, client).then(async () => {
        await generateTable(1, true)
        $('#myModal').modal('hide')
      })
    }
  }
}
editClient = async (idx) => {
  const contacts = await getContactList()
  const contact = contacts.filter((el) => el.id == idx)[0]
  let name = document.getElementById('name')
  let email = document.getElementById('email')
  let phone = document.getElementById('phone')
  name.value = contact.name
  email.value = contact.email
  phone.value = contact.phone
  edit = true
  id = contact.id
  $('#myModal').modal('show')
}

deleteClient = async () => {
  await axios.delete(apiContacts + '/' + idDelete)
  generateTable(1, true)
  closeModalDelete()
}

//Util
const validateFields = () => {
  return document.getElementById('form').reportValidity()
}

const generatePagination = (qtd) => {
  deletePagination()
  amountPage = 10
  let pages = Math.ceil(qtd / amountPage)
  if (pages > 1) {
    let firstValue = document.createElement('li')
    let newPagination = document.querySelector('#pagination')
    firstValue.innerHTML = `
  <li class="page-item disabled">
              <a class="page-link" href="#" tabindex="-1">Paginação</a>
            </li>
  `
    newPagination.appendChild(firstValue)
    for (let i = 0; i < pages; i++) {
      let line = document.createElement('li')
      line.onclick = () => pagination(i + 1)
      line.classList.add('page-item')
      line.id = `pag-${i + 1}`
      line.innerHTML = `
    <a class="page-link" >${i + 1}</a>
    `
      if (i == 0) line.classList.add('active')
      newPagination.appendChild(line)
    }
  }
}

pagination = (e) => {
  const search = document.getElementById('search').value
  let page = document.getElementById(`pag-${e}`)
  const actived = document.querySelectorAll('.active')
  actived.forEach((el) => el.classList.remove('active'))
  page.classList.add('active')
  if (search) {
    generateTable(e, true, search)
  } else {
    generateTable(e)
  }
}

deletePagination = () => {
  const div = document.querySelector('#pagination')
  div.innerHTML = ''
}

//Modal  Delete
openModalDelete = (id) => {
  idDelete = id
  $('#modal-delete').modal('show')
}

closeModalDelete = () => {
  $('#modal-delete').modal('hide')
}

//alert
closeAlert = () => {
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

showAlert = (msg) => {
  const div = document.getElementById('alert')
  div.setAttribute('role', 'alert')
  div.classList.add('alert', 'alert-danger', 'alert-dismissibl', 'fade', 'show')
  div.innerHTML = msg
}

//Máscara Celular
const tel = document.getElementById('phone') // Seletor do campo de telefone

tel.addEventListener('keypress', (e) => phoneMask(e.target.value)) // Dispara quando digitado no campo
tel.addEventListener('change', (e) => phoneMask(e.target.value)) // Dispara quando autocompletado o campo

const phoneMask = (valor) => {
  valor = valor.replace(/\D/g, '')
  valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2')
  valor = valor.replace(/(\d)(\d{4})$/, '$1-$2')
}

// Eventos
document.getElementById('save').addEventListener('click', saveClient)

document
  .querySelector('#continuar-delete')
  .addEventListener('click', deleteClient)

document
  .querySelector('#cancelar-delete')
  .addEventListener('click', closeModalDelete)

$('#modal-delete').on('hidden.bs.modal', function (e) {
  idDelete = null
})

$('#myModal').on('hidden.bs.modal', function (e) {
  const campos = document.querySelectorAll('.modal-field')
  campos.forEach((field) => (field.value = ''))
})

//Executaveis
generateTable(1, true)
