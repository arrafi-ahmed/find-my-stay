var db = require('./db');

module.exports ={
	getLatest3reviews: ()=>{
		return new Promise((resolve, reject)=>{
			var sql = "SELECT h.*, p.name, p.address, p.city, p.country, p.property_photo from review h, property p where h.property_id = p.id order by id desc limit 3;";
			db.getResult(sql, null, (results)=>{
				if(results.length > 0){
					resolve(results);
				}else{
					resolve(null);
				}
			});
		});
	},
	insertReview: (review)=>{
		return new Promise((resolve, reject)=>{
			var sql = "insert into review (user_id, property_id, rating, details, date) values($1,$2,$3,$4,$5);";
			db.execute(sql, [review.userId, review.propertyId, review.rating, review.details, review.date], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});		
	},
	get4ReviewsByProperty: (id)=>{
		return new Promise((resolve, reject)=>{
			var sql = "SELECT distinct r.user_id, TO_CHAR(date :: DATE, 'YYYY-MM-DD') rdate, r.id rid, r.rating rrating, r.*, u.first_name, u.last_name, u.country, u.profile_photo FROM review r, users u WHERE r.user_id = u.id and r.property_id = $1 order by rid desc limit 4;";
			db.getResult(sql, [id], (results)=>{
				if(results.length > 0){
					resolve(results);
				}else{
					resolve(null);
				}
			});
		});
	},
	getAllReviewsByProperty: (id)=>{
		return new Promise((resolve, reject)=>{
			var sql = "SELECT distinct r.user_id, TO_CHAR(date :: DATE, 'YYYY-MM-DD') rdate, r.id rid, r.rating rrating, r.*, u.first_name, u.last_name, u.country, u.profile_photo FROM review r, users u WHERE r.user_id = u.id and r.property_id = $1 order by rid desc;";
			db.getResult(sql, [id], (results)=>{
				if(results.length > 0){
					resolve(results);
				}else{
					resolve(null);
				}
			});
		});
	},
	getReviewsByUser: (userId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "SELECT TO_CHAR(date :: DATE, 'YYYY-MM-DD') rdate, r.*, p.name, p.city, p.country FROM review r, property p WHERE r.property_id = p.id and r.user_id = $1 order by date desc;";
			db.getResult(sql, [userId], (results)=>{
				if(results.length > 0){
					resolve(results);
				}else{
					resolve(null);
				}
			});
		});
	}
}