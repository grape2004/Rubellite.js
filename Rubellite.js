/*----------------------------------------------------------
  Rubellite  ver 0.031  2012.04.07
    Rubellite is not implementation of Ruby language.
    It provides coding such as Ruby restrictively.
      License    : MIT
      Written by : grape@nona.dti.ne.jp
  [CAUTION]
    This library pollutes prototype of atomic objects.
----------------------------------------------------------*/

/*--------------------------------------
  Common function
--------------------------------------*/
var __rubellite_user_agent = window.navigator.userAgent.toLowerCase();
var __rubellite_ua = null;
var __rubellite_is_local = null;
function __get_user_agent() {
	if ( null != __rubellite_ua ) { return __rubellite_ua; }
	if (__rubellite_user_agent.indexOf('opera') != -1) {
		__rubellite_ua = 'opera'
	}
	else if (__rubellite_user_agent.indexOf('msie') != -1) {
		__rubellite_ua = 'ie';
	}
	else if (__rubellite_user_agent.indexOf('chrome') != -1) {
		__rubellite_ua = 'chrome';
	}
	else if (__rubellite_user_agent.indexOf('safari') != -1) {
		__rubellite_ua = 'safari';
	}
	else if (__rubellite_user_agent.indexOf('gecko') != -1) {
		__rubellite_ua = 'gecko';
	}
	else {
		__rubellite_ua = false;
	}
	return __rubellite_ua;
};

function __is_local() {
	if ( null != __rubellite_is_local ) { return __rubellite_is_local; }
	__rubellite_is_local = ( "file://" == location.toString().slice( 0, 7 ) );
	return __rubellite_is_local;
}

function __safe_obj( obj ) {
	if ( null == obj || typeof( obj ) != "object" ) { return obj }
	var safeObj = obj;
	if ( typeof( obj._to_i ) == "undefined" ) {
		obj._to_i = Object.prototype._to_i;
		obj._to_f = Object.prototype._to_f;
		obj._to_s = Object.prototype._to_s;
		obj._to_a = Object.prototype._to_a;
		obj._to_ary = Object.prototype._to_ary;
		obj._is_array = Object.prototype._is_array;
		obj._is_eql = Object.prototype._is_eql;
		
		if ( __is_local() ) {
			obj.sessionStorage = null;
			obj.localStorage = null;
		}
		if ( typeof( sessionStorage ) === 'undefined' ) {
			obj.sessionStorage = null;
			obj.localStorage = null;
		}
	}
	return safeObj;
}

