var db = require('./db');

module.exports ={
	getRecentContacts: (id)=>{
		return new Promise((resolve, reject)=>{
			var sql = "SELECT CASE WHEN receiver = $1 THEN sender ELSE receiver END AS id, max(time) AS time FROM message WHERE receiver = $1 OR sender = $1 GROUP BY CASE WHEN receiver = $1 THEN sender ELSE receiver END;";
			db.getResult(sql, [id], (results)=>{
				if(results.length > 0){
					resolve(results);
				}else{
					resolve(null);
				}
			});
		});
	},
	getMessageById: (cookieId, paramsId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "SELECT TO_CHAR(time, 'YYYY-MM-DD HH:MI:SS') ctime, * from message where (receiver = $1 or receiver = $2) and (sender = $3 or sender = $4);";
			db.getResult(sql, [cookieId, paramsId, cookieId, paramsId], (results)=>{
				if(results.length > 0){
					resolve(results);
				}else{
					resolve(null);
				}
			});
		});
	},
	sendMessage: (message)=>{
		return new Promise((resolve, reject)=>{
			var sql = "insert into message (receiver, content, sender, is_invoice) values($1,$2,$3,$4)";
			db.execute(sql, [message.receiver, message.content, message.sender, message.isInvoice], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	checkInvoice: (messageId, username)=>{
		return new Promise((resolve, reject)=>{
			var sql = "select content from message where id = $1 and (sender = $2 or receiver = $3);";
			db.getResult(sql, [messageId, username, username], (result)=>{
				if(result.length > 0){
					resolve(result[0]);
				}else{
					resolve(null);
				}
			});
		});
	}
}