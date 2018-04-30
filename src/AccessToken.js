var OAuth       = require('twiz-client-oauth');
var deliverData = require('twiz-client-redirect').prototype.deliverData;

 function AccessToken (){         // checks that oauth data is in redirection(callback) url, and makes sure
                                  // that oauth_token from url matches the one we saved in first step. 
      OAuth.call(this);
      this.name = this.leg[2];

      this.redirectionUrlParsed;  // redirection(callback) url parsing status
      this.redirectionData;       // parsed data from redirection url

      this.loadedRequestToken;    // place to load token 
      this.authorized;            // redirection data that was autorized; 
      this.winLoc = window.location.href;  // get current url

      this.addCustomErrors({      // add  error messages related to this module
         verifierNotFound: '"oauth_verifier" string was not found in redirection(callback) url.',
         tokenNotFound: '"oauth_token" string was not found in redirection(callback) url.',
         tokenMissmatch: 'Request token and token from redirection(callback) url do not match',
         requestTokenNotSet: 'Request token was not set',
         requestTokenNotSaved: 'Request token was not saved. Check that page url from which you make request match your redirection_url.',
         noRepeat: "Cannot make another request with same redirection(callback) url",
         noStringProvided: "Expected string was not provided"
      })
   }
  
   AccessToken.prototype = Object.create(OAuth.prototype);

   AccessToken.prototype.setAuthorizedTokens = function(){

      this.authorizeRedirectionUrl(),
                                             // set params for access token leg explicitly 
      this.oauth[this.prefix + 'verifier'] = this.authorized.oauth_verifier // Put authorized verifier
      this.oauth[this.prefix + 'token']    = this.authorized.oauth_token;   // Authorized token
   }
 
   AccessToken.prototype.authorizeRedirectionUrl = function(){// makes sure we have needed data in redirection url
     this.parseRedirectionUrl(this.winLoc);          // parse 
     return this.authorize(this.redirectionData);    // authorize token
     
   }

   AccessToken.prototype.parseRedirectionUrl = function(url){ // parses data in url 
      // console.log('in parseRedirectionUrl');

      var str = this.parse(url, /\?/g, /#/g);              // parses query string
      this.redirectionData = this.parseQueryParams(str);   // parse parameters from query string

      this.redirectionUrlParsed = true;                    // indicate that the url was already parsed  
      
      // console.log(this.redirectionData.twiz_);
   }

   AccessToken.prototype.parse = function(str, delimiter1, delimiter2){ // parses substring of a string (str) 
                                                                     
       if(!str) throw this.CustomError('noStringProvided');

       var start = str.search(delimiter1);   // calculate from which index to take 
       var end ; 
       if(!delimiter2 || str.search(delimiter2) === -1) end = str.length;// if del2 was not passed as argument
                                                                         // or we didnt find it, then end index
                                                                         // is length of the string.
       else end = str.search(delimiter2);    // calcualte to which index to take                                                             
       // console.log(str); 
       return str.substring(start, end);     // return substring
            
   };

     
   AccessToken.prototype.parseQueryParams = function (str){
      var arr  = [];
      if(!str) throw this.CustomError('noStringProvided');
       

      if(str[0] === "?") str = str.substring(1); // remove "?" if we have one at beggining

      arr = str.split('&')                       // make new array element on each "&" 
            .map( function(el, i){ 
                 var arr2 =  el.split("=");      // for each element make new array element on each "=" 
                 return arr2;   

             });
     
      // console.log(arr);
      return  this.objectify(arr);                  // makes an object from query string parametars
   }

   AccessToken.prototype.objectify = function(array){// makes new object with props and values from array's 
                                                     // elements
      var data = {};
      var len = array.length;
      
      for(var i = 0; i < len; i++){
            var arr = array[i];
            for(var j = 0; j < arr.length; j++){   // iterating though each of arrays in parsed
               if(j == 0) data[arr[j]] = arr[j+1]; // if we are at element that holds name of property, 
                                                   // make property with that name in data object, set it's
                                                   //  value of next element (j+1)
          }
      } 
      
      return data;
   } 
   
   AccessToken.prototype.authorize = function(sent){ // check that sent data from redirection url has needed info
     
      if(this.isRequestTokenUsed(window.localStorage))          
        throw this.CustomError('noRepeat');
      

      // console.log('in authorize')
      if(!sent.oauth_verifier) throw this.CustomError('verifierNotFound');
      if(!sent.oauth_token)    throw this.CustomError('tokenNotFound');

      this.loadRequestToken(window.localStorage, sent);                      // load token from storage  
                                                                             
                                                                             // check that tokens match
      if(sent.oauth_token !== this.loadedRequestToken) throw this.CustomError('tokenMissmatch');

      return this.authorized = sent;                       // data passed checks, so its authorized;                     
   }

   AccessToken.prototype.isRequestTokenUsed = function(storage){ // check that we have a token to use 

     if(storage.requestToken_ === "null") return true; // token whould be "null" only when  loadRequestToken() 
                                                       // run twice on same redirection(callback) url
     return false;
   }

   

   AccessToken.prototype.loadRequestToken = function(storage, sent){
     
     if(!storage.hasOwnProperty('requestToken_')) throw this.CustomError('requestTokenNotSaved');  

     this.loadedRequestToken = storage.requestToken_;           // load token from storage

     // console.log('storage after: ', storage.requestToken_);
     // console.log('this.loadedRequestToken :', this.loadedRequestToken);

     storage.requestToken_ = null;                              // since we've loaded the token, mark it as 
                                                                // used/erased with null 
     // console.log('after erasing storage.requestToken :', storage.requestToken_);  
     
     if (!this.loadedRequestToken) throw this.CustomError('requestTokenNotSet');
   }
   
   AccessToken.prototype.getSessionData = function(){       // gets session data from redirection url
         console.log('in getSessionData')
         if(!this.redirectionUrlParsed); 
          this.parseRedirectionUrl(window.location.href); // parse data from url 
         
         if(!this.redirectionData.data){                  // return if no session data
            console.log(this.messages.noSessionData);
            return; 
         }                          
          
         this.sessionData = this.parseSessionData(this.redirectionData.data) // further parsing of session data
         console.log(this.sessionData);
         return this.sessionData;
   }

   AccessToken.prototype.parseSessionData = function(str){
       if(/%[0-9][0-9]/g.test(str))                       // See if there are percent encoded chars
       str = decodeURIComponent(decodeURIComponent(str)); // Decoding twice, since it was encoded twice
                                                          // (by OAuth 1.0a specification). See genSBS function.
       return this.parseQueryParams(str);                 // Making an object from parsed key/values.
   }

   AccessToken.prototype.deliverData = deliverData;  // borrow function from Redirect module

   module.exports = AccessToken;

