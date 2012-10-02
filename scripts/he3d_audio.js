//
// Audio Functions
//
he3d.log('notice','Include Loaded...','Audio');
he3d.a={
	path:'sounds/',
	sounds:[],
	volume:new Number(0.5)
};

he3d.a.init=function(){
	try{
		var lsvolume=localStorage.getItem("volume");
		if(!isNaN(lsvolume)&&parseFloat(lsvolume)>=0&&parseFloat(lsvolume)<=1){
			he3d.a.volume=parseFloat(lsvolume);
			he3d.log('NOTICE','[Localstorage]',"Volume: "+parseFloat(lsvolume));
		}
	}catch(e){
		he3d.log('NOTICE','[Localstorage]','Unsupported');
		return false;
	}
};

//
// Loading -----------------------------------------------------------------------------------------
//
he3d.a.load=function(sound){
	var newsound={
		id:he3d.a.sounds.length,
		name:((sound.name!=undefined)?sound.name:''),
		loop:true,
		state:'stopped',
		volume:1.0
	};

	if(sound.loop!==undefined)
		newsound.loop=sound.loop;
	if(sound.volume!==undefined&&!isNaN(sound.volume)&&sound.volume>0.0&&sound.volume<1.01)
		newsound.volume=sound.volume;
	if(!sound.type||!sound.name){
		var f=sound.filename.split('.');
		if(f.length>1){
			sound.type=f[f.length-1];
			f.pop();
			sound.name=f.join('.');
		}
	}		
	newsound.name=sound.name;
	newsound.type=sound.type;
	
	switch(sound.type){
		case 'ogg':
		case 'wav':
			if(!sound.filename){
				he3d.log('WARNING','Failed to Load new Sound('+newsound.id+'):',
					'Invalid or missing filename for '+sound.type+' sound');
				return;
			}
			newsound.sound=new Audio(he3d.a.path+sound.filename)
			he3d.log('NOTICE','Loaded Sound('+newsound.id+'):',he3d.a.path+sound.filename);
			if(newsound.loop){
				if(typeof(newsound.sound.loop)=='boolean'){
					newsound.sound.loop=true;
				}else{
					newsound.sound.addEventListener('ended',function(){
						this.currentTime=0;
						this.pause();
						this.play();
					},false);
				}
			}			
			newsound.sound.volume=newsound.volume*he3d.a.volume;
			break;
	}

	he3d.a.sounds.push(newsound);
	return newsound.id;
};

//
// Controls ----------------------------------------------------------------------------------------
//
he3d.a.pause=function(sid){
	if(sid>he3d.a.sounds.length){
		he3d.log('WARNING','Invalid Sound id:',sid);
		return;
	}

	switch(he3d.a.sounds[sid].state){
		case 'playing':
			he3d.a.sounds[sid].sound.pause();
			he3d.a.sounds[sid].state='paused';
			break;
	}
};

he3d.a.play=function(sid){
	if(sid>he3d.a.sounds.length){
		he3d.log('WARNING','Invalid Sound id:',sid);
		return;
	}

	switch(he3d.a.sounds[sid].state){
		case 'paused':
		case 'stopped':
			he3d.a.sounds[sid].sound.play();
			he3d.a.sounds[sid].state='playing';
			break;
	}
};

he3d.a.stop=function(sid){
	if(sid>he3d.a.sounds.length){
		he3d.log('WARNING','Invalid Sound id:',sid);
		return;
	}

	switch(he3d.a.sounds[sid].state){
		case 'paused':
		case 'playing':
			he3d.a.sounds[sid].sound.pause();
			he3d.a.sounds[sid].sound.currentTime=0;
			he3d.a.sounds[sid].state='stopped';
			break;
	}
};

//
// Options -----------------------------------------------------------------------------------------
//
//	Volume -
//		There is our master volume he3d.a.volume,
//		our local 'mix' volume he3d.a.sounds[s].volume,
//		and the actual <audio> item sound he3d.a.sounds[s].sound.volume,
//		To get our output volume, we set item.volume=mixvol*master
//
he3d.a.setItemVolume=function(s,volume){
	if(isNaN(volume)||volume<0||volume>1)
		return;
	he3d.a.sounds[s].volume=volume;
	he3d.a.sounds[s].sound.volume=he3d.a.sounds[s].volume*he3d.a.volume;
};

he3d.a.setVolume=function(volume){
	if(isNaN(volume)||volume<0||volume>1){
		he3d.log('WARNING','New Volume Level is out of range:',volume);
		return;
	}
	he3d.a.volume=(new Number(volume)).toFixed(2);
	
	for(var s=0;s<he3d.a.sounds.length;s++)
		he3d.a.sounds[s].sound.volume=he3d.a.sounds[s].volume*he3d.a.volume;
	he3d.log('NOTICE','New Volume Level:',he3d.a.volume);

	try{
		localStorage.setItem("volume",he3d.a.volume);
		he3d.log('NOTICE',"[Localstorage] Volume:",he3d.a.volume);
	}catch (e){return false;}
};
