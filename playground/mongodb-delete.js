'use strict';

let { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to db.')
	}
	console.log('Connected to db.');

	//db.close();
});