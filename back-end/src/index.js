const express = require('express');
const app = express();
const query = require('./OpenAI/query');
const debounce = require('./debounce');

app.use(express.json());

app.post('/query', async(req, res) => {
    const body = req.body;

    if (
        !body || 
        !body.prompt || 
        !body.userId || 
        !body.maxTokens || 
        !body.stop
    ) {
        res.status(400).send('Bad request');

        return;
    };
    
    const response = await debounce(async() =>
        await query(body), 50)();

    res.status(200).json(response.data.choices);
});
  
let port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Back-end running on port ${port}`);
});