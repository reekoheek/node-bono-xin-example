const test = require('supertest');
const assert = require('assert');
const Api = require('../../bundles/api');

describe('API', () => {
  describe('/user', () => {
    it('create new user', async () => {
      let api = new Api();

      let resp = await test(api.callback())
        .get('/user')
        .expect(200);

      assert.equal(resp.body.length, 0);

      resp = await test(api.callback())
        .post('/user')
        .send({ username: 'foo', password: 'bar' })
        .expect(201);

      assert.equal(resp.body.username, 'foo');
      assert.equal(resp.body.password, 'bar');

      resp = await test(api.callback())
        .get('/user')
        .expect(200);

      assert.equal(resp.body.length, 1);
    });
  });
});
