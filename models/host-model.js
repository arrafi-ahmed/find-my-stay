var db = require('./db');

module.exports ={
	findHostById: (hostId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "select id from hosts where id=$1";
			db.getResult(sql, [hostId], (result)=>{
				if(result.length > 0){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	getHostById: (hostId)=>{
		return new Promise((resolve, reject)=>{
			var sql = "select TO_CHAR(dob :: DATE, 'YYYY-MM-DD') cdob, * from hosts where id=$1";
			db.getResult(sql, [hostId], (result)=>{
				if(result.length > 0){
					resolve(result[0]);
				}else{
					resolve(null);
				}
			});
		});
	},
	validateHost: (credential)=>{
		return new Promise((resolve, reject)=>{
			var sql = "select * from hosts where id=$1 and password=$2";
			db.getResult(sql, [credential.id, credential.password], (result)=>{
				if(result.length > 0){
					resolve([true, result[0].first_name, result[0].last_name, result[0].profile_photo]);
				}else{
					resolve(false);
				}
			});
		});
	},
	insertHost: (data)=>{
		return new Promise((resolve, reject)=>{
			var sql = "insert into hosts (id, password, first_name, last_name, email, phone, dob, gender, profile_photo, about) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);";
			db.execute(sql, [data.id, data.password, data.firstName, data.lastName, data.email, data.phone, data.dob, data.gender, data.profilePhoto, data.about], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	updateHost: (host)=>{
		return new Promise((resolve, reject)=>{
			var sql = "update hosts set password=$1, first_name=$2, last_name=$3, gender=$4, dob=$5, email=$6, phone=$7, about=$8, profile_photo=$9 where id=$10";
			db.execute(sql, [host.password, host.firstName, host.lastName, host.gender, host.dob, host.email, host.phone, host.about, host.profilePhoto, host.id], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	},
	updateHostWithoutImg: (host)=>{
		return new Promise((resolve, reject)=>{
			var sql = "update hosts set password=$1, first_name=$2, last_name=$3, gender=$4, dob=$5, email=$6, phone=$7, about=$8 where id=$9";
			db.execute(sql, [host.password, host.firstName, host.lastName, host.gender, host.dob, host.email, host.phone, host.about, host.id], (status)=>{
				if(status){
					resolve(true);
				}else{
					resolve(false);
				}
			});
		});
	}
}