/**
 * MIT License
 *
 * Copyright (c) 2021 Ildar Bikmamatov <support@bayrell.org>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { createStore, Store } from "vuex";
import axios, { AxiosResponse, AxiosError } from "axios";


/**
 * is not null
 */
export function notNull(value)
{
	return value != undefined && value != null && value != "";
}



/**
 * is not null
 */
export function isNull(value)
{
	return value == undefined || value == null || value == "";
}



/**
 * Returns true if response is ok
 */
export function responseOk(response)
{
	return response &&
		typeof(response.data) == "object" &&
		typeof(response.data.error) == "object" &&
		response.data.error.code == 1;
}


/**
 * Returns VueJS model
 */
export function getModel (instance)
{
	if (instance.store != undefined) return instance.store;
	let arr = instance.store_path ? instance.store_path.slice() : [];
	let obj = instance.$store.state;	
	return attr(obj, arr, null);
}



/**
 * Returns mutations list from class state prototype
 */
export function getMutations (proto)
{
	let res = {};
	if (proto.mutations != undefined)
	{
		let items = proto.mutations();
		for (let i = 0; i < items.length; i++)
		{
			let method_name = items[i];
			res[method_name] = proto[method_name];
		}
	}
	return res;
}



/**
 * Build store from class state prototype
 */
export function buildStoreConfig (proto)
{
	/* Create store */
	let res =
	{
		namespaced: true,
		state: {},
		modules: {}
	};

	/* Build modules */
	if (proto.components != undefined)
	{
		let modules = proto.components();
		let modules_keys = Object.keys(modules);
		for (let i=0; i<modules_keys.length; i++)
		{
			let module_name = modules_keys[i];
			let module = modules[module_name];
			res["modules"][modules_keys[i]] = buildStoreConfig(module);
		}
	}
	
	/* Get mutations  */
	res["mutations"] = getMutations(proto);
	
	/* Returns store */
	return res;
}



/**
 * Build store
 */
export function buildStore(proto)
{
	let config = buildStoreConfig(proto);
	let obj = new proto();
	let keys = Object.keys(obj);
	let store = createStore( config )
	
	/* Init store */
	for (let i=0; i<keys.length; i++)
	{
		let key = keys[i];
		store.state[key] = obj[key];
	}

	return store;
}



/**
 * Route update
 */
export async function onRouteUpdate(kind, to, from, next)
{
	let props = to.matched[0].props.default;
	let store_path = props.store_path;
	let component = to.matched[0].components.default;
	let model = attr(storeInstance.state, store_path, null);
	if (model)
	{
		let route =
		{
			kind: kind,
			props,
			to,
			from,
			next,
			store_path,
			component,
			setPageTitle,
		};
		try
		{
			if (typeof model.onRouteUpdate == 'function')
			{
				await model.onRouteUpdate(route);
			}
			next();
		}
		catch (e)
		{
			next();
			throw e;
		}
	}
	else
	{
		next();
	}
}



/**
 * VueJS Mixin
 */
export const mixin =
{
	props:
	{
		store: Object,
		store_path: Array,
		page_action: String,
	},
	computed:
	{
		model()
		{
			return getModel(this);
		},
		state()
		{
			return this.$store.state;
		}
	},
	methods:
	{
		setPageTitle(s)
		{
			setPageTitle(s);
		},
		getModel()
		{
			return getModel(this);
		},
		setModel(keys, new_value)
		{
			let model = getModel(this);
			setAttr(model, keys, new_value);
		},
		getState()
		{
			return this.$store.state;
		},
		attr(obj, keys, default_value = null)
		{
			return attr(obj, keys, default_value);
		},
	},
};


export class BaseObject
{
	
	/**
	 * Constructor
	 */
	constructor(params)
	{
		this.init(params);
	}
	
	
	
	/**
	 * Returns class
	 */
	getClass()
	{
		return this.constructor;
	}
	
	
	
	/**
	 * Init class
	 */
	init(params)
	{
		this.assignValues(params);
	}
	
	
	
	/**
	 * Assign values
	 */
	assignValues(params)
	{
		if (notNull(params))
		{
			for (var key in params)
			{
				if (params[key] !== undefined)
				{
					this.assignValue(key, params[key]);
				}
			}
		}
		return this;
	}
	
	
	
	/**
	 * Assign value
	 */
	assignValue(key, value)
	{
		this[key] = value;
	}
	
	
	
	/**
	 * Returns values
	 */
	getValues()
	{
		let res = {};
		for (var key in this)
		{
			if (this[key] !== undefined)
			{
				res[key] = this[key];
			}
		}
		return res;
	}
}


/**
 * Extend component
 */
