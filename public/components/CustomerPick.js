import { ref } from "vue"
import { debounce } from "lodash-es"

export default {
	props: {
	},
	emits: ["customerSelect"],
	setup(props, context) {
		const term = ref("")
		const customer = ref("")
		const customers = ref([])

		function onCustomerSelect(event, customer) {
			context.emit("customerSelect", customer)
		}

		const getCustomers = debounce(async (e) => {
			customers.value = await (await fetch(`/customer/ordersearch?q=${e.target.value.trim()}`)).json()
		}, 500)

		return {
			term,
			customers,
			onCustomerSelect,
			getCustomers
		}
	},
	methods: {
		receiveFocus() {
			this.$nextTick(() => this.$refs.myInput.focus())
		}
	},

	template: /*html*/`
<input type=search placeholder="Search…" class=filter-dropdown-input v-model="term" ref="myInput" @input="getCustomers" />
<table class=customer-search-table>
	<tr v-for="customer in customers" :data-id="customer.CustomerId" :key="customer.CustomerId">
		<td><a href=# @click.prevent="onCustomerSelect($event, customer)">Select</a></td>
		<td>{{ customer.Code }} </td>
		<td>{{ customer.Company }} </td>
		<td>{{ customer.detailsString }} </td>
		<!--<td>{{ customer.State }} </td>-->
	</tr>
</table>
`
}