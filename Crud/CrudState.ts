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

import axios, { AxiosResponse, AxiosError } from "axios";
import { DefineComponent } from "vue";
import { attr, BaseObject, deepClone, objContains, objEquals } from "vue-helper";
import { DialogState } from "./DialogState";
import { FormState } from "./FormState";


export let CRUD_EVENTS =
{
	ROW_CLICK: "row_click",
	ROW_BUTTON_CLICK: "row_button_click",
	ITEM_CHANGE: "item_change",
};


export class CrudEvent
{
	event_name: string = "";
	item_name: string = "";
	value: any = null;
	tag: any = null;
	index: number = 0;
	crud_item: CrudItem | null = null;
	button_name: string = "";
	attrs: Record<string, any> = {};
	$event: any = null;
}


export class SelectOption extends BaseObject
{
	id: string;
	value: string;
	
	
	/**
	 * Init
	 */
	init(params:any)
	{
		/* Init variables */
		this.id = "";
		this.value = "";
		
		/* Init class */
		super.init(params);
	}
	
	
	/**
	 * Assign value
	 */
	assignValue(key:string, value:any)
	{
		if (key == "id") this.id = String(value);
		else if (key == "value") this.value = String(value);
		else super.assignValue(key, value);
	}
	
}


export class FieldInfo extends BaseObject
{
	api_name: string;
	label: string;
	component: any;
	
	/* Flags */
	primary: boolean;
	required: boolean;
	readonly: boolean;
	virtual: boolean;
	can_create: boolean;
	can_update: boolean;
	group: string;
	default_value: any;
	
	/* Select options */
	options: Array<SelectOption>;
	
	/* Component params */
    component_params: Record<string, any>;
	
	
	
	/**
	 * Init
	 */
	init(params:any)
	{
		/* Init variables */
		this.api_name = "";
		this.label = "";
		this.component = null;
		
		/* Flags */
		this.primary = false;
		this.required = false;
		this.readonly = false;
		this.virtual = false;
		this.can_create = true;
		this.can_update = true;
		this.group = "default";
		this.default_value = null;
		
		/* Select options */
		this.options = [];
		
		/* Component params */
		this.component_params = {};
		
		/* Init class */
		super.init(params);
	}
	
	
	
	/**
	 * Assign value
	 */
	assignValue(key:string, value:any)
	{
		if (key == "api_name") this.api_name = String(value);
		else if (key == "label") this.label = String(value);
		else if (key == "component") this.component = String(value);
		else super.assignValue(key, value);
	}
	
}


export class CrudButton extends BaseObject
{
	action: string;
	label: string;
	type: string;
	route: string;
	
	
	/**
	 * Init
	 */
	init(params:any)
	{
		/* Init variables */
		this.action = "";
		this.label = "";
		this.type = "";
		this.route = "";
		
		/* Init class */
		super.init(params);
	}
	
	
	/**
	 * Convert value
	 */
	assignValue(key:string, value:any)
	{
		if (key == "action") this.action = String(value);
		else if (key == "label") this.label = String(value);
		else if (key == "type") this.type = String(value);
		else super.assignValue(key, value);
	}
}



export class CrudItem extends BaseObject
{
	
}


export class CrudState extends BaseObject
{
	page_action: string;
	fields: Array<FieldInfo>;
	fields_table: Array<FieldInfo>;
	items: Array<CrudItem>;
	form_save: FormState;
	dialog_delete: DialogState;
	dialog_form: DialogState;
	active_item: CrudItem | null;
	active_item_pk: Record<string, any> | null;
	
	
	
	/**
	 * Init
	 */
	init(params:any)
	{
		/* Init variables */
		this.page_action = "";
		this.fields = [];
		this.fields_table = [];
		this.items = new Array<CrudItem>();
		this.form_save = new FormState();
		this.dialog_delete = new DialogState();
		this.dialog_form = new DialogState();
		this.active_item = null;
		this.active_item_pk = null;
		
		/* Init class */
		super.init(params);
		
		/* Crud init */
		this.crudInit();
	}
	
	
	
