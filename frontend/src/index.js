import './css/style.css';

const API_URL = 'https://ahj-homeworks-http.onrender.com';

class HelpDeskAPI {
  static async request(url, options = {}) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(res.status);
      }
      return await res.json();
    } catch (e) {
      throw new Error('Ошибка соединения с сервером');
    }
  }

  static getAllTickets() {
    return this.request(`${API_URL}/?method=allTickets`);
  }

  static getTicketById(id) {
    return this.request(`${API_URL}/?method=ticketById&id=${id}`);
  }

  static createTicket(data) {
    return this.request(`${API_URL}/?method=createTicket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  static updateTicket(data) {
    return this.request(`${API_URL}/?method=updateTicket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  static deleteTicket(id) {
    return this.request(`${API_URL}/?method=deleteTicket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
  }

  static changeStatus(id, status) {
    return this.request(`${API_URL}/?method=changeStatus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
  }
}

const ticketList = document.querySelector('#ticket-list');
const addBtn = document.querySelector('#add-ticket-btn');
const modal = document.querySelector('#modal');
const modalContent = modal.querySelector('.modal-content');
const closeBtn = modal.querySelector('.close');

function renderTicket(ticket) {
  return `
    <div class="ticket" data-id="${ticket.id}">
      <div class="ticket-body">${ticket.name}</div>
      <div class="ticket-actions">
        <button class="status-btn">${ticket.status ? '✔' : '❌'}</button>
        <button class="edit-btn">✎</button>
        <button class="delete-btn">x</button>
      </div>
    </div>
  `;
}

async function loadTickets() {
  try {
    const tickets = await HelpDeskAPI.getAllTickets();
    ticketList.replaceChildren(
      ...tickets.map(t => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = renderTicket(t);
        return wrapper.firstElementChild;
      })
    );
  } catch (e) {
    ticketList.textContent = e.message;
  }
}

function openModal(html) {
  modalContent.innerHTML = html;
  modal.classList.add('open');
}

function closeModal() {
  modal.classList.remove('open');
  modalContent.innerHTML = '';
}

function isValid(value) {
  return value.trim().length > 0;
}

ticketList.addEventListener('click', async e => {
  const ticketEl = e.target.closest('.ticket');
  if (!ticketEl) return;
  const id = ticketEl.dataset.id;

  try {
    if (e.target.classList.contains('status-btn')) {
      const ticket = await HelpDeskAPI.getTicketById(id);
      await HelpDeskAPI.changeStatus(id, !ticket.status);
      loadTickets();
    }

    if (e.target.classList.contains('edit-btn')) {
      const ticket = await HelpDeskAPI.getTicketById(id);
      openModal(`
        <h3>Редактировать тикет</h3>
        <input id="edit-name" value="${ticket.name}">
        <textarea id="edit-desc">${ticket.description || ''}</textarea>
        <label><input type="checkbox" id="edit-status" ${ticket.status ? 'checked' : ''}> Сделано</label>
        <button id="save-edit">Сохранить</button>
        <button id="cancel-edit">Отмена</button>
      `);

      modalContent.querySelector('#save-edit').onclick = async () => {
        const name = modalContent.querySelector('#edit-name').value;
        if (!isValid(name)) return;
        await HelpDeskAPI.updateTicket({
          id,
          name,
          description: modalContent.querySelector('#edit-desc').value,
          status: modalContent.querySelector('#edit-status').checked
        });
        closeModal();
        loadTickets();
      };

      modalContent.querySelector('#cancel-edit').onclick = closeModal;
    }

    if (e.target.classList.contains('delete-btn')) {
      openModal(`
        <h3>Удалить тикет?</h3>
        <button id="confirm-delete">Да</button>
        <button id="cancel-delete">Нет</button>
      `);

      modalContent.querySelector('#confirm-delete').onclick = async () => {
        await HelpDeskAPI.deleteTicket(id);
        closeModal();
        loadTickets();
      };

      modalContent.querySelector('#cancel-delete').onclick = closeModal;
    }

    if (e.target.classList.contains('ticket-body')) {
      const ticket = await HelpDeskAPI.getTicketById(id);
      openModal(`
        <h3>${ticket.name}</h3>
        <p>${ticket.description || 'Описание отсутствует'}</p>
        <button id="close-view">Закрыть</button>
      `);
      modalContent.querySelector('#close-view').onclick = closeModal;
    }
  } catch (e) {
    openModal(`<p>${e.message}</p><button id="close-error">Закрыть</button>`);
    modalContent.querySelector('#close-error').onclick = closeModal;
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

  modalContent.querySelector('#save-new').onclick = async () => {
    const name = modalContent.querySelector('#new-name').value;
    if (!isValid(name)) return;
    try {
      await HelpDeskAPI.createTicket({
        name,
        description: modalContent.querySelector('#new-desc').value,
        status: modalContent.querySelector('#new-status').checked
      });
      closeModal();
      loadTickets();
    } catch (e) {
      closeModal();
    }
  };

  modalContent.querySelector('#cancel-new').onclick = closeModal;
});

closeBtn.addEventListener('click', closeModal);

loadTickets();
