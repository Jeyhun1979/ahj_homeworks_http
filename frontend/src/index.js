import './css/style.css';


const API_URL = 'http://localhost:7070';

class HelpDeskAPI {
  static async getAllTickets() {
    const res = await fetch(`${API_URL}/?method=allTickets`);
    return res.json();
  }

  static async getTicketById(id) {
    const res = await fetch(`${API_URL}/?method=ticketById&id=${id}`);
    return res.json();
  }

  static async createTicket(data) {
    const res = await fetch(`${API_URL}/?method=createTicket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }

  static async updateTicket(data) {
    const res = await fetch(`${API_URL}/?method=updateTicket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }

  static async deleteTicket(id) {
    const res = await fetch(`${API_URL}/?method=deleteTicket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    return res.json();
  }

  static async changeStatus(id, status) {
    const res = await fetch(`${API_URL}/?method=changeStatus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    return res.json();
  }
}

const ticketList = document.querySelector('#ticket-list');
const addBtn = document.querySelector('#add-ticket-btn');
const modal = document.querySelector('#modal');
const modalContent = modal.querySelector('.modal-content');

function renderTicket(ticket) {
  const status = ticket.status ? '✔' : '❌';
  return `
    <div class="ticket" data-id="${ticket.id}">
      <div class="ticket-body">${ticket.name}</div>
      <div class="ticket-actions">
        <button class="status-btn">${status}</button>
        <button class="edit-btn">✎</button>
        <button class="delete-btn">x</button>
      </div>
    </div>
  `;
}

async function loadTickets() {
  const tickets = await HelpDeskAPI.getAllTickets();
  ticketList.innerHTML = tickets.map(renderTicket).join('');
}

function openModal(html) {
  modalContent.innerHTML = html;
  modal.classList.add('open');
}

function closeModal() {
  modal.classList.remove('open');
  modalContent.innerHTML = '';
}

ticketList.addEventListener('click', async e => {
  const ticketEl = e.target.closest('.ticket');
  if (!ticketEl) return;
  const id = ticketEl.dataset.id;

  if (e.target.classList.contains('status-btn')) {
    const ticket = await HelpDeskAPI.getTicketById(id);
    await HelpDeskAPI.changeStatus(id, !ticket.status);
    loadTickets();
  } else if (e.target.classList.contains('edit-btn')) {
    const ticket = await HelpDeskAPI.getTicketById(id);
    openModal(`
      <h3>Редактировать тикет</h3>
      <input id="edit-name" value="${ticket.name}">
      <textarea id="edit-desc">${ticket.description || ''}</textarea>
      <label><input type="checkbox" id="edit-status" ${ticket.status ? 'checked' : ''}> Сделано</label>
      <button id="save-edit">Сохранить</button>
      <button id="cancel-edit">Отмена</button>
    `);
    modalContent.querySelector('#save-edit').addEventListener('click', async () => {
      await HelpDeskAPI.updateTicket({
        id,
        name: modalContent.querySelector('#edit-name').value,
        description: modalContent.querySelector('#edit-desc').value,
        status: modalContent.querySelector('#edit-status').checked
      });
      closeModal();
      loadTickets();
    });
    modalContent.querySelector('#cancel-edit').addEventListener('click', closeModal);
  } else if (e.target.classList.contains('delete-btn')) {
    openModal(`
      <h3>Удалить тикет?</h3>
      <button id="confirm-delete">Да</button>
      <button id="cancel-delete">Нет</button>
    `);
    modalContent.querySelector('#confirm-delete').addEventListener('click', async () => {
      await HelpDeskAPI.deleteTicket(id);
      closeModal();
      loadTickets();
    });
    modalContent.querySelector('#cancel-delete').addEventListener('click', closeModal);
  } else if (e.target.classList.contains('ticket-body')) {
    const ticket = await HelpDeskAPI.getTicketById(id);
    openModal(`
      <h3>${ticket.name}</h3>
      <p>${ticket.description || 'Описание отсутствует'}</p>
      <button id="close-view">Закрыть</button>
    `);
    modalContent.querySelector('#close-view').addEventListener('click', closeModal);
  }
});

addBtn.addEventListener('click', () => {
  openModal(`
    <h3>Добавить тикет</h3>
    <input id="new-name" placeholder="Название">
    <textarea id="new-desc" placeholder="Описание"></textarea>
    <label><input type="checkbox" id="new-status"> Сделано</label>
    <button id="save-new">Создать</button>
    <button id="cancel-new">Отмена</button>
  `);
  modalContent.querySelector('#save-new').addEventListener('click', async () => {
    await HelpDeskAPI.createTicket({
      name: modalContent.querySelector('#new-name').value,
      description: modalContent.querySelector('#new-desc').value,
      status: modalContent.querySelector('#new-status').checked
    });
    closeModal();
    loadTickets();
  });
  modalContent.querySelector('#cancel-new').addEventListener('click', closeModal);
});

document.querySelector('#modal .close').addEventListener('click', closeModal);

loadTickets();
