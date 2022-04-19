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
</style>


<template>
	{{ value }}
</template>


<script lang="js">

import { defineComponent } from 'vue';
import { mixin } from "vue-helper";


export const Field =
{
	mixins: [ mixin ],
	emits: ["crudEvent"],
	props:
	[
		"store_path",
		"page_action",
		"route_names",
		"crud_index",
		"crud_item",
		"crud_model",
		"value",
		"name",
		"api_name",
		"type",
		"label",
		"options",
		"component",
		"component_params",
		"primary",
		"required",
		"readonly",
		"virtual",
		"can_create",
		"can_update",
		"group",
		"default_value",
	],
	computed:
	{
	},
	methods:
	{
	},
	components:
	{
	},
};


export default defineComponent(Field);

</script>
