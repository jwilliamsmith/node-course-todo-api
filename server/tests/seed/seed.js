'use strict';

const jwt = require('jsonwebtoken');

const {ObjectID} = require('mongodb');
const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID(); 
const userTwoId = new ObjectID(); 

const users = [
	{
		_id: userOneId,
		email: 'jack@jill.com',
		password: 'userOnePass',
		tokens: [{
			access: 'auth',
			token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
		}]
	},{
		_id: userTwoId,
		email: 'jill@jack.com',
		password: 'userTwoPass'
	}
]

const todos = [{
	_id: new ObjectID(),
	text: "first test todo"
}, {
	_id: new ObjectID(),
	text: "second test todo",
	completed: true,
	completedAt: 444
}];

const populateTodos = (done => {
	Todo.remove({}).then(() => {
		Todo.insertMany(todos);
	}).then(() => done());
});

const populateUsers = (done => {
	User.remove({}).then(() => {
		let userOne = new User(users[0]).save(),
			userTwo = new User(users[1]).save()
		return Promise.all([userOne, userTwo])
	}).then(() => done());
});

module.exports = {
	todos,
	populateTodos,
	users,
	populateUsers
}