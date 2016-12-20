'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
	let todo = new Todo({
		text: req.body.text
	});

	todo.save().then(d => {
			res.send(d)
		}).catch(e => res.status(400).send(e));
});

app.listen(3000, () =>{
	console.log("server listens on port 3k")
});

module.exports = {app};
