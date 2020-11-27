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