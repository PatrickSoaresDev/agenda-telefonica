// States
let edit = false
let id = null
let idDelete = null
let contactList = []
let participants = []
let idEdit = null
events = []

// api comunication
const eventApi = 'http://localhost:3000/eventos'
const contactApi = 'http://localhost:3000/contatos'

//table
const generateTable = async (page, pagination, search) => {
  const data = await getEvents(page, search)
  events = data.rows
  clearTable()
  if (pagination) {
    generatePagination(data.count)
  }
  await createTable()
  data.rows.forEach(createNewLineTable)
}

const clearTable = () => {
  const lines = document.querySelectorAll('#events>tbody tr')
  lines.forEach((line) => line.parentNode.removeChild(line))
}

const createTable = async () => {
  let div = document.getElementById('table-div')
  let p_no_table = document.getElementById('p-no-table')
  let table = document.getElementById('events')
  if (events.length && !document.body.contains(table)) {
    if (document.body.contains(p_no_table)) p_no_table.remove()
    const table = document.createElement('table')
    table.id = 'events'
    table.classList.add(
      'table',
      'table-striped',
      'table-bordered',
      'mydatatable'
    )

    table.innerHTML = `<thead>
    <tr>
    <th width="60%">Evento</th>
    <th>Data e Hora</th>
    <th>Ação</th>
    </tr>
    </thead>
    <tbody></tbody>`

    div.appendChild(table)
    document
      .querySelector('#events>tbody')
      .addEventListener('click', tableButton)
  } else if (!events.length) {
    if (document.body.contains(table)) table.remove()
    const p = document.createElement('p')
    p.id = 'p-no-table'
    p.classList.add('p-no-table')
    p.innerHTML = 'Nenhum evento cadastrado'
    div.appendChild(p)
  } else return
}

createNewLineTable = (event) => {
  const newLine = document.createElement('tr')
  newLine.innerHTML = `
        <td>${event.nome_evento}</td>
        <td>${dateFormat(event.data_evento)}</td>
        <td id="button-action">
            <button class="btn btn-custom" title="Participantes" onClick="participantsManager(${
              event.id
            })"><i class="bi bi-person-plus-fill"></i></button>      
            <button type="button" class="btn btn-edit" id="edit-${
              event.id
            }"  title="Editar Evento" onClick="eventEdit(${
    event.id
  })"><i class="bi bi-pencil-square"></i></button>                    
            <button type="button" class="btn btn-exclude" id="delete-${
              event.id
            }" title="Excluir Evento" onClick="openModalDelete(${
    event.id
  })"><i class="bi bi-trash"></i></button>          
        </td>
    `
  document.querySelector('#events>tbody').appendChild(newLine)
}

const tableButton = async (e) => {
  if (e.target.type == 'button') {
    const [action, index] = e.target.id.split('-')
    if (action == 'edit') {
      eventEdit(index)
    }
  }
}

// Api requisition
getEvent = async (id) => {
  return await axios.get(eventApi + '/' + id).then((res) => res.data)
}

getEvents = async (page, search) => {
  let limit = 10
  return await axios
    .get(eventApi + '/pagination', { params: { limit, page, search } })
    .then((res) => {
      return res.data
    })
    .catch((err) => {
      console.log(err)
    })
}

const saveEvent = async () => {
  if (edit) {
    let event = { nome_evento: document.getElementById('name').value }
    await axios.put(eventApi + '/' + id, event).then(async () => {
      await generateTable(1, true)
      $('#myModal').modal('hide')
    })
  } else {
    if (validateField()) {
      const event = {
        nome_evento: document.getElementById('name').value,
        data_evento: document.getElementById('date').value,
      }
      await axios.post(eventApi, event).then(async () => {
        await generateTable(1, true)
        $('#myModal').modal('hide')
      })
    }
  }
}

eventEdit = async (idx) => {
  const event = await axios.get(eventApi + '/' + idx).then((res) => res.data)
  let name = document.getElementById('name')
  let date = document.getElementById('date')
  date.style.display = 'none'
  name.value = event.nome_evento
  edit = true
  id = event.id
  $('#myModal').modal('show')
}

deleteEvent = async () => {
  await axios.delete(eventApi + '/' + idDelete)
  generateTable(1, true)
  closeModalDelete()
}

//Util
const validateField = () => {
  return document.getElementById('form').reportValidity()
}

dateFormat = (date) => {
  const dt = new Date(date)
  const options = {
    second: '2-digit',
    minute: '2-digit',
    hour: '2-digit',
    timeZone: 'UTC',
  }
  const dateFormat = dt.toLocaleDateString('pt-BR', options).split(' ')
  const hour = dateFormat[1].split(':')[0] + 'H'
  const min = dateFormat[1].split(':')[1] + 'min'
  const fullDate = dateFormat[0] + ' ' + hour + min

  return fullDate
}

