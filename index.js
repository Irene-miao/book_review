import express from "express";
import bodyParser from "body-parser";
import { Pool } from "pg";
//import { createPool } from '@vercel/postgres';


const app = express();


// Parse req body
app.use(bodyParser.urlencoded({ extended: true}));

app.set('view engine', 'ejs');

// serve static files
app.use(express.static("public"));



// Connect to postgres database
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false
    }
  });
const client = await pool.connect();



// Get all books 
async function getBooks(){
const result = await client.query('select * from books');
return result.rows;

}

// Get all reviews
async function getReviews(){
    const result = await client.query('select * from reviews');
    return result.rows;
   
}


app.get("/", async(req, res) => {

    try {
     const books = await getBooks();
     const reviews = await getReviews();
    console.log(books);
    console.log(reviews);
     res.render("index.ejs", {
        books: books,
        reviews: reviews
     })
    }catch(err){
        console.log(err);
        res.render("index.ejs", {
            error: "Failure retrieving resource" + err.stack
        })
    };
});



app.post("/addBook", async (req, res) => {
 
   if (req.body.add === "book"){
    res.render("newBook.ejs");
} else {
    const title = req.body.title;
    const author = req.body.author;
    const synopsis = req.body.synopsis;
    const isbn = req.body.isbn;
   
   const result = await client.query('insert into books(title, author, synopsis, isbn) values ($1, $2, $3, $4) returning id", [title, author, synopsis, isbn]');
    const reviewId = result.rows[0].id;
  
   if (reviewId){
        res.redirect("/");
    }
   
}

});


app.post("/addReview", async (req, res)=> {
  
    if (req.body.add === "review") {
        res.render("newReview.ejs", {
            bookId: req.body.bookId
            
        });
    } else {
        console.log(req.body);
        const bookId = parseInt(req.body.bookId);
        const review = req.body.review;
        const rating = parseInt(req.body.rating);
        const result = await client.query('insert into reviews(book_id, review, rating) values($1, $2, $3) returning id", [bookId, review, rating]');
        console.log(result.rows);
        const reviewId = result.rows[0].id;
        if (reviewId) {
            res.redirect("/")
        }
    }

});


app.post("/editReview", async (req, res) => {
console.log(req.body);
const editReviewId = req.body.editReviewId;
if (req.body.edit === "review"){
    res.render("newReview.ejs", {
        reviewId : editReviewId
        
    })
} else {
    console.log(req.body);
    const review = req.body.review;
    const rating = parseInt(req.body.rating);
    const reviewId = parseInt(req.body.reviewId);
    await client.query('update reviews set review=$1, rating=$2 where id = $3", [review, rating, reviewId]');
    res.redirect("/");
}
});

app.post("/deleteBook", async (req, res)=> {
const deleteBookId = req.body.deleteBookId;
await client.query('delete from books where id = $1", [deleteBookId]');
res.redirect("/");
});

app.post("/deleteReview", async (req, res)=>{
console.log(req.body);
const deleteReviewId = req.body.deleteReviewId;
await client.query('delete from reviews where id = $1", [deleteReviewId]');
res.redirect("/");
});


app.listen(process.env.POSTGRES_PORT, ()=> {
    console.log(`Server running on port ${process.env.POSTGRES_PORT}`);
})