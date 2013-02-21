//
// Input Functions
//
he3d.log('notice','Include Loaded...','Input');

//
// Enums -------------------------------------------------------------------------------------------
//
he3d.e.keys={
	BACKSPACE: 8,
	TAB: 9,
	ENTER: 13,
	SHIFT: 16,
	CTRL: 17,
	ALT: 18,
	PAUSE: 19,
	CAPS_LOCK: 20,
	ESCAPE: 27,
	SPACE: 32,
	PAGE_UP: 33,
	PAGE_DOWN: 34,
	END: 35,
	HOME: 36,
	LEFT_ARROW: 37,
	UP_ARROW: 38,
	RIGHT_ARROW: 39,
	DOWN_ARROW: 40,
	INSERT: 45,
	DELETE: 46,
	_0: 48,
	_1: 49,
	_2: 50,
	_3: 51,
	_4: 52,
	_5: 53,
	_6: 54,
	_7: 55,
	_8: 56,
	_9: 57,
	A: 65,
	B: 66,
	C: 67,
	D: 68,
	E: 69,
	F: 70,
	G: 71,
	H: 72,
	I: 73,
	J: 74,
	K: 75,
	L: 76,
	M: 77,
	N: 78,
	O: 79,
	P: 80,
	Q: 81,
	R: 82,
	S: 83,
	T: 84,
	U: 85,
	V: 86,
	W: 87,
	X: 88,
	Y: 89,
	Z: 90,
	LEFT_META: 91,
	RIGHT_META: 92,
	SELECT: 93,
	KP_0: 96,
	KP_1: 97,
	KP_2: 98,
	KP_3: 99,
	KP_4: 100,
	KP_5: 101,
	KP_6: 102,
	KP_7: 103,
	KP_8: 104,
	KP_9: 105,
	MULTIPLY: 106,
	ADD: 107,
	SUBTRACT: 109,
	DECIMAL: 110,
	DIVIDE: 111,
	F1: 112,
	F2: 113,
	F3: 114,
	F4: 115,
	F5: 116,
	F6: 117,
	F7: 118,
	F8: 119,
	F9: 120,
	F10: 121,
	F11: 122,
	F12: 123,
	NUM_LOCK: 144,
	SCROLL_LOCK: 145,
	SEMICOLON: 186,
	EQUALS: 61,
	COMMA: 188,
	DASH: 189,
	PERIOD: 190,
	FORWARD_SLASH: 191,
	GRAVE_ACCENT: 192,
	OPEN_BRACKET: 219,
	BACK_SLASH: 220,
	CLOSE_BRACKET: 221,
	SINGLE_QUOTE: 222
};
he3d.e.mouse={
	left:0,
	middle:1,
	right:2
};
he3d.e.gamepad={};

//
// Input Manager -----------------------------------------------------------------------------------
//
he3d.i={
	gamepad:{
		buttons:[false,false,false,false,false,false,false,false,false],
		device:null
	},
	keys:[],
	mouse:{
		buttons:[],
		buf:[[0,0],[0,0]],
		bufi:0,
		delta:[0,0],
		invert:false,
		lpos:[0,0],
		pos:[0,0],
		wheel:0
	},
	hasPointerlock:false,
	pointerLocked:false
};

