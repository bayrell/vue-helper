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
.component_row_buttons button{
	margin-left: 2px;
	margin-right: 2px;
}
.component_row_button{
	display: inline-block;
	vertical-align: middle;
}
</style>


<template>
	<div class="component_row_buttons" v-if="component_params.buttons != undefined">
		
		<div class="component_row_button"
			v-for="button in component_params.buttons"
			:key="button.action"
		>
			
			<div class="component_row_button" v-if="notNull(button.route)">
				<router-link custom
					:to="{ name: button.route, params: getParams(button)}"
					v-slot="{ href, navigate, route }"
				>
					<a :href="href" @click="navigate" class="nolink"
						v-bind:data-route-name="route.name"
					>
						<Button type="default" small="true">{{ button.label }}</Button>
					</a>
				</router-link>
			</div>
			
			<div class="component_row_button" v-else>
				<Button
					v-bind:type="button.type" small="true"
					@click="onButtonClick(button.action)"
				>
					{{ button.label }}
				</Button>
			</div>
		</div>
		
	</div>
	
	<div class="component_row_buttons" v-else>
		
		<div class="component_row_button"
			v-if="route_names != undefined && route_names.edit != undefined && route_names.edit != ''"
		>
			<router-link custom
				:to="{ name: route_names.edit, params: { id: getItemId() }}"
				v-slot="{ href, navigate, route }"
			>
				<a :href="href" @click="navigate" class="nolink"
					v-bind:data-route-name="route.name"
				>
					<Button type="default" small="true">Edit</Button>
				</a>
			</router-link>
		</div>
		
		<div class="component_row_button" v-else>
			<Button type="default" small="true" @click="onButtonClick('edit')">Edit</Button>
		</div>
		
		<div class="component_row_button">
			<Button type="danger" small="true" @click="onButtonClick('delete')">Delete</Button>
		</div>
	</div>
</template>


<script lang="js">

import Button from "./Button";
import { defineComponent } from 'vue';
import { mixin, componentExtend, deepClone, notNull } from 'vue-helper';
import { CrudEvent, CRUD_EVENTS } from "./CrudState";
import { Field } from './Field.vue';


export const RowButtons =
{
	name: "RowButtons",
	mixins: [ mixin ],
	emits: Field.emits,
	props: Field.props,
	computed:
	{
	},
	methods:
	{
		notNull,
		getParams: function(button)
		{
			let res = {};
			res.id = this.getItemId();
			if (button && button.params != null) res = button.params(res, this, button);
			return res;
		},
		getItemId: function()
		{
			let id = 0;
			if (this.crud_model)
			{
				id = this.crud_model.getItemId(this.crud_item);
			}
			return id;
		},
		onButtonClick: function(button_name)
		{
			let event = new CrudEvent();
			event.event_name = CRUD_EVENTS.ROW_BUTTON_CLICK;
			event.crud_item = deepClone(this.crud_item);
			event.button_name = button_name;
			event.index = this.crud_index;
			this.$emit( "crudEvent", event );
		}
	},
	components:
	{
		Button,
	},
};

componentExtend(RowButtons, Field);
export default defineComponent(RowButtons);

</script>
