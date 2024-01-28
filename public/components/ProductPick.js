import { ref } from "vue"
import { debounce } from "lodash-es"

export default {
	emits: ["productSelect"],
	setup(props, context) {
		const code = ref("")
		const label = ref("")
		const type = ref("")
		const colour = ref("")
		const products = ref([])
		const totalRecords = ref(0)
		const limit = ref(0)

		function onProductSelect(event, product) {
			this.clear()
			context.emit("productSelect", product)
		}

		const getProducts = debounce(async (me) => {
			let url = `/product/search?code=${me.code.trim()}&label=${me.label.trim()}&type=${me.type.trim()}&colour=${me.colour.trim()}`

			const result = await (await fetch(url)).json()

			 me.products = result.data
			 me.totalRecords = result.totalRecords
			 me.limit = result.limit

		}, 500)

		return {
			code,
			label,
			type,
			colour,
			products,
			onProductSelect,
			getProducts,
			totalRecords,
			limit
		}
	},
	methods: {
		clear() {
			this.code = ""
			this.label = ""
			this.type = ""
			this.colour = ""
			this.products = []

		}
	},
	template: /*html*/`
<table class=design-search-table>
	<thead>
		<tr>
			<th style="width:2em"></th>
			<th>
				<input type=search placeholder="Code" class=filter-dropdown-input 
						v-model="code" 
						@input="getProducts(this)" />
			</th>
			<th>
				<input type=search placeholder="Type" class=filter-dropdown-input 
						v-model="type" 
						@input="getProducts(this)" />
			</th>
			<th>
				<input type=search placeholder="Colour" class=filter-dropdown-input 
						v-model="colour" 
						@input="getProducts(this)" />
			</th>
			<th>
				<input type=search placeholder="Label" class=filter-dropdown-input 
						v-model="label" 
						@input="getProducts(this)" />
			</th>
			<th style="width:4em"></th>
		</tr>
	</thead>
	<tbody>
		<tr v-if="totalRecords > limit">
			<td colspan=6 ><i>Showing first {{ limit }} results of {{ totalRecords.toLocaleString()  }}</i></td>
		</tr>
		<tr v-else>
			<td colspan=6 ><i>Showing {{ totalRecords }} results</i></td>
		</tr>
		<tr v-for="product in products" @dblclick="onProductSelect($event, product)">
			<td><button @click="onProductSelect($event, product)">Select</button></td>
			<td>{{ product.Code }} </td>
			<td>{{ product.Type }} </td>
			<td>{{ product.Colour }} </td>
			<td>{{ product.Label }} </td>
			<td>{{ product.SizeCategory }}</td>
		</tr>
	</tbody>
</table>`
}