const { faker } = require('@faker-js/faker'); 
const mysql = require('mysql2'); 

const express = require('express');
const app = express();  

app.use(express.static("public"));

const path = require("path");
const methodOverride = require("method-override");
app.use(methodOverride("_method")); 
app.use(express.urlencoded({extended : true})); //For Parsing Form Data


app.set("view engine", "ejs"); 
app.set("views", path.join(__dirname, "/views"));

const {v4 : uuid4 } = require("uuid");

const connection = mysql.createConnection({
      host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});



//GET/  Fetch and Show Total number of user in our app. Home Page


app.get("/", (req,res) => {
    let q = `SELECT COUNT(*) AS count FROM user`; //SQL command ;

    connection.query(q, (err,result) => {
        if( err ) {
            console.log(err);
            return res.send("DataBase error"); 
        }

        let count = result[0].count;
        console.log(count); 

        res.render("home.ejs", {count}); 
    });
});


//server is lishning 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});



// GET /user Fetch and show (userid, username, email) of all users 

app.get("/user", (req, res) => {
    let q = `SELECT * FROM user`; 
     connection.query(q, (err, users) => {
        if( err ) {
            console.log(err);
            return res.send("DataBase error"); 
        }


        // res.send(result); 
        res.render("showUser.ejs", { users });
    });
});


// GET api for edit Detail

app.get("/user/:id/edit", (req,res) => {
    let { id } = req.params; 
    let q = `SELECT * FROM user WHERE id='${id}'`; 

    connection.query(q, (err,result) => {
        if( err ) {
            console.log(err);
            return res.send("DataBase error"); 
        }
        console.log(result); 
        let user = result[0]; 
        res.render("editUsername.ejs", { user });
    });

})




//Update Data Base 

app.patch("/user/:id", (req, res) => {
   let { id } = req.params; 
   let {password: formPass, username: newUsername } = req.body;
   let q = `SELECT * FROM user WHERE id='${id}'`; 

    connection.query(q, (err,result) => {
        if( err ) {
            console.log(err);
            return res.send("DataBase error"); 
        }
        console.log(result); 
        let user = result[0];  
        if(formPass.trim() !== user.password.trim()){
                    return res.send("Wrong Password");
        }
        else
            {
                let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
                connection.query( q2, (err,result) => {
                     if( err ) {
                                console.log(err);
                                return res.send("DataBase error"); 
                                }
                       return res.redirect("/user");
                });
            }   
    });
});

//Delete User Info 

// app.get("/user/:id/delete", (req,res) => {
//     let {id} = req.params;
//     let q = `DELETE FROM user WHERE id='${id}';`;
//     connection.query(q, (err,result) => {
//             if(err)
//             {
//                 console.log(err);
//                 return res.send("DataBase error");
//             }
//             console.log(result);
//             return res.redirect("/user");
//     });
// }); 

app.get("/user/:id/delete/check", (req,res) => {
    let { id } = req.params; 
    let q = `SELECT * FROM user WHERE id='${id}'`; 

    connection.query(q, (err,result) => {
        if( err ) {
            console.log(err);
            return res.send("DataBase error"); 
        }
        console.log(result); 
        let user = result[0]; 
        res.render("deleteData.ejs", { user });
    });
});

app.post("/user/:id/delete", (req,res) => {
    const id = req.params.id; 
    const { email, password} = req.body; 

    const q = "SELECT * FROM user WHERE id=?"; 

    connection.query( q, [id], (err,result) => {
        if( err ) {
            console.log(err);
            return res.send("DataBase error"); 
        } 

        const user = result[0]; 
        if (user.email !== email && user.password !== password) {
            return res.send("Invalid email or password");
        }

         connection.query( "DELETE FROM user WHERE id=?",[id],(err,result) => {
                if( err ) {
                    console.log(err);
                    return res.send("DataBase error"); 
                } 


                return res.redirect("/user");
            }
        );

    });
});


//Join new user Info 
app.get("/user/join", (req,res) => {
     res.render("joinUser.ejs");
});

//Here i am adding form to database

app.post("/user/login", (req,res) => {
    
    const id = uuid4() ;

    const { username, email, password } = req.body;

    connection.query( "INSERT INTO user(id, username, email, password) VALUES(?,?,?,?)",  [id,username,email,password], (err,result) => {
                if(err)
                {
                    console.log(err);
                    return res.send("DataBase error");
                } 
                return res.redirect("/"); 
    });
});


// let getRandomser = () => { 
//   return [
//     faker.string.uuid(),
//     faker.internet.username(),
//     faker.internet.email(),
//     faker.internet.password(),
//   ];
// } 


// //Inserting data
// let q = "INSERT INTO user (id, username, email, password) VALUES ?";
// let data = [];
// for(let i = 1; i<=100; i++)
// {
//      data.push(getRandomser()); // ISERT 100 data 
// }


// try {
//       connection.query(q, [data], (err, result) => {
//         if(err) throw err;
//         console.log(result)
//     });
// } catch(err) {
//       console.log(err);
// } 

// connection.end();


