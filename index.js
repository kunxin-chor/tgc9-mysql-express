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

    app.get('/actor/create', async(req,res)=>{
        res.render('create_actor.hbs');
    })

    app.post('/actor/create', async(req,res)=>{
        let firstName = req.body.first_name;
        let lastName = req.body.last_name;

        await connection.execute(`insert into actor (first_name, last_name)
                                  values (?, ?)`, [firstName, lastName]);

        res.redirect('/');

    });

    // the :actor_id placeholder is for the url to specify which actor we are editing
    app.get('/actor/:actor_id/update', async (req,res)=>{
        let [actors] = await connection.execute(`select * from actor where actor_id = ?`,
         [req.params.actor_id]);
        let theActor = actors[0];
 
        res.render('edit_actor.hbs',{
            'actor': theActor
        });
    })  

    app.post('/actor/:actor_id/update', async (req,res)=>{
       let firstName = req.body.first_name;
       let lastName = req.body.last_name;
       let actorId = req.params.actor_id;

       await connection.execute(`update actor set first_name = ?, last_name=?
                                WHERE actor_id = ?`, [firstName, lastName, actorId])

       res.redirect('/');

    })

    app.get('/actor/:actor_id/delete', async(req,res)=>{
        let theActorToDelete = req.params.actor_id;
        // BUT we will always get an array back from connection.execute EVEN if there is only one result
        let [actors] = await connection.execute(`select * from actor where actor_id= ?`, [theActorToDelete])
        let theActor = actors[0];
        // res.send(theActor);

        res.render('delete_actor.hbs',{
            'actor': theActor
        })
    })

    app.post('/actor/:actor_id/delete', async(req,res)=>{
        let actor_id = req.params.actor_id;
        await connection.execute(`delete from actor where actor_id = ?`, [actor_id]);
        res.redirect('/')
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
