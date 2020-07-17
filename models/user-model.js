var db = require('./db');

module.exports ={
	findUserById: (userId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "select id from users where id = $1";
			db.getResult(sql, [userId], (result)=>{
				if(result.length>0){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	getUserById: (userId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "select TO_CHAR(dob :: DATE, 'YYYY-MM-DD') cdob, * from users where id = $1";
			db.getResult(sql, [userId], (result)=>{
				if(result.length>0){
					resolve(result[0]);
				}else{
					resolve(null);
				}
			});
		});
	},
	validateUser: (credential)=>{
		return new Promise((resolve, reject)=>{
			var sql = "select * from users where id = $1 and password = $2";
			db.getResult(sql, [credential.id, credential.password], (result)=>{
				if(result.length > 0){
					resolve([true, result[0].first_name, result[0].last_name, result[0].profile_photo]);
				}else{
					resolve(false);
				}
			});
		});
	},
	insertUser: (data)=>{
		return new Promise((resolve, reject)=>{
			var sql = "insert into users (id, password, first_name, last_name, email, phone, dob, gender, profile_photo, address, city, country) values( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);";
			db.execute(sql, [data.id, data.password, data.firstName, data.lastName, data.email, data.phone, data.dob, data.gender, data.profilePhoto, data.address, data.city, data.country], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	updateUser: (user)=>{
		return new Promise((resolve, reject)=>{
			var sql = "update users set password=$1, first_name=$2, last_name=$3, gender=$4, dob=$5, email=$6, phone=$7, address=$8, city=$9, country=$10, profile_photo=$11 where id=$12";
			db.execute(sql, [user.password, user.firstName, user.lastName, user.gender, user.dob, user.email, user.phone, user.address, user.city, user.country, user.profilePhoto, user.id], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},	
	updateUserWithoutImg: (user)=>{
		return new Promise((resolve, reject)=>{
			var sql = "update users set password=$1, first_name=$2, last_name=$3, gender=$4, dob=$5, email=$6, phone=$7, address=$8, city=$9, country=$10 where id=$11";
			db.execute(sql, [user.password, user.firstName, user.lastName, user.gender, user.dob, user.email, user.phone, user.address, user.city, user.country, user.id], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	}	
}