	/**
	 * Returns if item is action
	 */
	isRowActive(item: CrudItem | null)
	{
		if (item == null) return false;
		if (this.active_item_pk == null) return false;
		
		if (objContains(this.active_item_pk, item)) return true;
		
		return false;
	}
	
	
	
	/**
	 * Returns if item is action
	 */
	setActiveItem(item: CrudItem | null)
	{
		this.active_item = (item) ? deepClone(item) : null;
		this.active_item_pk = (item) ? this.getPrimaryKeyFromItem(item) : null;
	}
	
	
	
	/**
	 * Returns api object name
	 */
	static getApiObjectName()
	{
		return "";
	}
	
	
	
	/**
	 * Return api search url
	 */
	static getApiUrlSearch()
	{
		return "/api/" + this.getApiObjectName() + "/crud/search/";
	}
	
	
	
	/**
	 * Return api search url
	 */
	static getApiUrlItem(id: string)
	{
		return "/api/" + this.getApiObjectName() + "/crud/item/" + encodeURIComponent(id) + "/";
	}
	
	
	
	/**
	 * Return api create url
	 */
	static getApiUrlCreate()
	{
		return "/api/" + this.getApiObjectName() + "/crud/create/";
	}
	
	
	
	/**
	 * Return api update url
	 */
	static getApiUrlUpdate(item: CrudItem)
	{
		return "/api/" + this.getApiObjectName() + "/crud/edit/" +
			encodeURIComponent(this.getItemId(item)) + "/";
	}
	
	
	
	/**
	 * Return api delete url
	 */
	static getApiUrlDelete(item: CrudItem)
	{
		return "/api/" + this.getApiObjectName() + "/crud/delete/" +
			encodeURIComponent(this.getItemId(item)) + "/";
	}
	
	
	
	/**
	 * Returns route names
	 */
	static getRouteNames(): Record<string, string>
	{
		return {};
	}
	
	
	
	/**
	 * Return route name
	 */
	static getRouteName(name: string): string
	{
		let names = this.getRouteNames();
		if (names && names[name] != undefined) return names[name];
		return "";
	}
	
	
	
	/**
	 * Returns new item
	 */
	static createNewItem(): CrudItem
	{
		return new CrudItem();
	}
	
	
	
	/**
	 * Returns new item instance
	 */
	static createNewItemInstance(data:any = null): CrudItem
	{
		let item = this.createNewItem();
		if (data != undefined && data != null) item.assignValues(data);
		return item;
	}
	
	
	 
	/**
	 * Get primary key
	 */
	getPrimaryKeyFields(): Array<string>
	{
		let pk_fields:Array<string> = this.fields
			.filter( (info:FieldInfo) => info.primary )
			.map( (info:FieldInfo) => info.api_name )
		;
		return pk_fields;
	}
	
	
	
	/**
	 * Get primary key
	 */
	getPrimaryKeyFromItem(item:any): Record<string, any>
	{
		let pk: Record<string, any> = {};
		let pk_fields:Array<string> = this.getPrimaryKeyFields();
		
		for (let i:number = 0; i<pk_fields.length; i++)
		{
			let field_name = pk_fields[i];
			let value = (item != null && (item as any)[field_name] != undefined) ?
				(item as any)[field_name] : null;
			pk[field_name] = deepClone(value);
		}
		
		return pk;
	}
	
	
	
	/**
	 * Find item
	 */
	findItemByPrimaryKey(item: any): number
	{
		let pk: Record<string, any> = this.getPrimaryKeyFromItem(item);
		let index = this.items.findIndex
		(
			(find_item: CrudItem) =>
			{
				for (let key in pk)
				{
					let item1 = (item as any)[key];
					let item2 = (find_item as any)[key];
					if (item1 != undefined && item2 != undefined && item1 == item2)
					{
						return true;
					}
				}
				return false;
			}
		);
		return index;
	}
	
	
	
