//
// Shader Functions
//

he3d.log('notice', 'Include Loaded...', 'Shader');
he3d.s = {
	path: 	'shaders/', 
	shaders:[], 
	total:	0
};

he3d.s.load = function(newshader) {
	he3d.s.shaders[newshader.name] = {
		id:		he3d.s.total, 
		bind:	(newshader.bind ? newshader.bind : null), 
		frag:	null, 
		vertex:	null, 
		loaded:	false, 
		onLoad:	(newshader.onLoad ? newshader.onLoad : null)
	};
	he3d.s.total++;

	// Load Fragment Shader
	if (!newshader.frag)
		newshader.frag = newshader.name + ".frag.shader";
	var frag = he3d.s.path+newshader.frag;
	if (newshader.internal)
		frag = he3d.path + '../' + frag;

	he3d.log('NOTICE', 'Requesting Shader File:', "[" +
		newshader.name + "] Fragment Shader: " + frag);
		
	var fxhr = new XMLHttpRequest();
	fxhr.open('GET', frag);
	fxhr.addEventListener('error', function() {
		he3d.log('FATAL', 'Failed to retrieve Fragment Shader:', newshader.name);
	}, false);
	fxhr.addEventListener('load', function() {
		if (fxhr.status != 200) {
			he3d.log('FATAL', 'Failed to retrieve Fragment Shader:', 
				newshader.name + " (Http Status: " + fxhr.status + ")");
			return;
		}
		he3d.s.compileFragmentShader(newshader.name, fxhr.responseText);
	}, false);
	fxhr.send();

	// Load Vertex Shader
	if (!newshader.vertex)
		newshader.vertex = newshader.name + ".vertex.shader";
	var vertex = he3d.s.path + newshader.vertex;
	if (newshader.internal)
		vertex = he3d.path + '../' + vertex;

	he3d.log('NOTICE', 'Requesting Shader File:', "[" +
		newshader.name + "] Vertex Shader: " + vertex);
		
	var vxhr = new XMLHttpRequest();
	vxhr.open('GET', vertex);
	vxhr.addEventListener('error', function() {
		he3d.log('FATAL', 'Failed to retrieve Vertex Shader:', newshader.name);
	}, false);
	vxhr.addEventListener('load', function() {
		if (vxhr.status != 200) {
			he3d.log('FATAL', 'Failed to retrieve Vertex Shader:', 
				newshader.name + " (Http Status: " + vxhr.status + ")");
			return;
		}
		he3d.s.compileVertexShader(newshader.name, vxhr.responseText);
	}, false);
	vxhr.send();
};

he3d.s.checkQueue = function() {
	var loaded = 0;
	for (var s in he3d.s.shaders) {
		if (he3d.s.shaders[s].loaded) {
			loaded++;
			continue;
		}

		if (he3d.s.shaders[s].frag == null || he3d.s.shaders[s].vertex == null)
			continue;

		var newShader = he3d.gl.createProgram();
		he3d.gl.attachShader(newShader, he3d.s.shaders[s].vertex);
		he3d.gl.attachShader(newShader, he3d.s.shaders[s].frag);
		he3d.gl.linkProgram(newShader);

		// Catch Linker Errors
		if (!he3d.gl.getProgramParameter(newShader, he3d.gl.LINK_STATUS)) {
			he3d.log('FATAL', "Could not initialise [" + s + "] shader:\n",
				he3d.gl.getProgramInfoLog(newShader));
			return false;
		}

		// Attrib Variable Bindings
		newShader.attributes = [];
		if (he3d.s.shaders[s].fattribs||he3d.s.shaders[s].vattribs) {
			var attribs = he3d.s.shaders[s].fattribs.concat(he3d.s.shaders[s].vattribs);
			for (var a in attribs) {
				if ((newShader.attributes[attribs[a]] = he3d.gl.getAttribLocation(
					newShader, attribs[a])) == -1) {
					he3d.log('WARNING', '[' + s + '] invalid Attribute location for:', attribs[a]);
				}
			};
			he3d.log('NOTICE', "Shader Attributes [" + s + "]:", attribs.length);
		}

		// Uniform Variable Bindings
		newShader.uniforms = [];
		if (he3d.s.shaders[s].fattribs||he3d.s.shaders[s].vattribs) {
			var uniforms = he3d.s.shaders[s].funiforms.concat(he3d.s.shaders[s].vuniforms);
			for (var u in uniforms) {
				if ((newShader.uniforms[uniforms[u]] = he3d.gl.getUniformLocation(
					newShader, uniforms[u])) === null) {
					he3d.log('WARNING', '['+s+'] invalid or unused '+
						'Uniform location for:', uniforms[u]);
				}
			};
			he3d.log('NOTICE', "Shader Uniforms [" + s + "]:", uniforms.length);
		}

		if (he3d.s.shaders[s].onLoad)
			var onload = he3d.s.shaders[s].onLoad;

		newShader.bind = null;
		if (he3d.s.shaders[s].bind)
			newShader.bind = he3d.s.shaders[s].bind;
		var sid = he3d.s.shaders[s].id;
		he3d.s.shaders[s] = newShader;
		he3d.s.shaders[s].loaded = true;
		he3d.s.shaders[s].bound = false;
		he3d.s.shaders[s].name = s;
		he3d.s.shaders[s].id = sid;

		he3d.log('NOTICE', "Shader Program [" + s + "]:", "Compiled");

		if (onload)
			onload();
		onload = null;

		loaded++;
	}

	if (loaded == he3d.s.total)
		return true;
	return false;
};

