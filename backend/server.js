const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const cors = require('@koa/cors');

const app = new Koa();
const router = new Router();
app.use(cors());
app.use(koaBody.koaBody());


let tickets = [
  { id: '1', name: 'Первый тикет', status: false, created: Date.now() },
  { id: '2', name: 'Второй тикет', status: true, created: Date.now() },
];

router.get('/', ctx => {
  const params = ctx.request.query;
  const { method, id } = params;

  switch (method) {
    case 'allTickets':
      ctx.body = tickets.map(({ id, name, status, created }) => ({ id, name, status, created }));
      return;
    case 'ticketById':
      const ticket = tickets.find(t => t.id === id);
      ctx.body = ticket || {};
      return;
    default:
      ctx.status = 404;
  }
});

router.post('/', ctx => {
  const { method } = ctx.request.query;
  const data = ctx.request.body;

  switch (method) {
    case 'createTicket':
      const newTicket = {
        id: (Date.now() + Math.random()).toString(),
        name: data.name || '',
        description: data.description || '',
        status: !!data.status,
        created: Date.now(),
      };
      tickets.push(newTicket);
      ctx.body = newTicket;
      return;
    case 'updateTicket':
      tickets = tickets.map(t => t.id === data.id ? { ...t, name: data.name, description: data.description, status: !!data.status } : t);
      ctx.body = tickets.find(t => t.id === data.id);
      return;
    case 'deleteTicket':
      tickets = tickets.filter(t => t.id !== data.id);
      ctx.body = { success: true };
      return;
    case 'changeStatus':
      tickets = tickets.map(t => t.id === data.id ? { ...t, status: !!data.status } : t);
      ctx.body = tickets.find(t => t.id === data.id);
      return;
    default:
      ctx.status = 404;
  }
});

app.use(router.routes()).use(router.allowedMethods());
app.listen(7070);
