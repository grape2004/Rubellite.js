/*----------------------------------------------------------
  Rubellite  ver 1.00  2012.06.24
    Rubellite is not implementation of Ruby language.
    It provides coding such as Ruby restrictively.
      License    : MIT
      Written by : S.Murakoshi( grape@nona.dti.ne.jp )
----------------------------------------------------------*/

/*--------------------------------------
  Wrap function
--------------------------------------*/
function $rb( obj ) {
	
	if ( !arguments.callee.rubellite ) {
		arguments.callee.rubellite = new $Rubellite();
	}
	var $rubellite = arguments.callee.rubellite;
	
	
	if ( $rubellite.isRubelliteClass( obj ) ) {
		return obj;
	}
	
	// wrapping object
	var wrapObj = null;
	switch( typeof obj ) {
	case "string":
		wrapObj = $rubellite.createRbString();
		break;
	case "number":
		wrapObj = $rubellite.createRbNumber();
		break;
	case "boolean":
		wrapObj = $rubellite.createRbBoolean();
		break;
	case "function":
		wrapObj = $rubellite.createRbFunction();
		break;
	default:
		if ( obj instanceof Array ) {
			wrapObj = $rubellite.createRbArray();
		}
		else {
			wrapObj = $rubellite.createRbObject();
			wrapObj.default_value = null;
		}
	}
	wrapObj.context = obj;
	return wrapObj;
	
	
	/*--------------------------------------
	  Rubellite implements
	--------------------------------------*/
	function $Rubellite() {
		/*--------------------------------------
		  Common function
		--------------------------------------*/
		var rubellite_user_agent = window.navigator.userAgent.toLowerCase();
		var rubellite_ua = null;
		var rubellite_is_local = null;
		function get_user_agent() {
			if ( null != rubellite_ua ) { return rubellite_ua; }
			if (rubellite_user_agent.indexOf('opera') != -1) {
				rubellite_ua = 'opera';
			}
			else if (rubellite_user_agent.indexOf('msie') != -1) {
				rubellite_ua = 'ie';
			}
			else if (rubellite_user_agent.indexOf('chrome') != -1) {
				rubellite_ua = 'chrome';
			}
			else if (rubellite_user_agent.indexOf('safari') != -1) {
				rubellite_ua = 'safari';
			}
			else if (rubellite_user_agent.indexOf('gecko') != -1) {
				rubellite_ua = 'gecko';
			}
			else {
				rubellite_ua = false;
			}
			return rubellite_ua;
		}
		
		function is_local() {
			if ( null != rubellite_is_local ) { return rubellite_is_local; }
			rubellite_is_local = ( "file://" == location.toString().slice( 0, 7 ) );
			return rubellite_is_local;
		}
		
		function safe_obj( obj ) {
			obj = $rb( obj );
			if ( null == obj || typeof( obj ) != "object" ) { return obj }
			if ( typeof( obj.to_i ) == "undefined" ) {
				obj = $rb( obj );
				if ( is_local() ) {
					obj.sessionStorage = null;
					obj.localStorage = null;
				}
				if ( typeof( sessionStorage ) === 'undefined' ) {
					obj.sessionStorage = null;
					obj.localStorage = null;
				}
			}
			return obj;
		}
		
		/*--------------------------------------
		  Enumerable
		--------------------------------------*/
		var enumerableExMethods = {
			'is_all': function(){
				var flag = true;
				if ( 0 == arguments.length ) {
					this.each( function( val ) {
						if ( typeof( val ) == "boolean" ) {
							val ? true : flag=false;
						}
						else if ( null == val || typeof( val ) == "undefined" ) {
							flag=false;
						}
					});
				}
				else {
					if ( typeof( arguments[0] ) != "function" ) {
						return $rb(false);
					}
					var yield = arguments[0];
					this.each( function( val ) {
						var res;
						res = $unrb( yield.apply( this, [val] ) );
						if ( typeof( res ) == "boolean" ) {
							res ? true : flag=false;
						}
						else if ( null == res || typeof( res ) == "undefined" ) {
							flag=false;
						}
					});
				}
				return $rb(flag);
			},
			'is_any': function(){
				var flag = false;
				if ( 0 == arguments.length ) {
					this.each( function( val ) {
						if ( typeof( val ) == "boolean" ) {
							val ? flag=true : false;
						}
						else if ( null != val && typeof( val ) != "undefined" ) {
							flag=true;
						}
					});
				}
				else {
					if ( typeof( arguments[0] ) != "function" ) {
						return $rb(false);
					}
					var yield = arguments[0];
					this.each( function( val ) {
						var res;
						res = $unrb( yield.apply( this, [val] ) );
						if ( typeof( res ) == "boolean" ) {
							res ? flag=true : false;
						}
						else if ( null != res && typeof( res ) != "undefined" ) {
							flag=true;
						}
					});
				}
				return $rb(flag);
			},
			'is_array': function(){ return $rb(false); },
			'collect': function( yield ){
				if ( typeof( yield ) != "function" ) {
					return this;
				}
				var retAry = $rb( new Array() );
				this.each( function( val ){
					retAry.context[ retAry.context.length ] = $unrb( yield.apply( this, [val] ));
				});
				return retAry;
			},
			'map': function(){ return this.collect.apply( this, arguments ); },
			'each_with_index': function( yield ){
				if ( typeof( yield ) == "function" ) {
					var idx = 0;
					this.each( function( val ){
						yield.apply( this, [ val, idx ] );
						idx += 1;
					});
				}
				return this;
			},
			'find': function( yield ){
				if ( typeof( yield ) != "function" ) {
					return $rb(null);
				}
				var elm = null;
				var res = null;
				this.each( function( elm ){
					if ( null == res && $unrb( yield.apply( this, [elm] )) ){
						res = elm;
					}
				});
				if ( null == res ) {
					if ( 2 <= arguments.length ) {
						if ( typeof( arguments[1] ) == "function" ) {
							arguments[1].apply( this );
						}
					}
				}
				return $rb(res);
			},
			'detect': function(){ return this.find.apply( this, arguments ); },
			'find_all': function( yield ){
				if ( typeof( yield ) != "function" ) {
					return $rb([]);
				}
				var retAry = [];
				this.each( function( elm ){
					if ( $unrb( yield.apply( this, [elm] )) ){
						retAry[retAry.length] = elm;
					}
				});
				return $rb(retAry);
			},
			'select': function(){ return this.find_all.apply( this, arguments ); },
			'grep': function( ptn ){
				var yield = null;
				if ( 2 == arguments.length ) {
					if ( typeof( arguments[1] ) == "function" ) {
						yield = arguments[1];
					}
				}
				var isRegExp = false;
				if ( typeof( ptn ) == "object" ) {
					if ( null != ptn && false == $rb(ptn).is_array().context ) {
						isRegExp = true;
					}
				}
				var ret;
				var retAry = [];
				var isMatch = false;
				this.each( function( elm ){
					isMatch = false;
					if ( typeof( elm ) != "string" ) {
						if	(
							   ( null != elm && safe_obj( elm ).is_eql( ptn ).context )
							|| ( null == elm && null == ptn )
							) {
							isMatch = true;
						}
					}
					else if	( true == isRegExp ) {
						ret = elm.match( ptn );
						if ( null != ret && "" != ret ) {
							isMatch = true;
						}
					}
					else if	( false == isRegExp ) {
						if ( null == elm || typeof( elm ) == "undefined" ) {
							if ( elm == ptn ) {
								isMatch = true;
							}
						}
						else if ( safe_obj( elm ).is_eql( ptn ).context ) {
							isMatch = true;
						}
					}
					if ( isMatch ) {
						if ( null != yield ) {
							retAry[retAry.length] = $unrb( yield.apply( this, [elm] ));
						}
						else {
							retAry[retAry.length] = elm;
						}
					}
				});
				return $rb(retAry);
			},
			'inject': function() {
				if ( 0 == arguments.length ) {
					return $rb(null);
				}
				var yield;
				var init = null;
				if ( 1 == arguments.length ) {
					yield = arguments[0];
				}
				if ( 2 == arguments.length ) {
					init = arguments[0];
					yield = arguments[1];
				}
				if ( null == yield || typeof( yield ) != "function" ) {
					return $rb(null);
				}
				var result = init;
				this.each( function( elm ){
					if ( null == init ) {
						init = true;
						result = elm;
					}
					else {
						result = $unrb( yield.apply( this, [result, elm] ));
					}
				});
				return $rb(result);
			},
			'is_include': function( obj ){
				obj = $unrb( obj );
				var ret = false;
				this.each( function( elm ){
					if ( false == ret ) {
						if ( null == elm ) {
							if ( null == obj ) {
								ret = true;
							}
						}
						else if ( elm.is_array().context && safe_obj( elm ).is_eql( obj ).context ) {
							ret = true;
						}
						else if ( elm == obj ) {
							ret = true;
						}
					}
				});
				return $rb(ret);
			},
			'is_member': function(){ return this.is_include.apply( this, arguments ) },
			'max': function(){
				var yiled = null;
				if ( 1 == arguments.length ) {
					if ( typeof( arguments[0] ) == "function" ) {
						yiled = arguments[0];
					}
				}
				var ret = null;
				var retTmp;
				if ( null != yiled ) {
					this.each( function( elm ){
						if ( null == ret ) {
							ret = elm;
						}
						else {
							retTmp = 0;
							retTmp = yiled.apply( this, [ret, elm] );
							if ( -1 == retTmp ) {
								ret = elm;
							}
						}
					});
				}
				else {
					this.each( function( elm ){
						if ( typeof( elm ) == "number" ) {
							if ( null == ret ) {
								ret = elm;
							}
							else if ( ret < elm ) {
								ret = elm;
							}
						}
					});
				}
				return $rb(ret);
			},
			'max_by': function( yiled ){
				if ( typeof( yiled ) != "function" ) {
					return $rb(null);
				}
				var ret = null;
				var retTmp;
				this.each( function( elm ){
					retTmp = yiled.apply( this, [elm] );
					if ( typeof( retTmp ) == "number" ) {
						if ( null == ret ) {
							ret = retTmp;
						}
						else {
							if ( ret < retTmp ) {
								ret = retTmp;
							}
						}
					}
				});
				return $rb(ret);
			},
			'min': function(){
				var yiled = null;
				if ( 1 == arguments.length ) {
					if ( typeof( arguments[0] ) == "function" ) {
						yiled = arguments[0];
					}
				}
				var ret = null;
				var retTmp;
				if ( null != yiled ) {
					this.each( function( elm ){
						if ( null == ret ) {
							ret = elm;
						}
						else {
							retTmp = 0;
							retTmp = yiled.apply( this, [ret, elm] );
							if ( 1 == retTmp ) {
								ret = elm;
							}
						}
					});
				}
				else {
					this.each( function( elm ){
						if ( typeof( elm ) == "number" ) {
							if ( null == ret ) {
								ret = elm;
							}
							else if ( ret > elm ) {
								ret = elm;
							}
						}
					});
				}
				return $rb(ret);
			},
			'min_by': function( yiled ){
				if ( typeof( yiled ) != "function" ) {
					return $rb(null);
				}
				var ret = null;
				var retTmp;
				this.each( function( elm ){
					retTmp = yiled.apply( this, [elm] );
					if ( typeof( retTmp ) == "number" ) {
						if ( null == ret ) {
							ret = retTmp;
						}
						else {
							if ( ret > retTmp ) {
								ret = retTmp;
							}
						}
					}
				});
				return $rb(ret);
			},
			'partition': function( yield ){
				if ( typeof( yield ) != "function" ) {
					return $rb([[],[]]);
				}
				var ret = [[],[]];
				var retTmp;
				this.each( function( elm ){
					retTmp = $unrb( yield.apply( this, [elm] ) );
					if ( true == retTmp ) {
						ret[0][ ret[0].length ] = elm;
					}
					else {
						ret[1][ ret[1].length ] = elm;
					}
				});
				return $rb(ret);
			},
			'reject': function( yield ){
				if ( typeof( yield ) != "function" ) {
					return $rb([]);
				}
				var retAry = [];
				this.each( function( elm ){
					if ( false == $unrb( yield.apply( this, [elm] ) ) ){
						retAry[retAry.length] = elm;
					}
				});
				return $rb(retAry);
			},
			'sort': function(){
				var retVal = [];
				var existFnc = false;
				var tmpAry = [];
				this.each( function( elm ){
					tmpAry[tmpAry.length] = elm;
				});
				if ( 1 == arguments.length ) {
					if ( null == arguments[0] || typeof( arguments[0] ) == "undefined" ) {
						return $rb(tmpAry);
					}
					if ( typeof( arguments[0] ) != "function" ) {
						return $rb(tmpAry);
					}
					existFnc = true;
				}
				if ( 0 == tmpAry.length ) {
					return $rb(retVal);
				}
				retVal.push( tmpAry[0] );
				if ( 1 == tmpAry.length ) {
					return $rb(retVal);
				}
				var evalVal;
				var insertFlag;
				for ( var i=1;i<tmpAry.length;i+=1 ) {
					insertFlag = false;
					for ( var j=0;j<retVal.length;j+=1 ) {
						if ( existFnc ) {
							evalVal = arguments[0].apply( tmpAry, [retVal[j], tmpAry[i]] );
							if ( null == evalVal || typeof( evalVal ) != "number" ) {
								return $rb(tmpAry);
							}
						}
						else {
							// bubble sort :(
							var org = retVal[j];
							var cmp = tmpAry[i];
							
							var org_type = 0;
							var cmp_type = 0;
							var typeTbl = {
									  "boolean": 1
									, "number": 2
									, "string": 3
									, "object": 4
									, "function": 6
									, "undefined": 7
								};
							if ( null == org ) {
								org_type = 0;
							}
							else {
								org_type = typeTbl[ typeof( org ) ];
								if ( 4 == org_type && false == org.is_array().context ) {
									org_type = 5;
								}
							}
							if ( null == cmp ) {
								cmp_type = 0;
							}
							else {
								cmp_type = typeTbl[ typeof( cmp ) ];
								if ( 4 == cmp_type && false == cmp.is_array().context ) {
									cmp_type = 5;
								}
							}
							evalVal = cmp_type - org_type;
							if ( 0 == evalVal ) {
								switch( cmp_type ) {
								case 1:	// boolean
									if ( cmp == org ) {
										evalVal = 0;
									}
									else {
										if ( true == cmp ) {
											evalVal = 1;
										}
										else {
											evalVal = -1;
										}
									}
									break;
									
								case 2: // number
									evalVal = cmp - org;
									break;
									
								case 3: // string
									var strMax = org.length;
									if ( strMax > cmp.length ) {
										strMax = cmp.length;
									}
									for ( var k=0;k<strMax;k+=1 ) {
										evalVal = cmp.charCodeAt(k) - org.charCodeAt(k);
										if ( 0 != evalVal ) {
											break;
										}
									}
									if ( 0 == evalVal ) {
										if ( strMax < org.length ) {
											evalVal = -1;
										}
									}
									break;
									
								case 4: // array
								case 5: // object
								case 6: // function
									evalVal = cmp.length - org.length;
									break;
								}
							}
						}
						if ( -1 >= evalVal ) {
							retVal.insert( j, tmpAry[i] );
							insertFlag = true;
							break;
						}
					}
					if ( false == insertFlag ) {
						retVal.push( tmpAry[i] );
					}
				}
				return retVal;
			},
			'sort_by': function(){
				var retVal = $rb([]);
				var tmpAry = $rb([]);
				var yield = null;
				if ( 1 == arguments.length ) {
					if ( null != arguments[0] && typeof( arguments[0] ) == "function" ) {
						yield = arguments[0];
					}
				}
				this.each( function( elm ){
					if ( null != yield ) {
						tmpAry.context[tmpAry.context.length] = $unrb( yield.apply( this, [elm] ) );
					}
					else {
						tmpAry.context[tmpAry.context.length] = elm;
					}
				});
				if ( 0 == tmpAry.context.length ) {
					return retVal;
				}
				retVal.push( tmpAry.context[0] );
				if ( 1 == tmpAry.context.length ) {
					return retVal;
				}
				var evalVal;
				var insertFlag;
				for ( var i=1;i<tmpAry.context.length;i+=1 ) {
					insertFlag = false;
					for ( var j=0;j<retVal.context.length;j+=1 ) {
						// bubble sort :(
						var org = retVal.context[j];
						var cmp = tmpAry.context[i];
						
						var org_type = 0;
						var cmp_type = 0;
						var typeTbl = {
								  "boolean": 1
								, "number": 2
								, "string": 3
								, "object": 4
								, "function": 6
								, "undefined": 7
							};
						if ( null == org ) {
							org_type = 0;
						}
						else {
							org_type = typeTbl[ typeof( org ) ];
							if ( 4 == org_type && false == $rb(org).is_array().context ) {
								org_type = 5;
							}
						}
						if ( null == cmp ) {
							cmp_type = 0;
						}
						else {
							cmp_type = typeTbl[ typeof( cmp ) ];
							if ( 4 == cmp_type && false == $rb(cmp).is_array().context ) {
								cmp_type = 5;
							}
						}
						evalVal = cmp_type - org_type;
						if ( 0 == evalVal ) {
							switch( cmp_type ) {
							case 1:	// boolean
								if ( cmp == org ) {
									evalVal = 0;
								}
								else {
									if ( true == cmp ) {
										evalVal = 1;
									}
									else {
										evalVal = -1;
									}
								}
								break;
								
							case 2: // number
								evalVal = cmp - org;
								break;
								
							case 3: // string
								var strMax = org.length;
								if ( strMax > cmp.length ) {
									strMax = cmp.length;
								}
								for ( var k=0;k<strMax;k+=1 ) {
									evalVal = cmp.charCodeAt(k) - org.charCodeAt(k);
									if ( 0 != evalVal ) {
										break;
									}
								}
								if ( 0 == evalVal ) {
									if ( strMax < org.length ) {
										evalVal = -1;
									}
								}
								break;
								
							case 4: // array
							case 5: // object
							case 6: // function
								evalVal = cmp.length - org.length;
								break;
							}
						}
						if ( -1 >= evalVal ) {
							retVal.insert( j, tmpAry.context[i] );
							insertFlag = true;
							break;
						}
					}
					if ( false == insertFlag ) {
						retVal.push( tmpAry.context[i] );
					}
				}
				return retVal;
			},
			'entries': function(){
				var retAry = [];
				this.each( function( elm ){
					retAry[ retAry.length ] = elm;
				});
				return $rb(retAry);
			},
			'zip': function( ary ){
				ary = $unrb( ary );
				var yield = null;
				var argAryNum = arguments.length;
				if ( 1 <= arguments.length ) {
					if ( null != arguments[arguments.length - 1] && typeof( arguments[arguments.length - 1] ) == "function" ) {
						yield = arguments[arguments.length - 1];
						argAryNum -= 1;
					}
				}
				var retAry = $rb([]);
				this.each( function( elm ){
					retAry.context[ retAry.context.length ] = [elm];
				});
				var tmpVal;
				for ( var i=0;i<retAry.context.length;i+=1 ) {
					for ( var j=0;j<argAryNum;j+=1 ) {
						tmpVal = null;
						if ( "object" == typeof( arguments[j] ) ) {
							if ( i < arguments[j].length ) {
								tmpVal = arguments[j][i];
							}
						}
						retAry.context[i][ retAry.context[i].length ] = tmpVal;
					}
				}
				if ( null != yield ) {
					retAry.each( function( elm ){
						yield.apply( this, [elm] );
					});
					return $rb(null);
				}
				return retAry;
			}
		};


		/*--------------------------------------
		  Object
		--------------------------------------*/
		var objectExMethods = {
			'to_i': function(){ return $rb(0); },
			'to_f': function(){ return $rb(0.0); },
			'to_s': function(){
				if ( null == this.context ) { return $rb("null"); }
				if ( typeof( this.context ) == "undefined" ) { return $rb("undefined"); }
				if ( 0 == this.context.length ) { return $rb("{}"); }
				var ref_stack;
				if ( 0 == arguments.length ) {
					ref_stack = new _ref_stack();
				}
				else {
					ref_stack = arguments[ arguments.length - 1 ];
					if ( typeof( ref_stack.is_circular ) == "undefined" ) {
						throw "Object.is_eql() : too few parameters";
					}
				}
				if ( ref_stack.is_circular( this.context ) ) {
					throw "Object.to_s() : circular reference";
				}
				var retVal = "";
				var i = 0;
				for ( var key in this.context ) {
					if ( key == "sessionStorage" || key == "localStorage" ) {
						try {
							if ( is_local() ) { continue; }
							if ( typeof( sessionStorage ) === 'undefined' ) { continue; }
						}catch(e) {}
					}
					if ( 0 != retVal.length ) { retVal += ","; }
					var key_s = key;
					var val_s = "";
					
					if ( typeof( key ) == "string" ) {
						key_s = '"' + key + '"';
					}
					if ( null == this.context[key] ) {
						val_s = "null";
					}
					else if ( typeof( this.context[key] ) == "undefined" ) {
						val_s = "undefine";
					}
					else if ( typeof( this.context[key].tagName ) != "undefined" ) {
						val_s = "[object " + this.context[key].tagName + "]";
					}
					else {
						val_s = safe_obj( this.context[key] ).to_s( ref_stack ).context;
						if ( typeof( this.context[key] ) == "string" ) {
							val_s = '"' + val_s + '"';
						}
					}
					retVal += ( key_s + "=>" + val_s );
					i += 1;
				}
				return $rb("{" + retVal + "}");
			},
			'to_a': function(){
				if ( null == this.context ) { return $rb([null]); }
				if ( typeof( this.context ) == "undefined" ) { return $rb("undefined"); }
				if ( 0 == this.context.length ) { return $rb([this.context]); }
				var retAry = [];
				var i = 0;
				for ( var key in this.context ) {
					if ( key == "sessionStorage" || key == "localStorage" ) {
						try {
							if ( is_local() ) { continue; }
							if ( typeof( sessionStorage ) === 'undefined' ) { continue; }
						}catch(e) {}
					}
					retAry[i] = [ key, this.context[key] ];
					i += 1;
				}
				return $rb(retAry);
			},
			'to_ary': function(){ return $rb(this.to_a.apply( this, arguments )); },
			'is_eql': function( other ) {
				if ( null == this.context ) {
					if ( null == other ) {
						return $rb(true);
					}
					return $rb(false);
				}
				for ( var key in this.context ) {
					if ( key == "sessionStorage" || key == "localStorage" ) {
						try {
							if ( is_local() ) { continue; }
							if ( typeof( sessionStorage ) === 'undefined' ) { continue; }
						}catch(e) {}
					}
					if ( this.context[key] != other[key] ) {
						return $rb(false);
					}
					break;
				}
				return $rb(true);
			},
			'store': function( key, val ){
				this.context[key] = val;
				return $rb(val);
			},
			'clear': function(){
				for( key in this.context ){
					delete this.context[key];
				}
				return this;
			},
			'clone': function(){
				var ret = {};
				for( key in this.context ){
					ret[key] = this.context[key];
				}
				return $rb(ret);
			},
			'dup': function(){ return this.clone.apply( this, arguments ); },
			'default': function( key ){
				if ( typeof(this.default_value) == "undefined" ) { this.default_value = null; }
				if ( typeof( this.default_value ) != "function" ) {
					return $rb(this.default_value);
				}
				else {
					if ( typeof( key ) == "undefined" ) {
						key = null;
					}
					return $rb( this.default_value.apply( this, [key] ) );
				}
			},
			'set_default': function( def ){
				this.default_value = def;
				return this;
			},
			'default_proc': function(){
				if ( typeof( this.default_value ) != "function" ) {
					return $rb( null );
				}
				return $rb( this.default_value );
			},
			'delete': function( key ){
				var ret = null;
				if ( typeof(key) != "undefined" ) {
					if ( typeof( this.context[key] ) != "undefined" ) {
						ret = this.context[key];
						delete this.context[key];
					}
				}
				if ( typeof(arguments[1]) == "function" ) {
					ret = arguments[1].apply( this, [key] );
				}
				return $rb(ret);
			},
			'reject': function( fnc ){
				var $ret = this.clone();
				if ( typeof(fnc) == "function" ) {
					for ( elm in $ret.context ) {
						if ( fnc.apply( this, [elm, $ret.context[elm] ] ) ) {
							delete $ret.context[elm];
						}
					}
				}
				return $ret;
			},
			'delete_if': function( fnc ){
				if ( typeof(fnc) == "function" ) {
					for ( elm in this.context ) {
						if ( fnc.apply( this, [elm, this.context[elm] ] ) ) {
							delete this.context[elm];
						}
					}
				}
				return this;
			},
			'reject_f': function( fnc ){
				var del_flag = false;
				if ( typeof(fnc) == "function" ) {
					for ( elm in this.context ) {
						if ( fnc.apply( this, [elm, this.context[elm] ] ) ) {
							delete this.context[elm];
							del_flag = true;
						}
					}
				}
				if ( !del_flag ) {
					return $rb(null);
				}
				return this;
			},
			'each': function( fnc ){
				if ( typeof(fnc) == "function" ) {
					for ( elm in this.context ) {
						fnc.apply( this, [[elm, this.context[elm]]] );
					}
				}
				return this;
			},
			'each_pair': function( fnc ){
				if ( typeof(fnc) == "function" ) {
					for ( elm in this.context ) {
						fnc.apply( this, [elm, this.context[elm]] );
					}
				}
				return this;
			},
			'each_key': function( fnc ){
				if ( typeof(fnc) == "function" ) {
					for ( elm in this.context ) {
						fnc.apply( this, [elm] );
					}
				}
				return this;
			},
			'each_value': function( fnc ){
				if ( typeof(fnc) == "function" ) {
					for ( elm in this.context ) {
						fnc.apply( this, [this.context[elm]] );
					}
				}
				return this;
			},
			'is_empty': function(){
				var flag = false;
				for ( elm in this.context ) {
					flag = true;
				}
				return $rb( flag );
			},
			'fetch': function( key ){
				if ( typeof( this.context[key] ) != "undefined" ) {
					return $rb( this.context[key] );
				}
				if ( typeof( arguments[1] ) == "undefined" ) {
					throw "Object.fetch() : KeyError";
				}
				if ( typeof( arguments[1] ) != "function" ) {
					return $rb( arguments[1] );
				}
				return $rb( arguments[1].apply( this, [key] ) );
			},
			'has_key': function( key ){
				if ( typeof( this.context[key] ) == "undefined" ) {
					return $rb(false);
				}
				return $rb(true);
			},
			'is_include': function( key ){
				return this.has_key.apply( this, arguments );
			},
			'is_key': function( key ){
				return this.has_key.apply( this, arguments );
			},
			'is_member': function( key ){
				return this.has_key.apply( this, arguments );
			},
			'has_value': function( val ){
				if ( typeof( val ) == "undefined" ) {
					return $rb(false);
				}
				for ( elm in this.context ) {
					if ( val == this.context[elm] ) {
						return $rb(true);
					}
				}
				return $rb(false);
			},
			'is_value': function( val ){
				return this.has_value.apply( this, arguments );
			},
			'index': function( val ){
				if ( typeof( val ) == "undefined" ) {
					return $rb(null);
				}
				for ( elm in this.context ) {
					if ( val == this.context[elm] ) {
						return $rb(elm);
					}
				}
				return $rb(null);
			},
			'key': function( val ){
				return this.index.apply( this, arguments );
			},
			'indexes': function(){
				var ret = $rb({});
				if ( 0 == arguments.length ) {
					return ret;
				}
				for ( elm in this.context ) {
					for ( var i=0; i<arguments.length; i+=1 ) {
						if ( arguments[i] == elm ) {
							ret.store( elm, this.context[elm] );
						}
					}
				}
				return ret;
			},
			'indices': function(){
				return this.indexes.apply( this, arguments );
			},
			'invert': function(){
				var ret=$rb({});
				for ( elm in this.context ) {
					ret.store( this.context[elm], elm );
				}
				return ret;
			},
			'keys': function(){
				var ret=$rb([]);
				for ( elm in this.context ) {
					ret.push( elm );
				}
				return ret;
			},
			'length': function(){
				var cnt=0;
				for ( elm in this.context ) {
					cnt+=1;
				}
				return $rb(cnt);
			},
			'size': function(){
				return this.length.apply( this, arguments );
			},
			'merge': function( other, fnc ){
				var ret = $rb(this).clone();
				other = $rb(other);
				if ( typeof( other.to_hash ) == "function" ) {
					other = other.to_hash();
				}
				other = $unrb(other);
				for ( key in other ) {
					if (    ( typeof(ret.context[key]) != "undefined" )
					     && ( typeof(fnc) == "function" ) ) {
						ret.context[key] = fnc.apply( this, [key, ret.context[key], other[key]] );
					}
					else {
						ret.context[key] = other[key];
					}
				}
				return ret;
			},
			'merge_f': function( other, fnc ){
				other = $rb(other);
				if ( typeof( other.to_hash ) == "function" ) {
					other = other.to_hash();
				}
				other = $unrb(other);
				for ( key in other ) {
					if (    ( typeof(this.context[key]) != "undefined" )
					     && ( typeof(fnc) == "function" ) ) {
						this.context[key] = fnc.apply( this, [key, this.context[key], other[key]] );
					}
					else {
						this.context[key] = other[key];
					}
				}
				return this;
			},
			'rehash': function(){
				// not implement
				return this;
			},
			'replace': function( other ){
				this.clear();
				for ( key in other ) {
					this.context[key] = other[key];
				}
				return this;
			},
			'shift': function(){
				var ret = null;
				for( key in this.context ){
					ret = [ key, this.context[key] ];
					delete this.context[key];
					break;
				}
				if ( !ret ) {
					return this.default();
				}
				return $rb( ret );
			},
			'to_hash': function(){
				return this;
			},
			'update': function(){
				return this.merge_f.apply( this, arguments );
			},
			'values': function(){
				var ret = $rb([]);
				for( key in this.context ){
					ret.push( this.context[key] );
				}
				return ret;
			},
			'values_at': function( keys ){
				var key_list;
				if ( 1 < arguments.length ) {
					key_list = $rb([]);
					for ( var i=0;i<arguments.length;i+=1 ) {
						key_list.push( arguments[i] );
					}
				}
				else {
					key_list = $unrb(keys);
					if ( key_list == null ) {
						key_list = [null];
					}
					else if ( typeof( key_list ) == "undefined" ) {
						return $rb([]);
					}
					else if ( !$rb(key_list).is_array() ) {
						key_list = [$unrb(key_list)];
					}
				}
				key_list = $unrb(key_list);
				var ret = $rb([]);
				for ( var i=0;i<key_list.length;i+=1 ) {
					if ( typeof( this.context[key_list[i]] ) != "undefined" ) {
						ret.push( this.context[key_list[i]] );
					}
				}
				if ( 0 == $unrb(ret.size()) ) {
					return this.default();
				}
				return ret;
			}
		};
		function RbObject(){};
		RbObject.prototype = new Object();
		for ( var fnName in enumerableExMethods ) {
			RbObject.prototype[fnName] = enumerableExMethods[fnName];
			RbObject.prototype["_"+fnName] = enumerableExMethods[fnName];
		}
		for ( var fnName in objectExMethods ) {
			RbObject.prototype[fnName] = objectExMethods[fnName];
			RbObject.prototype["_"+fnName] = objectExMethods[fnName];
		}
		
		
		/*--------------------------------------
		  Function
		--------------------------------------*/
		var functionExMethods = {
			'to_i': function(){ return $rb(0); },
			'to_f': function(){ return $rb(0.0); },
			'to_s': function(){ return $rb("[function]"); },
			'to_a': function(){ return $rb([ this.context ]); },
			'to_ary': function(){ return $rb(this.to_a.apply( this, arguments )); },
			'is_eql': function( other ){ return $rb(this.context == other); }
		};
		function RbFunction(){};
		RbFunction.prototype = new Function();
		for ( var fnName in enumerableExMethods ) {
			RbFunction.prototype[fnName] = enumerableExMethods[fnName];
			RbFunction.prototype["_"+fnName] = enumerableExMethods[fnName];
		}
		for ( var fnName in functionExMethods ) {
			RbFunction.prototype[fnName] = functionExMethods[fnName];
			RbFunction.prototype["_"+fnName] = functionExMethods[fnName];
		}
		
		
		/*--------------------------------------
		  Number
		--------------------------------------*/
		var numberExMethods = {
			'to_i': function(){
				if ( isNaN( this.context ) ) {
					return $rb(0);
				}
				return $rb(parseInt( this.context ));
			},
			'to_f': function(){ return $rb(0.0 + this.context); },
			'to_s': function(){ return $rb(this.context.toString()); },
			'to_a': function(){ return $rb([ this.context ]); },
			'to_ary': function(){ return $rb(this.to_a.apply( this, arguments )); },
			'is_eql': function( other ){ return $rb(this.context == other); },
			'valueOf': function(){ return this.context },
			'toString': function(){ return $unrb(this.to_s()) }
		};
		function RbNumber(){};
		RbNumber.prototype = new Number();
		for ( var fnName in enumerableExMethods ) {
			RbNumber.prototype[fnName] = enumerableExMethods[fnName];
			RbNumber.prototype["_"+fnName] = enumerableExMethods[fnName];
		}
		for ( var fnName in numberExMethods ) {
			RbNumber.prototype[fnName] = numberExMethods[fnName];
			RbNumber.prototype["_"+fnName] = numberExMethods[fnName];
		}
		
		
		/*--------------------------------------
		  String
		--------------------------------------*/
		var stringExMethods = {
			'to_i': function(){
				if ( this.context.match(/^[+-]?[0-9]+\.?[0-9]*$/i) ) {
					return $rb(parseInt( this.context ));
				}
				else {
					return $rb(0);
				}
			},
			'to_f': function(){
				if ( this.context.match(/^[+-]?[0-9]+\.?[0-9]*$/i) ) {
					return $rb(parseFloat( this.context ));
				}
				else {
					return $rb(0);
				}
			},
			'to_s': function(){ return $rb(this.context.toString()); },
			'to_a': function(){ return $rb([ this.context ]); },
			'to_ary': function(){ return $rb(this.to_a.apply( this, arguments )); },
			'is_eql': function( other ){ return $rb(this.context == other); },
			'valueOf': function(){ return this.context }
		};
		function RbString(){};
		RbString.prototype = new String();
		for ( var fnName in enumerableExMethods ) {
			RbString.prototype[fnName] = enumerableExMethods[fnName];
			RbString.prototype["_"+fnName] = enumerableExMethods[fnName];
		}
		for ( var fnName in stringExMethods ) {
			RbString.prototype[fnName] = stringExMethods[fnName];
			RbString.prototype["_"+fnName] = stringExMethods[fnName];
		}
		
		
		/*--------------------------------------
		  Boolean
		--------------------------------------*/
		var booleanExMethods = {
			'to_i': function(){
				if ( true == this.context ) {
					return $rb(0);
				}
				return $rb(-1);
			},
			'to_f': function() {
				if ( true == this.context ) {
					return $rb(0.0);
				}
				return $rb(-1.0);
			},
			'to_s': function() {
				if ( true == this.context ) {
					return $rb("true");
				}
				return $rb("false");
			},
			'to_a': function(){ return $rb([ this.context ]); },
			'to_ary': function(){ return $rb(this.to_a.apply( this, arguments )); },
			'is_eql': function( other ){ return $rb(this.context == other); },
			'valueOf': function(){ return this.context },
			'toString': function(){ return $unrb(this.to_s()) }
		};
		function RbBoolean(){};
		RbBoolean.prototype = new Boolean();
		for ( var fnName in enumerableExMethods ) {
			RbBoolean.prototype[fnName] = enumerableExMethods[fnName];
			RbBoolean.prototype["_"+fnName] = enumerableExMethods[fnName];
		}
		for ( var fnName in booleanExMethods ) {
			RbBoolean.prototype[fnName] = booleanExMethods[fnName];
			RbBoolean.prototype["_"+fnName] = booleanExMethods[fnName];
		}
		
		
		/*--------------------------------------
		  Array
		--------------------------------------*/
		var arrayExMethods = {
			'to_i': function(){ return $rb(0); },
			'to_f': function(){ return $rb(0.0); },
			'to_s': function(){
				var ref_stack;
				if ( 0 == arguments.length ) {
					ref_stack = new _ref_stack();
				}
				else {
					ref_stack = arguments[ arguments.length - 1 ];
					if ( typeof( ref_stack.is_circular ) == "undefined" ) {
						throw "Object.is_eql() : too few parameters";
					}
				}
				if ( ref_stack.is_circular( this.context ) ) {
					throw "Object.to_s() : circular reference";
				}
				var i;
				var retVal = "";
				for ( i=0; i<this.context.length; i+=1 ) {
					if ( 0 != retVal.length ) { retVal += ","; }
					if ( null == this.context[i] ) {
						retVal += "null";
					}
					else {
						retVal += ( safe_obj( this.context[i] ).to_s( ref_stack ).context );
					}
				}
				return $rb("[" + retVal + "]");
			},
			'to_a': function(){ return $rb(this.context); },
			'to_ary': function(){ return $rb(this.to_a.apply( this, arguments )); },
			'is_array': function(){ return $rb(true); },
			'is_eql': function( other ){
				var ref_stack;
				if ( 1 == arguments.length ) {
					if ( null != other && typeof( other ) != "undefined" && typeof( other.is_circular ) != "undefined" ) {
						throw "Object.is_eql() : too few parameters";
					}
					ref_stack = new _ref_stack();
				}
				else {
					ref_stack = arguments[ arguments.length - 1 ];
					if ( typeof( ref_stack.is_circular ) == "undefined" ) { return $rb(""); }
				}
				if ( ref_stack.is_circular( this.context ) ) {
					throw "Object.to_s() : circular reference";
				}
				if ( typeof( other ) != "undefined" ) {
					if ( null != other && $rb( other ).is_array().context ) {
						if ( this.context.length == other.length ) {
							var i;
							for ( i=0; i<this.context.length; i += 1 ) {
								if ( null == this.context[i] ) {
									if ( null != other[i] ) {
										return $rb(false);
									}
								}
								else if ( false == safe_obj( this.context[i] ).is_eql( other[i], ref_stack ).context ) {
									return $rb(false);
								}
							}
							return $rb(true);
						}
					}
				}
				return $rb(false);
			},
			'to_hash': function() {
				var ret = {};
				var tmpKey;
				var tmpVal;
				for ( var i=0; i<this.context.length; i+=1 ) {
					if ( null != this.context[i] && typeof( this.context[i] ) != "undefined" ) {
						if ( $rb(this.context[i]).is_array().context ) {
							
							tmpKey = $unrb(this.context[i])[0];
							if ( null != tmpKey && typeof( tmpKey ) != "undefined" && typeof(tmpKey) != "object" ) {
								tmpVal = $rb(this.context[i]).dup();
								if ( 1 >= tmpVal.context.length ) {
									tmpVal.shift();
									tmpVal = $unrb(tmpVal);
									if ( 1 == tmpVal.length ) {
										tmpVal = tmpVal[0];
									}
									else if ( 0 == tmpVal.length ) {
										tmpVal = null;
									}
								}
								else {
									tmpVal = null;
								}
								
								ret[tmpKey] = tmpVal;
							}
						}
					}
				}
				return $rb(ret);
			},
			'add': function( ary ){
				ary = $unrb( ary );
				return this.copy().concat( ary );
			},
			'sub': function( ary ){
				ary = $unrb( ary );
				var retAry = this.copy().delete_if( function(elm) {
					if ( null == ary ) {
						return $rb(ary == elm);
					}
					else if ( typeof( ary ) == "undefined" ) {
						return $rb(ary == elm);
					}
					else if ( $rb( ary ).is_array().context ) {
						return $rb(ary).is_exist( elm );
					}
					else {
						return $rb(ary == elm);
					}
				});
				return retAry;
			},
			'multiply': function( times ){
				times = $unrb( times );
				if ( null == times ) { return $rb([]) }
				if ( typeof( times ) != "number" ) { return $rb([]); }
				times = $unrb($rb(times).to_i());
				if ( 0 == times ) { return $rb([]); }
				var retAry = $rb([]);
				for ( var i=0;i<times;i+=1 ) {
					retAry.concat( this.context );
				}
				return retAry;
			},
			'times': function(){ return this.multiply.apply( this, arguments ); },
			'and': function( other ){
				other = $rb(other);
				if ( null == other.context || typeof( other.context ) == "undefined" || false == other.is_array().context ) {
					return $rb([]);
				}
				var retAry = this.uniq();
				other.uniq_f();
				retAry.delete_if( function(elm){
					return !$unrb( other.is_exist( elm ) );
				});
				return $rb(retAry);
			},
			'or': function( other ){
				other = $rb(other);
				if ( null == other.context || typeof( other.context ) == "undefined" || false == other.is_array().context ) {
					return $rb([]);
				}
				return this.uniq().concat( other.context ).uniq();
			},
			'assoc': function( key ){
				key = $unrb( key );
				var i;
				for ( i=0; i<this.context.length; i+=1 ) {
					if ( null != this.context[i] && typeof( this.context[i] ) != "undefined" ) {
						if ( $rb(this.context[i]).is_array().context ) {
							if ( null == key || typeof( key ) == "undefined" ) {
								if ( key == this.context[i][0] ) {
									return $rb(this.context[i]);
								}
							}
							else if ( safe_obj( key ).is_eql( this.context[i][0] ).context ) {
								return $rb(this.context[i]);
							}
						}
					}
				}
				return $rb(null);
			},
			'at': function( index ){
				index = $unrb( index );
				if ( null == index ) { return null }
				if ( typeof( index ) != "number" ) { return null; }
				index = $unrb($rb(index).to_i());
				if ( 0 > index ) {
					return $rb(null);
				}
				if ( this.context.length <= index ) {
					return $rb(null);
				}
				return $rb(this.context[ index ]);
			},
			'clear': function(){
				this.context.splice( 0, this.context.length );
				return this;
			},
			'copy': function(){
				var i;
				var cpyAry = $rb(new Array());
				for ( i = 0; i < this.context.length; i += 1 ) {
					cpyAry.context[i] = this.context[i];
				}
				return cpyAry;
			},
			'dup': function(){ return this.copy.apply( this, arguments ); },
			'collect_f': function( yield ){
				var retAry = $rb([]);
				for ( var i=0; i<this.context.length; i+=1 ) {
					retAry.context[retAry.context.length] = $unrb( yield.apply( this, [this.context[i]] ) );
				}
				return this.replace( $unrb( retAry ) );
			},
			'map_f': function(){ return this.collect_f.apply( this, arguments ) },
			'compact': function(){
				var i = 0;
				var j = 0;
				var retAry = $rb(new Array());
				while( i < this.context.length ) {
					if ( null != this.context[i] ) {
						retAry.context[j] = this.context[i];
						j += 1;
					}
					i += 1;
				}
				return retAry;
			},
			'compact_f': function(){
				var i = 0;
				while( i < this.context.length ) {
					if ( null == this.context[i] ) {
						this.context.splice( i, 1 );
					}
					else {
						i += 1;
					}
				}
				return this;
			},
			'concat': function( ary ){
				ary = $unrb( ary );
				switch( typeof( ary ) ) {
				case "object":
					if ( null == ary ) {
						this.context[this.context.length] = ary;
					}
					else if ( $rb( ary ).is_array().context ) {
						var i;
						for ( i = 0; i < ary.length; i += 1 ) {
							this.context[this.context.length] = ary[i];
						}
					}
					else {
						this.context[this.context.length] = ary;
					}
					break;
					
				default:
					this.context[this.context.length] = ary;
					break;
				}
				return this;
			},
			'delete': function( elm ){
				elm = $unrb( elm );
				var i = 0;
				var retVal = null;
				var numOfDelete = 0;
				while( i < this.context.length ) {
					if ( elm == this.context[i] ) {
						this.context.splice( i, 1 );
						retVal = elm;
						numOfDelete += 1;
						if ( i >= this.context.length ) {
							break;
						}
					}
					else {
						i += 1;
					}
				}
				if ( 0 == numOfDelete ) {
					if ( 2 == arguments.length ) {
						if ( typeof( arguments[1] ) == "function" ) {
							retVal = arguments[1].apply( this, arguments );
							if ( typeof( retVal ) == "undefined" ) {
								retVal = null;
							}
						}
					}
				}
				return $rb(retVal);
			},
			'delete_at': function( index ){
				index = $unrb( index );
				if ( typeof( index ) == "undefined" ) { return null; }
				index = $unrb($rb(index).to_i());
				var elm = this.context[index];
				if ( index < this.context.length ) {
					this.context.splice( index, 1 );
				}
				if ( typeof( elm ) == "undefined" ) {
					return $rb(null);
				}
				return $rb(elm);
			},
			'delete_if': function( yield ){
				var i = 0;
				if ( typeof( yield ) == "function" ) {
					while( i < this.context.length ) {
						if ( true == $unrb( yield.apply( this, [this.context[i]] ) ) ) {
							this.context.splice( i, 1 );
							if ( i >= this.context.length ) {
								break;
							}
						}
						else {
							i += 1;
						}
					}
				}
				return this;
			},
			'reject_f': function( yield ){
				var i = 0;
				var numOfDelete = 0;
				if ( typeof( yield ) == "function" ) {
					while( i < this.context.length ) {
						if ( true == $unrb( yield.apply( this, [this.context[i]] ) ) ) {
							this.context.splice( i, 1 );
							numOfDelete += 1;
							if ( i >= this.context.length ) {
								break;
							}
						}
						else {
							i += 1;
						}
					}
				}
				if ( 0 < numOfDelete ) {
					return this;
				}
				else {
					return $rb(null);
				}
			},
			'each': function( yield ){
				for ( var i=0;i<this.context.length;i+=1 ) {
					yield.apply( this, [this.context[i]] );
				}
				return this;
			},
			'each_index': function( yield ){
				var i;
				for ( i=0;i<this.context.length;i+=1 ) {
					yield.apply( this, [i] );
				}
				return this;
			},
			'is_empty': function(){
				return $rb( 0 == this.context.length );
			},
			'is_exist': function( obj ){
				obj = $unrb( obj );
				for ( var i=0;i<this.context.length;i+=1 ) {
					if ( null == this.context[i] ) {
						if ( null == obj ) {
							return $rb( true );
						}
					}
					else if ( this.is_array().context && safe_obj( this.context[i] ).is_eql( obj ).context ) {
						return $rb( true );
					}
					else if ( this.context[i] == obj ) {
						return $rb( true );
					}
				}
				return $rb( false );
			},
			'is_include': function(){ return $rb( this.is_exist.apply( this, arguments ) ); },
			'fetch': function(){
				if ( 0 == arguments.length ) {
					return $rb(null);
				}
				if ( 2 < arguments.length ) {
					return $rb(null);
				}
				if ( null == arguments[0] ) {
					return $rb(null);
				}
				var index = $unrb($rb(arguments[0]).to_i());
				var retVal = null;
				if ( 0 > index || this.context.length <= index ) {
					if ( 2 == arguments.length ) {
						if ( null != arguments[1] && typeof( arguments[1] ) == "function" ) {
							retVal = arguments[1].apply( this, [this.context[index]] );
						}
						else {
							retVal = arguments[1];
						}
						if ( typeof( retVal ) == "undefined" ) {
							retVal = null;
						}
						return $rb(retVal);
					}
					else {
						throw "Array.fetch() : too less argument.";
					}
				}
				if ( 2 == arguments.length ) {
					if ( null != arguments[1] && typeof( arguments[1] ) == "function" ) {
						retVal = arguments[1]( this.context[index] );
						if ( typeof( retVal ) == "undefined" ) {
							retVal = null;
						}
						return $rb(retVal);
					}
				}
				return $rb( this.context[index] );
			},
			'fill': function(){
				if ( 0 == arguments.length ) {
					return this;
				}
				if ( 3 < arguments.length ) {
					return this;
				}
				var fillVal = arguments[0];
				var startIndex = 0;
				var endIndex = this.context.length;
				if ( 2 <= arguments.length ) {
					if ( typeof( arguments[1] ) == "undefined" ) { return this; }
					startIndex = $unrb($rb(arguments[1]).to_i());
					if ( 0 > startIndex ) {
						startIndex = 0;
					}
				}
				if ( 3 == arguments.length ) {
					if ( typeof( arguments[2] ) == "undefined" ) { return this; }
					endIndex = $unrb($rb(arguments[2]).to_i());
					if ( 1 > endIndex ) {
						return this;
					}
					endIndex += startIndex;
				}
				var i;
				for ( i = startIndex; i < endIndex; i += 1 ) {
					this.context[ i ] = fillVal;
				}
				return this;
			},
			'first': function(){
				var retVal = null;
				var elmLength = 0;
				if ( 0 == this.context.length ) {
					return $rb(null);
				}
				if ( 0 < arguments.length ) {
					if ( null == arguments[0] ) {
						return $rb(null);
					}
					if ( typeof( arguments[0] ) == "undefined" ) {
						return $rb(null);
					}
					elmLength = $unrb($rb(arguments[0]).to_i());
					if ( 0 >= elmLength ) {
						return $rb([]);
					}
					if ( elmLength > this.context.length ) {
						elmLength = this.context.length;
					}
					retVal = this.context.slice( 0, elmLength );
				}
				else {
					retVal = this.context[0];
				}
				return $rb(retVal);
			},
			'flatten': function(){
				var ref_stack;
				if ( 0 == arguments.length ) {
					ref_stack = new _ref_stack();
				}
				else {
					ref_stack = arguments[ arguments.length - 1 ];
					if ( typeof( ref_stack.is_circular ) == "undefined" ) {
						throw "Object.is_eql() : too few parameters";
					}
				}
				if ( ref_stack.is_circular( this.context ) ) {
					throw "Object.to_s() : circular reference";
				}
				var retAry = $rb([]);
				for ( var i=0; i<this.context.length; i+=1 ) {
					var tmpVal = $rb(this.context[i]);
					if ( null != tmpVal.context && tmpVal.is_array().context ) {
						tmpVal = tmpVal.flatten( ref_stack );
					}
					retAry.concat( tmpVal.context );
				}
				return retAry;
			},
			'flatten_f': function(){
				return this.replace( this.flatten().context );
			},
			'index': function( aryOrFnc ){
				aryOrFnc = $unrb( aryOrFnc );
				for ( var i=0;i<this.context.length;i+=1 ) {
					if ( null != aryOrFnc && typeof( aryOrFnc ) == "function" ) {
						if ( aryOrFnc.apply( this, [this.context[i]] ) || false ) {
							return $rb(i);
						}
					}
					else {
						if ( null == this.context[i] ) {
							if ( null == aryOrFnc ) {
								return $rb(i);
							}
						}
						else if ( $rb(this.context[i]).is_array().context && safe_obj( this.context[i] ).is_eql( aryOrFnc ).context ) {
							return $rb(i);
						}
						else if ( this.context[i] == aryOrFnc ) {
							return $rb(i);
						}
					}
				}
				return $rb(null);
			},
			'insert': function(){
				if ( 1 >= arguments.length ) {
					return this;
				}
				var index = arguments[0];
				if ( null == index ) {
					return this;
				}
				if ( typeof( index ) == "undefined" ) {
					return this;
				}
				index = $unrb($rb(index).to_i());
				if ( 0 > index ) {
					return this;
				}
				var afterAry = [];
				if ( index < this.context.length ) {
					afterAry = this.context.slice( index );
				}
				else {
					this.fill( null, this.context.length, index - this.context.length - 1 );
				}
				var i;
				for ( i=0;i<arguments.length-1;i+=1) {
					this.context[index+i] = arguments[i+1];
				}
				index = index + i;
				for ( i=0;i<afterAry.length;i+=1) {
					this.context[index+i] = afterAry[i];
				}
				return this;
			},
			'join': function( sep ){
				sep = $unrb( sep );
				var ref_stack = null;
				if ( 0 == arguments.length ) {
					sep = ",";
				}
				else {
					if ( 1 == arguments.length ) {
						if ( null != sep && typeof( sep ) != "undefined" && typeof( sep.is_circular ) != "undefined" ) {
							throw "Object.is_eql() : too few parameters";
						}
					}
					else {
						ref_stack = arguments[ arguments.length - 1 ];
						if ( typeof( ref_stack.is_circular ) == "undefined" ) { return $rb(""); }
					}
				}
				if ( null == ref_stack ) {
					ref_stack = new _ref_stack();
				}
				if ( ref_stack.is_circular( this.context ) ) {
					throw "Object.to_s() : circular reference";
				}
				if ( null == sep || typeof( sep ) == "undefined" ) {
					sep = "";
				}
				sep = safe_obj( sep ).to_s().context;
				var retVal = "";
				for (var i=0;i<this.context.length;i+=1) {
					if ( 0 < retVal.length ) {
						retVal += sep;
					}
					if ( null == this.context[i] ) {
						retVal += "null";
					}
					else if ( typeof( this.context[i] ) == "undefined" ) {
						retVal += "undefined";
					}
					else if ( $rb(this.context[i]).is_array().context ) {
						retVal += $unrb($rb(this.context[i]).join( sep, ref_stack ));
					}
					else {
						retVal += $unrb(safe_obj( this.context[i] ).to_s());
					}
				}
				return $rb(retVal);
			},
			'last': function(){
				var retVal = null;
				var elmLength = 0;
				if ( 0 == this.context.length ) {
					return $rb(null);
				}
				if ( 0 < arguments.length ) {
					if ( null == arguments[0] ) {
						return $rb(null);
					}
					if ( typeof( arguments[0] ) == "undefined" ) {
						return $rb(null);
					}
					elmLength = $unrb( $rb(arguments[0]).to_i());
					if ( 0 >= elmLength ) {
						return $rb([]);
					}
					if ( elmLength > this.context.length ) {
						elmLength = this.context.length;
					}
					retVal = this.context.slice( this.context.length - elmLength );
				}
				else {
					retVal = this.context[this.context.length-1];
				}
				return $rb(retVal);
			},
			'size': function(){
				return $rb(this.context.length);
			},
			'nitems': function(){
				var nullCnt = 0;
				for ( var i=0;i<this.context.length;i+=1 ) {
					if ( null == this.context[i] ) {
						nullCnt += 1;
					}
				}
				return $rb(this.context.length - nullCnt);
			},
			'pack': function(){
				// Array.pack() is not implementation.
				return $rb(null);
			},
			'pop': function(){
				if ( 0 == this.context.length ) {
					return $rb(null);
				}
				var elm = this.context[this.context.length-1];
				this.context.splice( this.context.length-1, 1 );
				return $rb(elm);
			},
			'push': function(){
				if ( 0 == arguments.length ) { return this; }
				var i;
				for ( i=0; i<arguments.length; i+=1 ) {
					this.context[this.context.length] = arguments[i];
				}
				return this;
			},
			'rassoc': function( key ){
				key = $unrb( key );
				var i;
				for ( i=0; i<this.context.length; i+=1 ) {
					if ( null != this.context[i] && typeof( this.context[i] ) != "undefined" ) {
						if ( $rb(this.context[i]).is_array().context ) {
							if ( 2 <= this.context[i].length ) {
								if ( null == key || typeof( key ) == "undefined" ) {
									if ( key == this.context[i][1] ) {
										return $rb(this.context[i]);
									}
								}
								else if ( safe_obj( key ).is_eql( this.context[i][1] ).context ) {
									return $rb(this.context[i]);
								}
							}
						}
					}
				}
				return $rb(null);
			},
			'replace': function( another ){
				another = $unrb( another );
				this.clear();
				if ( null == another || typeof( another ) == "undefined" ) {
					this.context[0] = another;
				}
				else if ( false == $rb(another).is_array().context ) {
					this.context[0] = another;
				}
				else {
					for ( var i=0;i<another.length;i+=1 ) {
						this.context[i] = another[i];
					}
				}
				return this;
			},
			'reverse': function(){
				if ( 0 == this.context.length ) {
					return $rb([]);
				}
				var tmpVal = $rb([]);
				tmpVal.fill( null, 0, this.context.length );
				for ( var i=this.context.length-1;i>=0;i-=1 ) {
					tmpVal.context[(this.context.length-1)-i] = this.context[i];
				}
				return tmpVal;
			},
			'reverse_f': function(){
				if ( 0 == this.context.length ) {
					return this;
				}
				var tmpVal = this.copy();
				for ( var i=tmpVal.context.length-1;i>=0;i-=1 ) {
					this.context[(tmpVal.context.length-1)-i] = tmpVal.context[i];
				}
				return this;
			},
			'reverse_each': function( yield ){
				for ( var i=this.context.length-1; i>=0; i-=1 ) {
					yield.apply( this, [this.context[i]] );
				}
				return this;
			},
			'rindex': function( aryOrFnc ){
				aryOrFnc = $unrb( aryOrFnc );
				for ( var i=this.context.length-1;i>=0;i-=1 ) {
					if ( null != aryOrFnc && typeof( aryOrFnc ) == "function" ) {
						if ( aryOrFnc.apply( this, [this.context[i]] ) || false ) {
							return $rb(i);
						}
					}
					else {
						if ( null == this.context[i] ) {
							if ( null == aryOrFnc ) {
								return $rb(i);
							}
						}
						else if ( $rb(this.context[i]).is_array().context && safe_obj( this.context[i] ).is_eql( aryOrFnc ).context ) {
							return $rb(i);
						}
						else if ( this.context[i] == aryOrFnc ) {
							return $rb(i);
						}
					}
				}
				return $rb(null);
			},
			'shift': function(){
				if ( 0 == this.context.length ) {
					return $rb(null);
				}
				var elm = this.context[0];
				this.context.splice( 0, 1 );
				return $rb(elm);
			},
			'slice': function(){
				if ( 0 == arguments.length ) {
					retVal = this.copy();
					return retVal;
				}
				if ( 1 == arguments.length ) {
					if ( null == arguments[0] || typeof( arguments[0] ) == "undefined" ) {
						return $rb([]);
					}
					var stIndex = $unrb( $rb(arguments[0]).to_i());
					if ( 0 > stIndex ) {
						return $rb([]);
					}
					if ( this.context.length <= stIndex ) {
						return $rb([]);
					}
					return $rb(this.context.slice( stIndex ));
				}
				else {
					if ( null == arguments[0] || typeof( arguments[0] ) == "undefined" ) {
						return $rb([]);
					}
					if ( null == arguments[1] || typeof( arguments[1] ) == "undefined" ) {
						return $rb([]);
					}
					var stIndex = $unrb( $rb(arguments[0]).to_i() );
					var edIndex = $unrb( $rb(arguments[1]).to_i() );
					if ( 0 > stIndex ) {
						return $rb([]);
					}
					if ( this.context.length <= stIndex ) {
						return $rb([]);
					}
					if ( 0 >= edIndex ) {
						return $rb([]);
					}
					edIndex += stIndex;
					if ( this.context.length <= edIndex ) {
						edIndex = this.context.length;
					}
					return $rb(this.context.slice( stIndex, edIndex ));
				}
				return $rb([]);
			},
			'slice_f': function(){
				var retVal;
				if ( 0 == arguments.length ) {
					retVal = this.copy();
					this.clear();
					return $rb(retVal);
				}
				if ( 1 == arguments.length ) {
					if ( null == arguments[0] || typeof( arguments[0] ) == "undefined" ) {
						return $rb([]);
					}
					var stIndex = $unrb( $rb(arguments[0]).to_i() );
					if ( 0 > stIndex ) {
						return $rb([]);
					}
					if ( this.context.length <= stIndex ) {
						return $rb([]);
					}
					retVal = $rb(this.context.slice( stIndex ));
					this.context.splice( stIndex, this.context.length - stIndex );
					return retVal;
				}
				else {
					if ( null == arguments[0] || typeof( arguments[0] ) == "undefined" ) {
						return $rb([]);
					}
					if ( null == arguments[1] || typeof( arguments[1] ) == "undefined" ) {
						return $rb([]);
					}
					var stIndex = $unrb( $rb(arguments[0]).to_i() );
					var edIndex = $unrb( $rb(arguments[1]).to_i() );
					if ( 0 > stIndex ) {
						return $rb([]);
					}
					if ( this.context.length <= stIndex ) {
						return $rb([]);
					}
					if ( 0 >= edIndex ) {
						return $rb([]);
					}
					edIndex += stIndex;
					if ( this.context.length <= edIndex ) {
						edIndex = this.context.length;
					}
					retVal = $rb(this.context.slice( stIndex, edIndex ));
					this.context.splice( stIndex, edIndex - stIndex );
					return retVal;
				}
				return $rb([]);
			},
			'sort': function(){
				var retVal = $rb([]);
				var existFnc = false;
				if ( 1 == arguments.length ) {
					if ( null == arguments[0] || typeof( arguments[0] ) == "undefined" ) {
						return this.copy();
					}
					if ( typeof( arguments[0] ) != "function" ) {
						return this.copy();
					}
					existFnc = true;
				}
				if ( 0 == this.context.length ) {
					return retVal;
				}
				retVal.push( this.context[0] );
				if ( 1 == this.context.length ) {
					return retVal;
				}
				var evalVal;
				var insertFlag;
				for ( var i=1;i<this.context.length;i+=1 ) {
					insertFlag = false;
					for ( var j=0;j<retVal.context.length;j+=1 ) {
						if ( existFnc ) {
							evalVal = arguments[0].apply( this, [retVal.context[j], this.context[i]] );
							if ( null == evalVal || typeof( evalVal ) != "number" ) {
								return this.copy();
							}
						}
						else {
							// bubble sort :(
							var org = retVal.context[j];
							var cmp = this.context[i];
							
							var org_type = 0;
							var cmp_type = 0;
							var typeTbl = {
									  "boolean": 1
									, "number": 2
									, "string": 3
									, "object": 4
									, "function": 6
									, "undefined": 7
								};
							if ( null == org ) {
								org_type = 0;
							}
							else {
								org_type = typeTbl[ typeof( org ) ];
								if ( 4 == org_type && false == $rb(org).is_array().context ) {
									org_type = 5;
								}
							}
							if ( null == cmp ) {
								cmp_type = 0;
							}
							else {
								cmp_type = typeTbl[ typeof( cmp ) ];
								if ( 4 == cmp_type && false == $rb(cmp).is_array().context ) {
									cmp_type = 5;
								}
							}
							evalVal = cmp_type - org_type;
							if ( 0 == evalVal ) {
								switch( cmp_type ) {
								case 1:	// boolean
									if ( cmp == org ) {
										evalVal = 0;
									}
									else {
										if ( true == cmp ) {
											evalVal = 1;
										}
										else {
											evalVal = -1;
										}
									}
									break;
									
								case 2: // number
									evalVal = cmp - org;
									break;
									
								case 3: // string
									var strMax = org.length;
									if ( strMax > cmp.length ) {
										strMax = cmp.length;
									}
									for ( var k=0;k<strMax;k+=1 ) {
										evalVal = cmp.charCodeAt(k) - org.charCodeAt(k);
										if ( 0 != evalVal ) {
											break;
										}
									}
									if ( 0 == evalVal ) {
										if ( strMax < org.length ) {
											evalVal = -1;
										}
									}
									break;
									
								case 4: // array
								case 5: // object
								case 6: // function
									evalVal = cmp.length - org.length;
									break;
								}
							}
						}
						if ( -1 >= evalVal ) {
							retVal.insert( j, this.context[i] );
							insertFlag = true;
							break;
						}
					}
					if ( false == insertFlag ) {
						retVal.push( this.context[i] );
					}
				}
				return retVal;
			},
			'sort_f': function(){
				var retVal;
				if ( 1 == arguments.length ) {
					retVal = this.sort( arguments[0] );
				}
				else {
					retVal = this.sort();
				}
				return this.replace( retVal.context );
			},
			'transpose': function(){
				if ( 0 == this.context.length ) {
					return $rb([]);
				}
				var col = -1;
				var row = 0;
				row = this.context.length;
				for(var i=0;i<this.context.length;i+=1){
					if ( null == this.context[i] || typeof( this.context[i] ) == "undefined" || false == $rb(this.context[i]).is_array().context ) {
						throw "Array.transpose() : cannot convert type into array (TypeError)";
					}
					if ( -1 == col ) {
						col = this.context[i].length;
					}
					else if ( col != this.context[i].length ) {
						throw "Array.transpose() : element size differ (IndexError)";
					}
				}
				var retAry = $rb([]);
				for ( var i=0;i<col;i+=1 ) {
					retAry.push( [] );
				}
				for ( var i=0;i<row;i+=1 ) {
					for ( var j=0;j<col;j+=1 ) {
						retAry.context[j][i] = this.context[i][j];
					}
				}
				return retAry;
			},
			'uniq': function(){
				var retAry = [];
				var uniqFlag;
				for ( var i=0;i<this.context.length;i+=1 ) {
					uniqFlag = true;
					for ( var j=0;j<retAry.length;j+=1 ) {
						if ( null == retAry[j] ) {
							if ( null == this.context[i] ) {
								uniqFlag = false;
								break;
							}
						}
						else if ( typeof( retAry[j] ) == "undefined" ) {
							if ( typeof( this.context[i] ) == "undefined" ) {
								uniqFlag = false;
								break;
							}
						}
						else {
							if ( safe_obj( retAry[j] ).is_eql( this.context[i] ).context ) {
								uniqFlag = false;
								break;
							}
						}
					}
					if ( uniqFlag ) {
						retAry[retAry.length] = this.context[i];
					}
				}
				return $rb(retAry);
			},
			'uniq_f': function(){
				var retAry = this.uniq();
				return this.replace( retAry.context );
			},
			'unshift': function(){
				if ( 0 == arguments.length ) { return this; }
				var cpyAry = this.copy();
				this.clear();
				var i;
				for ( i=0;i<arguments.length;i+=1) {
					this.context[i] = arguments[i];
				}
				this.concat( cpyAry.context );
				return this;
			},
			'values_at': function(){
				if ( 0 == arguments.length ) { return $rb([]); }
				retAry = $rb([]);
				for ( var i=0;i<arguments.length;i+=1 ) {
					if ( null == arguments[i] || typeof( arguments[i] ) != "number" ) {
						retAry.push( null );
					}
					else {
						var index = $unrb( $rb(arguments[i]).to_i() );
						if ( 0 > index ) {
							retAry.push( null );
						}
						else if ( index >= this.context.length ) {
							retAry.push( null );
						}
						else {
							retAry.push( this.context[index] );
						}
					}
				}
				return $rb(retAry);
			}
		};
		function RbArray(){};
		RbArray.prototype = new Array();
		for ( var fnName in enumerableExMethods ) {
			RbArray.prototype[fnName] = enumerableExMethods[fnName];
			RbArray.prototype["_"+fnName] = enumerableExMethods[fnName];
		}
		for ( var fnName in arrayExMethods ) {
			RbArray.prototype[fnName] = arrayExMethods[fnName];
			RbArray.prototype["_"+fnName] = arrayExMethods[fnName];
		}
		
		
		/*--------------------------------------
		  STACK
		--------------------------------------*/
		function _ref_stack() {
			this.stack = [];
		}
		_ref_stack.prototype.stack = [];
		_ref_stack.prototype.is_circular = function( obj ) {
			for ( var i=0;i<this.stack.length;i+=1 ) {
				if ( null != obj && typeof( obj ) == "object" ) {
					if ( obj === this.stack[i] ) {
						return true;
					}
				}
			}
			if	(
				   ( null != obj )
				&& ( "object" == typeof( obj ) )
				) {
				this.stack[this.stack.length] = obj;
			}
			return false;
		};
		
		
		/*--------------------------------------
		  FACTORY
		--------------------------------------*/
		$Rubellite.prototype.isRubelliteClass = function( obj ) {
			if ( obj instanceof RbString ) { return true; }
			if ( obj instanceof RbNumber ) { return true; }
			if ( obj instanceof RbBoolean ) { return true; }
			if ( obj instanceof RbFunction ) { return true; }
			if ( obj instanceof RbArray ) { return true; }
			if ( obj instanceof RbObject ) { return true; }
			return false;
		};
		$Rubellite.prototype.createRbString = function() {
			return new RbString();
		};
		$Rubellite.prototype.createRbNumber = function() {
			return new RbNumber();
		};
		$Rubellite.prototype.createRbBoolean = function() {
			return new RbBoolean();
		};
		$Rubellite.prototype.createRbFunction = function() {
			return new RbFunction();
		};
		$Rubellite.prototype.createRbArray = function() {
			return new RbArray();
		};
		$Rubellite.prototype.createRbObject = function() {
			return new RbObject();
		};
	}
}

/*--------------------------------------
  Unwrap function
--------------------------------------*/
function $unrb( obj ){
	if ( null == obj ) { return obj; }
	if ( typeof( obj ) == "undefined" ) { return obj; }
	if ( typeof( obj.context ) != "undefined" ) {
		return obj.context;
	}
	return obj;
}

