const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const fs = require("fs"); // import in the file system
const mysql = require("mysql2/promise");

let app = express();
// set which view engine to use
app.set("view engine", "hbs");

// set where to find the static files
app.use(express.static("public"));

// setup wax on for template inheritance
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// setup forms
app.use(
  express.urlencoded({
    extended: false,
  })
);

const helpers = require("handlebars-helpers")({
  handlebars: hbs.handlebars,
});

async function main() {
  // creating the connection is an asynchronous procedure,
  // so we must use await
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "sakila",
  });

  app.get("/", async (req, res) => {
    // connection.execute is async
    let [actors, fields] = await connection.execute("select * from actor");
    res.render("actors.hbs", {
      actors: actors,
    });
  });

  app.get("/actor/create", async (req, res) => {
    res.render("create_actor.hbs");
  });

  app.post("/actor/create", async (req, res) => {
    let firstName = req.body.first_name;
    let lastName = req.body.last_name;

    await connection.execute(
      `insert into actor (first_name, last_name)
                                  values (?, ?)`,
      [firstName, lastName]
    );

    res.redirect("/");
  });

  // the :actor_id placeholder is for the url to specify which actor we are editing
  app.get("/actor/:actor_id/update", async (req, res) => {
    let [
      actors,
    ] = await connection.execute(`select * from actor where actor_id = ?`, [
      req.params.actor_id,
    ]);
    let theActor = actors[0];

    res.render("edit_actor.hbs", {
      actor: theActor,
    });
  });

  app.post("/actor/:actor_id/update", async (req, res) => {
    let firstName = req.body.first_name;
    let lastName = req.body.last_name;
    let actorId = req.params.actor_id;

    await connection.execute(
      `update actor set first_name = ?, last_name=?
                                WHERE actor_id = ?`,
      [firstName, lastName, actorId]
    );

    res.redirect("/");
  });

  app.get("/actor/:actor_id/delete", async (req, res) => {
    let theActorToDelete = req.params.actor_id;
    // BUT we will always get an array back from connection.execute EVEN if there is only one result
    let [
      actors,
    ] = await connection.execute(`select * from actor where actor_id= ?`, [
      theActorToDelete,
    ]);
    let theActor = actors[0];
    // res.send(theActor);

    res.render("delete_actor.hbs", {
      actor: theActor,
    });
  });

  app.post("/actor/:actor_id/delete", async (req, res) => {
    let actor_id = req.params.actor_id;
    await connection.execute(`delete from actor where actor_id = ?`, [
      actor_id,
    ]);
    res.redirect("/");
  });

  app.get("/languages", async (req, res) => {
    let [languages] = await connection.execute("select * from language");

    res.render("languages.hbs", {
      lang: languages,
    });
  });

  app.get("/countries", async (req, res) => {
    let [countries] = await connection.execute("select * from country");
    res.render("countries.hbs", {
      countries: countries,
    });
  });

  app.get("/cities", async (req, res) => {
    // when we do a R for a weak entity that is 1:M relationship
    // -- to get the full details, we have to do a join
    let [cities] = await connection.execute(`
            select * from city join country on
            city.country_id = country.country_id`);
    // res.send(cities);
    res.render("cities.hbs", {
      cities: cities,
    });
  });

  app.get("/city/create", async (req, res) => {
    let [countries] = await connection.execute("select * from country");
    res.render("create_city", {
      countries: countries,
    });
  });

  app.post("/city/create", async (req, res) => {
    // await connection.execute(`
    //     insert into city (city, country_id)
    //     VALUES (?, ?)`, [
    //         req.body.city,
    //         req.body.country_id
    //     ])
    let city = req.body.city;
    let country_id = req.body.country_id;
    await connection.execute(
      `insert into city (city, country_id)
                VALUES (?, ?)`,
      [city, country_id]
    );
    res.redirect("/cities");
  });

  app.get("/city/:city_id/update", async (req, res) => {
    let [countries] = await connection.execute("select * from country");
    let wantedCityID = req.params.city_id;
    let [
      cities,
    ] = await connection.execute(`select * from city where city_id = ?`, [
      wantedCityID,
    ]);
    let theCity = cities[0];
    res.render("edit_city", {
      countries: countries,
      city: theCity,
    });
  });

  app.post("/city/:city_id/update", async (req, res) => {
    let city = req.body.city;
    let country_id = req.body.country_id;
    await connection.execute(
      `
            update city set city= ?, country_id = ?
            WHERE city_id= ?`,
      [city, country_id, req.params.city_id]
    );
    res.redirect("/cities");
  });

  app.get("/stores", async (req, res) => {
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
    res.render("stores.hbs", {
      stores: stores,
    });
  });

  app.get("/films", async (req, res) => {
    /*
        Sample query:
            select * from film
        */
    let [results] = await connection.execute("select * from film");

    res.render("films", {
      films: results,
    });
  });

  app.get("/films/create", async (req, res) => {
    let [languages] = await connection.execute("select * from language");
    let [actors] = await connection.execute("select * from actor");
    let [categories] = await connection.execute("select * from category");
    res.render("create_film", {
      languages: languages,
      actors: actors,
      categories: categories
    });
  });

  app.post("/films/create", async (req, res) => {
    //   res.send(req.body);
    // traditional method
    // let title = req.body.title;
    // let description = req.body.description;
    // let release_year = req.body.release_year;
    // let language_id = req.body.language_id;
    // let rental_duration = req.body.language_id;
    // let replacement_cost = req.body.replacement_cost;

    try {
      // begin a new transaction
      await connection.beginTransaction();
      // OR use the modern method (object destructuring)
      let {
        title,
        description,
        release_year,
        language_id,
        rental_duration,
        replacement_cost,
        actor_id,
        category_id
      } = req.body;

      let [results] = await connection.execute(
        `
        insert into film 
        ( title, description, release_year, language_id, rental_duration, replacement_cost)
        values (?, ?, ?, ?, ?, ?)`,
        [
          title,
          description,
          release_year,
          language_id,
          rental_duration,
          replacement_cost,
        ]
      );

      // get the film_id of the film we just created
      let newFilmId = results.insertId;

      for (let eachActor of actor_id) {
        connection.execute(
          `insert into film_actor (actor_id, film_id)
            values (?, ?)`,
          [eachActor, newFilmId]
        );
      }

      for (let eachCategory of category_id) {
        connection.execute(`insert into film_category (film_id, category_id) values (?, ?)`, 
                            [newFilmId, eachCategory]);
                            
      }

      connection.commit();
      res.redirect("/films");
    } catch (e) {
      console.log(e);
      connection.rollback();  
    }
  });

  app.get('/films/:film_id/update', async (req,res) => {
      let wanted_film_id = req.params.film_id;
      let [films] = await connection.execute("select * from film where film_id= ?", [wanted_film_id]);
      let wanted_film = films[0];

      let [languages] = await connection.execute("select * from language");
      let [actors] = await connection.execute("select * from actor");
      let [existing_actors] = await connection.execute('select actor_id from film_actor where film_id=?', [wanted_film_id])

      let [categories] = await connection.execute("select * from category");
      let [existingCategories] = await connection.execute("select * from film_category where film_id = ?", [wanted_film_id])
      existingCategoriesId = existingCategories.map(function(eachCateogry){
          return eachCateogry.category_id;
      })

      let existing_actor_ids = [];
      for (let a of existing_actors) {
          existing_actor_ids.push(a.actor_id);
      }

      return res.render('update_film', {
          'wanted_film': wanted_film,
          'languages': languages,
          'actors': actors,
          'existing_actors': existing_actor_ids,
          'existing_categories': existingCategoriesId,
          'categories': categories
      })


  })

  app.post('/films/:film_id/update', async (req, res)=>{
      console.log("UPDATING FILM");
      console.log(req.params.film_id);
    let [existing_actors] = await connection.execute('select actor_id from film_actor where film_id = ?', [req.params.film_id]);
    // let existing_actor_ids = [];
    // for (let a of existing_actors) {
    //     existing_actor_ids.push(a.actor_id);
    // }
    let existing_actor_ids = existing_actors.map( a => a.actor_id);  
    let new_actor_ids = req.body.actor_id;
    console.log(existing_actor_ids);
    console.log(new_actor_ids);
    try {
        await connection.beginTransaction();
        for (let id of existing_actor_ids) {
            if (new_actor_ids.includes(id + "") == false) {
                let sql = `delete from film_actor where film_id=${req.params.film_id} AND actor_id=${id}`;
                console.log(sql);
                connection.execute("delete from film_actor where film_id=? AND actor_id=?",[
                    req.params.film_id, id
                ])
            }
        }

        for (let id of new_actor_ids) {
            if (existing_actor_ids.includes(parseInt(id)) == false) {
                connection.execute(`insert into film_actor (film_id, actor_id) values (?, ?)`, [
                    req.params.film_id, id
                ])
            }
        }

        // the easy way
        // 1. delete all the existing categories from the film
        await connection.execute("delete from film_category where film_id = ?", [req.params.film_id]);

        // 2. add back all the categories that the user has selected
        let selectedCategories;
        // if no categories selected
        if (!req.body.category_id) {
            selectedCategories = [];
        } 
        // if one category selected
        if (!Array.isArray(req.body.category_id)) {
            selectedCategories = [ req.body.category_id];
        } else {
            // if > 1 category selected
            selectedCategories = req.body.category_id;
        }
        for (let eachCategoryId of selectedCategories) {
            connection.execute('insert into film_category (film_id, category_id) values (?, ?)', [
                req.params.film_id,
                eachCategoryId
            ])
        }


        // extract out the existing category_ids of the film
        /* the complicated but correct way */

        // let [existingCategories] = await connection.execute("select * from film_category where film_id = ?", [req.params.film_id]);
        // let existingCategoriesId = existingCategories.map(function(category){
        //     return category.category_id
        // });

        // let selectedCategoriesId = req.body.category_id;
        // if (!selectedCategoriesId) {
        //     selectedCategoriesId = [];
        // }
        // if (!Array.isArray(selectedCategoriesId)) {
        //     selectedCategoriesId = [selectedCategoriesId];
        // }

        // selectedCategoriesId = selectedCategoriesId.map(function(category_id){
        //     return parseInt(category_id);
        // });

        // for (let existingCategoryId of existingCategoriesId) {
        //     // if this particular existingCategoryId is not in the new categories id, we remove)
        //     if (selectedCategoriesId.includes(existingCategoryId) == false) {
        //         await connection.execute(`delete from film_category where film_id = ? and category_id = ?`, [
        //             req.params.film_id, existingCategoryId
        //         ])
        //     }
        // }
        // console.log("----- categories id----");
        // console.log(selectedCategoriesId);
        // console.log(existingCategoriesId);

    

        // for (let selectedCategoryId of selectedCategoriesId) {
        //     if (existingCategoriesId.includes(selectedCategoryId) == false) {
        //         await connection.execute('insert into film_category (film_id, category_id) values (?, ?)',
        //         [
        //             req.params.film_id,
        //             selectedCategoryId
        //         ]);
        //     }
        // }

        await connection.execute(`update film set title=?,
                                              description=?,
                                              release_year=?,
                                              language_id=?,
                                              rental_duration=?,
                                              replacement_cost=? 
                                              where film_id = ?`,[
                                                  req.body.title,
                                                  req.body.description,
                                                  req.body.release_year,
                                                  req.body.language_id,
                                                  req.body.rental_duration,
                                                  req.body.replacement_cost,
                                                  req.params.film_id     
                                              ])


        await connection.commit();
        res.redirect('/films')
    } catch (e) {
        console.log(e);
        connection.rollback();
        res.send(e);
    }
 
})

} //  end mains



main();

app.listen(3000, () => {
  console.log("Server started");
});