/*--------------------------------------
  Object
--------------------------------------*/
Object.prototype._to_i = function() { return 0; };
Object.prototype._to_f = function() { return 0.0; };
Object.prototype._to_s = function() {
	if ( null == this ) { return "null"; }
	if ( typeof( this ) == "undefined" ) { return "undefined"; }
	if ( 0 == this.length ) { return "{}"; }
	var __ref_stack;
	if ( 0 == arguments.length ) {
		__ref_stack = new _ref_stack();
	}
	else {
		__ref_stack = arguments[ arguments.length - 1 ];
		if ( typeof( __ref_stack._is_circular ) == "undefined" ) {
			throw "Object._is_eql() : too few parameters";
		}
	}
	if ( __ref_stack._is_circular( this ) ) {
		throw "Object._to_s() : circular reference";
	}
	var retVal = "";
	var i = 0;
	for ( var key in this ) {
		switch( key ) {
		case "_to_i":
		case "_to_f":
		case "_to_s":
		case "_to_a":
		case "_to_ary":
		case "_is_array":
		case "_is_eql":
			break;
		default:
			if ( key == "sessionStorage" || key == "localStorage" ) {
				try {
					if ( __is_local() ) { continue; }
					if ( typeof( sessionStorage ) === 'undefined' ) { continue; }
				}catch(e) {}
			}
			if ( 0 != retVal.length ) { retVal += ","; }
			var key_s = key;
			var val_s = "";
			
			if ( typeof( key ) == "string" ) {
				key_s = '"' + key + '"';
			}
			if ( null == this[key] ) {
				val_s = "null";
			}
			else if ( typeof( this[key] ) == "undefined" ) {
				val_s = "undefine";
			}
			else if ( typeof( this[key].tagName ) != "undefined" ) {
				val_s = "[object " + this[key].tagName + "]";
			}
			else {
				val_s = __safe_obj( this[key] )._to_s( __ref_stack );
				if ( typeof( this[key] ) == "string" ) {
					val_s = '"' + val_s + '"';
				}
			}
			retVal += ( key_s + "=>" + val_s );
			i += 1;
		}
	}
	return "{" + retVal + "}";
};
Object.prototype._to_a = function() {
	if ( null == this ) { return [null]; }
	if ( typeof( this ) == "undefined" ) { return "undefined"; }
	if ( 0 == this.length ) { return [this]; }
	var retAry = [];
	var i = 0;
	for ( var key in this ) {
		switch( key ) {
		case "_to_i":
		case "_to_f":
		case "_to_s":
		case "_to_a":
		case "_to_ary":
		case "_is_array":
		case "_is_eql":
			break;
		default:
			if ( key == "sessionStorage" || key == "localStorage" ) {
				try {
					if ( __is_local() ) { continue; }
					if ( typeof( sessionStorage ) === 'undefined' ) { continue; }
				}catch(e) {}
			}
			retAry[i] = [ key, this[key] ];
			i += 1;
		}
	}
	return retAry;
};
Object.prototype._to_ary = Object.prototype._to_a;
Object.prototype._is_array = function() { return false; };
Object.prototype._is_eql = function( other ) {
	if ( null == this ) {
		if ( null == other ) {
			return true;
		}
		return false;
	}
	for ( var key in this ) {
		switch( key ) {
		case "_to_i":
		case "_to_f":
		case "_to_s":
		case "_to_a":
		case "_to_ary":
		case "_is_array":
		case "_is_eql":
			break;
		default:
			if ( key == "sessionStorage" || key == "localStorage" ) {
				try {
					if ( __is_local() ) { continue; }
					if ( typeof( sessionStorage ) === 'undefined' ) { continue; }
				}catch(e) {}
			}
			if ( this[key] != other[key] ) {
				return false;
			}
			break;
		}
	}
	return true;
};


/*--------------------------------------
  Function
--------------------------------------*/
Function.prototype._to_i = function() { return 0; };
Function.prototype._to_f = function() { return 0.0; };
Function.prototype._to_s = function() { return "[function]"; };
Function.prototype._to_a = function() { return [ this ]; };
Function.prototype._to_ary = Function.prototype._to_a;
Function.prototype._is_eql = function( other ) { return this == other; };

/*--------------------------------------
  Number
--------------------------------------*/
Number.prototype._to_i = function() {
	if ( NaN == this ) {
		return 0;
	}
	return parseInt( this );
};
Number.prototype._to_f = function() { return 0.0 + this; };
Number.prototype._to_s = function() { return this.toString(); };
Number.prototype._to_a = function() { return [ this ]; };
Number.prototype._to_ary = Number.prototype._to_a;
Number.prototype._is_eql = function( other ) { return this == other; };

/*--------------------------------------
  String
--------------------------------------*/
String.prototype._to_i = function() {
	if ( this.match(/^[+-]?[0-9]+\.?[0-9]*$/i) ) {
		return parseInt( this );
	}
	else {
		return 0;
	}
};
String.prototype._to_f = function() {
	if ( this.match(/^[+-]?[0-9]+\.?[0-9]*$/i) ) {
		return parseFloat( this );
	}
	else {
		return 0;
	}
};
String.prototype._to_s = function() { return this.toString(); };
String.prototype._to_a = function() { return [ this ]; };
String.prototype._to_ary = String.prototype._to_a;
String.prototype._is_eql = function( other ) { return this == other; };

/*--------------------------------------
  Boolean
--------------------------------------*/
Boolean.prototype._to_i = function() {
	if ( true == this ) {
		return 0;
	}
	return -1;
};
Boolean.prototype._to_f = function() {
	if ( true == this ) {
		return 0.0;
	}
	return -1.0;
};
Boolean.prototype._to_s = function() {
	if ( true == this ) {
		return "true";
	}
	return "false";
};
Boolean.prototype._to_a = function() { return [ this ]; };
Boolean.prototype._to_ary = Boolean.prototype._to_a;
Boolean.prototype._is_eql = function( other ) { return this == other; };

