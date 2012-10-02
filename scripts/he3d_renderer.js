//
// Renderer Functions
//
he3d.log('notice','Include Loaded...','Renderer');
he3d.r={
	clearColor:[0.0,0.0,0.0,0.0],
	culling:true,
	curProgram:null,
	debugCtx:false,
	fps:{
		current:1,
		count:0,
		favicon:{
			enabled:false,
			size:[16,16]
		},
		last:he3d.timer.now(),
		now:0,
		show:0
	},
	glAttribs:{},
	glExts:{},
	glOpts:{
		alpha:true,
		antialias:true,
		depth:true,
		stencil:true,
		premultipledAlpha:true,
		preserveDrawingBuffer:false
	},
	glLimits:{
		maxaf:0,
		textures:16
	},
	fullscreen:false,
	mvMatrixStack:[],
	renderables:[],
	targets:{
		FS1:{
			fbo:null,
			rbo:null
		}
	},
	windowsize:[960,540]
};

//
// Init Renderer -----------------------------------------------------------------------------------
//
he3d.r.init=function(){
	he3d.canvas=document.getElementById('he3d');
	try{
		if(he3d.r.debugCtx){
			he3d.gl=WebGLDebugUtils.makeDebugContext(he3d.canvas.getContext(
				"experimental-webgl",he3d.r.glOpts),he3d.r.throwOnGLError);
			he3d.log('WARNING',"Using WebGL Debug Context, performance may be degraded!",'');
		}else{
			he3d.gl=he3d.canvas.getContext("experimental-webgl",he3d.r.glOpts);
		}
		
		he3d.gl.viewportHeight=he3d.canvas.height;
		he3d.gl.viewportWidth=he3d.canvas.width;
	}catch(e){
		he3d.log('FATAL','renderer.init():','Failed to get WebGL Context - '+e);
		return false;
	}

	he3d.logo(true);

	try{
		var lsfullscreen=localStorage.getItem("fullscreen");
		if(parseInt(lsfullscreen)==1)
			he3d.r.fullscreen=true;
		he3d.log('NOTICE','[Localstorage]',"Fullscreen: "+((lsfullscreen)?'True':'False'));
	}catch (e){
		he3d.log('NOTICE','[Localstorage]','Unsupported');
		return false;
	}
	try{
		var lsfxaa=localStorage.getItem("fxaa");
		if(parseInt(lsfxaa)==1)
			he3d.fx.postProcessing.options.fxaa=true;
		he3d.log('NOTICE','[Localstorage]',"FXAA: "+((lsfxaa)?'Enabled':'Disabled'));
	}catch (e){
		he3d.log('NOTICE','[Localstorage]','Unsupported');
		return false;
	}

	if(he3d.platform=='mobile')
		he3d.r.fullscreen=true;

	he3d.r.listCaps();
	he3d.r.initViewMatrices();
	he3d.r.targets.FS1=he3d.r.targets.create();	// Default FullScreen Render Target
	he3d.r.windowResize();
	he3d.fx.postProcessing.init();
};

