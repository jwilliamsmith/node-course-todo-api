'use strict';

const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
	_id: new ObjectID(),
	text: "first test todo"
}, {
	_id: new ObjectID(),
	text: "second test todo",
	completed: true,
	completedAt: 444
}];

beforeEach(done => {
	Todo.remove({}).then(() => {
		Todo.insertMany(todos);
	}).then(() => done());
});

describe('POST /todos', () => {

	it('should create a new todo', (done) => {
		let text = 'Test todo text';
		request(app)
			.post('/todos')
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
			.expect(200)
			.expect(res => {
				expect(res.body.todos.length).toBe(2)
			})
			.end(done);

	});
});

describe('GET /todos/:id', () => {
	it('should get a todo by id', (done) => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect(res => {
				expect(res.body.todo.text).toBe(todos[0].text);
			})
			.end(done);
	});
	it('should return 404 if todo not found', (done) => {
		request(app)
			.get(`/todos/${new ObjectID().toHexString()}`)
			.expect(404)
			.end(done);
	});
	it('should return 404 for invalid ids', (done) => {
		request(app)
			.get('/todos/123')
			.expect(404)
			.end(done);
	});
});

describe('DELETE /todos/:id', () => {
	it('should remove a todo', (done) => {
		let hexId = todos[1]._id.toHexString();
		request(app)
			.delete(`/todos/${hexId}`)
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
	it('should return 404 if not found', (done) => {
		request(app)
			.delete(`/todos/${new ObjectID().toHexString()}`)
			.expect(404)
			.end(done);
	});
	it('should return 404 if id is invalid', (done) => {
		request(app)
			.get('/todos/123')
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
	it('should clear completedAt when toto is not completed', () => {
		let hexId = todos[1]._id.toHexString(),
			update = {"text": "changed text 2", "completed": false};
		request(app)
			.patch(`/todos/${hexId}`)
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