//
// Compile Functions -------------------------------------------------------------------------------
//
he3d.s.compileFragmentShader = function(name, data) {
	he3d.log('NOTICE', 'Compiling Fragment Shader:', name);

	he3d.s.shaders[name].frag = he3d.gl.createShader(he3d.gl.FRAGMENT_SHADER);
	he3d.gl.shaderSource(he3d.s.shaders[name].frag, data);
	he3d.gl.compileShader(he3d.s.shaders[name].frag);

	he3d.s.shaders[name].fdefines = he3d.s.getVars('define', data);
	he3d.s.shaders[name].fstructs = he3d.s.getVars('struct', data);
	he3d.s.shaders[name].fattribs = he3d.s.getVars('attribute', data);
	he3d.s.shaders[name].funiforms = he3d.s.getVars('uniform', data, 
		he3d.s.shaders[name].fstructs, he3d.s.shaders[name].fdefines);

	if (!he3d.gl.getShaderParameter(he3d.s.shaders[name].frag, he3d.gl.COMPILE_STATUS)) {
		he3d.log('FATAL', "[" + name + "] Fragment Compile Error:", 
			he3d.gl.getShaderInfoLog(he3d.s.shaders[name].frag));
		return;
	}
};

he3d.s.compileVertexShader = function(name, data) {
	he3d.log('NOTICE', 'Compiling Vertex Shader:', name);

	he3d.s.shaders[name].vertex = he3d.gl.createShader(he3d.gl.VERTEX_SHADER);
	he3d.gl.shaderSource(he3d.s.shaders[name].vertex, data);
	he3d.gl.compileShader(he3d.s.shaders[name].vertex);

	he3d.s.shaders[name].vdefines = he3d.s.getVars('define', data);
	he3d.s.shaders[name].vstructs = he3d.s.getVars('struct', data);
	he3d.s.shaders[name].vattribs = he3d.s.getVars('attribute', data);
	he3d.s.shaders[name].vuniforms = he3d.s.getVars('uniform', data, 
		he3d.s.shaders[name].vstructs, he3d.s.shaders[name].vdefines);

	if (!he3d.gl.getShaderParameter(he3d.s.shaders[name].vertex, he3d.gl.COMPILE_STATUS)) {
		he3d.log('FATAL', "[" + name + "] Vertex Compile Error:", 
			he3d.gl.getShaderInfoLog(he3d.s.shaders[name].vertex));
		return;
	}
};

he3d.s.getVars = function(type, src, structs, defines) {
	var vars = [];
	if (!type || !src)
		return vars;

	switch(type) {
		case 'attribute':
			var matches = src.match(/attribute (.*?) (.*?);/gi);
			for (var m in matches) {
				var v = matches[m].split(" ");
				var cut = v[2].indexOf("[");
				if (cut > 0)
					vars.push(v[2].substring(0, cut));
				else
					vars.push(v[2].substring(0, v[2].length - 1));
			}
			return vars;
			break;

		case 'define':
			var matches = src.match(/\#define (.*?) (.*?)\n/gi);
			for (var m in matches) {
				var v = matches[m].split(" ");
				var arg = matches[m].substr(matches[m].indexOf(v[1]) + v[1].length);
				vars[v[1]] = arg.trim();
			}
		
			return vars;
			break;

		case 'struct':
			var matches = src.replace(/\n/g, "").match(/struct (.*?) {(.*?)};/gi);
			for (var m in matches) {
				var name = matches[m].match(/struct (.*?) {/gi)[0].split(" ")[1];
				var props = matches[m].substring(matches[m].indexOf("{") + 1, 
					matches[m].indexOf("};")).split(";");
				props.pop();
				vars[name] = [];
				for (var p in props) {
					var v = props[p].trim().split(" ");
					var cut = v[1].indexOf("[");
					if (cut > 0)
						vars[name].push(v[1].substring(0, cut));
					else
						vars[name].push(v[1]);
				}
			}
			return vars;
			break;

		case 'uniform':
			var matches = src.match(/uniform (.*?) (.*?);/gi);
			for (var m in matches) {
				var v = matches[m].split(" ");

				// Struct data type uniform
				var sid = null;
				for (s in structs) {
					if (v[1] == s) {
						sid = s;
						break;
					}
				}

				var cut = v[2].indexOf("[");
				var u;
				// Array
				if (cut > 0) {
					u = v[2].substring(0, cut);
					var size = v[2].substring(cut + 1, v[2].indexOf("]"));
					if (isNaN(size)) {
						for (var d in defines) {
							if (size == d) {
								size = defines[d];
								break;
							}
						}
					}

					for (var s = 0; s < size; s++) {
						if (sid)
							for (var st in structs[sid]){
								vars.push(v[2].substr(0, cut) + "[" + s + "]." + structs[sid][st]);
							}
						else
							vars.push(v[2].substr(0, cut) + "[" + s + "]");
					}
					
					// Pass full name on to root entry in the single entry too
					v[2] = v[2].substr(0, cut + 1);
				}

				// Non-struct root entry
				if (!sid)
					vars.push(v[2].substring(0, v[2].length - 1));
			}
			return vars;
			break;

		default:
			dlog("Warning: unknown shader variable type - " + type);
			return vars;
			break;
	}
};