he3d.i.initBindings=function(){
	// Pointer Lock API Support
	if((he3d.i.hasPointerlock='pointerLockElement' in document
		|| 'mozPointerLockElement' in document
		|| 'webkitPointerLockElement' in document)){
		document.addEventListener('pointerlockchange',he3d.i.pointerLock,false);
		document.addEventListener('mozpointerlockchange',he3d.i.pointerLock,false);
		document.addEventListener('webkitpointerlockchange',he3d.i.pointerLock,false);
		document.addEventListener('pointerlockerror',he3d.i.pointerLockError,false);
		document.addEventListener('mozpointerlockerror',he3d.i.pointerLockError,false);
		document.addEventListener('webkitpointerlockerror',he3d.i.pointerLockError,false);
	}

	//
	// Keyboard
	//
	document.onkeydown=function(e){
		if(!he3d.console.open&&e.keyCode!=he3d.e.keys.GRAVE_ACCENT&&!he3d.t.viewer.enabled){
			he3d.i.keys[e.keyCode]=true;
		}

		// Full Screen
		if(he3d.i.keys[he3d.e.keys.ALT]&&he3d.i.keys[he3d.e.keys.ENTER]){
			he3d.r.setFullScreen();
			he3d.i.keys[he3d.e.keys.ENTER]=false;
		}
	};
	document.onkeyup=function(e){
		var triggered=false;
		// Console Binds
		if(he3d.console.open){
			switch(e.keyCode){
				case he3d.e.keys.ESCAPE:
					he3d.console.toggle();
					triggered=true;
					break;
				case he3d.e.keys.PAGE_UP:
					he3d.console.scroll('up');
					triggered=true;
					break;
				case he3d.e.keys.PAGE_DOWN:
					he3d.console.scroll('down');
					triggered=true;
					break;
			}
			if(triggered){
				e.stopPropagation();
				e.preventDefault();
				return false;
			}
		}

		// Texture Viewer Super Binds
		if(he3d.t&&he3d.t.viewer.enabled){
			switch(e.keyCode){
				case he3d.e.keys.ESCAPE:
					he3d.t.viewer.toggle(false);
					triggered=true;
					he3d.hud.dirty=true;
					break;
				case he3d.e.keys.LEFT_ARROW:
					var t=he3d.t.viewer.id-1;
					if(t<0)
						break;
					he3d.log('NOTICE','Viewing Texture:',t+": "+
						he3d.t.textures[t].name+' ['+he3d.t.textures[t].type+']'+
						(he3d.t.textures[t].width?' ['+he3d.t.textures[t].width+','+
						he3d.t.textures[t].height+']':''));
					he3d.t.viewer.id=t;
					he3d.s.shaders[he3d.fx.postProcessing.shader].bound=false;
					triggered=true;
					he3d.hud.dirty=true;
					break;
				case he3d.e.keys.RIGHT_ARROW:
					var t=he3d.t.viewer.id+1;
					if(t>he3d.t.textures.length-1)
						break;
					he3d.log('NOTICE','Viewing Texture:',t+": "+
						he3d.t.textures[t].name+' ['+he3d.t.textures[t].type+']'+
						(he3d.t.textures[t].width?' ['+he3d.t.textures[t].width+','+
						he3d.t.textures[t].height+']':''));
					he3d.t.viewer.id=t;
					he3d.s.shaders[he3d.fx.postProcessing.shader].bound=false;
					triggered=true;
					he3d.hud.dirty=true;
					break;
			}
		}

		// Super Key Binds
		switch(e.keyCode){
			case he3d.e.keys.F1:
				he3d.t.viewer.toggle();
				triggered=true;
				break;
			case he3d.e.keys.GRAVE_ACCENT:
				he3d.console.toggle();
				triggered=true;
				break;
			case he3d.e.keys.PAUSE:
				he3d.pause();
				triggered=true;
				break;
		}
		if(triggered){
			e.stopPropagation();
			e.preventDefault();
			return false;
		}

		// Everything Else
		he3d.i.keys[e.keyCode]=false;
	};

	//
	// Mouse
	//
	he3d.canvas.onmousedown=function(e){
		he3d.i.mouse.buttons[e.button]=true;
		e.stopPropagation();
		e.preventDefault();
	};
	he3d.canvas.onmouseup=function(e){
		he3d.i.mouse.buttons[e.button]=false;
		e.stopPropagation();
		e.preventDefault();
	};
	he3d.canvas.onmousemove=he3d.i.mouseMove;
	he3d.canvas.onmousewheel=function(e){
		if(e.wheelDelta)he3d.i.mouse.wheel=e.wheelDelta/120;
		if(e.detail)he3d.i.mouse.wheel=-e.detail/3;
	};
	he3d.canvas.addEventListener('DOMMouseScroll',he3d.canvas.onmousewheel,false);

	//
	// Gamepad
	//
	window.addEventListener('MozGamepadConnected',he3d.i.gamepad_connect,false);
	window.addEventListener('MozGamepadDiconnected',he3d.i.gamepad_disconnect,false);
	window.addEventListener('MozGamepadButtonDown',he3d.i.gamepad_buttonDown,false);
	window.addEventListener('MozGamepadButtonUp',he3d.i.gamepad_buttonUp,false);
//	window.addEventListener('MozGamepadAxisMove',he3d.i.gamepad_axisMove,false);
};

