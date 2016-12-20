'use strict';

let { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to db.')
	}
	console.log('Connected to db.');

	db.collection('Users').findOneAndUpdate({
		_id: new ObjectID('58591ac9a840d00c1e8a99e7')
	}, {
		$set: {
			name: "Alan"
		},
		$inc: {
			age: 1
		}
	}, {
		returnOriginal: false
	})
	.then(res => {console.log(res)});

	//db.close();
});