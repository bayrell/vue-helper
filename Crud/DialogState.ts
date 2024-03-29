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

import { AxiosResponse } from "axios";
import { BaseObject, deepClone } from "vue-helper";
import { CrudState } from "./CrudState";

export class DialogButtonClickEvent
{
    action: string = "";
}

export class DialogButton extends BaseObject
{
    action: string = "";
    label: string = "";
    type: string = "";
	
	
	/**
	 * Assign value
	 */
	assignValue(key:string, value:any)
	{
		if (key == "action") return String(value);
		else if (key == "label") return String(value);
		else if (key == "type") return String(value);
		else return super.assignValue(key, value);
	}
	
}

export class DialogState<CrudItem> extends BaseObject
{
	open: boolean;
	title: string;
	buttons: Array<DialogButton>;
	error_code: number;
	message: string;
	attrs: Record<string, any>;
	tag: any;
	item: CrudItem;
	item_class_name: any = null;
	
	
	/**
	 * Init
	 */
	init(params:any)
	{
		/* Init variables */
		this.open = false;
		this.title = "";
		this.buttons = [];
		this.error_code = 0;
		this.message = "";
		this.attrs = {};
		this.tag = null;
		
		/* Create item */
		if (this.item_class_name != null)
		{
			this.item = new this.item_class_name();
		}
		else
		{
			this.item = {} as any;
		}
		
		/* Init class */
		super.init(params);
	}
	
	
	
	/**
	 * Assign value
	 */
	assignValue(key:string, value:any)
	{
		if (key == "open") this.open = Boolean(value);
		else if (key == "title") this.title = String(value);
		else super.assignValue(key, value);
	}
	
	
	
    /**
	 * Show dialog
	 */
	show()
	{
		this.open = true;
	}
    
	
    
    /**
	 * Hide dialog
	 */
	hide()
	{
		this.open = false;
	}
    
	
	
	/**
	 * Set item
	 */
	setItem(item: any)
	{
		if (item == null)
		{
			if (this.item_class_name != null)
			{
				this.item = new this.item_class_name();
			}
			else
			{
				this.item = {} as any;
			}
		}
		else
		{
			this.item = deepClone(item);
		}
	}
	
	
	
	/**
	 * Clear
	 */
	clear()
	{
		this.error_code = 0;
		this.message = "";
		if (this.item_class_name != null)
		{
			this.item = new this.item_class_name();
		}
		else
		{
			this.item = {} as any;
		}
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
	 * Set response
	 */
	setAxiosResponse(response: AxiosResponse | null)
	{
		if (response)
		{
			let data: any = response.data;
			if (typeof(data["error"]) == "object")
			{
				this.error_code = data["error"]["code"];
				this.message = data["error"]["str"];
			}
			else
			{
				this.error_code = -1;
				this.message = "System error";
			}
		}
		else
		{
			this.error_code = -1;
			this.message = "System error. Response is null";
		}
	}
	
}