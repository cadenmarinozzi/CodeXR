const express = require('express');
const app = express();
const query = require('./OpenAI/query');
const debounce = require('./debounce');
const web = require('./web');

app.use(express.json());

const requestsPerMinute = 20;
let requests = 0;

function requestReset() {
    requests = 0;
    setTimeout(requestReset, 60000);
}

requestReset();

app.post('/query', async(req, res) => {
    if (requests >= requestsPerMinute) {
        res.status(400).send('Too many requests');

        return;
    }

    const body = req.body;

    if (
        !body || 
        !body.prompt || 
        !body.user || 
        !body.maxTokens || 
        !body.stop
    ) {
        res.status(400).send('Bad request');

        return;
    };

    if (web.userBlacklisted(body.user)) {
        res.status(403).send('User blacklisted');
        
        return;
    }
    
    requests++;
    const response = await debounce(async() =>
        await query(body), 200)();

    res.status(200).json(response.data.choices);
});
  
let port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Back-end running on port ${port}`);
});