







const express = require('express');
const sql = require('mssql');

const app = express();
app.use(express.json());

const PORT = 3000;

const Joi = require('joi');
const copySchema = Joi.object({
  isbn : Joi.string().length(10).required(),
  copyNo: Joi.number().integer().min(1).required()

}); 



app.get('/', (req, res) => {
  res.send('Welcome to the Book Category API');
});

app.get('/categories', (req, res) => {
  res.json([
    { id: 1, name: 'Fiction' },
    { id: 2, name: 'Non-Fiction' },
    { id: 3, name: 'Biography' }
  ]);
});

const dbConfig = {
  server: 'localhost',
  port: 1433,
  database: 'NPBookstore',
  user: 'S10278183G',
  password: '5Aisawesome',
  options: { trustServerCertificate: true },
};

async function closeConnection(connection) {
  if (connection) {
    try {
      await connection.close();
    } catch (closeError) {
      console.error('Error closing connection:', closeError);
    }
  }
}

// GET all authors
app.get('/authors', async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request().query('SELECT AuthorID, Name FROM Author');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('GET /authors error:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    await closeConnection(connection);
  }
});

// GET one author



  
app.get('/authors/:id', async (req, res) => {
  const authorId = parseInt(req.params.id, 10);
  if (isNaN(authorId)) {
    return res.status(400).json({ error: 'Invalid author id' });
  }
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('id', sql.Int, authorId);
    const result = await request.query('SELECT AuthorID, Name FROM Author WHERE AuthorID = @id');
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('GET /authors/:id error:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    await closeConnection(connection);
  }
});

// POST a new author


app.post('/authors', async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('id', sql.Int, req.body.id);
    request.input('name', sql.NVarChar, req.body.name);
    const result = await request.query(
      'INSERT INTO Author (AuthorID, Name) OUTPUT INSERTED.* VALUES (@id, @name)'
    );
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('POST /authors error:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    await closeConnection(connection);
  }
});

// PUT: change an author's name
app.put('/authors/:id', async (req, res) => {
  const authorId = parseInt(req.params.id, 10);
  if (isNaN(authorId)) {
    return res.status(400).json({ error: 'Invalid author id' });
  }
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('id', sql.Int, authorId);
    request.input('name', sql.NVarChar, req.body.name);
    const result = await request.query(
      'UPDATE Author SET Name = @name OUTPUT INSERTED.* WHERE AuthorID = @id'
    );
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('PUT /authors/:id error:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    await closeConnection(connection);
  }
});

// DELETE an author
app.delete('/authors/:id', async (req, res) => {
  const authorId = parseInt(req.params.id, 10);
  if (isNaN(authorId)) {
    return res.status(400).json({ error: 'Invalid author id' });
  }
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('id', sql.Int, authorId);
    const result = await request.query('DELETE FROM Author WHERE AuthorID = @id');
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /authors/:id error:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    await closeConnection(connection);
  }
});

app.get("/publishers/:id" , async (req , res) => {
  const publisherId = parseInt(req.params.id)
  if (isNaN(publisherId)){
    return res.status(400).json({error: "ID not found. Try again."})
  }
  
  let connection;
  try{
  connection = await sql.connect(dbConfig);
  const request = connection.request();
  request.input("id" , sql.Int , publisherId)
  const result = await request.query("SELECT PublisherID , Name FROM Publisher WHERE PublisherID = @id;")
  if (result.recordset.length === 0){
    return res.status(404).json("Error 404 , Not Found")
  }

  res.status(200).json(result.recordset[0]); 
  }
  catch (err){
    console.error("GET /publisher/:id" , err)
    res.status(500).json({error: "Database Error"})
  }
  finally{
    await closeConnection(connection)
  }

});

app.get("/publishers" , async (req , res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig); 
    const result = await connection.request().query("SELECT PublisherID , Name FROM Publisher;"); 
    res.status(200).json(result.recordset)}
    
  catch (err) {console.error ("Get /publishers" , err)
    
    res.status(500).json({error: "Database Error"})}
    
  finally {
      await closeConnection(connection)
    }
    
  }
);


//GET books

