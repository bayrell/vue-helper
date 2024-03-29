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
import { attr, BaseObject, callApi, deepClone,
	notNull, objContains, objEquals, responseOk, setPageTitle } from "vue-helper";
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
	crud_item: any = null;
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
	/* Input name */
	name: string;
	
	/* Input value */
	value: any;
	
	/* Input type */
	type: string;	
	
	/* Input label */
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
		this.name = "";
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
		if (key == "name") this.name = String(value);
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



export class CrudState<CrudItem> extends BaseObject
{
	page_action: string;
	fields: Array<FieldInfo>;
	fields_table: Array<FieldInfo>;
	items: Array<CrudItem>;
	form_save: FormState<CrudItem>;
	dialog_delete: DialogState<CrudItem>;
	dialog_form: DialogState<CrudItem>;
	active_item: CrudItem | null;
	active_item_pk: Record<string, any> | null;
	dictionary: any;
	page: Number;
	pages: Number;
	limit: Number;
	start: Number;
	
	
	/**
	 * Returns class
	 */
	getClass(): typeof CrudState
	{
		return this.constructor as typeof CrudState;
	}
	
	
	
	/**
	 * Returns class item
	 */
	static getClassItem(): any
	{
		return "";
	}
	
	
	
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
		this.dictionary = null;
		this.start = 0;
		this.limit = 1;
		this.page = 0;
		this.pages = 1;
		
		/* Setup class items */
		this.form_save.item_class_name = this.getClass().getClassItem();
		this.dialog_delete.item_class_name = this.getClass().getClassItem();
		this.dialog_form.item_class_name = this.getClass().getClassItem();
		
		/* Init class */
		super.init(params);
		
