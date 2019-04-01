const net = require('net');
const fs = require('fs');



const ip = '0.0.0.0';
let Sockets = [];


let tcp_server = net.createServer((socket) => {
	console.log('new socket connected');

	let s = {key:"hello Im tcp server"};
	let msg = Buffer.from(JSON.stringify(s));

	let len = Buffer.alloc(4);
	len.writeUInt32LE(msg.length);
	
	socket.write(len);
	socket.write(msg);


	
	setTimeout(() => {
		let j = {lll: "werwerw"};
		let msgJ = Buffer.from(JSON.stringify(j));

		let jLen = Buffer.alloc(4);
		jLen.writeUInt32LE(msgJ.length);

		socket.write(jLen);
		socket.write(msgJ);

	}, 3000);

	let queue = [];
	let contentLen = 0;
	let readState = 'HEADER';
	let bufferdBytes = 0;
	socket.on('data', (data) => {
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


			fs.writeFile('file1', file, (err) => {
				console.log('sfsdfs');
				if(err){

					console.log(err);
				}
			});
		}
	
		
	});

	socket.on('error', (err) => {
		console.log('ERROR FROM SOCKET');

	});

	socket.on('close', (had_err) => {
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

});

tcp_server.on('error', (err) => {
	console.log('ERROR IN SERVER');
	console.log(err);
});

tcp_server.listen(3001, ip, () => {
	console.log('tcp server listen on port 3001')
});

/*try{
json = JSON.parse(data.toString());
console.log(json);


let n = Math.floor(Math.random() * 1000);
fs.writeFile(`file${n}`, binMsg, (err) => {
	binMsg = Buffer.allocUnsafe(0);;
});

}catch(e){
binMsg = Buffer.concat([binMsg, data]);
}*/


// long unixSeconds = DateTimeOffset.Now.ToUnixTimeSeconds(); .NET 4.6


	