/*--------------------------------------
  Array
--------------------------------------*/
Array.prototype._to_i = function() { return 0; };
Array.prototype._to_f = function() { return 0.0; };
Array.prototype._to_s = function() {
	var __ref_stack;
	if ( 0 == arguments.length ) {
		__ref_stack = new _ref_stack();
	}
	else {
		__ref_stack = arguments[ arguments.length - 1 ];
		if ( typeof( __ref_stack._is_circular ) == "undefined" ) {
			throw "Object._is_eql() : too few parameters";
		}
	}
	if ( __ref_stack._is_circular( this ) ) {
		throw "Object._to_s() : circular reference";
	}
	var i;
	var retVal = "";
	for ( i=0; i<this.length; i+=1 ) {
		if ( 0 != retVal.length ) { retVal += ","; }
		if ( null == this[i] ) {
			retVal += "null";
		}
		else {
			retVal += ( __safe_obj( this[i] )._to_s( __ref_stack ) );
		}
	}
	return "[" + retVal + "]";
};
Array.prototype._to_a = function() { return this; };
Array.prototype._to_ary = Array.prototype._to_a;
Array.prototype._is_array = function() { return true; };
Array.prototype._is_eql = function( other ) {
	var __ref_stack;
	if ( 1 == arguments.length ) {
		if ( null != other && typeof( other ) != "undefined" && typeof( other._is_circular ) != "undefined" ) {
			throw "Object._is_eql() : too few parameters";
		}
		__ref_stack = new _ref_stack();
	}
	else {
		__ref_stack = arguments[ arguments.length - 1 ];
		if ( typeof( __ref_stack._is_circular ) == "undefined" ) { return ""; }
	}
	if ( __ref_stack._is_circular( this ) ) {
		throw "Object._to_s() : circular reference";
	}
	if ( typeof( other ) != "undefined" ) {
		if ( null != other && other._is_array() ) {
			if ( this.length == other.length ) {
				var i;
				for ( i=0; i<this.length; i += 1 ) {
					if ( null == this[i] ) {
						if ( null != other[i] ) {
							return false;
						}
					}
					else if ( false == __safe_obj( this[i] )._is_eql( other[i], __ref_stack ) ) {
						return false;
					}
				}
				return true;
			}
		}
	}
	return false;
};
Array.prototype._add = function( ary ) {
	return this._copy()._concat( ary );
};
Array.prototype._sub = function( ary ) {
	var retAry = this._copy()._delete_if( function(elm) {
		if ( null == ary ) {
			return ary == elm;
		}
		else if ( typeof( ary ) == "undefined" ) {
			return ary == elm;
		}
		else if ( ary._is_array() ) {
			return ary._is_exist( elm );
		}
		else {
			return ary == elm;
		}
	});
	return retAry;
};
Array.prototype._multiply = function( times ) {
	if ( null == times ) { return [] }
	if ( typeof( times ) != "number" ) { return []; }
	times = times._to_i();
	if ( 0 == times ) { return []; }
	var retAry = [];
	for ( var i=0;i<times;i+=1 ) {
		retAry._concat( this );
	}
	return retAry;
};
Array.prototype._times = Array.prototype._multiply;
Array.prototype._and = function( other ) {
	if ( null == other || typeof( other ) == "undefined" || false == other._is_array() ) {
		return [];
	}
	var retAry = this._uniq();
	other._uniq_f();
	retAry._delete_if( function(elm){
		return !other._is_exist( elm );
	});
	return retAry;
};
Array.prototype._or = function( other ) {
	if ( null == other || typeof( other ) == "undefined" || false == other._is_array() ) {
		return [];
	}
	return this._uniq()._concat( other )._uniq();
};
Array.prototype._assoc = function( key ) {
	var i;
	for ( i=0; i<this.length; i+=1 ) {
		if ( null != this[i] && typeof( this[i] ) != "undefined" ) {
			if ( this[i]._is_array() ) {
				if ( null == key || typeof( key ) == "undefined" ) {
					if ( key == this[i][0] ) {
						return this[i];
					}
				}
				else if ( __safe_obj( key )._is_eql( this[i][0] ) ) {
					return this[i];
				}
			}
		}
	}
	return null;
};
Array.prototype._at = function( index ) {
	if ( null == index ) { return null }
	if ( typeof( index ) != "number" ) { return null; }
	index = index._to_i();
	if ( 0 > index ) {
		return null;
	}
	if ( this.length <= index ) {
		return null;
	}
	return this[ index ];
};
Array.prototype._clear = function() {
	this.splice( 0, this.length );
	return this;
};
Array.prototype._copy = function() {
	var i;
	var cpyAry = new Array();
	for ( i = 0; i < this.length; i += 1 ) {
		cpyAry[i] = this[i];
	}
	return cpyAry;
};
Array.prototype._dup = Array.prototype._copy;
Array.prototype._collect = function( yield ) {
	var i;
	var elm = undefined;
	var retAry = new Array();
	for ( i = 0; i < this.length; i += 1 ) {
		elm = yield.apply( this, [this[i]] );
		if ( typeof elm != "undefined" ) {
			retAry[i] = elm;
		}
		else {
			retAry[i] = this[i];
			elm = undefined;
		}
	}
	return retAry;
};
Array.prototype._collect_f = function( yield ) {
	var i;
	var elm = undefined;
	for ( i = 0; i < this.length; i += 1 ) {
		elm = yield.apply( this, [this[i]] );
		if ( typeof elm != "undefined" ) {
			this[i] = elm;
		}
		else {
			elm = undefined;
		}
	}
	return this;
};
Array.prototype._map_f = Array.prototype._collect_f;
Array.prototype._compact = function() {
	var i = 0;
	var j = 0;
	var retAry = new Array();
	while( i < this.length ) {
		if ( null != this[i] ) {
			retAry[j] = this[i];
			j += 1;
		}
		i += 1;
	}
	return retAry;
};
Array.prototype._compact_f = function() {
	var i = 0;
	while( i < this.length ) {
		if ( null == this[i] ) {
			this.splice( i, 1 );
		}
		else {
			i += 1;
		}
	}
	return this;
};
Array.prototype._concat = function( ary ) {
	switch( typeof( ary ) ) {
	case "object":
		if ( null == ary ) {
			this[this.length] = ary;
		}
		else if ( ary._is_array() ) {
			var i;
			for ( i = 0; i < ary.length; i += 1 ) {
				this[this.length] = ary[i];
			}
		}
		break;
		
	default:
		this[this.length] = ary;
		break;
	}
	return this;
};
Array.prototype._delete = function( elm ) {
	var i = 0;
	var retVal = null;
	var numOfDelete = 0;
	while( i < this.length ) {
		if ( elm == this[i] ) {
			this.splice( i, 1 );
			retVal = elm;
			numOfDelete += 1;
			if ( i >= this.length ) {
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
	return retVal;
};
Array.prototype._delete_at = function( index ) {
	if ( typeof( index ) == "undefined" ) { return null; }
	index = index._to_i();
	var elm = this[index];
	if ( index < this.length ) {
		this.splice( index, 1 );
	}
	if ( typeof( elm ) == "undefined" ) {
		return null;
	}
	return elm;
};
Array.prototype._delete_if = function( yield ) {
	var i = 0;
	if ( typeof( yield ) == "function" ) {
		while( i < this.length ) {
			if ( true == yield.apply( this, [this[i]] ) ) {
				this.splice( i, 1 );
				if ( i >= this.length ) {
					break;
				}
			}
			else {
				i += 1;
			}
		}
	}
	return this;
};
Array.prototype._reject_f = function( yield ) {
	var i = 0;
	var numOfDelete = 0;
	if ( typeof( yield ) == "function" ) {
		while( i < this.length ) {
			if ( true == yield.apply( this, [this[i]] ) ) {
				this.splice( i, 1 );
				numOfDelete += 1;
				if ( i >= this.length ) {
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
		return null;
	}
};
Array.prototype._each = function( yield ) {
	for ( var i=0;i<this.length;i+=1 ) {
		yield.apply( this, [this[i]] );
	}
	return this;
};
Array.prototype._each_index = function( yield ) {
	var i;
	for ( i=0;i<this.length;i+=1 ) {
		yield.apply( this, [i] );
	}
	return this;
};
Array.prototype._is_empty = function() {
	return 0 == this.length;
};
Array.prototype._is_exist = function( ary ) {
	for ( var i=0;i<this.length;i+=1 ) {
		if ( null == this[i] ) {
			if ( null == ary ) {
				return true;
			}
		}
		else if ( this[i]._is_array() && __safe_obj( this[i] )._is_eql( ary ) ) {
			return true;
		}
		else if ( this[i] == ary ) {
			return true;
		}
	}
	return false;
};
Array.prototype._is_include = Array.prototype._is_exist;
Array.prototype._fetch = function() {
	if ( 0 == arguments.length ) {
		return null;
	}
	if ( 2 < arguments.length ) {
		return null;
	}
	if ( null == arguments[0] ) {
		return null;
	}
	var index = arguments[0]._to_i();
	var retVal = null;
	if ( 0 > index || this.length <= index ) {
		if ( 2 == arguments.length ) {
			if ( null != arguments[1] && typeof( arguments[1] ) == "function" ) {
				retVal = arguments[1].apply( this, [this[index]] );
			}
			else {
				retVal = arguments[1];
			}
			if ( typeof( retVal ) == "undefined" ) {
				retVal = null;
			}
			return retVal;
		}
		else {
			throw "Array._fetch() : too less argument.";
		}
	}
	if ( 2 == arguments.length ) {
		if ( null != arguments[1] && typeof( arguments[1] ) == "function" ) {
			retVal = arguments[1]( this[index] );
			if ( typeof( retVal ) == "undefined" ) {
				retVal = null;
			}
			return retVal;
		}
	}
	return this[index];
};
Array.prototype._fill = function() {
	if ( 0 == arguments.length ) {
		return this;
	}
	if ( 3 < arguments.length ) {
		return this;
	}
	var fillVal = arguments[0];
	var startIndex = 0;
	var endIndex = this.length;
	if ( 2 <= arguments.length ) {
		if ( typeof( arguments[1] ) == "undefined" ) { return this; }
		startIndex = arguments[1]._to_i();
		if ( 0 > startIndex ) {
			startIndex = 0;
		}
	}
	if ( 3 == arguments.length ) {
		if ( typeof( arguments[2] ) == "undefined" ) { return this; }
		endIndex = arguments[2]._to_i();
		if ( 1 > endIndex ) {
			return this;
		}
		endIndex += startIndex;
	}
	var i;
	for ( i = startIndex; i < endIndex; i += 1 ) {
		this[ i ] = fillVal;
	}
	return this;
};
Array.prototype._first = function() {
	var retVal = null;
	var elmLength = 0;
	if ( 0 == this.length ) {
		return null;
	}
	if ( 0 < arguments.length ) {
		if ( null == arguments[0] ) {
			return null;
		}
		if ( typeof( arguments[0] ) == "undefined" ) {
			return null;
		}
		elmLength = arguments[0]._to_i();
		if ( 0 >= elmLength ) {
			return [];
		}
		if ( elmLength > this.length ) {
			elmLength = this.length;
		}
		retVal = this.slice( 0, elmLength );
	}
	else {
		retVal = this[0];
	}
	return retVal;
};
Array.prototype._flatten = function() {
	var __ref_stack;
	if ( 0 == arguments.length ) {
		__ref_stack = new _ref_stack();
	}
	else {
		__ref_stack = arguments[ arguments.length - 1 ];
		if ( typeof( __ref_stack._is_circular ) == "undefined" ) {
			throw "Object._is_eql() : too few parameters";
		}
	}
	if ( __ref_stack._is_circular( this ) ) {
		throw "Object._to_s() : circular reference";
	}
	var retAry = [];
	for ( var i=0; i<this.length; i+=1 ) {
		var tmpVal = this[i];
		if ( null != tmpVal && tmpVal._is_array() ) {
			tmpVal = tmpVal._flatten( __ref_stack );
		}
		retAry._concat( tmpVal );
	}
	return retAry;
};
Array.prototype._flatten_f = function() {
	return this._replace( this._flatten() );
};
Array.prototype._index = function( aryOrFnc ) {
	for ( var i=0;i<this.length;i+=1 ) {
		if ( null != aryOrFnc && typeof( aryOrFnc ) == "function" ) {
			if ( aryOrFnc.apply( this, [this[i]] ) || false ) {
				return i;
			}
		}
		else {
			if ( null == this[i] ) {
				if ( null == aryOrFnc ) {
					return i;
				}
			}
			else if ( this[i]._is_array() && __safe_obj( this[i] )._is_eql( aryOrFnc ) ) {
				return i;
			}
			else if ( this[i] == aryOrFnc ) {
				return i;
			}
		}
	}
	return null;
};
Array.prototype._insert = function() {
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
	index = index._to_i();
	if ( 0 > index ) {
		return this;
	}
	var afterAry = [];
	if ( index < this.length ) {
		afterAry = this.slice( index );
	}
	else {
		this._fill( null, this.length, index - this.length - 1 );
	}
	var i;
	for ( i=0;i<arguments.length-1;i+=1) {
		this[index+i] = arguments[i+1];
	}
	index = index + i;
	for ( i=0;i<afterAry.length;i+=1) {
		this[index+i] = afterAry[i];
	}
	return this;
};
Array.prototype._join = function( sep ) {
	var __ref_stack = null;
	if ( 0 == arguments.length ) {
		sep = ",";
	}
	else {
		if ( 1 == arguments.length ) {
			if ( null != sep && typeof( sep ) != "undefined" && typeof( sep._is_circular ) != "undefined" ) {
				throw "Object._is_eql() : too few parameters";
			}
		}
		else {
			__ref_stack = arguments[ arguments.length - 1 ];
			if ( typeof( __ref_stack._is_circular ) == "undefined" ) { return ""; }
		}
	}
	if ( null == __ref_stack ) {
		__ref_stack = new _ref_stack();
	}
	if ( __ref_stack._is_circular( this ) ) {
		throw "Object._to_s() : circular reference";
	}
	if ( null == sep || typeof( sep ) == "undefined" ) {
		sep = "";
	}
	sep = __safe_obj( sep )._to_s();
	var retVal = "";
	for (var i=0;i<this.length;i+=1) {
		if ( 0 < retVal.length ) {
			retVal += sep;
		}
		if ( null == this[i] ) {
			retVal += "null";
		}
		else if ( typeof( this[i] ) == "undefined" ) {
			retVal += "undefined";
		}
		else if ( this[i]._is_array() ) {
			retVal += this[i]._join( sep, __ref_stack );
		}
		else {
			retVal += __safe_obj( this[i] )._to_s();
		}
	}
	return retVal;
};
Array.prototype._last = function() {
	var retVal = null;
	var elmLength = 0;
	if ( 0 == this.length ) {
		return null;
	}
	if ( 0 < arguments.length ) {
		if ( null == arguments[0] ) {
			return null;
		}
		if ( typeof( arguments[0] ) == "undefined" ) {
			return null;
		}
		elmLength = arguments[0]._to_i();
		if ( 0 >= elmLength ) {
			return [];
		}
		if ( elmLength > this.length ) {
			elmLength = this.length;
		}
		retVal = this.slice( this.length - elmLength );
	}
	else {
		retVal = this[this.length-1];
	}
	return retVal;
};
Array.prototype._size = function() {
	return this.length;
};
Array.prototype._nitems = function() {
	var nullCnt = 0;
	for ( var i=0;i<this.length;i+=1 ) {
		if ( null == this[i] ) {
			nullCnt += 1;
		}
	}
	return this.length - nullCnt;
};
Array.prototype._pack = function() {
	// Array._pack() is not implementation.
	return null;
};
Array.prototype._pop = function() {
	if ( 0 == this.length ) {
		return null;
	}
	var elm = this[this.length-1];
	this.splice( this.length-1, 1 );
	return elm;
};
Array.prototype._push = function() {
	if ( 0 == arguments.length ) { return this; }
	var i;
	for ( i=0; i<arguments.length; i+=1 ) {
		this[this.length] = arguments[i]
	}
	return this;
};
Array.prototype._rassoc = function( key ) {
	var i;
	for ( i=0; i<this.length; i+=1 ) {
		if ( null != this[i] && typeof( this[i] ) != "undefined" ) {
			if ( this[i]._is_array() ) {
				if ( 2 <= this[i].length ) {
					if ( null == key || typeof( key ) == "undefined" ) {
						if ( key == this[i][1] ) {
							return this[i];
						}
					}
					else if ( __safe_obj( key )._is_eql( this[i][1] ) ) {
						return this[i];
					}
				}
			}
		}
	}
	return null;
};
Array.prototype._replace = function( another ) {
	this._clear();
	if ( null == another || typeof( another ) == "undefined" ) {
		this[0] = another;
	}
	else if ( false == another._is_array() ) {
		this[0] = another;
	}
	else {
		for ( var i=0;i<another.length;i+=1 ) {
			this[i] = another[i];
		}
	}
	return this;
};
Array.prototype._reverse = function() {
	if ( 0 == this.length ) {
		return [];
	}
	var tmpVal = [];
	tmpVal._fill( null, 0, this.length );
	for ( var i=this.length-1;i>=0;i-=1 ) {
		tmpVal[(this.length-1)-i] = this[i];
	}
	return tmpVal;
};
Array.prototype._reverse_f = function() {
	if ( 0 == this.length ) {
		return this;
	}
	var tmpVal = this._copy();
	for ( var i=tmpVal.length-1;i>=0;i-=1 ) {
		this[(tmpVal.length-1)-i] = tmpVal[i];
	}
	return this;
};
Array.prototype._reverse_each = function( yield ) {
	for ( var i=this.length-1; i>=0; i-=1 ) {
		yield.apply( this, [this[i]] );
	}
	return this;
};
Array.prototype._rindex = function( aryOrFnc ) {
	for ( var i=this.length-1;i>=0;i-=1 ) {
		if ( null != aryOrFnc && typeof( aryOrFnc ) == "function" ) {
			if ( aryOrFnc.apply( this, [this[i]] ) || false ) {
				return i;
			}
		}
		else {
			if ( null == this[i] ) {
				if ( null == aryOrFnc ) {
					return i;
				}
			}
			else if ( this[i]._is_array() && __safe_obj( this[i] )._is_eql( aryOrFnc ) ) {
				return i;
			}
			else if ( this[i] == aryOrFnc ) {
				return i;
			}
		}
	}
	return null;
};
Array.prototype._shift = function() {
	if ( 0 == this.length ) {
		return null;
	}
	var elm = this[0];
	this.splice( 0, 1 );
	return elm;
};
Array.prototype._slice = function() {
	if ( 0 == arguments.length ) {
		retVal = this._copy();
		return retVal;
	}
	if ( 1 == arguments.length ) {
		if ( null == arguments[0] || typeof( arguments[0] ) == "undefined" ) {
			return [];
		}
		var stIndex = arguments[0]._to_i();
		if ( 0 > stIndex ) {
			return [];
		}
		if ( this.length <= stIndex ) {
			return [];
		}
		return this.slice( stIndex );
	}
	else {
		if ( null == arguments[0] || typeof( arguments[0] ) == "undefined" ) {
			return [];
		}
		if ( null == arguments[1] || typeof( arguments[1] ) == "undefined" ) {
			return [];
		}
		var stIndex = arguments[0]._to_i();
		var edIndex = arguments[1]._to_i();
		if ( 0 > stIndex ) {
			return [];
		}
		if ( this.length <= stIndex ) {
			return [];
		}
		if ( 0 >= edIndex ) {
			return [];
		}
		edIndex += stIndex;
		if ( this.length <= edIndex ) {
			edIndex = this.length;
		}
		return this.slice( stIndex, edIndex );
	}
	return [];
};
Array.prototype._slice_f = function() {
	var retVal;
	if ( 0 == arguments.length ) {
		retVal = this._copy();
		this._clear();
		return retVal;
	}
	if ( 1 == arguments.length ) {
		if ( null == arguments[0] || typeof( arguments[0] ) == "undefined" ) {
			return [];
		}
		var stIndex = arguments[0]._to_i();
		if ( 0 > stIndex ) {
			return [];
		}
		if ( this.length <= stIndex ) {
			return [];
		}
		retVal = this.slice( stIndex );
		this.splice( stIndex, this.length - stIndex );
		return retVal;
	}
	else {
		if ( null == arguments[0] || typeof( arguments[0] ) == "undefined" ) {
			return [];
		}
		if ( null == arguments[1] || typeof( arguments[1] ) == "undefined" ) {
			return [];
		}
		var stIndex = arguments[0]._to_i();
		var edIndex = arguments[1]._to_i();
		if ( 0 > stIndex ) {
			return [];
		}
		if ( this.length <= stIndex ) {
			return [];
		}
		if ( 0 >= edIndex ) {
			return [];
		}
		edIndex += stIndex;
		if ( this.length <= edIndex ) {
			edIndex = this.length;
		}
		retVal = this.slice( stIndex, edIndex );
		this.splice( stIndex, edIndex - stIndex );
		return retVal;
	}
	return [];
};
Array.prototype._sort = function() {
	var retVal = [];
	var existFnc = false;
	if ( 1 == arguments.length ) {
		if ( null == arguments[0] || typeof( arguments[0] ) == "undefined" ) {
			return this._copy();
		}
		if ( typeof( arguments[0] ) != "function" ) {
			return this._copy();
		}
		existFnc = true;
	}
	if ( 0 == this.length ) {
		return retVal;
	}
	retVal._push( this[0] );
	if ( 1 == this.length ) {
		return retVal;
	}
	var evalVal;
	var insertFlag;
	for ( var i=1;i<this.length;i+=1 ) {
		insertFlag = false;
		for ( var j=0;j<retVal.length;j+=1 ) {
			if ( existFnc ) {
				evalVal = arguments[0].apply( this, [retVal[j], this[i]] );
				if ( null == evalVal || typeof( evalVal ) != "number" ) {
					return this._copy();
				}
			}
			else {
				// bubble sort :(
				var org = retVal[j];
				var cmp = this[i];
				
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
					if ( 4 == org_type && false == org._is_array() ) {
						org_type = 5;
					}
				}
				if ( null == cmp ) {
					cmp_type = 0;
				}
				else {
					cmp_type = typeTbl[ typeof( cmp ) ];
					if ( 4 == cmp_type && false == cmp._is_array() ) {
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
							strMax = cmp.length
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
				retVal._insert( j, this[i] );
				insertFlag = true;
				break;
			}
		}
		if ( false == insertFlag ) {
			retVal._push( this[i] );
		}
	}
	return retVal;
};
Array.prototype._sort_f = function() {
	var retVal;
	if ( 1 == arguments.length ) {
		retVal = this._sort( arguments[0] );
	}
	else {
		retVal = this._sort();
	}
	return this._replace( retVal );
}
Array.prototype._transpose = function() {
	if ( 0 == this.length ) {
		return [];
	}
	var col = -1;
	var row = 0;
	row = this.length;
	for(var i=0;i<this.length;i+=1){
		if ( null == this[i] || typeof( this[i] ) == "undefined" || false == this[i]._is_array() ) {
			throw "Array._transpose() : cannot convert type into array (TypeError)";
		}
		if ( -1 == col ) {
			col = this[i].length;
		}
		else if ( col != this[i].length ) {
			throw "Array._transpose() : element size differ (IndexError)";
		}
	}
	var retAry = [];
	for ( var i=0;i<col;i+=1 ) {
		retAry._push( [] );
	}
	for ( var i=0;i<row;i+=1 ) {
		for ( var j=0;j<col;j+=1 ) {
			retAry[j][i] = this[i][j];
		}
	}
	return retAry;
};
Array.prototype._uniq = function() {
	var retAry = [];
	var uniqFlag;
	for ( var i=0;i<this.length;i+=1 ) {
		uniqFlag = true;
		for ( var j=0;j<retAry.length;j+=1 ) {
			if ( null == retAry[j] ) {
				if ( null == this[i] ) {
					uniqFlag = false;
					break;
				}
			}
			else if ( typeof( retAry[j] ) == "undefined" ) {
				if ( typeof( this[i] ) == "undefined" ) {
					uniqFlag = false;
					break;
				}
			}
			else {
				if ( __safe_obj( retAry[j] )._is_eql( this[i] ) ) {
					uniqFlag = false;
					break;
				}
			}
		}
		if ( uniqFlag ) {
			retAry[retAry.length] = this[i];
		}
	}
	return retAry;
};
Array.prototype._uniq_f = function() {
	var retAry = this._uniq();
	return this._replace( retAry );
};
Array.prototype._unshift = function() {
	if ( 0 == arguments.length ) { return this; }
	var cpyAry = this._copy();
	this._clear();
	var i;
	for ( i=0;i<arguments.length;i+=1) {
		this[i] = arguments[i];
	}
	this._concat( cpyAry );
	return this;
};
Array.prototype._values_at = function() {
	if ( 0 == arguments.length ) { return []; }
	retAry = [];
	for ( var i=0;i<arguments.length;i+=1 ) {
		if ( null == arguments[i] || typeof( arguments[i] ) != "number" ) {
			retAry._push( null );
		}
		else {
			var index = arguments[i]._to_i();
			if ( 0 > index ) {
				retAry._push( null );
			}
			else if ( index >= this.length ) {
				retAry._push( null );
			}
			else {
				retAry._push( this[index] );
			}
		}
	}
	return retAry;
};

/*--------------------------------------
  STACK
--------------------------------------*/
function _ref_stack() {
	this.stack._clear();
}
_ref_stack.prototype.stack = new Array();
_ref_stack.prototype._is_circular = function( obj ) {
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
		this.stack._push( obj );
	}
	return false;
}