		/* Crud init */
		this.initCrud();
	}
	
	
	
	/**
	 * Returns True if is create
	 */
	isCreate()
	{
		return this.page_action == "add" || this.page_action == "create";
	}
	
	
	
	/**
	 * Returns True if is update
	 */
	isUpdate()
	{
		return this.page_action == "edit" || this.page_action == "update";
	}
	
	
	
	/**
	 * Returns True if is list
	 */
	isList()
	{
		return this.page_action == "list";
	}
	
	
	
	/**
	 * Returns True if is delete
	 */
	isDelete()
	{
		return this.page_action == "delete";
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
	static getApiUrl(api_type: string, params: Record<string, any> | null = null)
	{
		let api_name = this.getApiObjectName();
		if (api_type == "search")
		{
			return "/api/" + api_name + "/crud/search/";
		}
		else if (api_type == "item")
		{
			return "/api/" + api_name + "/crud/item/";
		}
		else if (api_type == "create")
		{
			return "/api/" + api_name + "/crud/create/";
		}
		else if (api_type == "update")
		{
			return "/api/" + api_name + "/crud/update/";
		}
		else if (api_type == "delete")
		{
			return "/api/" + api_name + "/crud/delete/";
		}
		return "";
	}
	
	
	
	/**
	 * Returns route names
	 */
	static getRouteNames(): Record<string, string>
	{
		return {
			"list": "app:spaces:list",
			"add": "",
			"edit": "",
		};
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
	static createNewItem()
	{
		let f = this.getClassItem();
		return new f();
	}
	
	
	
	/**
	 * Returns new item instance
	 */
	static createNewItemInstance(data:any = null)
	{
		let item = this.createNewItem();
		if (data != undefined && data != null) item.assignValues(data);
		return item;
	}
	
	
	
	/**
	 * Get primary key
	 */
	getFieldByName(name: string): FieldInfo | null
	{
		return this.fields.find(
			(field: FieldInfo) => field.name == name
		) || null;
	}
	
	
	
	/**
	 * Get primary key
	 */
	getPrimaryKeyFields(): Array<string>
	{
		let pk_fields:Array<string> = this.fields
			.filter( (info:FieldInfo) => info.primary )
			.map( (info:FieldInfo) => info.name )
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
	 * Get primary key from route
	 */
	getPrimaryKeyFromRoute(route: any)
	{
		return {
			"pk": {
				"id": route.to.params.id
			},
		};
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
				let c1 = 0;
				let c2 = 0;
				for (let key in pk)
				{
					let item1 = (item as any)[key];
					let item2 = (find_item as any)[key];
					if (item1 != undefined && item2 != undefined && item1 == item2)
					{
						c2++;
					}
					c1++;
				}
				return c1 == c2 && c1 > 0 && c2 > 0;
			}
		);
		return index;
	}
	
	
	
	/**
	 * Crud init
	 */
	initCrud()
	{
		
	}
	
	
	
	/**
	 * Returns form value
	 */
	getItemName(item: any): string
	{
		return "";
	}
	
	
	
	/**
	 * Returns item id for route
	 */
	getItemId(item: any): string
	{
		return item ? String(item.id) : "0";
	}
	
	
	
	/**
	 * Returns crud message
	 */
	getMessage(message_type: string, item: any): string
	{
		if (message_type == "list_title")
		{
			return "Items";
		}
		else if (message_type == "item")
		{
			return "item";
		}
		else if (message_type == "form_title")
		{
			if (item)
			{
				return this.getMessage("edit_title", item);
			}
			return this.getMessage("add_title", item);
		}
		else if (message_type == "save_title")
		{
			return (item == null) ?
				this.getMessage("add_title", item) :
				this.getMessage("edit_title", item)
			;
		}
		else if (message_type == "add_title")
		{
			return "Add " + this.getMessage("item", item);
		}
		else if (message_type == "edit_title")
		{
			return "Edit " + this.getMessage("item", item) +
				(item ? (" \"" + this.getItemName(item) + "\"") : "");
		}
		else if (message_type == "delete_title")
		{
			return "Delete " + this.getMessage("item", item);
		}
		else if (message_type == "delete_text")
		{
			return "Do you sure delete " + this.getMessage("item", item)
				+ " \"" + this.getItemName(item) + "\" ?"
			;
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
	getItemValue(index: number, name: string): any
	{
		if (this.items[index] == undefined) return "";
		let item: any = this.items[index];
		let arr: Array<string> = name.split(".");
		return attr(item, arr, "");
	}
	
	
	
	/**
	 * Add new item
	 */
	addItem(data: any)
	{
		let item:CrudItem = this.getClass().createNewItemInstance(data);
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
			let item = this.getClass().createNewItemInstance(items[i]);
			this.items.push(item);
		}
		this.sortItems();
	}
	
	
	
	/**
	 * Set items
	 */
	setItems(items: Array<any>)
	{
		this.items = new Array();
		this.addItems(items);
	}
	
	
	
	/**
	 * Update item
	 */
	updateItem(old_item: CrudItem, new_item: any)
	{
		let index = this.findItemByPrimaryKey(old_item);
		if (index != -1)
		{
			new_item = this.getClass().createNewItemInstance(new_item);
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
	editField(kind: Array<string>, field_name: string, callback:any = null)
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
						if (field.name == field_name)
						{
							callback(field);
						}
					}
				}
			}
		}

	}
	
	
	
	/**
	 * Read dictionary
	 */
	setOptionsFromDictionary
	(
		response:AxiosResponse | null,
		kind: Array<string>,
		field_name: string,
		dictionary_name:string,
		callback:any = null
	)
	{
		if (response && responseOk(response) &&
			notNull(response.data) &&
			notNull(response.data.result) &&
			notNull(response.data.result.dictionary) &&
			notNull(response.data.result.dictionary[dictionary_name]) &&
			response.data.result.dictionary[dictionary_name] instanceof Array
		)
		{
			let options: Array<SelectOption> = response.data.
				result.dictionary[dictionary_name]
				.map(callback)
			;
			this.editField
			(
				kind,
				field_name,
				(field: FieldInfo) =>
				{
					field.options = deepClone(options);
				}
			);
		}
	}
	
	
	
	/**
	 * Set form save item
	 */
	setFormSaveItem(item:CrudItem)
	{
		this.form_save.setItem(item);
	}
	
	
	
	/**
	 * Show form
	 */
	showFormDialog(item:CrudItem)
	{
		this.form_save.clear();
		this.form_save.setItem(item);
		this.dialog_form.clear();
		this.dialog_form.show();
	}
	
	
	
	/**
	 * Show delete
	 */
	showDeleteDialog(item:CrudState<CrudItem>)
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
		if (page_action == undefined) page_action = "list";
		if (page_action == "add") this.page_action = "create";
		else if (page_action == "edit") this.page_action = "update";
		else this.page_action = page_action;
	}
	
	
	
	/**
	 * Page data
	 */
	async onRouteUpdate(route: any)
	{
		this.setPageAction(route.props.page_action);
		
		if (this.page_action == "list")
		{
			await this.onLoadPageList(route);
		}
		else if (this.page_action == "add" || this.page_action == "create")
		{
			await this.onLoadPageSave(route);
		}
		else if (this.page_action == "edit" || this.page_action == "update")
		{
			await this.onLoadPageSave(route);
		}
		else if (this.page_action == "delete")
		{
			await this.onLoadPageDelete(route);
		}
	}
	
	
	
	/**
	 * Before api
	 */
	async before(kind: string, params: Record<string, any>): Promise<boolean>
	{
		return true;
	}
	
	
	
	/**
	 * After page title
	 */
	afterPageTitle(kind: string, params: Record<string, any>)
	{
		if (kind == "onLoadPageSave" || kind == "processSaveForm")
		{
			let item = this.form_save.item_original;
			let page_title = this.getMessage("save_title", item);
			setPageTitle(page_title);
		}
		else if (kind == "onLoadPageList")
		{
			let page_title = this.getMessage("list_title", null);
			setPageTitle(page_title);
		}
		else if (kind == "onLoadPageDelete")
		{
			let page_title = this.getMessage("delete_title", null);
			setPageTitle(page_title);
		}
	}
	
	
	
	/**
	 * After api
	 */
	async after(kind: string, params: Record<string, any>)
	{
		this.afterPageTitle(kind, params);
		
		let response = params["response"] as AxiosResponse;
		if (response &&
			responseOk(response) &&
			["onLoadPageList", "onLoadPageSave"].indexOf(kind) >= 0
		)
		{
			this.dictionary = response.data.result.dictionary;
		}
	}
	
	
	
	/**
	 * Search data
	 */
	getSearchParamsFromRoute(route: any)
	{
		let page = route.to.query.page || 1;
		return {
			"page": page,
		};
	}
	
	
	
	/**
	 * Search data
	 */
	getSearchData(params: any)
	{
		let page = params.page || 1;
		let limit = params.limit || 20;
		return {
			"filter": [],
			"page": page,
			"limit": limit,
		};
	}
	
	
	
	/**
	 * Process search data
	 */
	async processPostData(kind: string, data: any)
	{
		return data;
	}
	
	
	/** ===================== List page ===================== **/
	
	/**
	 * List Page Load data
	 */
	async onLoadPageList(route: any)
	{
		let res:boolean = await this.before("onLoadPageList", {"route": route});
		if (!res) return;
		
		/* Ajax request */
		let search_params = this.getSearchParamsFromRoute(route);
		let post_data:any = this.getSearchData(search_params);
		post_data = await this.processPostData("onLoadPageList", post_data);
		let response:AxiosResponse | null = 
			await this.getClass().processLoadListApi( post_data )
		;
		
		/* Set result */
		this.items = new Array();
		if (response &&
			typeof(response.data) == "object" &&
			response.data.error.code == 1
		)
		{
			this.page = Number(response.data.result.page);
			this.pages = Number(response.data.result.pages);
			this.limit = Number(response.data.result.limit);
			this.start = Number(response.data.result.start);
			this.setItems(response.data.result.items);
		}
		
		await this.after("onLoadPageList", {"response": response, "route": route});
	}
	
	
	
	/**
	 * Load data api
	 */
	static async processLoadListApi(post_data: any): Promise<AxiosResponse | null>
	{
		let url = this.getApiUrl("search", {"post_data": post_data});
		let response:AxiosResponse | null = null;
		
		try
		{
			response = await callApi(url, post_data);
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
	
	
	
	/** ===================== Item page ===================== **/
	
	
	/**
	 * Load item api
	 */
	static async processLoadItemApi(post_data: any): Promise<AxiosResponse | null>
	{
		let response:AxiosResponse | null = null;
		
		let url = this.getApiUrl("item", {"post_data": post_data});
		
		try
		{
			response = await callApi(url, post_data);
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
	
	
	
	/** ===================== Save Form ===================== **/
	
	/**
	 * Add Page Load data
	 */
	async onLoadPageSave(route: any)
	{
		if (this.page_action == "add" || this.page_action == "create")
		{
			let res:boolean = await this.before("onLoadPageSave", {"route": route});
			if (!res) return;
			
			this.form_save.clear();
			
			await this.after("onLoadPageSave", {"response": null, "route": route});
		}
		
		else if (this.page_action == "edit" || this.page_action == "update")
		{
			let res:boolean = await this.before("onLoadPageSave", {"route": route});
			if (!res) return;
			
			this.form_save.clear();
			
			/* Get post data */
			let post_data = this.getPrimaryKeyFromRoute(route);
			post_data = await this.processPostData("onLoadPageSave", post_data);
			
			/* Ajax request */
			let response:AxiosResponse | null = await this.getClass()
				.processLoadItemApi(post_data);
			
			this.form_save.setLoadResponse(response);
			
			await this.after("onLoadPageSave", {"response": response, "route": route});
		}
	}
	
	
	
	/**
	 * Save form
	 */
	async processSaveForm(component: DefineComponent)
	{
		let item:CrudItem = this.form_save.item as CrudItem;
		let item_original:CrudItem = this.form_save.item_original as CrudItem;
		
		let res:boolean = await this.before( "processSaveForm", {} );
		if (!res) return;
		
		/* Get post data */
		let post_data = {
			"pk": item_original ? this.getPrimaryKeyFromItem(item_original) : null,
			"item": item,
		};
		post_data = await this.processPostData("processSaveForm", post_data);
		
		/* Send post data */
		this.form_save.setWaitResponse();
		let response:AxiosResponse | null = await this.getClass()
			.processSaveFormApi(post_data);
		this.form_save.setAxiosResponse(response);
		
		if (item_original == null)
		{
			if (response &&
				typeof(response.data) == "object" &&
				response.data.error.code == 1
			)
			{
				this.form_save.setItem(response.data.result.new_data);
				this.addItem(response.data.result.new_data);
				this.dialog_form.hide();
			}
		}
		
		else
		{
			if (response &&
				typeof(response.data) == "object" &&
				response.data.error.code == 1
			)
			{
				this.form_save.setItem(response.data.result.new_data);
				this.updateItem(item_original, response.data.result.new_data);
				this.dialog_form.hide();
			}
		}
		
		if (response &&
			typeof(response.data) == "object" &&
			response.data.error.code == 1
		)
		{
			this.setPageAction("update");
		}
		
		await this.after("processSaveForm", {
			"response": response,
			"item_original": item_original,
		});
	}
	
	
	
	/**
	 * Save form api
	 */
	static async processSaveFormApi(post_data:any): Promise<AxiosResponse | null>
	{
		let response:AxiosResponse | null = null;
		let pk = post_data["pk"];
		
		if (pk == null)
		{
			let url = this.getApiUrl("create", {"post_data": post_data});
			
			try
			{
				response = await callApi(url, post_data);
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
			let url = this.getApiUrl("update", {"post_data": post_data});
			
			try
			{
				response = await callApi(url, post_data);
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
	
	
	
	/** ==================== Delete Form ==================== **/
	
	/**
	 * Delete Page Load data
	 */
	async onLoadPageDelete(route: any)
	{
	}
	
	
	
	/**
	 * Delete form
	 */
	async processDeleteForm(component: DefineComponent)
	{
		let item:CrudItem = this.dialog_delete.item as CrudItem;
		
		let res:boolean = await this.before("processDeleteForm", {});
		if (!res) return;
		
		/* Get post data */
		let post_data = {
			"pk": this.getPrimaryKeyFromItem(item),
		};
		post_data = await this.processPostData("processDeleteForm", post_data);
		
		/* Send post data */
		this.dialog_delete.setWaitResponse();
		let response:AxiosResponse | null = await this.getClass()
			.processDeleteFormApi(post_data)
		;
		this.dialog_delete.setAxiosResponse(response);
		
		if (
			item && response &&
			typeof(response.data) == "object" && response.data.error.code == 1
		)
		{
			this.deleteItem(item);
			this.dialog_delete.hide();
		}
		
		await this.after("processDeleteForm", {"response": response});
	}
	
	
	
	/**
	 * Delete form api
	 */
	static async processDeleteFormApi(post_data:any): Promise<AxiosResponse | null>
	{
		let response:AxiosResponse | null = null;
		let url = this.getApiUrl("delete", {"post_data": post_data});
		
		if (url)
		{
			try
			{
				response = await callApi(url, post_data);
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
