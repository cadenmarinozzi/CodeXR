/*
	author....: nekumelon
	License...: MIT (Check LICENSE)
*/

const { initializeApp, setLogLevel } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');
const assert = require('assert');

setLogLevel('silent');

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

describe('The users directory in the database', () => {
    it('should revoke access to write an empty object to it', async() => {
        let errCode;

        await set(ref(database, 'users/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), {})
            .catch(err => {
                errCode = err.code;
            });

        assert.equal(errCode, 'PERMISSION_DENIED');
    });

    it('should revoke access to write a non valid index to it', async() => {
        let errCode;

        await set(ref(database, 'users/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/nonValidIndex'), true)
            .catch(err => {
                errCode = err.code;
            });

        assert.equal(errCode, 'PERMISSION_DENIED');
    });

    it('should revoke access to write a non boolean value to its isInsider value', async() => {
        let errCode;

        await set(ref(database, 'users/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/isInsider'), 'nonBoolean')
            .catch(err => {
                errCode = err.code;
            });

        assert.equal(errCode, 'PERMISSION_DENIED');
    });

    it('should revoke access to write a non number value to its tokens value', async() => {
        let errCode;

        await set(ref(database, 'users/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/tokens'), 'nonNumber')
            .catch(err => {
                errCode = err.code;
            });

        assert.equal(errCode, 'PERMISSION_DENIED');
    });

    it('should revoke access to write a non number value to its usage value', async() => {
        let errCode;

        await set(ref(database, 'users/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/usage'), 'nonNumber')
            .catch(err => {
                errCode = err.code;
            });

        assert.equal(errCode, 'PERMISSION_DENIED');
    });

    it('should revoke access to write a negative value to its usage value', async() => {
        let errCode;

        await set(ref(database, 'users/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/usage'), -10)
            .catch(err => {
                errCode = err.code;
            });

        assert.equal(errCode, 'PERMISSION_DENIED');
    });

    it('should revoke access to write a negative value to its tokens value', async() => {
        let errCode;

        await set(ref(database, 'users/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/tokens'), -10)
            .catch(err => {
                errCode = err.code;
            });

        assert.equal(errCode, 'PERMISSION_DENIED');
    });
    
    it('should allow access to write a valid object to it', async() => {
        let errCode;

        await set(ref(database, 'users/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), {
            "usage": 0,
            "tokens": 0,
            "isInsider": false
        })
            .catch(err => {
                errCode = err.code;
            });

        assert.notEqual(errCode, 'PERMISSION_DENIED');
    });

    it('should allow access to write a valid number to its tokens value', async() => {
        let errCode;

        await set(ref(database, 'users/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/tokens'), 10)
            .catch(err => {
                errCode = err.code;
            });

        assert.notEqual(errCode, 'PERMISSION_DENIED');
    });

    it('should allow access to write a valid number to its usage value', async() => {
        let errCode;

        await set(ref(database, 'users/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/usage'), 10)
            .catch(err => {
                errCode = err.code;
            });

        assert.notEqual(errCode, 'PERMISSION_DENIED');
    });

    it('should allow access to write a valid boolean to its isInsider value', async() => {
        let errCode;

        await set(ref(database, 'users/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/isInsider'), true)
            .catch(err => {
                errCode = err.code;
            });

        assert.notEqual(errCode, 'PERMISSION_DENIED');
    });
});