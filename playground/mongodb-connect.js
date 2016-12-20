'use strict';

let { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to db.')
	}
	console.log('Connected to db.');
/*	db.collection('Users').insertOne({
		name: "James Tiberius Kirk",
		age: 44,
		location: "The Crab Nebula"
	}, (err, result) => {
		if (err) {
			return console.log('Unable to insert document: ', err);
		}
		console.log(JSON.stringify(result.ops, undefined, 2));
	})*/
	db.close();
});