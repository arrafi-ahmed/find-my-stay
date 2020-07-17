var db = require('./db');

module.exports ={
	insertInvoice: (invoice)=>{
		return new Promise((resolve, reject)=>{
			var sql = "insert into invoice (book_id, user_id, amount, host_id) values($1,$2,$3,$4);";
			db.execute(sql, [invoice.bookId, invoice.userId, invoice.amount, invoice.hostId], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	getInvoiceByBookId: (bookId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "SELECT id from invoice where book_id = $1;";
			db.getResult(sql, [bookId], (result)=>{
				if(result.length > 0){
					resolve(result[0]);
				}else{
					resolve(null);
				}
			});
		});
	},
	getStatEarn: (hostId,callback)=>{
		return new Promise((resolve, reject)=>{
			var sql = "SELECT coalesce(sum(amount), 0) earn from invoice where host_id = $1;";
			db.getResult(sql, [hostId], (result)=>{
				if(result.length > 0){
					resolve(result[0]);
				}else{
					resolve(null);
				}
			});
		});
	}
}