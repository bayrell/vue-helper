<!--
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
-->

<style lang="scss">
@import '@/variable.scss';
.component_crud{
	&__top_buttons{
		margin-bottom: 10px;
	}
	&__top_button{
		display: inline-block;
		vertical-align: top;
		margin-left: 2px;
		margin-right: 2px;
		&:first-child{
			margin-left: 0px;
		}
	}
	&__table table{
		border-collapse: collapse;
		border: 1px $color_table_border solid;
	}
	&__table td, &__table th{
		border: 1px $color_table_border solid;
		padding: 5px;
		text-align: center;
	}
	&__row:hover{
		background-color: $color_table_hover;
		color: inherit;
	}
	&__row.active{
		background-color: $color_table_selected;
		color: white;
	}
	&_save_back{
		margin-bottom: 10px;
	}
	.buttons button{
		margin-left: 2px;
		margin-right: 2px;
	}
	.dialog_buttons button{
		margin: 0 5px;
	}
	.form_buttons{
		text-align: center;
		margin-top: 10px;
	}
	.form_buttons button{
		margin-left: 10px;
		margin-right: 10px;
	}
}
</style>


<template>
	<div class="component_crud">
		
		<slot name="crud_before"></slot>
		
		<div class="component_crud_list" v-if="page_action == undefined || page_action == 'list'">
		
			<div class="component_crud__top_buttons">
				<slot name="top_buttons">
					
					<div class="component_crud__top_button"
						v-if="route_names != undefined && route_names.add != undefined"
					>
						<router-link custom
							:to="{ name: route_names.add }"
							v-slot="{ href, navigate, route }"
						>
							<a :href="href" @click="navigate" class="nolink"
								v-bind:data-route-name="route.name"
							>
								<Button type="success">
									[+] {{ model.constructor.getMessage("top_button_show_add_title", model.current_item) }}
								</Button>
							</a>
						</router-link>
					</div>
					
					<div class="component_crud__top_button" v-else >
						<Button type="success" @click="onShowAdd()">
							[+] {{ model.constructor.getMessage(
								"top_button_show_add_title", model.current_item
							) }}
						</Button>
					</div>
					
				</slot>
			</div>
			
			<slot name="table_before"></slot>
			
			<div class="component_crud__table">
				<slot name="table">
					<table>
						<tr class="component_crud__header">
							<th v-for="field in model.fields_table"
								:key="field.api_name"
							>{{ field.label }}</th>
						</tr>
						<tr class="component_crud__row"
							v-for="item, item_index in model.items" :key="item.domain_name"
							v-bind:class="{ active: model.isRowActive(item) }"
							@click="onRowClick(item, item_index, $event)"
						>
							<td v-for="field in model.fields_table"
								:key="field.api_name"
							>
								<component v-bind:is="field.component"
									v-bind="Object.assign({}, field, {
										page_action: page_action,
										route_names: route_names,
										crud_index: item_index,
										crud_item: item,
										crud_model: model
									})"
									v-bind:value="model.getItemValue(item_index, field.name)"
									@crudEvent="onCrudComponentEvent($event)"
								/>
							</td>
						</tr>
					</table>
				</slot>
			</div>
			
			<slot name="table_after"></slot>
			<slot name="dialog_form">
				<Dialog v-bind:store_path="store_path.concat('dialog_form')"
					width="800px" buttons="false"
				>
					<template v-slot:title>
						{{ model.constructor.getMessage("form_title", model.current_item) }}
					</template>
					<template v-slot:content>
						<Form v-bind:store_path="store_path.concat('form_save')"
							@crudEvent="onCrudFormEvent($event, 'form_save')"
						>
							<template v-slot:buttons>
								<Button type="primary"
									@click="onSaveFormButtonSaveClick()">Save</Button>
								<Button type=""
									@click="onSaveFormButtonCancelClick()">Cancel</Button>
							</template>
						</Form>
					</template>
				</Dialog>
			</slot>
			<slot name="dialog_delete">
				<Dialog v-bind:store_path="store_path.concat('dialog_delete')">
					<template v-slot:title>
						{{ model.constructor.getMessage("delete_title", model.dialog_delete.item) }}
					</template>
					<template v-slot:text>
						{{ model.constructor.getMessage("delete_text", model.dialog_delete.item) }}
					</template>
					<template v-slot:buttons>
						<Button type="danger" @click="onDeleteFormButtonYesClick()">Yes</Button>
						<Button type="" @click="onDeleteFormButtonNoClick()">No</Button>
					</template>
				</Dialog>
			</slot>
		</div>
		
		<div class="component_crud_save" v-if="page_action == 'edit' || page_action == 'add'">
			<slot name="component_crud_save_back">
				<div class="component_crud_save_back">
					<Button type="primary" @click="onSaveFormButtonBackClick()">Back</Button>
				</div>
			</slot>
			<slot name="component_crud_save">
				<Form v-bind:store_path="store_path.concat('form_save')"
					@crudEvent="onCrudFormEvent($event, 'form_save')"
				>
					<template v-slot:buttons>
						<Button type="primary"
							@click="onSaveFormButtonSaveClick()">Save</Button>
					</template>
				</Form>
			</slot>
		</div>
		
		<slot name="crud_after"></slot>
	</div>
</template>


<script lang="js">

import { defineComponent } from 'vue';
import { mixin, deepClone } from "vue-helper";
import { CRUD_EVENTS, CrudEvent } from "./CrudState";

export const Crud =
{
	name: "Crud",
	mixins: [ mixin ],
	props: ["page_action"],
	computed:
	{
		route_names: function()
		{
			return this.model.constructor.getRouteNames();
		},
	},
	methods:
	{
		onRowClick: function(item, index, $event)
		{
			let event = new CrudEvent();
			event.event_name = CRUD_EVENTS.ROW_CLICK;
			event.crud_item = deepClone(item);
			event.index = this.crud_index;
			event.$event = $event;
			this.$emit( "crudEvent", event );
		},
		onCrudDialogEvent: function($event, dialog_name)
		{
		},
		onCrudFormEvent: function($event, form_name)
		{
		},
		onCrudComponentEvent: function($event)
		{
			if ($event.event_name == CRUD_EVENTS.ROW_BUTTON_CLICK)
			{
				if ($event.button_name == "edit")
				{
					this.onShowEdit($event.crud_item);
				}
				if ($event.button_name == "delete")
				{
					this.onShowDelete($event.crud_item);
				}
			}
		},
		onShowAdd: function()
		{
			this.model.showForm(null);
		},
		onShowEdit: function(item)
		{
			this.model.showForm(item);
		},
		onShowDelete: function(item)
		{
			this.model.showDelete(item);
		},
		onSaveFormButtonSaveClick: function()
		{
			this.model.doSaveForm();
		},
		onSaveFormButtonCancelClick: function()
		{
			this.onSaveFormButtonBackClick();
		},
		onSaveFormButtonBackClick: function()
		{
			let route_names = this.model.constructor.getRouteNames();
			let item_original = this.model.form_save.item_original;
			
			let is_back = false;
			if (item_original == null && route_names.add != undefined) is_back = true;
			if (item_original != null && route_names.edit != undefined) is_back = true;
			
			if (!is_back)
			{
				this.model.dialog_form.hide();
			}
			else
			{
				if (route_names.list != undefined)
				{
					this.$router.push({ name: route_names.list });
				}
			}
		},
		onDeleteFormButtonYesClick: function()
		{
			this.model.doDeleteForm();
		},
		onDeleteFormButtonNoClick: function()
		{
			this.model.dialog_delete.hide();
		},
	}
};


export default defineComponent(Crud);

</script>