// Pagination
const generatePagination = (qtd) => {
  deletePagination()
  amountPage = 10
  let pages = Math.ceil(amountPage / 10)
  if (pages > 1) {
    let firstValue = document.createElement('li')
    let newPagination = document.querySelector('#pagination')
    firstValue.innerHTML = `
  <li class="page-item disabled">
              <a class="page-link" href="#" tabindex="-1">Paginação</a>
            </li>
  `
    newPagination.appendChild(firstValue)
    for (let i = 0; i < qtd; i++) {
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

//Search
search = () => {
  const search = document.getElementById('search').value
  generateTable(1, true, search)
}

//Modal Delete
openModalDelete = (id) => {
  idDelete = id
  $('#modal-delete').modal('show')
}

closeModalDelete = () => {
  $('#modal-delete').modal('hide')
}

//Modal Edit / Create
$('#myModal').on('hidden.bs.modal', function (e) {
  const fields = document.querySelectorAll('.modal-field')
  let date = document.getElementById('date')
  date.style.removeProperty('display')
  fields.forEach((field) => (field.value = ''))
  edit = false
  id = null
})
$('#myModal').on('shown.bs.modal', function (e) {
  const title = document.getElementById('ModalCreateOrEdit')
  if (edit) {
    title.innerHTML = 'Editar Nome do Evento'
  } else {
    title.innerHTML = 'Inserir Evento'
  }
})

// Events HTML
document.getElementById('save').addEventListener('click', saveEvent)

document
  .querySelector('#cancelar-delete')
  .addEventListener('click', closeModalDelete)

document
  .querySelector('#continuar-delete')
  .addEventListener('click', deleteEvent)

//participants manager
const select = document.getElementById('contacts')

participantsManager = async (id) => {
  const event = await getEvent(id)
  const contacts = await axios.get(contactApi).then((res) => res.data)
  contactList = contacts
  participants = event.contatos || []
  tableContact()
  idEdit = id
  contacts.forEach(createOption)
  event.contatos.forEach(createContactLine)
  const title = document.getElementById('title-modal-contact')
  title.innerHTML = `Evento: ${event.nome_evento}`
  $('#contact-modal').modal('show')
}

deleteContactList = (id) => {
  participants = participants.filter((el) => el.id != id)
  resetContactTable()
  participants.forEach(createContactLine)
  tableContact()
}

saveEventEdit = async () => {
  const contacts = participants.map((el) => el.id)
  const event = await getEvent(idEdit)
  event.contatos = contacts
  await axios.put(eventApi + '/' + idEdit, event).then(() => {
    $('#contact-modal').modal('hide')
  })
}

createOption = (contact) => {
  const optionDefault = document.getElementById('optionDefault')
  const existsDefault = document.body.contains(optionDefault)
  if (!existsDefault) {
    optionDefaultCreate = document.createElement('option')
    optionDefaultCreate.id = 'optionDefault'
    optionDefaultCreate.setAttribute('value', '')
    optionDefaultCreate.innerHTML = 'Selecione um contato'
    document.querySelector('#contacts').appendChild(optionDefaultCreate)
  }
  const option = document.createElement('option')
  option.value = contact.id
  option.innerHTML = contact.nome
  document.querySelector('#contacts').appendChild(option)
}

tableContact = () => {
  const div = document.getElementById('contacts-div')
  const p = document.getElementById('not-contact')
  const table = document.getElementById('event-contacts')
  const existsTable = document.body.contains(table)
  const existsP = document.body.contains(p)
  if (!participants.length && !existsP) {
    if (existsTable) table.remove()
    const p = document.createElement('h4')
    p.classList.add('text-center')
    p.innerHTML = 'Nenhum contato cadastrado'
    p.id = 'not-contact'
    div.appendChild(p)
  } else if (participants.length && !existsTable) {
    if (existsP) p.remove()
    const table = document.createElement('table')
    table.classList.add(
      'table',
      'table-striped',
      'table-bordered',
      'mydatatable',
      'contact-table'
    )
    table.id = 'event-contacts'
    table.innerHTML = `<thead>
                      <tr>
                        <th width="100%">Nome</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody></tbody>`
    div.appendChild(table)
  }
}

createContactLine = (contact) => {
  tableContact()
  const newLine = document.createElement('tr')
  newLine.innerHTML = `
        <td>${contact.nome}</td>
        <td id="button-action">                             
            <button type="button" class="btn btn-exclude" id="delete-${contact.id}" title="Excluir Contato" onClick=deleteContactList(${contact.id})><i class="bi bi-trash"></i></button>          
        </td>
    `
  document.querySelector('#event-contacts>tbody').appendChild(newLine)
}

resetContactTable = () => {
  const lines = document.querySelector('#event-contacts>tbody')
  if (lines) lines.innerHTML = ''
}

select.addEventListener('change', function handleChange(event) {
  if (!event.target.value) return
  const id = event.target.value
  const name = select.options[select.selectedIndex].text
  const exists = participants.findIndex((el) => el.id == id) > -1
  if (exists) {
    setTimeout(() => closeAlert(), 5000)
    return showAlert(`Participante ${name} já está na lista`)
  }

  const data = contactList.filter((el) => el.id == id)[0]
  participants.push(data)
  createContactLine(data)
})

//Modal Delete
$('#modal-delete').on('hidden.bs.modal', function (e) {
  idDelete = null
})

//Modal Contact Event
$('#contact-modal').on('hidden.bs.modal', function (e) {
  $('#contacts').html('')
  contactList = []
  participants = []
  idEdit = null
  resetContactTable()
})

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

//Executaveis
generateTable(1, true)
