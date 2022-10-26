import { ref } from "vue"
import { debounce } from "lodash-es"

export default {
	props: {
		location: String,
		medium: String,
		designId: Number,
		decoration: String,
		position: Number
	},
	emits: ["mediaSelect"],
	setup(props, context) {
		const name   = ref("") // screen, transfer
		const number = ref("") // screen, usb
		const colour = ref("") // screen
		const notes  = ref("") // usb
		const media  = ref([])

		function onMediaSelect(event, medium) {
			this.clear()

			medium.medium = this.medium
			medium.location   = this.location
			context.emit("mediaSelect", medium)
		}

		const fetchMedia = debounce(async (vue) => {
			let url = `/order/media?media=${vue.medium}&location=${vue.location}&designid=${vue.designId}number=${vue.number.trim()}&notes=${vue.notes.trim()}&colour=${vue.colour.trim()}&name=${vue.name.trim()}`

			vue.media = await (await fetch(url)).json()

		}, 500)

		return {
			name,
			number,
			colour,
			notes,
			media,
			onMediaSelect,
			fetchMedia
		}
	},
	methods: {
		clear() {
			this.name  = ""
			this.number = ""
			this.colour = ""
			this.notes = ""
			this.media = []
		}
	},
	template: /*html*/`
<table class=design-search-table>
	<thead>
		<tr>
			<th style="width:2em"></th>
			<th v-if="medium == 'Screen' || medium == 'Transfer'">
				<input type=search placeholder="Name" class=filter-dropdown-input v-model="name" ref="myNameInput" @input="getMedia(this)" />
			</th>
			<th v-if="medium == 'Screen' || medium=='Usb'">
				<input type=search placeholder="Number" class=filter-dropdown-input v-model="number" ref="myNumberInput" @input="getMedia(this)" />
			</th>
			<th v-if="medium == 'Screen'">
				<input type=search placeholder="Colour" class=filter-dropdown-input v-model="colour" ref="myColourInput" @input="getDesigns(this)" />
			</th>
			<th v-if="medium == 'Usb'">
				<input type=search placeholder="Notes" class=filter-dropdown-input v-model="notes" ref="myNotesInput" @input="getDesigns(this)" />
			</th>
		</tr>
	</thead>
	<tbody>
		<tr v-for="mediaItem in media">
			<td><a href=# @click.prevent="onMediaSelect($event, mediaItem)">Select</a></td>
			<td v-if="medium == 'Screen' || medium == 'Transfer'">{{ mediaItem.Name }} </td>
			<td v-if="medium == 'Screen' || medium == 'Usb'">{{ mediaItem.Number }} </td>
			<td v-if="medium == 'Screen'">{{ mediaItem.Colour }} </td>
			<td v-if="medium == 'Usb'">{{ mediaItem.Notes }}</td>
		</tr>
	</tbody>
</table>`
}	