const fs = require('fs');
const net = require('net');

let client = new net.Socket();




let ex = 'rar';
//let file = Buffer.alloc(23);
//let file = fs.readFileSync('./files/aa.' + ex);

let auth = {
	type: 'authentication',
	// sami98
	//AccessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNhbWk5OCIsInVzZXJJRCI6IjNkZDBlZDEwLTU0NTAtMTFlOS1iMWE2LWVkNzZiMzg1M2M2MyIsImlhdCI6MTU1NDEwMzkyMn0.XvD5LqMyFA-v-OFyLhROT_QjIqdeD22v2Dd4Ud42Fss'
	// alaa
	AccessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFsYWEiLCJ1c2VySUQiOiI1MDc0ZWVhMC01NTYxLTExZTktYTYxZS03OWVlMGNkZjU2NTMiLCJpYXQiOjE1NTQyMjEyMDZ9.Lii2AVpLO3xwYgMiEKHhKauZjnAb-_goOKLH-szHdnE'
};

let text = {
	type: 'Text',
	message: '☻السلام عليكم',
	receiver: 'sami98',
	sendDate: '2019/2/3'
};

let binary = {
	type: 'BinaryFile',
	extension: ex,
	receiver: 'alaa'
};

client.connect(3001, '192.168.43.56', function() {
	// let authMsg = Buffer.from(JSON.stringify(auth));
	// let binaryMsg = Buffer.from(JSON.stringify(binary));
	// let textMsg = Buffer.from(JSON.stringify(text));

	// let FileContentLen = Buffer.alloc(4);

	// let AuthContentLen = Buffer.alloc(4);
	// let BinaryContentLen = Buffer.alloc(4);
	// let TextContentLen = Buffer.alloc(4);


	// FileContentLen.writeUInt32LE(file.length);
	// AuthContentLen.writeUInt32LE(authMsg.length);
	// BinaryContentLen.writeUInt32LE(binaryMsg.length);
	// TextContentLen.writeUInt32LE(textMsg.length);

	// //client.write(Buffer.concat([AuthContentLen, authMsg, BinaryContentLen, binaryMsg, FileContentLen]));

	
	// client.write(AuthContentLen);
	// client.write(authMsg);
	// // client.write(TextContentLen);
	// // client.write(textMsg);
	// // client.write(TextContentLen);
	// // client.write(textMsg);
	// // client.write(TextContentLen);
	// // client.write(textMsg);
	// // setTimeout(() => {
	// // 	client.write(TextContentLen);
	// // 	client.write(textMsg);
	// // }, 1000 * 4);


	// client.write(BinaryContentLen);
	// client.write(binaryMsg);
	// client.write(FileContentLen);
	// client.write(file);
	

	// // setTimeout(() => {
	// // 	client.destroy();

	// // }, 1000 * 60);

});


let queue = [];
let contentLen = 0;
let readState = 'HEADER';
let bufferdBytes = 0;
client.on('data', function(data) {
	//console.log(data.toString());queue.push(data);
	queue.push(data);
	bufferdBytes += data.length;

	if(readState === 'HEADER' && bufferdBytes >= 4){
		contentLen = readByts(4).readUInt32LE(0);
		readState = 'BODY';

		console.log('contentLen:', contentLen);
		console.log('bufferdBytes:', bufferdBytes);
		
		
	}
	if(readState === 'BODY' && bufferdBytes >= contentLen){
		let file = readByts(contentLen);
		readState = 'HEADER';

		console.log('bufferdBytes:', bufferdBytes);


		fs.writeFile('file555', file, (err) => {
			//console.log('sfsdfs');
			if(err){

				console.log(err);
			}
		});
	}

});

/**
 * 
 * @param {Number} size
 * @returns {Buffer} 
 */
let readByts = (size) => {
	bufferdBytes -= size;

	if(queue[0].length === size){
		return queue.shift();
	}

	else if(queue[0].length > size){
		
		let result = queue[0].slice(0, size);
		queue[0] = queue[0].slice(size);
		return result;
		
	}

	else{
		let result = Buffer.allocUnsafe(size);
		let offset = 0;
		while(size > 0){

			// read body size from queue[i] and add it to result
			// update the content of queue each iteration (delete queue[i] or update it)

			if(size >= queue[0].length){
				queue[0].copy(result, offset);
				offset += queue[0].length;
				size -= queue[0].length;
				queue.shift();

			}
			else{
				queue[0].copy(result, offset, 0, size);
				queue[0] = queue[0].slice(size);
				size -= queue[0].length;
			}

		}
		return result;
	}
}




client.on('error', (err) => {
	console.log('error from client', err);
});


client.on('close', function() {
	console.log('Connection closed');
});

// client.write(AuthContentLen, (e) => {
	// 	console.log(e);
	// 	client.write(authMsg, (e) => {
	// 		console.log(e);
	// 		client.write(BinaryContentLen, (e) => {
	// 			console.log(e);
	// 			client.write(binaryMsg, (e) => {
	// 				console.log(e);
	// 				client.write(FileContentLen, (e) => {
	// 					console.log(e);
	// 					client.write(file);
	// 				});
	// 			});
	// 		});
	// 	});
	// });