	/**
	 * Crud init
	 */
	crudInit()
	{
		
	}
	
	
	
	/**
	 * Returns form value
	 */
	static getItemName(item: CrudItem | null): string
	{
		return "";
	}
	
	
	
	/**
	 * Returns item id
	 */
	static getItemId(item: CrudItem | null): string
	{
		return "";
	}
	
	
	
	/**
	 * Returns crud message
	 */
	static getMessage(message_type: string, item: CrudItem | null): string
	{
		if (message_type == "list_title")
		{
			return "Items";
		}
		else if (message_type == "form_title")
		{
			if (item)
			{
				return this.getMessage("edit_title", item);
			}
			return this.getMessage("add_title", item);
		}
		else if (message_type == "add_title")
		{
			return "Add item";
		}
		else if (message_type == "edit_title")
		{
			return "Edit item";
		}
		else if (message_type == "delete_title")
		{
			return "Delete item";
		}
		else if (message_type == "delete_text")
		{
			return "Do you sure to delete \"" + this.getItemName(item) + "\" ?";
		}
		else if (message_type == "top_button_show_add_title")
		{
			return "Add";
		}
		return "";
	}
	
	
	
	/**
	 * Returns form value
	 */
	getItemValue(index: number, api_name: string): any
	{
		if (this.items[index] == undefined) return "";
		let item: any = this.items[index];
		let arr: Array<string> = api_name.split(".");
		return attr(item, arr, "");
	}
	
	
	
	/**
	 * Add new item
	 */
	addItem(data: any)
	{
		let item:CrudItem = (this.constructor as any).createNewItemInstance(data);
		this.items.unshift(item);
		this.sortItems();
	}
	
	
	
	/**
	 * Add items
	 */
	addItems(items: Array<any>)
	{
		for (let i = 0; i < items.length; i++)
		{
			let item = (this.constructor as any).createNewItemInstance(items[i]);
			this.items.push(item);
		}
		this.sortItems();
	}
	
	
	 
	/**
	 * Update item
	 */
	updateItem(old_item: CrudItem, new_item: any)
	{
		let index = this.findItemByPrimaryKey(old_item);
		if (index != -1)
		{
			new_item = (this.constructor as any).createNewItemInstance(new_item);
			this.items[index] = new_item;
		}
	}
	
	
	
	/**
	 * Delete item
	 */
	deleteItem(old_item: CrudItem)
	{
		let index = this.findItemByPrimaryKey(old_item);
		if (index != -1)
		{
			this.items.splice(index, 1);
		}
	}
	
	
	
	/**
	 * Sort items
	 */
	sortItems()
	{
		
	}
	
	
	/**
	 * Edit field
	 */
	editField(kind: Array<string>, field_name: string, f:any = null)
	{
		let fields: Array<FieldInfo> | null = null;
		let arr: Array<string> = ["fields_table", "form_save", "fields"];
		
		for (let j=0; j<arr.length; j++)
		{
			let arr_name: string = arr[j];
			if (kind.indexOf(arr_name) != -1 || kind.indexOf("all") != -1)
			{
				fields = null;
				if (arr_name == "fields_table")
				{
					fields = this.fields_table;
				}
				else if (arr_name == "form_save")
				{
					fields = this.form_save.fields;
				}
				else if (arr_name == "fields")
				{
					fields = this.fields;
				}
				if (fields)
				{
					for (let i=0; i<fields.length; i++)
					{
						let field: FieldInfo = fields[i];
						if (field.api_name == field_name)
						{
							f(field);
						}
					}
				}
			}
		}

	}
	
	
	/**
	 * Set form save item
	 */
	setFormSaveItem(item:CrudState)
	{
		if (item != null)
		{
			this.form_save.item = deepClone(item);
			this.form_save.item_original = deepClone(item);
		}
		else
		{
			this.form_save.item = new CrudItem();
			this.form_save.item_original = null;
		}
	}
	
	
	
