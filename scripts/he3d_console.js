//
// Console Functions
//
he3d.console  =  {
	gameconsole:	null,
	maxcmdhistory:	10,
	cmdhistory:		[],
	cmdhistorypos:	0,
	open: 			false
};

//
// Controls --------------------------------------------------------------------------------------
//
he3d.console.execute = function() {
	var value = he3d.console.input.value.split(' ');
	switch(value[0]) {
		case 'clearcmdhistory':
			he3d.console.cmdhistory = [];
			he3d.console.cmdhistorypos = 0;
			try {
				localStorage.setItem("consolehistory", he3d.console.cmdhistory.join('|c|'));
			} catch(e) {}
			he3d.console.input.value = '';
			return;
			break;
		case 'connect':
			if (value.length == 2)
				he3d.net.connect({addr:value[1]});
			else if (value.length == 3)
				he3d.net.connect({addr:value[1], port:value[2]});
			else
				he3d.log('NOTICE', 'Usage:', 'Connect <addr> <port>');
			break;
		case 'disconnect':
			he3d.net.disconnect();
			break;
		case 'r_af':
			if (value.length == 2 && value[1].length && !isNaN(value[1]))
				he3d.t.setFilterAnisotropic(value[1]);
			else
				he3d.log('NOTICE', 'Renderer.Anisotropic:', he3d.t.af.level);
			break;
		case 'r_culling':
			var c = null;
			switch (parseInt(value[1])) {
				case 1: c = true; break;
				case 0: c = false; break;
			}
			if (c != null)
				he3d.r.setCulling(c);
			else
				he3d.log('NOTICE', 'Renderer.culling:', he3d.r.culling);
			break;
		case 'r_debugdrawcalls':
			var t = null;
			switch (parseInt(value[1])) {
				case 1: t = true; break;
				case 0: t = false; break;
			}
			if (t != null)
				he3d.r.debugDrawCalls = t;
			he3d.log('NOTICE', 'Renderer.debugDrawCalls:',
				(he3d.r.debugDrawCalls ? 'Enabled' : 'Disabled'));
			break;
		case 'r_faviconfps':
			var t = null;
			switch (parseInt(value[1])) {
				case 1: t = true; break;
				case 0: t = false; break;
			}
			if (t != null)
				he3d.r.fps.favicon.toggle(t);
			else
				he3d.log('NOTICE', 'Renderer.FPS.Favicon:', he3d.r.fps.favicon.enabled);
			break;
		case 'r_fxaa':
			var t = null;
			switch (parseInt(value[1])) {
				case 1: t = true; break;
				case 0: t = false; break;
			}
			if (t != null)
				he3d.r.setFXAA(t);
			else
				he3d.log('NOTICE', 'Renderer.FXAA:', he3d.fx.postProcessing.options.fxaa);
			break;
		case 'r_drawfps':
			if (value.length == 2 && value[1].length &&
				!isNaN(value[1]) && value[1] >= 0 && value[1] <= 2) {
				he3d.r.fps.show = parseInt(value[1]);
			} else {
				he3d.log('NOTICE', 'Renderer.fps.show:', he3d.r.fps.show);
			}
			break;
		case 'say':
			if (value.length > 1)
				he3d.net.say(he3d.console.input.value);
			else
				he3d.log('NOTICE', 'Usage:', 'say <msg>');
			break;
		case 's_list':
			he3d.log('NOTICE', 'Listing ' + he3d.a.sounds.length + ' Sounds', '');
			for (var s = 0; s < he3d.a.sounds.length; s++ ) {
				he3d.log('NOTICE', he3d.a.sounds[s].id,
					he3d.a.sounds[s].name + ' [' + he3d.a.sounds[s].type + '] ' +
					he3d.a.sounds[s].state + ' (' + (he3d.a.sounds[s].volume * 100) + '%)');
			}
			break;
		case 's_volume':
			if (value.length > 1)
				he3d.a.setVolume(value[1]);
			else
				he3d.log('NOTICE', 'Volume Level:', he3d.a.volume);
			break;
		case 't_list':
			he3d.log('NOTICE', 'Listing ' + he3d.t.textures.length + ' Textures', '');
			for (var t = 0; t < he3d.t.textures.length; t++ ) {
				he3d.log('NOTICE', he3d.t.textures[t].id,
					he3d.t.textures[t].name + ' [' + he3d.t.textures[t].type + ']' +
					(he3d.t.textures[t].width ? ' [' + he3d.t.textures[t].width + ', ' +
					he3d.t.textures[t].height + ']' : ''));
			}
			break;
		case 't_viewer':
			if (value.length == 2 && value[1].length && !isNaN(value[1]) &&
				value[1] > -1 && value[1] < he3d.t.textures.length) {
				var t = parseInt(value[1]);
				he3d.log('NOTICE', 'Viewing Texture:', t + ": " +
					he3d.t.textures[t].name + ' [' + he3d.t.textures[t].type + ']' +
					(he3d.t.textures[t].width ? ' [' + he3d.t.textures[t].width + ', ' +
					he3d.t.textures[t].height + ']' : ''));
				he3d.t.viewer.id = t;
				he3d.t.viewer.toggle(true);
			} else {
				he3d.t.viewer.toggle();
			}
			break;
		default:
			if (he3d.console.gameconsole != null && !he3d.console.gameconsole(value))
				he3d.log('Unknown Command: ' + he3d.console.input.value);
			break;
	}
	var dupe = false;
	for (var c = 0; c < he3d.console.cmdhistory.length; c++)
		if (he3d.console.cmdhistory[c] == he3d.console.input.value)
			dupe = true;
	if (!dupe) {
		he3d.console.cmdhistory.push(he3d.console.input.value);

		if (he3d.console.cmdhistory.length > he3d.console.maxcmdhistory)
			he3d.console.cmdhistory.splice(0, 1);

		he3d.console.cmdhistorypos = he3d.console.cmdhistory.length - 1;
		try{
			localStorage.setItem("consolehistory", he3d.console.cmdhistory.join('|c|'));
		} catch(e) {}
	}
	he3d.console.input.value = '';
};

