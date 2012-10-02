//
// Context Menu Functions
//
he3d.log('notice','Include Loaded...','ContextMenu');
he3d.contextMenu={
	items:[
		{label:'Fullscreen',icon:'../he3d/images/fsicon.png',onclick:'he3d.r.setFullScreen();'},
		{label:'FXAA',icon:'../he3d/images/fxaaicon.png',onclick:'he3d.r.setFXAA();'},
		{label:'Console',icon:'../he3d/images/consoleicon.png',onclick:'he3d.console.toggle();'}
	]
};

he3d.contextMenu.init=function(){
	if(!'contextMenu' in document.body){
		he3d.log('NOTICE',"ContextMenu not supported on this Browser");
		return;
	}

	// Root Menu
	var rootmenu=document.createElement('menu');
	rootmenu.setAttribute('id','he3dmenu');
	rootmenu.setAttribute('type','context');
	he3d.canvas.parentNode.insertBefore(rootmenu,he3d.canvas);

	// Sub Menu
	this.menu=document.createElement('menu');
	this.menu.setAttribute('label','Heavy Engine 3D');
	rootmenu.appendChild(he3d.contextMenu.menu);

	// Menu Items
	for(var i=0;i<this.items.length;i++){
		var item=document.createElement('menuitem');
		for(var a in this.items[i])
			item.setAttribute(a,this.items[i][a]);
		this.menu.appendChild(item);
	}

	// Link to renderer target canvas
	he3d.canvas.setAttribute('contextmenu','he3dmenu');
};
