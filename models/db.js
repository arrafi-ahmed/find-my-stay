const { Pool } = require('pg');
const conString = process.env.DATABASE_URL;
const pool = new Pool({
	connectionString: conString,
		ssl: process.env.DATABASE_URL ? true : false  //ssl: {rejectUnauthorized: false}
});

module.exports ={
	getResult: (sql, params, callback)=>{
		pool.query(sql, params, (error, results)=>{
			if(!error){
				callback(results.rows);
			}else{
				console.log(error.stack);
				callback(null);
			}
		});
	},
	execute: (sql, params, callback)=>{
		pool.query(sql, params, (error, result)=>{
			if(result){
				callback(true);
			}else{
				console.log(error.stack);
				callback(false);				
			}
		});
	}
}