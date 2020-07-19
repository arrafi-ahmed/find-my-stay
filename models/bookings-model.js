var db = require('./db');

module.exports ={
	getBookingByHost: (hostId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "SELECT TO_CHAR(start_date :: DATE, 'YYYY-MM-DD') cstart_date, TO_CHAR(end_date :: DATE, 'YYYY-MM-DD') cend_date, c.*, p.name FROM bookings c, property p WHERE (c.property_id = p.id) AND (c.host_id = $1) order by c.id desc;";
			db.getResult(sql, [hostId], (result)=>{
				if(result.length > 0){
					resolve(result);
				}else{
					resolve(null);
				}
			});
		});
	},
	getBookingPropertyByUser: (userId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "SELECT TO_CHAR(start_date :: DATE, 'YYYY-MM-DD') cstart_date, TO_CHAR(end_date :: DATE, 'YYYY-MM-DD') cend_date, c.*, p.name FROM bookings c, property p WHERE (c.property_id = p.id) AND (c.user_id = $1) order by c.id desc;";
			db.getResult(sql, [userId], (result)=>{
				if(result.length > 0){
					resolve(result);
				}else{
					resolve(null);
				}
			});
		});
	},
	checkBookingByUserProperty: (bookId, propertyId, userId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "SELECT id from bookings where id = $1 and property_id = $2 and user_id = $3 and status = 2;";
			db.getResult(sql, [bookId, propertyId, userId], (result)=>{
				if(result.length > 0){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	insertBooking: (property)=>{
		return new Promise((resolve, reject)=>{
			var sql = "insert into bookings (property_id, total_amount, start_date, end_date, status, user_id, host_id) values($1,$2,$3,$4,$5,$6,$7)";
			db.execute(sql, [booking.propertyId, booking.totalAmount, booking.startDate, booking.endDate, booking.status, booking.userId, booking.hostId], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	acceptBooking: (bookId, hostId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "update bookings set status = 1 where id = $1 and host_id = $2;";
			db.execute(sql, [bookId, hostId], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	paidBooking: (bookId, hostId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "update bookings set status = 2 where id = $1 and host_id = $2;";
			db.execute(sql, [bookId, hostId], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	completeBooking: (bookId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "update bookings set status = 3 where id = $1;";
			db.execute(sql, [bookId], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	invoicedBooking: (bookId, hostId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "update bookings set status = 4 where id = $1 and host_id = $2;";
			db.execute(sql, [bookId, hostId], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	declineBooking: (bookId, hostId)=>{ //for host
		return new Promise((resolve, reject)=>{
			var sql = "delete from bookings where id = $1 and host_id = $2;";
			db.execute(sql, [bookId, hostId], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	deleteBooking: (bookId, userId)=>{ //for user
		return new Promise((resolve, reject)=>{
			var sql = "delete from bookings where id = $1 and user_id = $2 and status = 0;";
			db.execute(sql, [bookId, userId], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	getStatRecievedBook: (hostId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "SELECT count(id) book from bookings where host_id = $1;";
			db.getResult(sql, [hostId], (result)=>{
				if(result.length > 0){
					resolve(result[0]);
				}else{
					resolve(null);
				}
			});
		});
	},
	getStatApprovedBook: (hostId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "SELECT count(id) book from bookings where status = 1 and host_id = $1;";
			db.getResult(sql, [hostId], (result)=>{
				if(result.length > 0){
					resolve(result[0]);
				}else{
					resolve(null);
				}
			});
		});
	},
	getStatPaidBook: (hostId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "SELECT count(id) book from bookings where status = 0 and host_id = $1;";
			db.getResult(sql, [hostId], (result)=>{
				if(result.length > 0){
					resolve(result[0]);
				}else{
					resolve(null);
				}
			});
		});
	},
	getStatReview: (hostId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "SELECT count(id) book from bookings where status = 2 and host_id = $1;";
			db.getResult(sql, [hostId], (result)=>{
				if(result.length > 0){
					resolve(result[0]);
				}else{
					resolve(null);
				}
			});
		});
	},
	searchBooking: (query)=>{
		return new Promise((resolve, reject)=>{
			var sql = "SELECT p.* FROM property p LEFT JOIN bookings b ON b.start_date < TO_DATE($1, 'YYYY-MM-DD') AND b.end_date > TO_DATE($2, 'YYYY-MM-DD') AND b.property_id = p.id WHERE (city ILIKE $3 OR country ILIKE $4 OR country ILIKE $4) AND type in ($5, $6) AND b.id IS NULL;";
			db.getResult(sql, [query.checkout, query.checkin, query.location[0], query.location[1], query.type[0], query.type[1]], (result)=>{
				if(result.length > 0){
					resolve(result);
				}else{
					resolve(null);
				}
			});
		});
	},
	findBooking: (propertyId, checkin, checkout)=>{
		return new Promise((resolve, reject)=>{
			var sql = "select id from bookings where property_id = $1 and (start_date < TO_DATE($2, 'YYYY-MM-DD') and end_date > TO_DATE($3, 'YYYY-MM-DD')) limit 1;";
			db.getResult(sql, [propertyId, checkout, checkin], (result)=>{
				if(result[0]){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	}
}