const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userAccount = users.find((account) => account.username === username);

  if (!userAccount) {
    return response
      .status(404)
      .json({ message: "User account does not exist." });
  }

  request.userAccount = userAccount;

  return next();
}

function getTodoById(request, response, next) {
  const { userAccount } = request;

  const { id } = request.params;

  const todo = userAccount.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  request.todo = todo;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userNameAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (userNameAlreadyExists) {
    return response.status(400).json({ error: "Username already exists" });
  }

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;

  return response.status(201).json(userAccount.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  userAccount.todos.push(todo);

  response.status(201).json(todo);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  getTodoById,
  (request, response) => {
    const { title, deadline } = request.body;
    const { todo } = request;

    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.status(201).json(todo);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  getTodoById,
  (request, response) => {
    const { todo } = request;

    todo.done = true;

    return response.status(201).json(todo);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  getTodoById,
  (request, response) => {
    const { userAccount } = request;
    const { todo } = request.params;

    userAccount.todos.splice(todo, 1);

    return response.status(204).json();
  }
);

module.exports = app;
