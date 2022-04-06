/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const axios = require('axios');
const { exec } = require('child_process');
const glob = require('glob');
const fs = require('fs');

let lastSha;
let processes = {};

const envRegExp = new RegExp(/(?!\<)(\w+)(?=\>)/g);
const envReplacerRegExp = new RegExp(/\<\w+\>/g);

function parseCommand(command) {
    const env = command.match(envRegExp);
    
    if (env) return command.replace(envReplacerRegExp, process.env[env[0]]);

    return command;
}

function deploy(config) {
    if (processes[config.name]) processes[config.name].kill();

    if (process.platform !== 'win32') {
        processes[config.name] = exec(parseCommand(config.command), (err, stdout) => {
            if (err) {
                console.error(`An error occured while deploying to ${config.name}: ${err}`);
            }

            if (config.logs && stdout) console.log(stdout);
        });

        return;
    } else {
        throw('Windows is not supported yet!');
    }
}

glob('../../**/deploy-config.json', (err, files) => {
    if (err) {
        console.log(err);
        
        return;
    }

    files.forEach(file => {
        fs.readFile(file, (err, data) => {
            if (err) {
                console.log(err);
                
                return;
            }

            const config = JSON.parse(data);

            if (config.deployOnStart) {
                console.log(`Deploying to ${config.name}...`);
                deploy(config);
            }
        });
    });
});

async function deploymentLoop() {
    try {
        const commits = await axios.get('https://api.github.com/repos/nekumelon/CodeXR/commits');
        const sha = commits.data[0].sha;

        if (lastSha && sha !== lastSha) {
            const commit = await axios.get(`https://api.github.com/repos/nekumelon/CodeXR/commits/${sha}`);

            glob('../../**/deploy-config.json', (err, files) => {
                if (err) {
                    console.log(err);
                    
                    return;
                }

                files.forEach(file => {
                    fs.readFile(file, (err, data) => {
                        if (err) {
                            console.log(err);
                            
                            return;
                        }

                        const config = JSON.parse(data);
                        
                        commit.data.files.forEach(commitFile => {
                            config.activationFiles.forEach(activationFile => {
                                if (commitFile.filename.includes(activationFile)) {
                                    console.log(`Hash change: ${sha} Deploying to ${config.name}...`);
                                    deploy(config);
                                }
                            });
                        })
                    });
                });
            });
        }

    lastSha = sha;
    } catch (err) {
        console.log(`Deployment loop failed: ${err.message}`)
    }

    setTimeout(deploymentLoop, 1 * 60 * 1000);
}

deploymentLoop();