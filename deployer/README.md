# Deployer
The deployer allows packages like the back-end and discord bot to be deployed from a single environment, while also being automated whenever there is a new commit on the remote repository.

# deploy-config.json
Deployment settings are put into the `deploy-config.json` file. \
An example of that configuration might be:
`json
{
    "name": "Deploying-test-123",
    "command": "cd ../test_thing && npm .",
    "logs": true,
    "deployOnStart": true,
    "activationFiles": [
        "test_thing/",
        "test_thing_legacy/"
    ]
}
`
The options are:
* name: The name of the deployable. This is used to identify the deployable in the logs.
* command: The shell command that will be executed by the deployer. Multiple commands should be seperated by &&.
* logs: Whether or not the deployer should log the output of the command.
* deployOnStart: Whether or not the deployer should deploy the package when the deployer is started.
* activationFiles: A list of files that will be checked for changes. If any of those files are changed, the deployer will deploy the package.