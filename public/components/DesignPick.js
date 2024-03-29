import { ref, watch } from "vue"
import { debounce } from "lodash-es"

export default {
	props: {
		location: String,
		decoration: String
	},
	emits: ["designSelect"],
	setup(props, context) {
		const code             = ref("")
		const notes            = ref("")
		const comments         = ref("")
		const designs          = ref([])
		const checkedLocations = ref([])

		watch(() => props.location, (newValue, oldValue) => {
			checkedLocations.value = [newValue]
		})

		function onDesignSelect(event, design) {
			this.clear()

			design.decoration = this.decoration
			design.location   = this.location
			design.checkedLocations = this.checkedLocations
			context.emit("designSelect", design)
		}

		const getDesigns = debounce(async (me) => {
			let url = `/order/designs?location=${me.location}&decoration=${me.decoration}&code=${me.code.trim()}&notes=${me.notes.trim()}`

			if (me.decoration != "Transfer")
				url += `&comments=${me.comments.trim()}`
			
			me.designs = await (await fetch(url)).json()

		}, 500)

		return {
			code,
			notes,
			comments,
			designs,
			onDesignSelect,
			getDesigns,
			checkedLocations
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
<p><!-- the passed in locations will be checked and disabled by default, other locations can be chosen -->
	<input type=checkbox id="front_designcheckbox"  value="Front"  v-model="checkedLocations" :disabled="location==='Front'"  /><label for="front_designcheckbox" >Front</label>
	<input type=checkbox id="back_designcheckbox"   value="Back"   v-model="checkedLocations" :disabled="location==='Back'"   /><label for="back_designcheckbox"  >Back</label>
	<input type=checkbox id="pocket_designcheckbox" value="Pocket" v-model="checkedLocations" :disabled="location==='Pocket'" /><label for="pocket_designcheckbox">Pocket</label>
	<input type=checkbox id="sleeve_designcheckbox" value="Sleeve" v-model="checkedLocations" :disabled="location==='Sleeve'" /><label for="sleeve_designcheckbox">Sleeve</label>
</p>
<table class=design-search-table>
	<thead>
		<tr>
			<th style="width:2em"></th>
			<th>
				<input type=search placeholder="Code" class=filter-dropdown-input v-model="code" ref="myCodeInput" @input="getDesigns(this)" autofocus />
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
		<tr v-for="design in designs" @dblclick="onDesignSelect($event, design)">
			<td><button @click="onDesignSelect($event, design)" title="click to select this design">Select</button></td>
			<td>{{ design.Code }}</td>
			<td>{{ design.Notes }} </td>
			<td v-if="decoration != 'Transfer'">{{ design.Comments }} </td>
			<td>{{ design.SizeCategory }}</td>
		</tr>
	</tbody>
</table>`
}	