const sizes = {
	Kids: ["K0", "K1", "K2", "K4", "K6", "K8", "K10", "K12", "K14", "K16"],
	Womens: ["W6", "W8", "W10", "W12", "W14", "W16", "W18", "W20", "W22", "W24", "W26", "W28"],
	Adults: ["AXS", "ASm", "AM", "AL", "AXL", "A2XL", "A3XL", "A4XL", "A5XL", "A6XL", "A7XL", "A8XL"]
}


const sizeCategories = Object.keys(sizes)


let allSizes = []
sizeCategories.forEach(cat => allSizes = allSizes.concat(sizes[cat]))

module.exports = {sizes, sizeCategories, allSizes }