he3d.r.listCaps=function(){
	he3d.log('NOTICE',"GL Version:",he3d.gl.getParameter(he3d.gl.VERSION));
	he3d.log('NOTICE',"GL Vendor:",he3d.gl.getParameter(he3d.gl.VENDOR));
	he3d.log('NOTICE',"GL Renderer:",he3d.gl.getParameter(he3d.gl.RENDERER));
	he3d.log('NOTICE',"GL Shader Version:",he3d.gl.getParameter(he3d.gl.SHADING_LANGUAGE_VERSION));
	he3d.log('NOTICE',"GL Max Vertex Attributes:",he3d.gl.getParameter(he3d.gl.MAX_VERTEX_ATTRIBS));
	he3d.log('NOTICE',"GL Max Vertex Uniform Vectors:",
		he3d.gl.getParameter(he3d.gl.MAX_VERTEX_UNIFORM_VECTORS));
	he3d.log('NOTICE',"GL Max Varying Vectors:",
		he3d.gl.getParameter(he3d.gl.MAX_VARYING_VECTORS));
	he3d.log('NOTICE',"GL Max Fragment Uniform Vectors:",
		he3d.gl.getParameter(he3d.gl.MAX_FRAGMENT_UNIFORM_VECTORS));
	he3d.log('NOTICE',"GL Max Combined Texture Image Units:",
		he3d.gl.getParameter(he3d.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
	he3d.log('NOTICE',"GL Max Vertex Texture Image Units:",
		he3d.gl.getParameter(he3d.gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
	he3d.log('NOTICE',"GL Max Texture Image Units:",
		he3d.r.glLimits.textures=he3d.gl.getParameter(he3d.gl.MAX_TEXTURE_IMAGE_UNITS));
	he3d.log('NOTICE',"GL RGBA:",
		he3d.gl.getParameter(he3d.gl.RED_BITS)+'/'
		+he3d.gl.getParameter(he3d.gl.GREEN_BITS)+'/'
		+he3d.gl.getParameter(he3d.gl.BLUE_BITS)+'/'
		+he3d.gl.getParameter(he3d.gl.ALPHA_BITS));

	he3d.r.glExts=he3d.gl.getSupportedExtensions();
	if(he3d.r.glExts.length){
		he3d.log('NOTICE',"GL Extensions:",'');
		for(var gle=0;gle<he3d.r.glExts.length;gle++){
			he3d.log('NOTICE',"\t"+he3d.r.glExts[gle]);

			// Latch onto EXT_texture_filter_anisotropic
			if(he3d.r.glExts[gle]=='MOZ_EXT_texture_filter_anisotropic'||
				he3d.r.glExts[gle]=='WEBKIT_EXT_texture_filter_anisotropic'||
				he3d.r.glExts[gle]=='EXT_texture_filter_anisotropic'){
				if(!(he3d.t.af.ext=he3d.gl.getExtension(he3d.r.glExts[gle])))
					he3d.t.af.max=he3d.gl.getParameter(he3d.t.af.ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
			}
		}
	}

	if(he3d.t.af.ext)
		he3d.log('NOTICE',"GL Max Texture Anisotropy:",he3d.t.af.max);
		
	he3d.log('NOTICE',"GL Context:",he3d.gl.viewportWidth+"x"+he3d.gl.viewportHeight);

	he3d.r.glAttribs=he3d.gl.getContextAttributes();
	he3d.log('NOTICE',"GL Context Attributes","");
	he3d.log('NOTICE',"\tAlpha",
		he3d.r.glAttribs.alpha+" (Requested: "+he3d.r.glOpts.alpha+")");
	he3d.log('NOTICE',"\tAntiAlias:",he3d.r.glAttribs.antialias
		+" (Requested: "+he3d.r.glOpts.antialias+")");
	he3d.log('NOTICE',"\tDepth:",he3d.r.glAttribs.depth
		+" (Requested: "+he3d.r.glOpts.depth+")");
	he3d.log('NOTICE',"\tStencil:",he3d.r.glAttribs.stencil
		+" (Requested: "+he3d.r.glOpts.stencil+")");
	he3d.log('NOTICE',"\tPremultipled Alpha:",
		he3d.r.glAttribs.premultipledAlpha+" (Requested: "+he3d.r.glOpts.premultipledAlpha+")");
	he3d.log('NOTICE',"\tPreserve Drawing Buffer:",
		he3d.r.glAttribs.preserveDrawingBuffer+" (Requested: "+
		he3d.r.glOpts.preserveDrawingBuffer+")");

	he3d.gl.clearDepth(1.0);
	he3d.log('NOTICE',"GL DEPTH BUFFER:",he3d.gl.getParameter(he3d.gl.DEPTH_BITS)+"bit");
	
	he3d.gl.enable(he3d.gl.DEPTH_TEST);
	he3d.gl.depthFunc(he3d.gl.LEQUAL);
	he3d.log('NOTICE',"GL DEPTH_TEST:","LEQUAL");

	he3d.gl.polygonOffset(1.0,1.0);
	he3d.log('NOTICE',"GL POLYGON OFFSET:",he3d.gl.getParameter(he3d.gl.POLYGON_OFFSET_FACTOR)
		+","+he3d.gl.getParameter(he3d.gl.POLYGON_OFFSET_UNITS));

	he3d.r.setCulling(he3d.r.culling);

	he3d.gl.blendFunc(he3d.gl.SRC_ALPHA,he3d.gl.ONE_MINUS_SRC_ALPHA);
	he3d.log('NOTICE',"GL BLENDFUNC:","SRC_ALPHA,ONE_MINUS_SRC_ALPHA");
};

he3d.r.hasGLExt=function(ext){
	for(var gle=0;gle<he3d.r.glExts.length;gle++)
		if(he3d.r.glExts[gle]==ext)
			return true;
	return false;
};

he3d.r.throwOnGLError=function(err,funcName,args){
	var error=WebGLDebugUtils.glEnumToString(err)+" was caused by call to "
		+funcName+"("+JSON.stringify(args)+")";
	he3d.log("FATAL","WEBGL Error:",error);
	if(he3d.r.curProgram){
		he3d.log("NOTICE","Current Shader:",he3d.r.curProgram.name);
		for(var a in he3d.r.curProgram.attributes)
			he3d.log("\t"+a+" - "+he3d.r.curProgram.attributes[a]);
		for(var u in he3d.r.curProgram.uniforms)
			he3d.log("\t"+u+" - "+he3d.r.curProgram.uniforms[u]);
	}
};

he3d.r.changeProgram=function(prog){
	if(he3d.r.curProgram==null||prog!=he3d.r.curProgram.name){
		// Disable Active Attrs
		if(he3d.r.curProgram!=null)
			for(var a in he3d.r.curProgram.attributes)
				he3d.gl.disableVertexAttribArray(he3d.r.curProgram.attributes[a]);

		he3d.r.curProgram=he3d.s.shaders[prog];
		he3d.gl.useProgram(he3d.r.curProgram);
		
		if(!he3d.r.curProgram.bound&&he3d.r.curProgram.bind!=null)
			he3d.r.curProgram.bind();
	}
};

//
// Draw Functions ----------------------------------------------------------------------------------
//
he3d.r.drawFrame=function(){
	he3d.r.fps.update();

	he3d.fx.postProcessing.pass();

	// Render final pass into main Frame Buffer
	he3d.gl.viewport(0,0,he3d.gl.viewportWidth,he3d.gl.viewportHeight);
	he3d.gl.clearColor(
		he3d.r.clearColor[0],
		he3d.r.clearColor[1],
		he3d.r.clearColor[2],
		he3d.r.clearColor[3]
	);
//	he3d.gl.clear(he3d.gl.COLOR_BUFFER_BIT|he3d.gl.DEPTH_BUFFER_BIT);

	if(he3d.t.viewer.enabled){
		he3d.t.viewer.draw();
		he3d.hud.update();
		return;
	}

	he3d.fx.postProcessing.draw();
		
	he3d.hud.update();
	if(he3d.hud.mode=='3d')
		he3d.hud.draw();	
};

he3d.r.fps.update=function(){
	he3d.r.fps.now=he3d.timer.now();
	if(he3d.r.fps.now-he3d.r.fps.last>=1000){
		he3d.r.fps.current=(he3d.r.fps.count/(he3d.r.fps.now-he3d.r.fps.last)*1000)|0;
		he3d.r.fps.favicon.update();
		he3d.r.fps.count=0;
		he3d.r.fps.last=he3d.r.fps.now;
	}
	he3d.r.fps.count++;
};

//
// Favicon FPS Functions ---------------------------------------------------------------------------
//
he3d.r.fps.favicon.init=function(){
	if(!this.enabled)
		return;
	this.canvas=document.createElement('canvas');
	this.canvas.setAttribute('width',this.size[0]);  
	this.canvas.setAttribute('height',this.size[1]);
	this.canvas.setAttribute('id','fpsfavicon');
	
	this.ctx=this.canvas.getContext('2d');
	this.ctx.setTransform(1,0,0,1,0,0);
	this.ctx.clearRect(0,0,this.size[0],this.size[1]);
	this.ctx.textAlign='left';
	this.ctx.font="normal 8px impact";

	this.target=document.getElementById('favicon');
};

he3d.r.fps.favicon.toggle=function(t){
	this.enabled=t;
	if(t&&!this.ctx){
		this.init();
	}else if(!t){
		var head=this.target.parentNode;
		head.removeChild(this.target);
		this.target=document.createElement("link");
		this.target.setAttribute('rel','Shortcut Icon');
		this.target.setAttribute('type','image/png');
		this.target.setAttribute('href','favicon.png');
		head.appendChild(this.target);
	}		
};

he3d.r.fps.favicon.update=function(){
	if(!this.enabled)
		return;
	this.ctx.fillStyle='#000';
	this.ctx.fillRect(0,0,this.size[0],this.size[1]);
	if(he3d.r.fps.count>30)
		this.ctx.fillStyle="#0f0";
	else if(he3d.r.fps.count>15)
		this.ctx.fillStyle="#FA0";
	else
		this.ctx.fillStyle="#F00";
	this.ctx.fillText('FPS',2,7);
	this.ctx.fillText(he3d.r.fps.count,4,15);
	
	var head=this.target.parentNode;
	head.removeChild(this.target);
	this.target=document.createElement("link");
	this.target.setAttribute('rel','Shortcut Icon');
	this.target.setAttribute('type','image/png');
	this.target.setAttribute('href',this.canvas.toDataURL("image/png"));
	head.appendChild(this.target);
};

//
// Matrices ----------------------------------------------------------------------------------------
//
he3d.r.initViewMatrices=function(){
	he3d.r.pMatrix=he3d.m.mat4.create();
	he3d.log('NOTICE','Matrix Create:','Perspective');

	he3d.r.mvMatrix=he3d.m.mat4.create();
	he3d.log('NOTICE','Matrix Create:','Model View');
	
	he3d.r.worldPosMatrix=he3d.m.mat4.identity(he3d.m.mat4.create());
	he3d.log('NOTICE','Matrix Create:','World Pos');
};

he3d.r.mvPushMatrix=function(){
	var copy=he3d.m.mat4.create();
	he3d.m.mat4.set(he3d.r.mvMatrix,copy);
	he3d.r.mvMatrixStack.push(copy);
};

he3d.r.mvPopMatrix=function(){
	if(!he3d.r.mvMatrixStack.length){
		he3d.log('FATAL',"Invalid popMatrix!");
		return;
	}
	he3d.r.mvMatrix=he3d.r.mvMatrixStack.pop();
};

//
// Render Targets ----------------------------------------------------------------------------------
//
he3d.r.targets.create=function(o){
	var targ={
		depth:he3d.gl.DEPTH_COMPONENT16,
		height:he3d.canvas.height,
		width:he3d.canvas.width
	};
	if(!o)o={};
	for(var a in o){targ[a]=o[a];}

	// Create Frame Buffer
	targ.fbo=he3d.gl.createFramebuffer();
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER,targ.fbo);

	// Create Render Buffer
	targ.rbo=he3d.gl.createRenderbuffer();
	he3d.gl.bindRenderbuffer(he3d.gl.RENDERBUFFER,targ.rbo);
	if(targ.depth==he3d.gl.DEPTH_STENCIL&&he3d.r.glAttribs.stencil){
		he3d.gl.renderbufferStorage(he3d.gl.RENDERBUFFER,he3d.gl.DEPTH_STENCIL,
			targ.width,targ.height);
		he3d.gl.framebufferRenderbuffer(he3d.gl.FRAMEBUFFER,he3d.gl.DEPTH_STENCIL_ATTACHMENT,
			he3d.gl.RENDERBUFFER,targ.rbo);
	}else{
		he3d.gl.renderbufferStorage(he3d.gl.RENDERBUFFER,he3d.gl.DEPTH_COMPONENT16,
			targ.width,targ.height);
		he3d.gl.framebufferRenderbuffer(he3d.gl.FRAMEBUFFER,he3d.gl.DEPTH_ATTACHMENT,
			he3d.gl.RENDERBUFFER,targ.rbo);
	}

	// Colour Attachment
	if(targ.texture)
		he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER,he3d.gl.COLOR_ATTACHMENT0,
			he3d.gl.TEXTURE_2D,targ.texture,0);

	he3d.log('NOTICE',"New Render Target Created:",targ.width+"x"+targ.height);

	// Reset active buffers to null
	he3d.gl.bindRenderbuffer(he3d.gl.RENDERBUFFER,null);
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER,null);

	return targ;
};

he3d.r.targets.resize=function(targ,width,height){
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER,targ.fbo);

	targ.height=height;
	targ.width=width;
	he3d.gl.bindRenderbuffer(he3d.gl.RENDERBUFFER,targ.rbo);
	he3d.gl.renderbufferStorage(he3d.gl.RENDERBUFFER,he3d.gl.DEPTH_COMPONENT16,
		targ.width,targ.height);

	if(targ.depth==he3d.gl.DEPTH_STENCIL&&he3d.r.glAttribs.stencil){
		he3d.gl.renderbufferStorage(he3d.gl.RENDERBUFFER,he3d.gl.DEPTH_STENCIL,
			targ.width,targ.height);
		he3d.gl.framebufferRenderbuffer(he3d.gl.FRAMEBUFFER,he3d.gl.DEPTH_STENCIL_ATTACHMENT,
			he3d.gl.RENDERBUFFER,targ.rbo);
	}else{
		he3d.gl.renderbufferStorage(he3d.gl.RENDERBUFFER,he3d.gl.DEPTH_COMPONENT16,
			targ.width,targ.height);
		he3d.gl.framebufferRenderbuffer(he3d.gl.FRAMEBUFFER,he3d.gl.DEPTH_ATTACHMENT,
			he3d.gl.RENDERBUFFER,targ.rbo);
	}

	he3d.gl.bindRenderbuffer(he3d.gl.RENDERBUFFER,null);
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER,null);
};

