const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, update, child, get } = require('firebase/database');

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

function writeUserData(userId, isInsider=false, usage=0, tokens=0) {
    usage = Math.abs(usage); // usage cannot be negative
    tokens = Math.abs(tokens); // tokens cannot be negative

    set(ref(database, 'users/' + userId), {
        isInsider: isInsider,
        usage: usage,
        tokens: tokens
    });
}

async function readUserData(userId, key) {
    const userData = await get(child(ref(database), `users/${userId}/${key}`));

    return userData.val();
}

function updateUserData(userId, data) { 
    let updates = {};

    for (const key of Object.keys(data)) {
        updates[`users/${userId}/${key}`] = data[key];
    }

    update(ref(database), updates);
}

async function incrementUserData(userId, data) { // Decrement is just negative usage
    for (const key of Object.keys(data)) {
        const currentValue = await readUserData(userId, key);
        data[key] = currentValue + data[key];
    }

    updateUserData(userId, data);
}

async function isUser(userId) {
    const userData = await get(child(ref(database), `users/${userId}`));

    return userData.exists();
}

function beginUser(userId) {
    writeUserData(userId, false, 0, 0);
}

module.exports = { beginUser, incrementUserData, updateUserData, isUser };