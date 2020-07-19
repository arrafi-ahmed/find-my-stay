var db = require('./db');

module.exports ={
	getPropertyById: (propertyId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "select ROUND(rating, 2) rrating, * from property where id=$1";
			db.getResult(sql, [propertyId], (result)=>{
				if(result.length > 0){
					resolve(result[0]);
				}else{
					resolve(null);
				}
			});
		});
	},
	getPropertyByHostId: (hostId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "select * from property where host_id=$1";
			db.getResult(sql, [hostId], (result)=>{
				if(result.length > 0){
					resolve(result);
				}else{
					resolve(null);
				}
			});
		});
	},
	getPropertyByIdHostId: (propertyId, hostId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "select * from property where id = $1 and host_id=$2";
			db.getResult(sql, [propertyId, hostId], (result)=>{
				if(result.length > 0){
					resolve(result[0]);
				}else{
					resolve(null);
				}
			});
		});
	},
	insertProperty: (property)=>{
		return new Promise((resolve, reject)=>{
			var sql = "insert into property (name, type, price, address, city, country, details, promote_status, property_photo, host_id) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);";
			db.execute(sql, [property.name, property.type, property.price, property.address, property.city, property.country, property.description, 0, property.propertyPhotos, property.hostId], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	deleteProperty: (propertyId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "delete from property where id=$1";
			db.execute(sql, [propertyId], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	updateProperty: (property)=>{
		return new Promise((resolve, reject)=>{
			var sql = "update property set name=$1, address=$2, city=$3, country=$4, details=$5, price=$6, type=$7, property_photo=$8 where id=$9";
			db.execute(sql, [property.name, property.address, property.city, property.country, property.description, property.price, property.type, property.propertyPhotos, property.propertyId], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	updatePropertyWithoutImg: (property)=>{
		return new Promise((resolve, reject)=>{
			var sql = "update property set name=$1, address=$2, city=$3, country=$4, details=$5, price=$6, type=$7 where id=$8";
			db.execute(sql, [property.name, property.address, property.city, property.country, property.description, property.price, property.type, property.propertyId], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	getPromoteInfo: ()=>{
        return new Promise((resolve, reject)=>{
            var sql = "select * from property where promote_status = 1;";
            db.getResult(sql, null, (result)=>{
            	if(result){
					resolve(result);
				}else{
					resolve(null);
				}
           });
        });
    },
	getPromoteStatus: ()=>{
		return new Promise((resolve, reject)=>{
			var sql = "select id, promote_status from property where promote_status = 1;";
			db.getResult(sql, null, (result)=>{
				if(result.length > 0){
					resolve(result[0]);
				}else{
					resolve(null);
				}
			});
		});
	},
	setPromoteStatusNull: (propertyId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "update property set promote_status = 0 where id=$1";
			db.execute(sql, [propertyId], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	setPromoteStatus: (propertyId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "update property set promote_status = 1 where id=$1";
			db.execute(sql, [propertyId], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	getPropertyByBookId: (bookId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "SELECT TO_CHAR(start_date :: DATE, 'YYYY-MM-DD') cstart_date, TO_CHAR(end_date :: DATE, 'YYYY-MM-DD') cend_date, p.id property_id, p.*, c.id book_id, c.* FROM property p, bookings c WHERE p.id = c.property_id and c.id =$1";
			db.getResult(sql, [bookId], (result)=>{
				if(result.length > 0){
					resolve(result[0]);
				}else{
					resolve(null);
				}
			});
		});
	},
	getStatProp: (hostId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "SELECT count(id) prop from property where host_id = $1;";
			db.getResult(sql, [hostId], (result)=>{
				if(result.length > 0){
					resolve(result[0]);
				}else{
					resolve(null);
				}
			});
		});
	},
	getHostByProperty: (propertyId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "select h.id hid, h.about, h.first_name, h.last_name, h.profile_photo, h.rating, h.rating_count from hosts h, property p where h.id = p.host_id and p.id = $1;";
			db.getResult(sql, [propertyId], (result)=>{
				if(result.length > 0){
					resolve(result[0]);
				}else{
					resolve(null);
				}
			});
		});
	},
	getPropertyRating: (propertyId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "select rating, rating_count from property where id = $1;";
			db.getResult(sql, [propertyId], (result)=>{
				if(result.length > 0){
					resolve(result[0]);
				}else{
					resolve(null);
				}
			});
		});
	},
	updatePropertyRating: (rating, propertyId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "update property set rating = $1, rating_count = $2 where id = $3;";
			db.execute(sql, [rating.newRating, rating.newRatingCount, propertyId], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	}
}