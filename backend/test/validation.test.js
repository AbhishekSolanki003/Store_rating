const test = require('node:test');
const assert = require('node:assert/strict');
const { validateUserInput, validatePassword, parsePositiveId } = require('../src/utils/validation');

test('valid user data passes validation', () => {
  assert.deepEqual(validateUserInput({ name: 'A Valid User Name That Works', email: 'user@example.com', address: '42 Main Street', password: 'Password1!' }), {});
});

test('password rules and ids are enforced', () => {
  assert.equal(validatePassword('password'), false);
  assert.equal(validatePassword('Password1!'), true);
  assert.equal(parsePositiveId('4'), 4);
  assert.equal(parsePositiveId('-1'), null);
});
