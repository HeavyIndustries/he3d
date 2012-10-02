/*******************************************************************************
*                                                                              *
*                      ******************************                          *
*                              Heavy Engine 3D                                 *
*                      ******************************                          *
*                                                                              *
*                       Copyright (C) 2012 by int13h                           *
*                                                                              *
* Licenced under the int13h Coffee-Ware Licence                                *
* As long as you retain this notice you can do whatever you want with this     *
* stuff. If we meet some day, and you think this stuff is worth it, you can    *
* buy us a coffee.                                                             *
*                                                                              *
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS          *
* "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED    *
* TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR   *
* PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR             *
* CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,        *
* EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,          *
* PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR           *
* PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF       *
* LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING         *
* NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS           *
* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.                 *
*                                                                              *
* Basically, don't be a dick....  - http://www.int13h.com                      *
*                                                                              *
*******************************************************************************/

var he3d={
	canvas:null,
	e:{},
	platform:'desktop',
	running: true,
	mode: null,
	modules: {l:0,m:[
		'he3d_console',
		'he3d_input',
		'he3d_tools',
		'he3d_math',
		'he3d_renderer',
		'he3d_contextmenu',
		'he3d_shader',
		'he3d_textures',
		'he3d_particlesystem',
		'he3d_effects',
		'he3d_primatives',
		'he3d_modelloader',
		'he3d_camera',
		'he3d_canvas',
		'he3d_hud',
		'he3d_audio',
		'he3d_net',
		'he3d_nogame',
		'lib/webgl-debug',
		'lib/socket.io',
		'lib/input'
	]},
	path:'../he3d/scripts/',
	timer:{
		accum:0,
		delta:0.016,
		frameTime:0,
		runningTime:0,
		maxStep:0.1,
		wallCurrent:0,
		wallDelta:0,
		wallLastTimestamp:0
	}
};

(function(he3d){
	"use strict";

	// Load all modules in order
	he3d.load=function(){
		// Don't load nogame code unless we need to
		if(he3d.modules.m[he3d.modules.l]=='he3d_nogame'&&he3d.game!=undefined)
			he3d.modules.l++;
		
		var head=document.getElementsByTagName('head')[0];
		var script=document.createElement('script');
		script.type='text/javascript';
		script.src=he3d.path+he3d.modules.m[he3d.modules.l]+'.js';
		script.onload=function(){
			if((++he3d.modules.l)==he3d.modules.m.length) he3d.init();
			else he3d.load();
		};
		head.appendChild(script);
	};
	
	he3d.init=function(){
		if(navigator.userAgent.indexOf('Fennec')>1)
			he3d.platform='mobile';

		he3d.r.init();
		he3d.contextMenu.init();
		he3d.i.initBindings();
		he3d.i.initInputManager();
		he3d.r.fps.favicon.init();
		he3d.a.init();
		
		if(!he3d.running)return;
		he3d.ps.init();
		if(he3d.game!=undefined){
			he3d.log('NOTICE','Loading Game:',he3d.game.name);
			document.title=he3d.game.name+" - Heavy Engine 3D";
			he3d.mode=he3d.game.loadAssets;
		} else {
			document.title="Heavy Engine 3D";
			he3d.game={
				loaded:false
			};
			he3d.noGame.load();
			he3d.mode=he3d.noGame.view;
		}
		he3d.mainLoop();
	};

	he3d.logo=function(enable){
		if(!he3d.canvas.style)
			return;
		if(enable){
			he3d.canvas.style.backgroundImage='../images/he3dlogo.png';
		} else {
			he3d.canvas.style.backgroundImage='none';
			he3d.canvas.style.backgroundColor='#000000ff';
		}
	};

	//
	// Game Loop -------------------------------------------------------------------------------------
	//
	he3d.mainLoop=function(){
		if(!he3d.running)return;
		he3d.timer.tick();
		window.requestAnimFrame(he3d.mainLoop);
		he3d.mode();
		he3d.r.drawFrame();
		he3d.i.reset();
		he3d.timer.frameTime=he3d.timer.now()-he3d.timer.wallCurrent;
	};

	he3d.pause=function(){
		if(he3d.running){
			he3d.log('DEBUG','*** PAUSED ***','');
			document.title+=' *** PAUSED ***';
			he3d.running=false;
		}else{
			he3d.log('DEBUG','*** UNPAUSED ***','');
			document.title=document.title.replace(' *** PAUSED ***','');
			he3d.running=true;
			he3d.mainLoop();
		}
	};

	//
	// Timer Functions -----------------------------------------------------------------------------
	//
	he3d.timer.now=function(){
		if(window.performance.now)
			return window.performance.now();
		if(window.performance.webkitNow)
			return window.performance.webkitNow();
		if(window.performance.mozNow)
			return window.performance.mozNow();
		return Date.now();
	};

	he3d.timer.tick=function(){
		he3d.timer.wallCurrent=he3d.timer.now();
		he3d.timer.wallDelta=(he3d.timer.wallCurrent-he3d.timer.wallLastTimestamp)/1000;

		if(he3d.timer.wallDelta>0.25)
			he3d.timer.wallDelta=0.25;

		he3d.timer.accum+=he3d.timer.wallDelta;
		he3d.timer.delta=0.016;
		if(he3d.timer.accum>he3d.timer.delta){
			he3d.timer.delta=he3d.timer.accum;		
			he3d.timer.accum=0;
		} else {
			he3d.timer.delta=0;
		}

		he3d.timer.wallLastTimestamp=he3d.timer.wallCurrent;
		he3d.timer.runningTime+=he3d.timer.delta;
	};
})(he3d);

// Wait for everything to load
document.addEventListener('DOMContentLoaded',he3d.load,false);
