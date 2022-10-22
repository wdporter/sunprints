
const locations = ["Front", "Back", "Pocket", "Sleeve"]

const decorations = ["Print", "Embroidery", "Transfer"]

const media = ["Screen", "Usb", "TransferName"]

const art = []
decorations.forEach((decoration, i) => art.push({decoration, medium: media[i]}))


module.exports = { locations, decorations, media, art }