export function componentExtend(child, parent)
{
	let parent2 = Object.assign({}, parent);
	
	function copy(parent, child, attr_name, parent2)
	{
		if (parent[attr_name] != undefined && parent[attr_name] instanceof Array)
		{
			if (child[attr_name] == undefined)
			{
				child[attr_name] = parent[attr_name].slice();
			}
			else if (child[attr_name] instanceof Array)
			{
				let arr = parent[attr_name].concat(child[attr_name]);
				arr = removeDuplicates(arr);
				child[attr_name] = arr;
			}
			
			parent2[attr_name] = child[attr_name].slice();
		}
		else if (parent[attr_name] != undefined && parent[attr_name] instanceof Object)
		{
			if (child[attr_name] == undefined)
			{
				child[attr_name] = Object.assign({}, parent[attr_name]);
			}
			else if (child[attr_name] instanceof Object)
			{
				let obj = Object.assign({}, parent[attr_name]);
				obj = Object.assign(obj, child[attr_name]);
				child[attr_name] = obj;
			}
			
			parent2[attr_name] = Object.assign({}, child[attr_name]);
		}
	}
	
	/* Copy props from parent to child */
	copy(parent, child, "methods", parent2);
	copy(parent, child, "computed", parent2);
	copy(parent, child, "components", parent2);
	copy(parent, child, "emits", parent2);
	copy(parent, child, "props", parent2);
	
	const events =
	[
		"beforeCreate",
		"created",
		"beforeMount",
		"mounted",
		"beforeUpdate",
		"updated",
		"activated",
		"deactivated",
		"beforeUnmount",
		"unmounted",
		"errorCaptured",
		"renderTracked",
		"renderTriggered",
		"beforeRouteEnter",
		"beforeRouteUpdate",
	];
	
	for (let i=0; i<events.length; i++)
	{
		let event_name = events[i];
		if (child[event_name] != undefined && parent2[event_name] != undefined)
		{
			delete parent2[event_name];
		}
		else if (child[event_name] == undefined && parent2[event_name] != undefined)
		{
			child[event_name] = parent[event_name];
		}
	}
	
	if (child.components == undefined) child.components = {};
	child.components[parent.name] = parent2;
}


/**
 * Set page title
 */
export function setPageTitle(s)
{
	storeInstance.state.title = s;
	document.title = s;
}


/**
 * Attr
 */
export function attr(obj, keys, default_value = null)
{
	if (obj == null || obj == undefined) return default_value;
	if (keys instanceof String || typeof keys == "string")
	{
		let s = String(keys);
		keys = new Array();
		keys.push(s);
	}

	let res = obj;
	for (let i=0; i<keys.length; i++)
	{
		let key = keys[i];
		if (res[key] == undefined) return default_value;
		res = res[key];
	}

	return res;
}


/**
 * Set attr
 */
export function setAttr(obj, keys, new_value)
{
	if (obj == null || obj == undefined) return;
	keys = keys.slice();
	let count_keys = keys.length;
	if (count_keys == 1) obj[keys[0]] = new_value;
	else if (count_keys > 1)
	{
		let first_key = keys.shift();
		if (obj[first_key] == undefined) obj[first_key] = {};
		setAttr(obj[first_key], keys, new_value);
	}
}


export function removeDuplicates(items)
{
	items = items.filter( (value, index) => items.indexOf(value) === index );
	return items;
}


export function findIndexByKey(obj, key, value)
{
	for (let i=0; i<obj.length; i++)
	{
		if (obj[i][key] == value)
		{
			return i;
		}
	}
	return -1;
}

export function findItemByKey(obj, key, value)
{
	let index = findIndexByKey(obj, key, value);
	if (index == -1) return null;
	return obj[index];
}

export function deepClone(obj)
{
	if (typeof(obj) != "object" || obj === null) return obj;
	let res = obj instanceof Array ? [] : {};
	for (let key in obj)
	{
		if (obj.hasOwnProperty(key))
		{
			res[key] = deepClone(obj[key]);
		}
	}
	return res;
}

export function objContains(obj1, obj2)
{
	if (typeof(obj1) != "object" || obj1 === null) return false;
	if (typeof(obj2) != "object" || obj2 === null) return false;
	for (let key in obj1)
	{
		if (obj1.hasOwnProperty(key))
		{
			if (!obj2.hasOwnProperty(key)) return false;
			if (obj1[key] != obj2[key]) return false;
		}
	}
	return true;
}

export function objEquals(obj1, obj2)
{
	return objContains(obj1, obj2) && objContains(obj2, obj1);
}


/**
 * Add get parameter to url
 */
export function urlGetAdd(s, key, value)
{
	key = encodeURI(key);
	value = (value != undefined) ? encodeURI(value) : value;
	var arr = s.split("?");
	var s0 = arr[0] || "";
	var s1 = arr[1] || "";
	var arr2 = s1.split('&');
	var i = arr2.length - 1;
	while (i >= 0)
	{
		var x = arr2[i].split('=');
		if (x.length == 2 && x[0] == key)
		{
			if ((value || false) == false)
			{
				arr2[i] = "";
			}
			else
			{
				x[1] = value;
				arr2[i] = x.join('=');
			}
			break;
		}
		i--;
	}
	if (i < 0 && (value || false) != false) { arr2.push( [key, value].join('=') ); }
	arr2 = arr2.filter(function (s){ return s != ""; });
	var s2 = arr2.join('&');
	if (s2 == "") return s0;
	return s0 + "?" + s2;
}



/**
 * Call api
 */
export async function callApi(url, post_data)
{
	let response = await axios.post(url, post_data);
	if (response.data.ob_content)
	{
		console.log(response.data.ob_content);
	}
	return response;
}