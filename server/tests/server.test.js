'use strict';

const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

const {todos, populateTodos, users, populateUsers} = require('./seed/seed'); 

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
	it('should create a new todo', (done) => {
		let text = 'Test todo text';
		request(app)
			.post('/todos')
			.set('x-auth', users[0].tokens[0].token)
			.send({text})
			.expect(200)
			.expect(res => {
				expect(res.body.text).toBe(text);
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.find({text}).then(todos => {
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe(text);
					done()
				}).catch(e => done(e));
			});
	});

	it('should not create todo with invalid body data', (done) => {
		request(app)
			.post('/todos')
			.set('x-auth', users[0].tokens[0].token)
			.send({})
			.expect(400)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.find().then(todos => {
					expect(todos.length).toBe(2);
					done()
				}).catch(e => done(e));
			});

	});

});

describe('GET /todos', () => {
	it('should get all todos', (done) => {
		request(app)
			.get('/todos')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect(res => {
				expect(res.body.todos.length).toBe(1)
			})
			.end(done);

	});
});

describe('GET /todos/:id', () => {
	it('should get a todo by id', (done) => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect(res => {
				expect(res.body.todo.text).toBe(todos[0].text);
			})
			.end(done);
	});
	it('should return 404 if todo not found', (done) => {
		request(app)
			.get(`/todos/${new ObjectID().toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done);
	});
	it('should return 404 for invalid ids', (done) => {
		request(app)
			.get('/todos/123')
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done);
	});
	it('should not get a todo created by different user', (done) => {
		request(app)
			.get(`/todos/${todos[1]._id.toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done);
	});
});

describe('DELETE /todos/:id', () => {
	it('should remove a todo', (done) => {
		let hexId = todos[1]._id.toHexString();
		request(app)
			.delete(`/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)
			.expect(200)
			.expect(res => {
				expect(res.body.todo._id).toBe(hexId);
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.findById(hexId)
					.then(res => {
						expect(res).toNotExist()
						done();
					}).catch(err => done(err));
			});
	});
	it('should not remove a todo created by other user', (done) => {
		let hexId = todos[0]._id.toHexString();
		request(app)
			.delete(`/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)
			.expect(404)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.findById(hexId)
					.then(res => {
						expect(res).toExist()
						done();
					}).catch(err => done(err));
			});
	});
	it('should return 404 if not found', (done) => {
		request(app)
			.delete(`/todos/${new ObjectID().toHexString()}`)
			.set('x-auth', users[1].tokens[0].token)
			.expect(404)
			.end(done);
	});
	it('should return 404 if id is invalid', (done) => {
		request(app)
			.get('/todos/123')
			.set('x-auth', users[1].tokens[0].token)
			.expect(404)
			.end(done);
	});
});

describe('PATCH /todos/:id', () => {
	it('should update todo', (done) => {
		let hexId = todos[0]._id.toHexString(),
			update = {"text": "changed text 1", "completed": true};
		request(app)
			.patch(`/todos/${hexId}`)
			.set('x-auth', users[0].tokens[0].token)
			.send(update)
			.expect(200)
			.end((err, res) => {
				if (err) {
					return done(err)
				}
				Todo.findById(hexId)
					.then(res => {
						expect(res.text).toBe(update.text);
						expect(res.completed).toBe(true);
						expect(res.completedAt).toBeA('number');
						done();
					}).catch(err => done(err));
			});
	});
	it('should not update todo created by different user', (done) => {
		let hexId = todos[0]._id.toHexString(),
			update = {"text": "changed text 1", "completed": true};
		request(app)
			.patch(`/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)
			.send(update)
			.expect(404)
			.end((err, res) => {
				if (err) {
					return done(err)
				}
				Todo.findById(hexId)
					.then(res => {
						expect(res.text).toNotBe(update.text);
						expect(res.completed).toBe(false);
						expect(res.completedAt).toNotExist();
						done();
					}).catch(err => done(err));
			});
	});
	it('should clear completedAt when toto is not completed', () => {
		let hexId = todos[1]._id.toHexString(),
			update = {"text": "changed text 2", "completed": false};
		request(app)
			.patch(`/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)
			.send(update)
			.expect(200)
			.end((err, res) => {
				if (err) {
					return done(err)
				}
				Todo.findById(hexId)
					.then(res => {
						expect(res.text).toBe(update.text);				
						expect(res.completed).toBe(false);
						expect(res.completedAt).toBe(null);
						done();
					}).catch(err => done(err));
			});
	});

});

describe('GET /users/me', () => {
	it('should return user if authenticated', (done) => {
		request(app)
			.get('/users/me')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect(res => {
				expect(res.body._id).toBe(users[0]._id.toHexString());
				expect(res.body.email).toBe(users[0].email);
			})
			.end(done);
	});
	it('should return 401 if not authenticated', (done) => {
		request(app)
			.get('/users/me')
			.expect(401)
			.expect(res => {
				expect(res.body).toEqual({});
			})
			.end(done);
	});
});

describe('POST /users/me', () => {
	it('should create a user', (done) => {
		let email = 'example@example.com',
			password = '123mnb!';
		request(app)
			.post('/users')
			.send({email, password})
			.expect(200)
			.expect(res => {
				expect(res.headers['x-auth']).toExist();
				expect(res.body._id).toExist();
				expect(res.body.email).toBe(email);
			})
			.end(err => {
				if (err) {
					return done(err);
				} 
				User.findOne({email}).then(user => {
					expect(user).toExist();
					expect(user.password).toNotBe(password);
					done();
				}).catch(e => done(e));
			});
	});
	it('should return validation errors w/ invalid request', (done) => {
		let email = 'invalid',
			password = 'ty';
		request(app)
			.post('/users')
			.send({email, password})
			.expect(400)
			.end(done);
	});
	it('should not create user with used email', (done) => {
		let email = users[0].email,
			password ='userOnePass';

		request(app)
			.post('/users')
			.send({email, password})
			.expect(400)
			.end(done);
	});
})

describe('POST /users/login', () => {
	it('should login user and return auth token', done => {
		request(app)
			.post('/users/login')
			.send({
				email: users[1].email,
				password: users[1].password
			})
			.expect(200)
			.expect(res => {
				expect(res.headers['x-auth']).toExist();
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				User.findById(users[1]._id).then(user => {
					expect(user.tokens[1]).toInclude({
						access: 'auth',
						token: res.headers['x-auth']
					});
					done();
				}).catch(e => done(e));
			});
	});
	it('should reject invalid login', done => {
		request(app)
			.post('/users/login')
			.send({
				email: users[1].email,
				password: users[1].password + 'r'
			})
			.expect(400)
			.expect(res => {
				expect(res.headers['x-auth']).toNotExist();
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				User.findById(users[1]._id).then(user => {
					expect(user.tokens.length).toBe(1);
					done();
				}).catch(e => done(e));
			});
	})
});

describe('DELETE /users/me/token', () => {
	it('should remove auth token on logout', done => {
		request(app)
			.delete('/users/me/token')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				User.findById(users[0]._id).then(user => {
					expect(user.tokens.length).toBe(0);
					done();
				}).catch(e => done(e));
			});
	});
});




