const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');
const fs = require('fs'); // import in the file system
const mysql = require('mysql2/promise')

let app = express();
// set which view engine to use
app.set('view engine', 'hbs');

// set where to find the static files
app.use(express.static('public'))

// setup wax on for template inheritance
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');

// setup forms
app.use(express.urlencoded({
    extended:false
}))

const helpers = require('handlebars-helpers')({
  handlebars: hbs.handlebars
});

async function main() {
    // creating the connection is an asynchronous procedure,
    // so we must use await 
    const connection = await mysql.createConnection({
        'host':'localhost',
        'user':'root',
        'database': 'sakila'
    })

    app.get('/', async (req,res)=>{
        // connection.execute is async
        let [actors, fields] = await connection.execute('select * from actor');
        res.render('actors.hbs', {
            'actors': actors
        })
    })

    app.get('/languages', async (req, res) =>{
        let [languages] = await connection.execute('select * from language');

        res.render('languages.hbs', {
            'lang': languages
        })
    })

    app.get('/countries', async (req, res)=>{
        let [countries] = await connection.execute('select * from country');
        res.render('countries.hbs',{
            'countries': countries
        })
    })

    app.get('/stores', async (req,res)=>{
        /*
            select store.store_id, address, address2, first_name, last_name from store join staff
            on store.manager_staff_id = staff.staff_id
            join address ON
            store.address_id = address.address_id
        */
        let [stores] = await connection.execute(`
            select store.store_id, address, address2, first_name, last_name from store join staff
            on store.manager_staff_id = staff.staff_id
            join address ON
            store.address_id = address.address_id
        `);

        // res.send(stores);
        res.render('stores.hbs',{
            'stores': stores
        })
    })

}

main();

app.listen(3000, ()=>{
 console.log("Server started");
});
