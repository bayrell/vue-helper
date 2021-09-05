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


/**
 * Returns VueJS model
 */
export const getModel = (instance) =>
{
	let arr = instance.store_path ? instance.store_path.slice() : [];
	let obj = instance.$store.state;
	
	while (arr.length != 0)
	{
		let key = arr.shift();
		if (obj[key] == undefined)
		{
			obj = null;
			break;
		}
		obj = obj[key];
	}
	
	return obj;
};



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
 * VueJS Mixin
 */
export const mixin =
{
	props:
	{
		store_path: Array
	},
	computed:
	{
		model()
		{
			return getModel(this);
		}
	},
	methods:
	{
		setPageTitle(s)
		{
			storeInstance.state.title = s;
			document.title = s;
		},
		getModel()
		{
			return getModel(this);
		},
		$commit (action, params)
		{
			let obj = this;
			var arr = obj.store_path.concat( action.split("/") );
			obj.$store.commit(arr.join("/"), params);
		},
		attr(obj, keys, default_value = null)
		{
			if (obj == null) return default_value;
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
	}
};


export class BaseObject
{
	
	/**
	 * Assign values
	 */
	assignValues(params)
	{
		return this;
	}
	
	
	/**
	 * Returns values
	 */
	getValues()
	{
		return {};
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