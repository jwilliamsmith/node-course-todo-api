'use strict';

let { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to db.')
	}
	console.log('Connected to db.');

/*	db.collection('Todos').find({
		_id: new ObjectID('58591728a840d00c1e8a99e1')
	}).toArray()
		.then(docs => {
			console.log('ToDos');
			console.log(JSON.stringify(docs, undefined, 2));
		})
		.catch(err => {
			console.log('Unable to complete find: ', err);
		})*/

	// db.collection('Todos').find().count()
	// 	.then(cnt => {
	// 		console.log(`Todos count: ${cnt}`);
	// 	})
	// 	.catch(err => {
	// 		console.log('Unable to complete find: ', err);
	// });

	//db.close();
	db.collection('Users').find({name: "James"}).toArray()
		.then(users => {
			console.log(JSON.stringify(users, undefined, 2));
		})
		.catch(err => console.log('no soup'))

});