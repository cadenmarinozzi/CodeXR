/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const axios = require('axios');
const { exec } = require('child_process');

let lastSha;

function herokuDeploy() {
    exec('cd ../back-end && git commit -am "heroku-deploy" && git push heroku main', (err, stdout) => {
        if (err) {
            console.error(`An error occured while deploying to Heroku. ${err}`);

            return;
        }

        if (stdout) console.log(stdout);
    });
}

function discordDeploy() {
    exec(`cd ../discord && DISCORD_TOKEN="${process.env.DISCORD_TOKEN}" node src/index.js`, (err, stdout) => {
        if (err) {
            console.error(`An error occured while deploying to Discord. ${err}`);

            return;
        }

        if (stdout) console.log(stdout);
    });
}

async function deploymentLoop() {
    const commits = await axios.get('https://api.github.com/repos/nekumelon/CodeXR/commits');
    const sha = commits.data[0].sha;

    if (lastSha && sha !== lastSha) {
        const commit = await axios.get(`https://api.github.com/repos/nekumelon/CodeXR/commits/${sha}`);
        let backEndChanged, discordChanged;

        commit.data.files.forEach(file => {
            if (file.filename.includes('back-end/')) backEndChanged = true;
        });

        commit.data.files.forEach(file => {
            if (file.filename.includes('discord/')) discordChanged = true;
        });

        if (backEndChanged) {
            console.log(`Hash change: ${sha} Deploying to Heroku...`);
            herokuDeploy();
        }

        if (discordChanged) {
            console.log(`Hash change: ${sha} Deploying to Discord...`);
            discordDeploy();
        }
    }

    lastSha = sha;
    setTimeout(deploymentLoop, 5 * 60 * 1000);
}

deploymentLoop();