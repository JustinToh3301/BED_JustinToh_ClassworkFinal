const express = require('express');
const app = express();
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

app.get('/authors', async (req, res) => {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
    } catch (error) {
        res.status(500).json({ error: 'Unable to retrieve authors' });
    }
});

app.get('/about', (req, res) => {
res.send('My name is Justin from IT');
}); 






app.listen(3000, () => {
console.log('Listening on port 3000');});