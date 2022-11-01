import { ref, computed } from "vue"


export default {
	props: {
		location: String,
		medium: String,
		position: Number,
		designid: Number,
	},
	emits: ["mediaSelect"],
	setup(props, context) {
		
		const media = ref([])
		
		function onMediaSelect(event, medium) {

			medium.medium = this.medium
			medium.location = this.location
			medium.position = this.position
			
			switch(medium.medium) {
				case "Screen": 
					medium.name = `${medium.Name} — ${medium.Number} — ${medium.Colour}`
					break
				case "Usb":
					medium.name = `${medium.Number} — ${medium.Notes}`
					break
				case "TransferName":
					medium.name = medium.Name
			}

			context.emit("mediaSelect", medium)
		}


		return {
			media,
			onMediaSelect
		}
	},
	methods: {
		fetch() {
			this.media = []
			const me = this
			let url = `/order/media?media=${this.medium}&location=${this.location}&designid=${this.designid}`
			fetch(url)
			.then(response => response.json())
			.then(json => {
				me.media = json
			})
		}
	},
	template: /*html*/`
<table class=design-search-table>
	<tbody>
		<tr v-for="mediaItem in media" :key="mediaItem.id">
			<td><a href=# @click.prevent="onMediaSelect($event, mediaItem)">Select</a></td>
			<td v-if="medium == 'Screen' || medium == 'TransferName'">{{ mediaItem.Name }} </td>
			<td v-if="medium == 'Screen' || medium == 'Usb'">{{ mediaItem.Number }} </td>
			<td v-if="medium == 'Screen'">{{ mediaItem.Colour }} </td>
			<td v-if="medium == 'Usb'">{{ mediaItem.Notes }}</td>
		</tr>
		<tr v-if="media.length == 0">
			<td colspan=5>No results</td>
		</tr>
	</tbody>
</table>`
}