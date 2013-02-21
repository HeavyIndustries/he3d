//
// Canvas Extensions -------------------------------------------------------------------------------
//
CanvasRenderingContext2D.prototype.progressBar=function(s){
	var opts={
		height:10,
		width:100,
		barcolor:'#e9a800',
		bordercolor:'white',
		pmin:0,
		pmax:100,
		pad:4
	};
	for(var a in s){opts[a]=s[a];}

	var gval=(opts.pmax/opts.width)*100;
	var bval=(opts.pval/gval)*100;

	if(isNaN(bval)||bval<opts.pad)bval=opts.pad;

	this.save();
		this.fillStyle=opts.bordercolor;
		this.fillRect(0,0,opts.width,opts.height);

		this.fillStyle=opts.barcolor;
		this.fillRect(opts.pad/2,opts.pad/2,bval-opts.pad,opts.height-opts.pad);
	this.restore();
	return this;
};

CanvasRenderingContext2D.prototype.roundRect=function(x,y,width,height,radius,fill,stroke){
	if(typeof stroke==="undefined")
		stroke=true;
	if (typeof radius==="undefined")
		radius=5;
	this.beginPath();
		this.moveTo(x+radius,y);
		this.lineTo(x+width-radius,y);
		this.quadraticCurveTo(x+width,y,x+width,y+radius);
		this.lineTo(x+width,y+height-radius);
		this.quadraticCurveTo(x+width,y+height,x+width-radius,y+height);
		this.lineTo(x+radius,y+height);
		this.quadraticCurveTo(x,y+height,x,y+height-radius);
		this.lineTo(x,y+radius);
		this.quadraticCurveTo(x,y,x+radius,y);
	this.closePath();
	if(stroke)
		this.stroke();
	if(fill)
		this.fill();
	return this;
};
