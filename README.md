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