he3d.console.recallcmdhistory = function(dir) {
	if (he3d.console.cmdhistory.length < 1)
		return;
	if (dir)
		he3d.console.cmdhistorypos++;
	else
		he3d.console.cmdhistorypos--;

	if (he3d.console.cmdhistorypos > he3d.console.cmdhistory.length - 1)
			he3d.console.cmdhistorypos = he3d.console.cmdhistory.length - 1;

	if (he3d.console.cmdhistorypos<0) {
		he3d.console.cmdhistorypos = 0;
		he3d.console.input.value = '';
	} else {
		he3d.console.input.value = he3d.console.cmdhistory[he3d.console.cmdhistorypos];
	}
};

he3d.console.initBindings = function() {
	// Console Input
	he3d.console.input.onkeyup = function(e) {
		switch(e.keyCode) {
			case he3d.e.keys.ENTER: he3d.console.execute(); break;
			case he3d.e.keys.UP_ARROW: he3d.console.recallcmdhistory(1); break;
			case he3d.e.keys.DOWN_ARROW: he3d.console.recallcmdhistory(0); break;
		}
		e.preventDefault();
		return false;
	}
	he3d.console.input.onkeydown = function(e) {
		if (e.keyCode == he3d.e.keys.GRAVE_ACCENT) {
			e.preventDefault();
			return false;
		}
	}
	he3d.console.history.addEventListener('DOMMouseScroll', function(e) {
		if (e.detail > 0)
			he3d.console.scroll('down');
		else
			he3d.console.scroll('up');
	}, false);

	he3d.console.history.addEventListener('mousewheel', function(e) {
		if (e.wheelDelta > 0)
			he3d.console.scroll('up');
		else
			he3d.console.scroll('down');
	}, false);
};

