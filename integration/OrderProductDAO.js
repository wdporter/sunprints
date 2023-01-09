const AuditLogDao = require("./AuditLogDAO.js")

module.exports = class OrderProductDao {

	constructor(db) {
		this.db = db
	}


	get(orderGarmentId) {
		return this.db.prepare(/*sql*/`SELECT * FROM OrderGarment WHERE OrderGarmentId=?`).get(orderGarmentId)
	}


	insert(product) {

		try {
			let query = /*sql*/`
INSERT INTO OrderGarment ( ${Object.keys(product).join(" , ")} )
VALUES (${Object.keys(product).map(k => `@${k}`).join(" , ")})`
			let statement = this.db.prepare(query) // note, there is a trigger to insert into Sales
			let info = statement.run(product)
			console.log("insert product", info)

			product.OrderGarmentId = info.lastInsertRowid

			new AuditLogDao(this.db).insert("OrderGarment", "OrderGarmentId", product)

			return product.OrderGarmentId

		}
		catch (ex) {
			console.log("error", ex)
			throw ex
		}

	}


	delete(product) {
		try {
			const selectQuery = /*sql*/`SELECT * FROM OrderGarment WHERE OrderGarmentId=?`
			const orderGarment = this.db.prepare(selectQuery).get(product.OrderGarmentId)

			let query = /*sql*/`DELETE FROM OrderGarment WHERE OrderGarmentId=?`
			this.db.prepare(query).run(product.OrderGarmentId)

			// in our audit logging, we don't audit anything that has the default value
			for(let key in orderGarment) {
				if (orderGarment[key] === null || orderGarment[key] === 0 || orderGarment[key] === "") {
					delete orderGarment[key]
				}
			}

			new AuditLogDao(this.db).delete("OrderGarment", "OrderGarmentId", orderGarment)


		}
		catch (ex) {
			console.log("error", ex)
			throw ex
		}


	}


	update(orderGarment) {
		try {

			// get the original OrderProduct item
		const original = new OrderProductDao(this.db).get(orderGarment.OrderGarmentId)

		// get a list of changed columns
		const changedColumns = [] 
		for (let key in original) {
			if (key == "OrderGarmentId")
				continue // ignore these
			if (typeof orderGarment[key] == "undefined")
				continue
			if (original[key] !== orderGarment[key])
				changedColumns.push(key)
		}

		let query = /*sql*/`UPDATE OrderGarment SET 
			${changedColumns.map(c => `${c}=@${c}`).join(", ")}
			WHERE OrderGarmentId=@OrderGarmentId`
		this.db.prepare(query).run(orderGarment)

		new AuditLogDao(this.db).update("OrderGarment", "OrderGarmentId", original, orderGarment )

	}
	catch (ex) {
		console.log("error", ex)
		throw ex
	}


	}



}

