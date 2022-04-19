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
.components_tabs__tab{
	display: inline-block;
	vertical-align: top;
	padding: 10px 15px;
	cursor: pointer;
	border-bottom: 1px $color_border solid;
}
.components_tabs__tab.active{
	border: 1px $color_border solid;
	border-bottom: 0px;
}
</style>


<template>
	<div class="components_tabs">
		
		<div class="components_tabs__top">
			<div v-for="tab in tabs" :class="{ 'active': selected_tab == tab.name }"
				class="components_tabs__tab" :key="tab.name" @click="selectTab(tab)"
			>
				{{ tab.label }}
			</div>
		</div>
		
		<div class="components_tabs__bottom">
			<slot></slot>
		</div>
		
	</div>
</template>


<script lang="js">

import { defineComponent } from 'vue';
import { mixin } from 'vue-helper';

export const Tabs =
{
	mixins: [ mixin ],
	
	data: function () {
		return {
			tabs: [],
			selected_tab: "",
		};
	},
	
	created ()
	{
		let slots = this.$slots.default();
		
		for (let i = 0; i<slots.length; i++)
		{
			let slot = slots[i];
			let tab = {
				name: slot.props.name,
				label: slot.props.label || slot.props.name,
			};
			if (slot.props.selected)
			{
				this.selected_tab = slot.props.name;
			}
			this.tabs.push( tab );
		}
	},
	
	methods:
	{
		selectTab: function(tab)
		{
			this.selected_tab = tab.name;
			this.$emit( "select", tab.name );
		},
	},
	
}

export default defineComponent(Tabs);

</script>