const mysql = require('mysql2/promise');

async function run() {
    // get the database connection
    const connection = await mysql.createConnection({
        'host':'localhost',
        'user':'root',
        'database':'sakila'
    })
    console.log(connection)

    let query = "select * from actor";
    let [rows] = await connection.execute(query);
    console.log(rows);
}

run();