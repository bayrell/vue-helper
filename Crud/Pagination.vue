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
.pagination {
    text-align: center;
    padding: 10px 0;
	width: 100%;
	
	ul {
		padding: 0;
		margin: 0;
	}
	
	li {
		display: inline-block;
		vertical-align: top;
		list-style: none;
		margin-left: 5px;
		margin-right: 5px;
		
		a, a:hover, span {
			display: table-cell;
			vertical-align: middle;
			background-color: #fff;
			border: 1px #ccc solid;
			color: #000;
			text-align: center;
			width: 30px;
			height: 30px;
			font-size: 14px;
			text-decoration: none;
		}		
	}
	
	li:first-child{
		margin-left: 0px;
	}
	
	li.active{
		a, a:hover {
			background-color: #337ab7;
			border: 1px #22527b solid;
			color: #fff;
		}		
	}
}
</style>


<template>
	<nav class="pagination" v-if="pages > 1">
		<ul>
			<li v-for="p in pages" :key="p" class="btn page"
				v-bind:class='{ "active": isActive(p) }'
				@click="openPage(p)"
			>
				<a class="nolink">{{ p }}</a>
			</li>
		</ul>
	</nav>
</template>


<script lang="js">

import { defineComponent } from 'vue';
import { mixin, componentExtend, urlGetAdd } from 'vue-helper';
import { CrudEvent, CRUD_EVENTS } from "./CrudState";
import { Field } from './Field.vue';

export const Pagination =
{
	props: ["page", "pages", "limit"],
	methods:
	{
		isActive: function(p)
		{
			return this.page == p;
		},
		openPage: function(p)
		{
			let url = this.$route.fullPath;
			url = urlGetAdd(url, "page", p);
			this.$router.push( url );
		},
	}
}

export default defineComponent(Pagination);

</script>