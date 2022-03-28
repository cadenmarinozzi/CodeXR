const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, child, get } = require('firebase/database');
const assert = require('assert');

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
    it('should revoke access to write an empty json object to it', () => {
        set(ref(database, 'users/'), {})
            .catch(err => {
                assert.equal(err.code, 'PERMISSION_DENIED');
            });
    });

    it('should revoke access to write an empty json object to its usage values', () => {
        set(ref(database, 'users/usage'), {})
            .catch(err => {
                assert.equal(err.code, 'PERMISSION_DENIED');
            });
    });

    it('should revoke access to write an empty json object to its isInsider values', () => {
        set(ref(database, 'users/isInsider'), {})
            .catch(err => {
                assert.equal(err.code, 'PERMISSION_DENIED');
            });
    });

    it('should revoke access to write an empty json object to its tokens values', () => {
        set(ref(database, 'users/tokens'), {})
            .catch(err => {
                assert.equal(err.code, 'PERMISSION_DENIED');
            });
    });

    it('should revoke access to write an empty json object to its userId values', () => {
        set(ref(database, 'users/userId'), {})
            .catch(err => {
                assert.equal(err.code, 'PERMISSION_DENIED');
            });
    });

    it('should revoke access to write a non number value to its usage values', () => {
        set(ref(database, 'users/usage'), 'This is not a number')
            .catch(err => {
                assert.equal(err.code, 'PERMISSION_DENIED');
            });
    });

    it('should revoke access to write a non number value to its tokens values', () => {
        set(ref(database, 'users/tokens'), 'This is not a number')
            .catch(err => {
                assert.equal(err.code, 'PERMISSION_DENIED');
            });
    });

    it('should revoke access to write a non boolean value to its isInsider values', () => {
        set(ref(database, 'users/tokens'), 'This is not a boolean')
            .catch(err => {
                assert.equal(err.code, 'PERMISSION_DENIED');
            });
    });

    it('should revoke access to write a non string value to its userId values', () => {
        set(ref(database, 'users/tokens'), 100)
            .catch(err => {
                assert.equal(err.code, 'PERMISSION_DENIED');
            });
    });
    
    it('should revoke access to write a negative value to its usage values', () => {
        set(ref(database, 'users/usage'), -10)
            .catch(err => {
                assert.equal(err.code, 'PERMISSION_DENIED');
            });
    });

    it('should revoke access to write a negative value to its tokens values', () => {
        set(ref(database, 'users/usage'), -10)
            .catch(err => {
                assert.equal(err.code, 'PERMISSION_DENIED');
            });
    });

    it('should revoke access to write a string with a length less than or greater than 36 to its userId values', () => {
        set(ref(database, 'users/usage'), 'This is not a string with a length of 36')
            .catch(err => {
                assert.equal(err.code, 'PERMISSION_DENIED');
            });
    });

    it('should allow the client to read its usage values', () => {
        get(child(ref(database), 'users/usage'))
            .catch(err => {
                assert.notEqual(err.code, 'PERMISSION_DENIED');
            });
    });

    it('should allow the client to read its isInsider values', () => {
        get(child(ref(database), 'users/isInsider'))
            .catch(err => {
                assert.notEqual(err.code, 'PERMISSION_DENIED');
            });
    });

    it('should allow the client to read its tokens values', () => {
        get(child(ref(database), 'users/tokens'))
            .catch(err => {
                assert.notEqual(err.code, 'PERMISSION_DENIED');
            });
    });

    it('should allow the client to read its userId values', () => {
        get(child(ref(database), 'users/userId'))
            .catch(err => {
                assert.notEqual(err.code, 'PERMISSION_DENIED');
            });
    });
});