	/**
	 * Show form
	 */
	showForm(item:CrudState)
	{
		this.form_save.clear();
		this.form_save.setItem(item);
		this.dialog_form.clear();
		this.dialog_form.show();
	}
	
	
	
	/**
	 * Show delete
	 */
	showDelete(item:CrudState)
	{
		if (item != null)
		{
			this.dialog_delete.clear();
			this.dialog_delete.setItem(item);
			this.dialog_delete.show();
		}
	}
	
	
	
	/**
	 * Set current crud action
	 */
	setPageAction(page_action: string)
	{
		if (page_action == "add" ||
			page_action == "create" ||
			page_action == "edit" ||
			page_action == "delete" ||
			page_action == "list"
		)
		{
			if (page_action == "create") this.page_action = "add";
			else this.page_action = page_action;
		}
		else
		{
			this.page_action = "list";
		}
	}
	
	
	
	/**
	 * Page data
	 */
	async pageLoadData(route: any)
	{
		this.setPageAction(route.props.page_action);
		
		if (this.page_action == "list")
		{
			await this.listPageLoadData(route);
		}
		
		else if (this.page_action == "add")
		{
			await this.addPageLoadData(route);
		}
		
		else if (this.page_action == "edit")
		{
			await this.editPageLoadData(route);
		}
		
		else if (this.page_action == "delete")
		{
			await this.deletePageLoadData(route);
		}
	}
	
	
	
	/**
	 * Before api
	 */
	async beforeApi(kind: string): Promise<boolean>
	{
		return true;
	}
	
	
	
	/**
	 * After api
	 */
	async afterApi(kind: string, response:AxiosResponse | null)
	{
		
	}
	
	
	
	/**
	 * Search data
	 */
	getSearchData(route: any)
	{
		return {
			"filter": [],
			"start": 0,
			"limit": 50,
		};
	}
	
	
	
	/**
	 * List Page Load data
	 */
	async listPageLoadData(route: any)
	{
		let res:boolean = await this.beforeApi("listPageLoadData");
		if (!res) return;
		
		/* Set page title */
		let page_title = (this.constructor as any).getMessage("list_title", null);
		route.setPageTitle(page_title);
		
		/* Ajax request */
		let response:AxiosResponse | null = await (this.constructor as any)
			.apiLoadData( this.getSearchData(route) );
		
		/* Set result */
		this.items = new Array();
		if (response && typeof(response.data) == "object" && response.data.error.code == 1)
		{
			this.addItems(response.data.result.items);
		}
		
		await this.afterApi("listPageLoadData", response);
	}
	
	
	
	/**
	 * Add Page Load data
	 */
	async addPageLoadData(route: any)
	{
		/* Set page title */
		let page_title = (this.constructor as any).getMessage("add_title", null);
		route.setPageTitle(page_title);
		
		this.form_save.clear();
	}
	
	
	
	/**
	 * Edit Page Load data
	 */
	async editPageLoadData(route: any)
	{
		let res:boolean = await this.beforeApi("editPageLoadData");
		if (!res) return;
		
		/* Set page title */
		let page_title = (this.constructor as any).getMessage("edit_title", null);
		route.setPageTitle(page_title);
		
		/* Ajax request */
		let response:AxiosResponse | null = await (this.constructor as any)
			.apiLoadItem(route.to.params.id);
		
		this.form_save.setLoadResponse(response);
		
		await this.afterApi("editPageLoadData", response);
	}
	
	
	
	/**
	 * Delete Page Load data
	 */
	async deletePageLoadData(route: any)
	{
		/* Set page title */
		let page_title = (this.constructor as any).getMessage("delete_title", null);
		route.setPageTitle(page_title);
	}
	
	
	
