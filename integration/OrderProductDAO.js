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
			let statement = this.db.prepare(query) 
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


	update(orderGarment, user) {
		try {

			// get the original OrderProduct item
		const original = new OrderProductDao(this.db).get(orderGarment.OrderGarmentId)

		// get a list of changed columns
		const changedColumns = [] 
		for (let key in original) {
			// ignore these when seeing if user has made changes
			if (key === "OrderGarmentId" || key === "CreatedBy" || key === "CreatedDateTime" || key === "LastModifiedBy" || key === "LastModifiedDateTime") {
				continue; 
			}
			// we only get properties from the front end that have a value
			if (typeof orderGarment[key] === "undefined") {
				// if it's null in the database, then there's no change
				if (original[key] === null) {
					continue;
				}
				else {
					// but if the database had a value before, it means the user has deleted the value, 
					// so we add it back into what the frontend submitted as a null
					orderGarment[key] = null;
				}
			} 
			if (original[key] !== orderGarment[key]) {
				changedColumns.push(key);
			}
		}

		// if we have changes, then save them
		if (changedColumns.length > 0) {
			// prepare our audit column values
			orderGarment.LastModifiedBy = user;
			orderGarment.LastModifiedDateTime = new Date().toLocaleString();
			changedColumns.push("LastModifiedBy");
			changedColumns.push("LastModifiedDateTime");

			// construct update statement
			let query = /*sql*/`UPDATE OrderGarment SET 
				${changedColumns.map(c => `${c}=@${c}`).join(", ")}
				WHERE OrderGarmentId=@OrderGarmentId`
			this.db.prepare(query).run(orderGarment)

			// update audit logs
			new AuditLogDao(this.db).update("OrderGarment", "OrderGarmentId", original, orderGarment )
		}

	}
	catch (ex) {
		console.log("error", ex)
		throw ex
	}


	}



}

