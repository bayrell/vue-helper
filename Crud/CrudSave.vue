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
		/*border: 1px $color_table_border solid;*/
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
	&__pagination td, &__pagination th{
		border-bottom-width: 0px;
		border-left-width: 0px;
		border-right-width: 0px;
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
		
		<div class="component_crud_save">
			<slot name="component_crud_save_back">
				<div class="component_crud_save_back">
					<Button type="primary" @click="onSaveFormButtonBackClick()">Back</Button>
				</div>
			</slot>
			<slot name="component_crud_save_before"></slot>
			<slot name="component_crud_save">
				<Form v-bind:store_path="store_path.concat('form_save')"
					@crudEvent="onCrudFormEvent($event, 'form_save')"
				>
					<template v-slot:title>
						<slot name="component_crud_save_title"></slot>
					</template>
					<template v-slot:rows_before>
						<slot name="component_crud_save_rows_before"></slot>
					</template>
					<template v-slot:rows_after>
						<slot name="component_crud_save_rows_after"></slot>
					</template>
					<template v-slot:rows_first>
						<slot name="component_crud_save_rows_first"></slot>
					</template>
					<template v-slot:rows_last>
						<slot name="component_crud_save_rows_last"></slot>
					</template>
					<template v-slot:buttons>
						<Button type="primary"
							@click="onSaveFormButtonSaveClick()">Save</Button>
					</template>
					<template v-slot:result>
						<slot name="component_crud_save_result"></slot>
					</template>
				</Form>
			</slot>
			<slot name="component_crud_save_after"></slot>
		</div>
		
		<slot name="crud_after"></slot>
	</div>
</template>


<script lang="js">

import { defineComponent } from 'vue';
import { mixin, deepClone, componentExtend, onRouteUpdate } from "vue-helper";
import { CRUD_EVENTS, CrudEvent } from "./CrudState";

export const CrudSave =
{
	name: "CrudSave",
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
		onCrudFormEvent: function($event, form_name)
		{
		},
		onSaveFormButtonSaveClick: async function()
		{
			await this.model.processSaveForm();
			let page_title = this.model.constructor
				.getMessage("edit_title", this.model.form_save.item)
			;
			this.setPageTitle(page_title);
		},
		onSaveFormButtonCancelClick: function()
		{
			this.onSaveFormButtonBackClick();
		},
		onSaveFormButtonBackClick: function()
		{
			let route_names = this.model.constructor.getRouteNames();
			let item_original = this.model.form_save.item_original;
			
			if (route_names.list != undefined)
            {
                this.$router.push({ name: route_names.list });
            }
		}
	},
    beforeRouteEnter(to, from, next)
	{
		onRouteUpdate("beforeRouteEnter", to, from, next);
	},
	beforeRouteUpdate(to, from, next)
	{
		onRouteUpdate("beforeRouteUpdate", to, from, next);
	}
};


export default defineComponent(CrudSave);

</script>
