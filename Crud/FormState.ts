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

import { attr, BaseObject, deepClone, setAttr } from "vue-helper";
import { CrudState, FieldInfo } from "./CrudState";
import { AxiosResponse } from "axios";


export class FormState<CrudItem> extends BaseObject
{
	action: string = "";
	title: string = "";
	fields: Array<FieldInfo> = [];
	item: CrudItem | null = null;
	item_original: CrudItem | null = null;
	item_class_name: any = null;
	error_code: number = 0;
	message: string = "";
	load_error: boolean = false;
	tag: any;
	
	
	/**
	 * Is add
	 */
	isAdd()
	{
		return this.item_original == null;
	}
	
	
	
	/**
	 * Is edit
	 */
	isEdit()
	{
		return this.item_original != null;
	}
	
	
	
	/**
	 * Assign value
	 */
	assignValue(key:string, value:any)
	{
		super.assignValue(key, value);
	}
	
	
	
	/**
	 * Returns form value
	 */
	getItemValue(name: string): any
	{
		if (this.item)
		{
			let arr: Array<string> = name.split(".");
			return attr(this.item, arr, "");
		}
		return "";
	}
	
	
	
	/**
	 * Set form value
	 */
	setItemValue(api_name: string, value: string)
	{
		let arr: Array<string> = api_name.split(".");
		setAttr(this.item, arr, value);
	}
	
	
	
	/**
	 * Set item
	 */
	setItem(item: any)
	{
		if (item == null)
		{
			if (this.item_class_name)
			{
				this.item = new this.item_class_name();
			}
			else
			{
				this.item = {} as any;
			}
			this.item_original = null;
		}
		else
		{
			this.item = deepClone(item);
			this.item_original = deepClone(item);
		}
	}
	
	
	
	/**
	 * Clear
	 */
	clear()
	{
		this.action = "";
		this.title = "";
		this.error_code = 0;
		this.message = "";
		this.load_error = false;
		if (this.item_class_name != null)
		{
			this.item = new this.item_class_name();
		}
		else
		{
			this.item = {} as any;
		}
		this.item_original = null;
		this.tag = null;
	}
	
	
	
	/**
	 * Set wait response
	 */
	setWaitResponse()
	{
		this.error_code = 0;
		this.message = "Please wait";
	}
	
	
	
	/**
	 * Set load response
	 */
	setLoadResponse(response: AxiosResponse | null)
	{
		this.clear();
		
		if (response && typeof(response.data) == "object" && response.data.error.code == 1)
		{
			let item = response.data.result.item;
			this.setItem(item);
		}
		else
		{
			this.load_error = true;
			this.setAxiosResponse(response);
		}
	}
	
	
	
	/**
	 * Set response
	 */
	setAxiosResponse(response: AxiosResponse | null)
	{
		if (response)
		{
			let data: any = response.data;
			if (typeof(data) == "object" && typeof(data["error"]) == "object")
			{
				this.error_code = data["error"]["code"];
				this.message = data["error"]["str"];
			}
			else
			{
				this.error_code = -1;
				this.message = "System error (" +
					response.status + " " + response.statusText +
				")";
			}
		}
		else
		{
			this.error_code = -1;
			this.message = "System error. Response is null";
		}
	}
}