	/**
	 * Save form
	 */
	async doSaveForm(component: DefineComponent)
	{
		let model:CrudState = this;
		let item:CrudItem = model.form_save.item as CrudItem;
		let item_original:CrudItem = model.form_save.item_original as CrudItem;
		
		let res:boolean = await this.beforeApi( "onSaveForm");
		if (!res) return;
		
		model.form_save.setWaitResponse();
		let response:AxiosResponse | null = await (this.constructor as any)
			.apiSaveForm(item, item_original);
		model.form_save.setAxiosResponse(response);
		
		if (item_original == null)
		{
			if (response && model.form_save.error_code == 1)
			{
				model.form_save.setItem(response.data.result.new_data);
				model.addItem(response.data.result.new_data);
				model.dialog_form.hide();
			}
		}
		
		else
		{
			if (response && typeof(response.data) == "object" && response.data.error.code == 1)
			{
				model.form_save.setItem(response.data.result.new_data);
				model.updateItem(item_original, response.data.result.new_data);
				model.dialog_form.hide();
			}
		}
		
		await this.afterApi("onSaveForm", response);
	}
	
	
	
	/**
	 * Delete form
	 */
	async doDeleteForm(component: DefineComponent)
	{
		let model:CrudState = this;
		let item:CrudItem = model.dialog_delete.item as CrudItem;
		
		let res:boolean = await this.beforeApi("onDeleteForm");
		if (!res) return;
		
		model.dialog_delete.setWaitResponse();
		let response:AxiosResponse | null = await (this.constructor as any).apiDeleteForm(item);
		model.dialog_delete.setAxiosResponse(response);
		
		if (item && response && typeof(response.data) == "object" && response.data.error.code == 1)
		{
			model.deleteItem(item);
			model.dialog_delete.hide();
		}
		
		await this.afterApi("onDeleteForm", response);
	}
	
	
	
	/**
	 * Load data api
	 */
	static async apiLoadData(data: any): Promise<AxiosResponse | null>
	{
		let url = this.getApiUrlSearch();
		let response:AxiosResponse | null = null;
		
		try
		{
			response = await axios.post
			(
				url,
				data
			);
		}
		catch (e)
		{
			if (axios.isAxiosError(e))
			{
				response = e["response"] as AxiosResponse;
			}
		}
		
		return response;
	}
	
	
	
	/**
	 * Load data api
	 */
	static async apiLoadItem(id: string): Promise<AxiosResponse | null>
	{
		let response:AxiosResponse | null = null;
		
		let url = this.getApiUrlItem(id);
		
		try
		{
			response = await axios.get(url);
		}
		catch (e)
		{
			if (axios.isAxiosError(e))
			{
				response = e["response"] as AxiosResponse;
			}
		}
		
		return response;
	}
	
	
	
	/**
	 * Save form api
	 */
	static async apiSaveForm(item:CrudItem, item_original:CrudItem): Promise<AxiosResponse | null>
	{
		let response:AxiosResponse | null = null;
		
		if (item_original == null)
		{
			let url = this.getApiUrlCreate();
			
			try
			{
				response = await axios.post
				(
					url,
					{ "item": item }
				);
			}
			catch (e)
			{
				if (axios.isAxiosError(e))
				{
					response = e["response"] as AxiosResponse;
				}
			}
		}
		
		else
		{
			let url = this.getApiUrlUpdate(item_original);
			
			try
			{
				response = await axios.post
				(
					url,
					{ "item": item }
				);
			}
			catch (e)
			{
				if (axios.isAxiosError(e))
				{
					response = e["response"] as AxiosResponse;
				}
			}
		}
		
		return response;
	}
	
	
	
	/**
	 * Delete form api
	 */
	static async apiDeleteForm(item:CrudItem): Promise<AxiosResponse | null>
	{
		let response:AxiosResponse | null = null;
		
		if (item)
		{
			let url = this.getApiUrlDelete(item);
			
			try
			{
				response = await axios.delete(url);
			}
			catch (e)
			{
				if (axios.isAxiosError(e))
				{
					response = e["response"] as AxiosResponse;
				}
			}
		}
		
		return response;
	}
	
	
}
