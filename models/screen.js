module.exports = class ScreenModel {
	ScreenId
	Name
	Number
	Colour
	LastModifiedDateTime
	LastModifiedBy
	CreatedDateTime
	CreatedBy
	PrintDesigns // array

	constructor(item) {
		this.ScreenId = item.ScreenId //?? null
		this.Name = item.Name //?? null
		this.Number = item.Number //?? null
		this.Colour = item.Colour //?? null
		this.LastModifiedDateTime = item.LastModifiedDateTime //?? new Date().toLocaleString("en-AU")
		this.LastModifiedBy = item.LastModifiedBy //?? null
		this.CreatedDateTime = item.CreatedDateTime //?? new Date().toLocaleString("en-AU")
		this.CreatedBy = item.CreatedBy //?? null
	}

}