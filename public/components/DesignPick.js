import { ref } from "vue"
import { debounce } from "lodash-es"

export default {
	props: {
		location: String,
		decoration: String
	},
	emits: ["designSelect"],
	setup(props, context) {
		const code     = ref("")
		const notes    = ref("")
		const comments = ref("")
		const designs  = ref([])

		function onDesignSelect(event, design) {
			this.clear()

			design.decoration = this.decoration
			design.location   = this.location
			context.emit("designSelect", design)
		}

		const getDesigns = debounce(async (vue) => {
			let url = `/order/designs?location=${vue.location}&decoration=${vue.decoration}&code=${vue.code.trim()}&notes=${vue.notes.trim()}`

			if (vue.decoration != "Transfer")
				url += `&comments=${vue.comments.trim()}`

			vue.designs = await (await fetch(url)).json()

		}, 500)

		return {
			code,
			notes,
			comments,
			designs,
			onDesignSelect,
			getDesigns
		}
	},
	methods: {
		clear() {
			this.code = ""
			this.notes = ""
			this.comments = ""
			this.designs = []

		}
	},
	template: /*html*/`
<table class=design-search-table>
	<thead>
		<tr>
			<th style="width:2em"></th>
			<th>
				<input type=search placeholder="Code" class=filter-dropdown-input v-model="code" ref="myCodeInput" @input="getDesigns(this)" />
			</th>
			<th>
				<input type=search placeholder="Notes" class=filter-dropdown-input v-model="notes" ref="myNotesInput" @input="getDesigns(this)" />
			</th>
			<th v-if="decoration != 'Transfer'">
				<input type=search placeholder="Comments" class=filter-dropdown-input v-model="comments" ref="myCommentsInput" @input="getDesigns(this)" />
			</th>
			<th style="width:4em"></th>
		</tr>
	</thead>
	<tbody>
		<tr v-for="design in designs">
			<td><a href=# @click.prevent="onDesignSelect($event, design)">Select</a></td>
			<td>{{ design.Code }} </td>
			<td>{{ design.Notes }} </td>
			<td v-if="decoration != 'Transfer'">{{ design.Comments }} </td>
			<td>{{ design.SizeCategory }}</td>
		</tr>
	</tbody>
</table>`
}	