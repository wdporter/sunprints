//import { ref } from "vue"
export default {
	props: {
		data: Array,
		headers: Array
	},
	setup(props, context) {
	},
	methods: {
		formatSubTableCell(header, item) {
				if (header.type === Boolean)
					return item[header.name] ? "✅" : ""
				else
					return item[header.name] 
			}
	},
	template: /*html*/`
		<table v-if="data && data.length > 0" class="border border-solid border-black border-collapse">
			<thead>
				<tr>
					<th v-for="header in headers" class="border border-solid border-black px-2" scope=col>{{header.displayName || header.name}}</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="item in data">
					<td v-for="header in headers" class="border border-solid border-black px-2" :class="{'text-center': header.type==Boolean }">{{ formatSubTableCell(header, item) }}</td>
				</tr>
			</tbody>
		</table>
	`
}