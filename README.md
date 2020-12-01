# Importing in the database

```
mysql -u root < sakila-schema.sql
mysql -u root < sakila-data.sql
```

# Dependencies

```
yarn add express
yarn add hbs
yarn add wax-on
yarn add handlebars-helpers
npm install -g nodemon
```

# Boilerplate Code
```
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

app.listen(3000, ()=>{
 console.log("Server started");
});
```

# Entering the database
```
mysql -u root
use sakila;
describe actor;
```

# How to write the route

1. First, add in the 
```
app.get('/<whatever-url>/, async(req,res)=>{

})
```

2. Figure out the query 

3. Test the query in mysql prompt

4. Once it works, use the connection to execute the query

5. Use `res.send` with the results, and then test the route
and see if it can send back the results

6. Create the hbs file and extend (but don't do the `#each` yet)

7. Create the final output using `#each`

# PSUEDO CODE FOR CRUD

## THE GENERIC FLOW

0. Look at the database and figure whether we are dealing
   with a strong entity, a weak entity using 1:M relationship,
   or a weak entity using M:N relationship
1. A route to recieve the request from the Client
   1. We need the URL (which URL does the cliebt goes to activate)
   2. The view function (`aysnc (req,res)`)
   3. Response -- .hbs (`res.render`) or a json response (`res.send`)?
2. A query that will the route will send to the DB
    1. 
3. A result that is sent from DB
4. A template (response) that will be sent back to the Client
   1. What do pass from the view function into the hbs file

This is also known the 3-Tier architecture

## READ
1. We decide what exactly we want to do retrieve from the database
2. Formulate the query for that, and we test using whatever storage system
(json files, API endpoints, MySQL, Mongo etc.)
3. Then we create a route 
4. In the route, execute the query and store the results
5. Send the results to the template file
```
              4. response
    + -------------------+
    |                    ^
    |      1. request    |        2. query       (json file, API etc.)
<Client> -----------> <server>  -------------->  <DB> 
                        ^                          |
                        |                          |
                        +--------------------------+
                                  3. results
```

## Create
1. The route must display a form for the user to fill in
   * addenum: just need some way for the user to provide data to the 
              route
              1. fill in a form
              2. upload a file
              3. through the URL
              4. through a JSON sent via axios

2. write the query to inser the data into storage (json file, API endpoint, database)
3. notify the user that it's done / redirect back to the listing page (depending on requirement)

For our dynamic web app, we need 2 routes

1. To display the form
   * If the field is a foreign key, we must use a select dropdown
   ** this means, we need a query to fetch all the possible selection for the
      select dropdown
   * if the field is a foreign key to a pivot table (meaning, it's a M:M), then
     we use the `<select>` but we must allow the user to select multiple
    * when creating the form, suggest the `name` attribute for each input
      to be the same as the columns in the table
    * use `<select>` to allow the user to choose from the possible foreign key
    * test the form
        * make sure the form shows up in the first place
        * make sure the when we submit is via POST
        * make sure all the fields are filled in correctly
        * make sure there are no missing fields
2. Process the form
    * first test: make sure to echo back (use `res.send` or `console.log`) and that there is no missing fields
    * extract out the fields that we want to insert into the database
    * write a test query
    * put the test query into the code and replace all the fixed values with question mark
    * use `connection.execute` with the query as the first argumnet, and an array of values to fill in as the second