/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const axios = require('axios');
const { exec } = require('child_process');

let lastSha;

function deploy() {
    exec('cd ../../back-end', () => {});
    exec('git -am "heroku-deploy"', (err, stdout, stderr) => {
        if (err || stderr) {
            console.error(`A problem occured while committing the changes. ${err}`);

            return;
        }

        console.log(stdout);
    });

    exec('git push heroku main', (err, stdout, stderr) => {
        if (err || stderr) {
            console.error(`A problem occured while pushing to heroku. ${err}`);

            return;
        }

        console.log(stdout);
    })
}

async function deploymentLoop() {
    const commits = await axios.get('https://api.github.com/repos/nekumelon/CodeXR/commits');
    const sha = commits.data[0].sha;

    if (lastSha && sha !== lastSha) {
        lastSha = sha;
        console.log(`Hash change: ${sha} Deploying...`);
        deploy();
    }

    setTimeout(deploymentLoop, 2 * 60 * 1000);
}

deploymentLoop();