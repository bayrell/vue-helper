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
export const getModel = (instance: any) =>
{
	let arr = instance.store_path.slice();
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
export function getMutations (proto: any): Record<string, any>
{
	let res: Record<string, any> = {};
	let items:Array<string> = proto.mutations();
	for (let i = 0; i < items.length; i++)
	{
		let method_name = items[i];
		res[method_name] = proto[method_name];
	}
	return res;
}



/**
 * Build store from class state prototype
 */
export function buildStoreConfig (proto: any): Record<string, any>
{
	/* Create store */
	let res: Record<string, any> =
	{
		namespaced: true,
		state: {},
		modules: {}
	};

	/* Build modules */
	let modules:Record<string, any> = proto.modules();
	let modules_keys:Array<string> = Object.keys(modules);
	for (let i=0; i<modules_keys.length; i++)
	{
		let module_name:string = modules_keys[i];
		let module:any = modules[module_name];
		res["modules"][modules_keys[i]] = buildStoreConfig(module);
	}

	/* Get mutations  */
	res["mutations"] = getMutations(proto);
	
	/* Returns store */
	return res;
}



/**
 * Build store
 */
export function buildStore(proto: any)
{
	let config:Record<string, any> = buildStoreConfig(proto);
	let obj = new proto();
	let keys = Object.keys(obj);
	let store: Record<string, any> = createStore( config )
	
	/* Init store */
	for (let i=0; i<keys.length; i++)
	{
		let key: string = keys[i];
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
		getModel()
		{
			return getModel(this);
		},
		$commit (action: string, params: any)
		{
			let obj: any = this;
			var arr = obj.store_path.concat( action.split("/") );
			obj.$store.commit(arr.join("/"), params);
		},
	}
};
