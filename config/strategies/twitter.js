'use strict';

/**
 * Module dependencies.
 */
let passport = require('passport'),
	TwitterStrategy = require('passport-twitter').Strategy,
	users = require(__base + 'core/modules/users/backend/controllers/index');


module.exports = function() {
	// Use twitter strategy
	passport.use(new TwitterStrategy({
			consumerKey: __config.twitter.clientID,
			consumerSecret: __config.twitter.clientSecret,
			callbackURL: __config.twitter.callbackURL,
			passReqToCallback: true
		},
		function(req, token, tokenSecret, profile, done) {
			// Set the provider data and include tokens
			let providerData = profile._json;
			providerData.token = token;
			providerData.tokenSecret = tokenSecret;

			// Create the user OAuth profile
			let providerUserProfile = {
				displayName: profile.displayName,
				username: profile.username,
				provider: 'twitter',
				providerIdentifierField: 'id_str',
				providerData: providerData
			};

			// Save the user OAuth profile
			users.saveOAuthUserProfile(req, providerUserProfile, done);
		}
	));
};