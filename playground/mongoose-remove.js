'use strict';

const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');

let id = '586ebb94ee41863cb89444d1';



Todo.findByIdAndRemove(id)
	.then(todo => {
		console.log(todo);
	});