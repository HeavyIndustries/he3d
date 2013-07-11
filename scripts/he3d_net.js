//
// Network Functions
// - uses Socket.io Lib
//
he3d.log('notice', 'Include Loaded...', 'Net');
he3d.net = {
	addr:		null,
	connected:	false,
	port:		13666,
	ws:			null
};

//
// Connection functions ----------------------------------------------------------------------------
//
he3d.net.connect = function(server) {
	if (he3d.net.ws)
		he3d.net.disconnect();

	if (server.addr)
		he3d.net.addr = server.addr;
	if (server.port && !isNaN(server.port))
		he3d.net.port = server.port;

	try {
		he3d.net.ws=io.connect("http://" + he3d.net.addr + ":" + he3d.net.port);
		he3d.log("NET", "Connecting to server:", he3d.net.addr + ":" + he3d.net.port);
		he3d.net.ws.on('connect', function() {
			he3d.net.connected = true;
			he3d.log("NOTICE", "Connected to server", he3d.net.addr + ":" + he3d.net.port);
		});
		he3d.net.ws.on('connect_failed', function() {
			he3d.log("WARNING", "Failed to connect to server", he3d.net.addr + ":" + he3d.net.port);
		});
		he3d.net.ws.on('msg', he3d.net.recvMsg);
		he3d.net.ws.on('data', he3d.net.recvData);
	} catch(e) {
		he3d.log("WARNING", 'Websocket Connect Failed:', e.detail);
	}
};

he3d.net.disconnect = function(server) {
	if (he3d.net.ws) {
		he3d.net.ws.disconnect();
		he3d.log("NET", "Disconnected from "+he3d.net.addr+":"+he3d.net.port);
		he3d.net.ws = null;
		he3d.net.connected = false;
	} else {
		he3d.log("NET", "Not connected to a server");
	}
};

//
// Client to server --------------------------------------------------------------------------------
//
he3d.net.say = function(msg) {
	he3d.net.ws.emit('msg', msg.replace('say ', ''));
};

//
// Call Backs --------------------------------------------------------------------------------------
//

// Data back from Server (can be overwritten as a callback for game logic)
he3d.net.recvData = function(data) {
	he3d.log("NET", data.from+" returned ", JSON.stringify(data));
};

// Chat Message return
he3d.net.recvMsg = function(msg) {
	he3d.log("NET", msg.from+" said ", msg.msg);
};