he3d.i.mouseMove=function(e){
	if(he3d.i.pointerLocked){
		he3d.i.mouse.buf[he3d.i.mouse.bufi][0]+=e.movementX||e.mozMovementX||e.webkitMovementX||0;
		he3d.i.mouse.buf[he3d.i.mouse.bufi][1]+=e.movementY||e.mozMovementY||e.webkitMovementY||0;

		he3d.i.mouse.delta[0]=(he3d.i.mouse.buf[0][0]+he3d.i.mouse.buf[1][0])*0.5;
		he3d.i.mouse.delta[1]=(he3d.i.mouse.buf[0][1]+he3d.i.mouse.buf[1][1])*0.5;

		he3d.i.mouse.bufi^=1;
		he3d.i.mouse.buf[he3d.i.mouse.bufi][0]=0;
		he3d.i.mouse.buf[he3d.i.mouse.bufi][1]=0;
	} else {
		he3d.i.mouse.lpos.set(he3d.i.mouse.pos);
		he3d.i.mouse.pos[0]=e.pageX-this.offsetLeft;
		he3d.i.mouse.pos[1]=e.pageY-this.offsetTop;
		he3d.m.vec2.subtract(he3d.i.mouse.pos,he3d.i.mouse.lpos,he3d.i.mouse.delta);
	}
};
he3d.i.initInputManager=function(){
	for(var i in he3d.e.keys)
		he3d.i.keys[he3d.e.keys[i]]=false;
	he3d.log('NOTICE','Input Manager',he3d.i.keys.length+" keys initialised");
	for(var i in he3d.e.mouse)
		he3d.i.mouse.buttons[he3d.e.mouse[i]]=false;
	he3d.log('NOTICE','Input Manager',he3d.i.mouse.buttons.length+" mouse buttons initialised");

	he3d.i.mouse.delta=he3d.m.vec2.create([0,0]);
	he3d.i.mouse.lpos=he3d.m.vec2.create([0,0]);
	he3d.i.mouse.pos=he3d.m.vec2.create([0,0]);
};

he3d.i.reset=function(){
	he3d.i.mouse.delta[0]=0;
	he3d.i.mouse.delta[1]=0;
	he3d.i.mouse.wheel=0;
};

//
// Pointer Lock API --------------------------------------------------------------------------------
//
he3d.i.pointerLock=function(e){
	if (document.pointerLockElement===he3d.canvas||
		document.mozPointerLockElement===he3d.canvas||
		document.webkitPointerLockElement===he3d.canvas){
		if(he3d.i.pointerLocked)
			return;
		document.addEventListener("mousemove", he3d.i.mouseMove,false);
		he3d.i.pointerLocked=true;
		he3d.log("NOTICE","Pointer Lock","Enabled");
	} else {
		document.removeEventListener("mousemove",he3d.i.mouseMove,false);
		he3d.i.pointerLocked=false;
		he3d.log("NOTICE","Pointer Lock","Disabled");
	}
};
he3d.i.pointerLockError=function(e){
	he3d.log("WARNING","Pointer Lock Request Failed");
};
he3d.i.requestPointerLock=function(){
	if(he3d.canvas.requestPointerLock)
		he3d.canvas.requestPointerLock();
	if(he3d.canvas.webkitRequestPointerLock)
		he3d.canvas.webkitRequestPointerLock();
	if(he3d.canvas.mozRequestPointerLock)
		he3d.canvas.mozRequestPointerLock();
};
he3d.i.exitPointerLock=function(){
	if(he3d.canvas.exitPointerLock)
		he3d.canvas.exitPointerLock();
	if(he3d.canvas.webkitExitPointerLock)
		he3d.canvas.webkitExitPointerLock();
	if(he3d.canvas.mozExitPointerLock)
		he3d.canvas.mozExitPointerLock();
};

//
// Gamepad Handlers --------------------------------------------------------------------------------
//
he3d.i.gamepad_connect=function(e){
	try {
    he3d.i.gamepad.device=new Input.Device(e.gamepad);
    he3d.log('NOTICE',"Gamepad Connected",e.gamepad.id);
  } catch (ex) {
		he3d.log('NOTICE',"Gamepad Connect Failed",ex);
  }
};
he3d.i.gamepad_disconnect=function(e){
	he3d.log('NOTICE',"Gamepad Disconnected",e.gamepad.id);
	he3d.i.gamepad.device=null;
};

he3d.i.gamepad_buttonDown=function(e){
	he3d.i.gamepad.buttons[e.gamepad.buttons[e.button]]=true;
};
he3d.i.gamepad_buttonUp=function(e){
	he3d.i.gamepad.buttons[e.gamepad.buttons[e.button]]=false;
};
he3d.i.gamepad_axisMove=function(e){
};
