/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const axios = require('axios');
const { exec } = require('child_process');

let lastSha;

function deploy() {
    exec('cd ../../back-end && git commit -am "heroku-deploy" && git push heroku main', (err, stdout, stderr) => {
        if (err || stderr) {
            console.error(`An error occured while deploying to heroku. ${err}`);

            return;
        }

        console.log(stdout);
    });
}


async function deploymentLoop() {
    const commits = await axios.get('https://api.github.com/repos/nekumelon/CodeXR/commits');
    const sha = commits.data[0].sha;

    if (lastSha && sha !== lastSha) {
        const commit = await axios.get(`https://api.github.com/repos/nekumelon/CodeXR/commits/${sha}`);
        let changed;

        commit.data.files.forEach(file => {
            if (file.filename.includes('back-end/')) changed = true;
        })

        if (changed) {
            console.log(`Hash change: ${sha} Deploying...`);
            deploy();
        }
    }

    lastSha = sha;
    setTimeout(deploymentLoop, 1 * 60 * 1000);
}

deploymentLoop();