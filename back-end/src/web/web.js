/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, update, child, get } = require('firebase/database');

const firebaseConfig = {
    apiKey: 'AIzaSyB2njt8fOxzBi1COEBH4ahVnUb_rd9_dU8',
    authDomain: 'codexr-app.firebaseapp.com',
    databaseURL: 'https://codexr-app-default-rtdb.firebaseio.com',
    projectId: 'codexr-app',
    storageBucket: 'codexr-app.appspot.com',
    messagingSenderId: '479853425309',
    appId: '1:479853425309:web:9162c4c48c669477631a74',
    measurementId: 'G-PFK9BB8CSY'
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function readUserData(user, key) {
    const userData = await get(child(ref(database), `users/${user}/${key}`));

    return userData.val();
}

function updateUserData(user, data) { 
    let updates = {};

    for (const key of Object.keys(data)) {
        updates[`users/${user}/${key}`] = data[key];
    }

    update(ref(database), updates);
}

async function incrementUserData(user, data) { // Decrement is just negative usage
    for (const key of Object.keys(data)) {
        const currentValue = await readUserData(user, key);
        data[key] = currentValue + data[key];
    }

    updateUserData(user, data);
}

async function userBlacklisted(user) {
    const isBlacklisted = await get(child(ref(database), `users/${user}/blacklisted`));

    return isBlacklisted.exists() && isBlacklisted.val();
}

async function isUser(user) {
    const userData = await get(child(ref(database), `users/${user}`));

    return userData.exists();
}

module.exports = { incrementUserData, updateUserData, isUser, userBlacklisted };