var expect = require('chai').expect;
var request = require('supertest');

describe(require('../package.json').name + 'sample-projects', function() {
  describe('basic-usage', function() {
    var app = require('./sample-projects/basic-usage/app.js');
    var expectedApiDoc = require('./fixtures/basic-usage-api-doc-after-initialization.json');

    it('should expose <apiDoc>.basePath/api-docs', function(done) {
      request(app)
        .get('/v3/api-docs')
        .expect(200, expectedApiDoc, done);
    });

    it('should add response validation middleware when parameters are empty', function(done) {
      request(app)
        .delete('/v3/users')
        .expect(204, '', done);
    });

    it('should use defaults, coercion, and operation parameter overriding', function(done) {
      request(app)
        .get('/v3/users/34?name=fred')
        .expect(200)
        .end(function(err, res) {
          expect(res.body).to.eql({id: 34, name: 'fred', age: 80});
          done(err);
        });
    });

    it('should validate input', function(done) {
      request(app)
        .get('/v3/users/34?name=barney')
        .expect(400, {errors: [
          {
            errorCode: 'pattern.openapi.validation',
            location: 'query',
            message: 'instance.name does not match pattern \"^fred$\"',
            path: 'name'
          }
        ], status: 400}, done);
    });

    it('should use path parameters', function(done) {
      request(app)
        .post('/v3/users/34')
        .send({name: 'fred'})
        .expect(200)
        .end(function(err, res) {
          expect(res.body).to.eql({id: '34'});
          done(err);
        });
    });

    it('should dereference #/definitions/ for validation', function(done) {
      var user = {};

      request(app)
        .post('/v3/users/34?name=barney')
        .send(user)
        .expect(400, {errors: [
          {
            errorCode: 'required.openapi.validation',
            location: 'body',
            message: 'instance requires property "name"',
            path: 'name'
          }
        ], status: 400}, done);
    });
  });

  describe('without-basePath-and-different-docsPath', function() {
    var app = require('./sample-projects/without-basePath-and-different-docsPath/app.js');

    it('should be mounted at the top level', function(done) {
      request(app)
        .get('/foo-docs')
        .expect(200, done);
    });
  });

  describe('with-errorTransformer', function() {
    var app = require('./sample-projects/with-errorTransformer/app.js');

    it('should transform errors', function(done) {
      request(app)
        .get('/v3/users/34?name=barney')
        .expect(400, {errors: [
          {fooError: 'oh yea'}
        ], status: 400}, done);
    });
  });

  describe('with-exposeApiDocs-set-to-false', function() {
    var app = require('./sample-projects/with-exposeApiDocs-set-to-false/app.js');

    it('should not expose /api-docs', function(done) {
      request(app)
        .get('/v3/api-docs')
        .expect(404, done);
    });
  });
});
