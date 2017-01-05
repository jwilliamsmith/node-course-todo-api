'use strict';

const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {User} = require('./../server/models/user');

let id = '58598ce54fffd57718256d17';

// if (!ObjectID.isValid(id)) {
// 	console.log('ID not Valid.');
// }

// Todo.find({
// 	_id: id
// }).then((todos) => {
// 	console.log("Todos", todos);
// });

// Todo.findOne({
// 	_id: id
// }).then((todo) => {
// 	console.log("Todo", todo);
// });

// Todo.findById(id).then((todo) => {
// 	if (!todo) {
// 		return console.log("not found")
// 	}
// 	console.log('Todo by Id', todo);
// }).catch((err) => console.log(err));

User.findById(id)
	.then((user) => {
		if (!user) {
			return console.log(`User ${id} not found.`)
		} else {
			console.log('User', user);
		}
	}).catch((err) => console.log(err));