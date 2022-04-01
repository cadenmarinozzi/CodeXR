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

function writeUserData(user, data) {
    set(ref(database, 'users/' + user), data);
}

function updateUserData(user, data) { 
    let updates = {};

    for (const key of Object.keys(data)) {
        updates[`users/${user}/${key}`] = data[key];
    }

    update(ref(database), updates);
}

async function isUser(user) {
    const userData = await get(child(ref(database), `users/${user}`));

    return userData.exists();
}

function beginUser(user) {
    writeUserData(user, {
        isInsider: false,
        usage: 0,
        tokens: 0,
        blacklisted: false
    });
}

module.exports = { beginUser, updateUserData, isUser };