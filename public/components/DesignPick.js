import {  ref  } from "vue"
import { debounce } from "lodash-es"

export default {
	props: {
		location: String,
		decoration: String
	},
	emits: ["designSelect"],
	setup(props, context) {
		const code = ref("")
		const notes = ref("")
		const comments = ref("")
		const designs = ref([])

		function onDesignSelect(event, design) {
			context.emit("designSelect", design)

			code.value = ""
			notes.value = ""
			comments.value = ""
			designs.value = []
			//todo, need a way to reset these if they click the close button
		}

		const getDesigns = debounce(async (vue) => {
			let url = `/order/designs?location=${vue.location}&decoration=${vue.decoration}&code=${vue.code.trim()}&notes=${vue.notes.trim()}`

			if (vue.decoration != "Transfer")
				url += `&comments=${vue.comments.trim()}`

			vue.designs = await (await fetch(url)).json()
			// fetch(url)
			// .then(response => response.json())
			// .then(json => {
			// 	vue.designs.value = json
			// })

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