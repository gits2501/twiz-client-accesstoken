var AccessToken = require('../src/AccessToken_instrumented');
var assert      = require('assert');



describe('Access Token', function(){
 

   describe('Access Token leg', function(){
      var request_token = 'longStringOfAlphanumerics33521' // mock request token from first leg (request token leg);
      var query = '?oauth_token='+request_token+'&oauth_verifier=similarStringOfAlphanumerics4224';                                                                         // make query string
      window.localStorage.requestToken_ = request_token    // mock saved request token (in request token leg)

      var at = new AccessToken();                          // make instance
      at.winLoc += query                                   //  mock authorized url (query string from twitter)

      it('ready ', function(){
             assert.doesNotThrow(at.setAuthorizedTokens.bind(at))
      })
   })

   describe('not ready')

}) 