//
// Events Handlers ---------------------------------------------------------------------------------
//
he3d.r.setCulling=function(c){
	if(c==undefined)
		c=!he3d.r.culling;
	he3d.r.culling=c;
	
	if(he3d.r.culling){
		he3d.gl.enable(he3d.gl.CULL_FACE);
		he3d.gl.cullFace(he3d.gl.BACK);
		he3d.gl.frontFace(he3d.gl.CCW);
		he3d.log('NOTICE',"Renderer.culling",'Enabled');
		he3d.log('NOTICE',"GL CULL_FACE:","BACK");
		he3d.log('NOTICE',"GL FRONT_FACE:","CCW");
	}else{
		he3d.gl.disable(he3d.gl.CULL_FACE);
		he3d.log('NOTICE',"Renderer.culling",'Disabled');
	}
};

he3d.r.setFullScreen=function(fs){
	if(fs==undefined)
		fs=!he3d.r.fullscreen;
	he3d.r.fullscreen=fs;
	try{
		localStorage.setItem("fullscreen",((he3d.r.fullscreen)?1:0));
		he3d.log('NOTICE',"[Localstorage] Fullscreen: ",((he3d.r.fullscreen)?'True':'False'));
	}catch (e){return false;}
	he3d.r.windowResize();
};

he3d.r.setFXAA=function(fs){
	if(fs==undefined)
		fs=!he3d.fx.postProcessing.options.fxaa;
	he3d.fx.postProcessing.options.fxaa=fs;
	try{
		localStorage.setItem("fxaa",((he3d.fx.postProcessing.options.fxaa)?1:0));
		he3d.log('NOTICE',"[Localstorage] FXAA: ",
			((he3d.fx.postProcessing.options.fxaa)?'Enabled':'Disabled'));
	}catch (e){return false;}
	he3d.s.shaders[he3d.fx.postProcessing.shader].bound=false;
};