he3d.console.scroll = function(dir) {
	if (!he3d.console.open)
		return;
	if (dir == 'up')
		he3d.console.history.scrollTop -= 30;
	else
		he3d.console.history.scrollTop += 30;
};

he3d.console.scrollbottom = function() {
	he3d.console.history.scrollTop = he3d.console.history.scrollHeight;
};

he3d.console.toggle = function(open) {
	if (open == undefined)open = !he3d.console.open;
	if (open) {
		he3d.console.view.style.display = 'block';
		he3d.console.scrollbottom();
		he3d.console.input.focus();
	}else{
		he3d.console.view.style.display = 'none';
		he3d.console.input.blur();
	}
	he3d.console.open = open;
};

//
// Logging function ------------------------------------------------------------------------------
//
he3d.log = function() {
	var level = 'notice';
	var highlight = '';
	var msg = '';

	switch (arguments.length) {
		case 3:
			level = arguments[0];
			highlight = '<span class="highlight">' + arguments[1] + '</span> ';
			msg = new String(arguments[2]);
			break;
		case 2:
			level = arguments[0];
			msg = new String(arguments[1]);
			break;
		default:
		case 1:
			msg = new String(arguments[0]);
			break;
	}
	highlight = highlight.replace(/\t/gi, "&nbsp;&nbsp;&nbsp;&nbsp;").replace(/\n/gi, "<br>");
	msg = msg.replace(/\t/gi, "&nbsp;&nbsp;&nbsp;&nbsp;").replace(/\n/gi, "<br>");
	switch (level.toLowerCase()) {
		case 'fatal':
			he3d.console.history.innerHTML +=
				'<br><span class="fatal">FATAL:</span> ' + highlight + msg;
			he3d.console.toggle(true);
			he3d.r.clearColor[3] = 0.0;
			he3d.logo(true);
			he3d.running = false;
			break;
		case 'error':
			he3d.console.history.innerHTML +=
				'<br><span class="error">ERROR:</span> ' + highlight + msg;
			break;
		case 'warning':
			he3d.console.history.innerHTML +=
				'<br><span class="warning">WARNING:</span> ' + highlight + msg;
			break;
		case 'debug':
			he3d.console.history.innerHTML +=
				'<br><span class="debug">DEBUG:</span> ' + highlight + msg;
			break;
		case 'net':
			he3d.console.history.innerHTML +=
				'<br><span class="net">NET:</span> ' + highlight + msg;
			break;
		default:
		case 'notice':
			he3d.console.history.innerHTML += '<br>' + highlight + msg;
			break;
	}
	he3d.console.scrollbottom();
};

//
// Onload Initialisers ---------------------------------------------------------------------------
//
document.getElementsByTagName('body')[0].innerHTML += '<div id="console" class="console">'
	 + '<div id="consolehistorywrapper" class="consolehistorywrapper"><div id="consolehistory" '
	 + 'class="consolehistory"><br><span class="highlight">Heavy Engine 3D Console</span><br><hr>'
	 + '</div></div><div class="consoleinput">Console: <input type="text" value=""'
	 + 'id="consolecommandline" class="consolecommandline"></div></div>';
he3d.console.view = document.getElementById('console');
he3d.console.history = document.getElementById('consolehistory');
he3d.console.input = document.getElementById('consolecommandline');
he3d.console.toggle(true);
he3d.log('notice', 'User Agent ...', navigator.userAgent);
he3d.log('notice', 'Include Loaded...', 'Console');
try {
	var history = localStorage.getItem("consolehistory");
	if (history&&history.length) {
		he3d.console.cmdhistory = history.split('|c|');
		he3d.log('NOTICE', '[Localstorage] Console Command History Restored',
			he3d.console.cmdhistory.length + ' items');
	}
} catch (e) {};

// Send Javascript Errors to our console
window.onerror = function(msg, url, ln) {
	he3d.log('FATAL', url + ":" + ln, msg);
};
