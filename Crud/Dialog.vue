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
.component_dialog__box, .component_dialog__shadow{
	position: fixed;
	top: 0; left: 0;
	width: 100%; height: 100%;
	z-index: 1001;
}
.component_dialog__box{
	overflow: auto;
	overflow-y: scroll;
	display: none;
	visibility: hidden;
}
.component_dialog__box.open{
	display: block;
	visibility: visible;
}
.component_dialog__shadow{
	background-color: #000;
	opacity: 0.2;
	overflow: hidden;
}
.component_dialog__wrap{
	width: 100%;
	min-height: 100%;
}
.component_dialog__wrap > tr > td{
	padding: 20px;
}
.component_dialog{
	position: relative;
	padding: 20px;
	background-color: white;
	max-width: 350px;
	margin: 0 auto;
	width: auto;
	z-index: 1002;
	box-shadow: 2px 4px 10px 0px rgba(0,0,0,0.5);
	font-size: 14px;
}
.component_dialog__title, .component_dialog__text, .component_dialog__promt{
	text-align: center;
	padding-bottom: 12px;
}
.component_dialog__title{
	font-weight: bold;
}
.component_dialog__promt_input{
	padding: 6px 12px;
	width: 100%;
}
.component_dialog__text{
	text-align: center;
	white-space: pre-wrap;
}
.component_dialog__buttons{
	padding-top: 12px;
	text-align: center;
}
.component_dialog__buttons button{
	margin: 0 5px;
}
.component_dialog__row{
	padding-bottom: 6px;
}
.component_dialog__row:last-child{
	padding-bottom: 0px;
}
.component_dialog__result_message{
	text-align: center;
	padding-top: 12px;
	white-space: break-spaces;
}
.component_dialog__result_message.success{
	color: green;
}
.component_dialog__result_message.error{
	color: red;
}
</style>


<template><teleport to="body">
	<div v-bind:class="getDialogClass()">
		<div class='component_dialog__shadow'></div>
		<table class='component_dialog__wrap'><tr><td>
			<div class='component_dialog' v-bind:style="getDialogStyle()">
				
				<div class='component_dialog__title'>
					<slot name="title">{{ model.title }}</slot>
				</div>
				
				<div class='component_dialog__text'>
					<slot name="text">{{ model.text }}</slot>
				</div>
				
				<div class='component_dialog__content'>
					<slot name="content"></slot>
				</div>
				
				<div class='component_dialog__buttons' v-if="showButtons()">
					<slot name="buttons">
						<Button v-for="button, index in model.buttons"
							v-bind:data-action="button.action"
							@click="onButtonClick(button.action, $event)"
							v-bind:type="button.type"
							:key="index"
						>{{ button.label }}</Button>
					</slot>
				</div>
				
				<div class="component_dialog__result">
					<slot name="result">
						<div class="component_dialog__result_message"
							v-if="model.message != ''"
							v-bind:class="{
								error: model.error_code < 0,
								success: model.error_code > 0,
							}"
						>{{ model.message }}</div>
					</slot>
				</div>
				
			</div>
		</td></tr></table>
	</div>
</teleport></template>


<script lang="js">

import { defineComponent } from 'vue';
import { mixin } from "vue-helper";
import { DialogButtonClickEvent } from './DialogState.ts';
import Button from './Button.vue';

export default defineComponent({
	mixins: [ mixin ],
	props: [ "width", "buttons", "style" ],
	computed:
	{
	},
	methods:
	{
		getDialogClass: function()
		{
			let res = [ "component_dialog__box" ];
			if (this.model.open)
			{
				res.push("open");
			}
			if (this.style instanceof Array)
			{
				res = res.concat( this.style );
			}
			else (this.style instanceof String || typeof this.style == "string")
			{
				res.push( this.style );
			}
			return res.join(" ");
		},
		showButtons: function()
		{
			if (this.buttons == "false") return false;
			return true;
		},
		getDialogStyle: function()
		{
			let s = {};
			if (this.width != "") s["max-width"] = this.width;
			return s;
		},
		onButtonClick: function(action, $event)
		{
			if (action == "cancel") this.model.hide();
			let event = new DialogButtonClickEvent();
			event.action = action;
			this.$emit("buttonClick", event);
		},
	},
	components:
	{
		Button,
	},
});

</script>