app.get('/books', async (req, res) => {
  try {
    const connection = await sql.connect(dbConfig);
    const result = await connection 
      .request()
      .query('SELECT ISBN, Title, YearPublish, PublisherID, BookCat FROM Book');

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


app.get('/books/:isbn' , async (req , res) => {
  let connection; 
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('isbn' , sql.Char(10) , req.params.isbn);
    const result = await request.query('SELECT ISBN , Title , YearPublish , PublisherID , BookCat FROM Book WHERE ISBN = @isbn')
    if (result.recordset.length === 0){
      res.status(400).json({error: 'Not Found'}); 
    }
    res.status(200).json(result.recordset[0]);
  }
  catch (err){
    console.error(err);
    res.status(500).json({error: 'Database Error'});

  }
  finally{
    if (connection) await connection.close();
  }

})

app.post("/books" , async (req , res) => {
  const { isbn , title , yearPublish , publisherId , bookCat , authorId} = req.body;
  let connection;
  let transaction;
  try{
  
  const transaction = new sql.Transaction(await sql.connect(dbConfig));
  await transaction.begin(); 
  const bookRequest = transaction.request();
  bookRequest.input('isbn' , sql.Char(10) , isbn);
  bookRequest.input('title' , sql.VarChar(200) , title);
  bookRequest.input('yearPublish' , sql.Char(4) , yearPublish);
  bookRequest.input('publisherId' , sql.SmallInt, publisherId);
  bookRequest.input('bookCat' , sql.Char(2), bookCat); 
  const bookResult = await bookRequest.query("INSERT INTO Book (ISBN , title , YearPublish , publisherId , bookCat)" +
    'OUTPUT INSERTED.* VALUES (@isbn , @title , @yearPublish , @publisherId , @bookCat)');   
  
  const authorRequest = transaction.request();
  authorRequest.input("isbn" , sql.Char(10) , isbn);
  authorRequest.input("authorId" , sql.SmallInt , authorId); 
  await authorRequest.query("INSERT INTO BookAuthor (ISBN , AuthorID) VALUES (@isbn , @authorId)"); 
  await transaction.commit(); 

  res.status(201).json(bookResult.recordset[0]);}
  catch (err) {
    console.error(err); 
    if(transaction){
      try{
        await transaction.rollback();

      } catch (rollbackErr) {
        console.error(rollbackErr);
      }
    }
    res.status(500).json({error: "Database error"}); 
  } 
  finally {
    if (connection) await connection.close(); 
  }



});

//get only one copy of book. 
app.get('/books/:isbn/copies/:copyNo' , async (req , res) => {
  let connection;
  try{
    connection = await sql.connect(dbConfig); 
    const request = connection.request();
    request.input('isbn' , sql.Char(10) , req.params.isbn);
    request.input('copyNo' , sql.TinyInt , req.params.copyNo); 
    const result = await request.query("SELECT ISBN , CopyNo , RentalRate , Status FROM BookCopy WHERE ISBN = @isbn AND CopyNo = @copyNo"); 
    if (result.recordset.length === 0){
      return res.status(404).json({error: "Result is not found"})
    }
    res.status(200).json(result.recordset[0])
  } 
  catch (err) {console.error(err);
    res.status(500).json({error: "Database error"})
  }
  finally {
    if (connection) 
      await connection.close();
  }

}); 


/*
 * Key Notes for Express + mssql Composite-Key Routes (/books/:isbn/copies/:copyNo):
 * 1. Route & params: Express matches :isbn and :copyNo by name (order in path doesn't matter),
 *    and places them on req.params. Keep spelling/casing exact across route, req.params, and @SQL params.
 * 2. Data types: Use sql.Char(10) for ISBN (text, never parseInt), sql.TinyInt for copyNo,
 *    and sql.SmallMoney for rentalRate. Ensure app.use(express.json()) is enabled for req.body.
 * 3. Composite WHERE: Always filter by BOTH ISBN = @isbn AND CopyNo = @copyNo on GET, PUT, and DELETE
 *    so updates or deletes don't affect every copy of a book.
 * 4. SELECT vs. UPDATE/DELETE results:
 *    - SELECT uses result.recordset (check recordset.length === 0 -> 404; return recordset[0] -> 200).
 *    - UPDATE/DELETE use result.rowsAffected[0] (check rowsAffected[0] === 0 -> 404).
 *    - PUT uses OUTPUT INSERTED.* so result.recordset[0] returns the updated row (200).
 *    - DELETE returns 204 with no body: res.status(204).send().
 * 5. Flow & cleanup: Always `return` early on 404s to avoid duplicate responses, return 500 in catch
 *    (including SQL constraint/type errors), and close the connection in `finally`.
 */


//PUT : change one copy's rental rate 

app.put('/books/:isbn/copies/:copyNo' , async (req , res) => {
  let connection;
  try{
    connection = await sql.connect(dbConfig); 
    const request = connection.request();
    request.input('isbn' , sql.Char(10) , req.params.isbn);
    request.input('copyNo' , sql.TinyInt , req.params.copyNo); 
    request.input('rentalRate' , sql.SmallMoney , req.body.rentalRate); 
    const result = await request.query("UPDATE BookCopy SET RentalRate = @rentalRate OUTPUT INSERTED.* WHERE ISBN = @isbn AND CopyNo = @copyNo "); 
    if (result.rowsAffected[0] === 0){
      return res.status(404).json({error : "Not found"}); 
    }
    res.status(200).json(result.recordset[0]);}
    catch (err) {console.error(err);
      res.status(500).json({error: 'Database error'}); 
    }
    finally {
      if (connection) await connection.close(); 
    }
  });


//DELETE almost similar structure to PUT but remove rental rate and change UPDATE to DELETE

app.delete('/books/:isbn/copies/:copyNo' , async (req , res) => {
  let connection;
  try{
    connection = await sql.connect(dbConfig); 
    const request = connection.request();
    request.input('isbn' , sql.Char(10) , req.params.isbn);
    request.input('copyNo' , sql.TinyInt , req.params.copyNo); 
     
    const result = await request.query("DELETE FROM BookCopy WHERE  ISBN = @isbn AND CopyNo = @copyNo "); 
    if (result.rowsAffected[0] === 0){
      return res.status(404).json({error : "Not found"}); 
    }
    res.status(204).send();}
    catch (err) {console.error(err);
      res.status(500).json({error: 'Database error'}); 
    }
    finally {
      if (connection) await connection.close(); 
    }
  });


  //Check Availability and then mark Rented. No need (req , res) for available or markRent
  // Use PUT (UPDATE) , only result

async function CheckAvailable(isbn , copyNo){
    let connection;
    try{
      connection = await sql.connect(dbConfig);
      const result = await connection.request()
      .input("isbn" , sql.Char(10) , isbn)
      .input("copyNo" , sql.TinyInt , copyNo) 
      .query("SELECT Status FROM BookCopy WHERE ISBN = @isbn AND CopyNo = @copyNo");
      if (result.recordset.length === 0) return null; 
      return result.recordset[0].Status === "D";
    } finally {if (connection) {await connection.close()}; 

  }}
  
async function markRented(isbn , copyNo){
  let connection;
  try{
    connection = await sql.connect(dbConfig);
    await connection.request()
    .input("isbn" , sql.Char(10) , isbn) 
    .input("copyNo" , sql.TinyInt , copyNo)
    .query("UPDATE BookCopy SET Status = 'M' WHERE ISBN = @isbn AND CopyNo = @copyNo ");
    

  } finally {if(connection){await connection.close();}}; 
}

 // HELPER FUNCTIONS CONNECTED TO DB , NO NEED FOR PUT TO CONNECT. 
app.put("/books/:isbn/copies/:copyNo/rent" , async (req , res) => {
    const {error , value } = copySchema.validate(req.params);
    if (error) return res.status(400).json({error: error.details[0].message});
  
    const isbn = value.isbn;
    const copyNo = value.copyNo; 
    try{
      const available = await CheckAvailable(isbn , copyNo); 
      if (available === null) return res.status(404).json({error : "Error 404 Not Found"});
      if (available === false) return res.status(409).json({error : "Copy is rented out"}); 
      await markRented(isbn , copyNo); 
      res.status(200).json({ ISBN: isbn, copyNo: copyNo, Status: 'M' });

    } catch(err){
      console.error(err);
      res.status(500).json({error: "Database not Found."});
    }
  });

async function markReturned(isbn , copyNo){
  let connection;
  
  try{
    connection = await sql.connect(dbConfig);
    await connection.request()
    .input('isbn' , sql.Char(10) , isbn)
    .input('copyNo' , sql.TinyInt() , copyNo)
    .query("UPDATE BookCopy SET Status = 'D' WHERE ISBN = @isbn AND CopyNo = @copyNo");
    

  } finally {if (connection) await connection.close();} 
}


app.put("/books/:isbn/copies/:copyNo/return" , async (req , res) => {
  const {error , value} = copySchema.validate(req.params);
  if (error) return res.status(400).json({error: error.details[0].message});
  const isbn = value.isbn;
  const copyNo = value.copyNo; 
  let connection;
  try{
   
    const available = await CheckAvailable(isbn , copyNo);
    if (available === null){return res.status(404).json({error: "Error 404 , not found"});}
    if (available === true){return res.status(409).json({error: "Copy is not rented"});}
    await markReturned(value.isbn , value.copyNo); 
    res.status(200).json({ISBN: value.isbn, copyNo: value.copyNo, Status: 'D'}); 
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({error : "Database Error"});

  }
  finally{if (connection) {await connection.close()}}
  });



















app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});