he3d.r.windowResize=function(e){
	if(he3d.r.fullscreen){
		he3d.gl.viewportHeight=he3d.canvas.height=window.innerHeight;
		he3d.gl.viewportWidth=he3d.canvas.width=window.innerWidth;
	}else{
		// Nothings changed!
		if(he3d.canvas.height==he3d.r.windowsize[1]&&he3d.canvas.width==he3d.r.windowsize[0])
			return;
		he3d.gl.viewportHeight=he3d.canvas.height=he3d.r.windowsize[1];
		he3d.gl.viewportWidth=he3d.canvas.width=he3d.r.windowsize[0];
	}

	he3d.hud.resize();

	// Resize Targets and FX
	he3d.r.targets.resize(he3d.r.targets.FS1,he3d.canvas.width,he3d.canvas.height);
	for(var fx in he3d.fx){
		if(typeof he3d.fx[fx].resize==='function')
			he3d.fx[fx].resize();
	}
};

//
// Onload Initialisers -----------------------------------------------------------------------------
//
window.onresize=he3d.r.windowResize;
window.requestAnimFrame=(function(){
  return window.requestAnimationFrame
		|| window.webkitRequestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.oRequestAnimationFrame
		|| window.msRequestAnimationFrame	// lulz?
		|| function(callback,element){
			window.setTimeout(callback,1000/60);
		};
})();
