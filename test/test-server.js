var chai = require('chai');
var expect = chai.expect
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);

const serverAddress = 'http://localhost:3000';
const userId = '57717526d8ffd21821e1fba0';

describe('bulla', function(){
	before(function(done) {
		this.timeout(3000); // A very long environment setup.
		setTimeout(done, 2500);
	});

	it('register a user');
	it('verify a user');
	it('get user details', function(done){
		chai.request(serverAddress)
		.get('/v1/user/' + userId)
		.end(function(err, res){
			expect(res).to.have.status(200);
			expect(res).to.be.json;
			done();
		});
	});
	it('add social account', function(done){
		chai.request(serverAddress)
		.post('/v1/user/' + userId + '/account')
		.send({"type": 2, "social_id": "124701427970535", "token": "EAAVZCL30UfR0BAJ9dPLHBVSbNBRcgZBtTBxdrwt4M4SHG8VO4r3Ov8V2fAiBQCdPKoAHmlZALxppyCW8wlc08YQx9ETcPgwSlrmj2ixioZBtOXHxh3a3QlF502G1PyTPWsx3j50fRRiqXu47gaR9hshoPXSiLhD4XTA3svHUNZCtMfzUMmV8H"})
		.end(function(err, res){
			expect(res).to.have.status(200);
			expect(res).to.be.json;
			done();
		});
	});
	it('get social accounts', function(done){
		chai.request(serverAddress)
		.get('/v1/user/' + userId + '/accounts')
		.end(function(err, res){
			expect(res).to.have.status(200);
			expect(res).to.be.json;
			done();
		});
	});
	it('recive facebook callback', function(done){
		chai.request(serverAddress)
		.post('/v1/fbwebhook/callback')
		.send({"entry":[{"time":1466587870,"id":"124701427970535","changed_fields":["feed"],"uid":"124701427970535"}],"object":"user"})
		.end(function(err, res){
			expect(res).to.have.status(200);
			expect(res).to.be.json;
			done();
		});
	});
	it('get content around location', function(done){
		chai.request(serverAddress)
		.get('/v1/content/32.47314790194518/35.00038797441984/500')
		.end(function(err, res){
			expect(res).to.have.status(200);
			expect(res).to.be.json;
			done();
		});
	});
	it('join a bubble', function(done){
		chai.request(serverAddress)
		.post('/v1/bubble/57b559a788979448048bea8f/join')
		.send({"uid":"577dfb6faa4310e1456ea53a"})
		.end(function(err, res){
			expect(res).to.have.status(200);
			expect(res).to.be.json;
			done();
		});
	});
	it('add a bubble comment', function(done){
		chai.request(serverAddress)
		.post('/v1/bubble/57b559a788979448048bea8f/comment')
		.send({"uid": "577dfb6faa4310e1456ea53a","body": "a test"})
		.end(function(err, res){
			expect(res).to.have.status(200);
			expect(res).to.be.json;
			done();
		});
	});
	it('get bubble comments', function(done){
		chai.request(serverAddress)
		.get('/v1/bubble/57d3c0e3bc6f55d80e4123d6/comments/57ee9175c1219f1840dffdc6')
		.end(function(err, res){
			expect(res).to.have.status(200);
			expect(res).to.be.json;
			done();
		});
	});

})