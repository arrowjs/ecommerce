'use strict';

let passport = require('passport');
let Promise = require('bluebird');
let randomBytesAsync = Promise.promisify(require('crypto').randomBytes);

var coreModule = new BackModule;

module.exports = function (app) {
    app.route('/' + __config.admin_prefix + '/login').get(function (req, res) {
        if (req.isAuthenticated()) {
            return res.redirect('/admin');
        } else {
            coreModule.render(req, res, 'login');
        }
    }).post(function (req, res, next) {
        passport.authenticate('local', function (err, user, info) {
            // Remove sensitive data before login
            if (user)
                user.user_pass = undefined;
            if (info) {
                req.flash.error(info.message);
                return coreModule.render(req, res, 'login');
            } else {
                req.login(user, function (err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        return res.redirect('/admin');
                    }
                });
            }
        })(req, res, next);
    });

    app.route('/' + __config.admin_prefix + '/forgot-password').get(function (req, res) {
        coreModule.render(req, res, 'forgot-password');
    }).post(function (req, res, next) {
        if (!req.body.email) {
            req.flash.warning('Email is required');
            return coreModule.render(req, res, 'forgot-password');
        }

        let token = '';

        // Generate random token
        let promises = randomBytesAsync(20).then(function (buffer) {
            token = buffer.toString('hex');

            // Lookup user by user_email
            return __models.user.find({
                where: 'user_email=\'' + req.body.email + '\''
            });
        }).then(function (user) {
            if (!user) {
                req.flash.warning('No account with that email has been found');
                coreModule.render(req, res, 'forgot-password');
                return promises.cancel();
            } else {
                // Block spam
                let time = Date.now() + 3600000; // 1 hour

                if (user.reset_password_expires != null) {
                    if (time - user.reset_password_expires < 900000) // 15 minutes
                    {
                        let min = 15 - Math.ceil((time - user.reset_password_expires) / 60000);
                        req.flash.warning('An reset password email has already been sent. Please try again in ' + min + ' minutes.');
                        coreModule.render(req, res, 'reset-password');
                        return promises.cancel();
                    }
                }

                // Update user
                let data = {};
                data.reset_password_token = token;
                data.reset_password_expires = time;
                return user.updateAttributes(data)
            }
        }).then(function (user) {
            // Send reset password email
            coreModule.render(req, res, 'email-templates/reset-password-email', {
                name: user.display_name,
                appName: __config.app.title,
                url: 'http://' + req.headers.host + '/admin/reset/' + user.id + '/' + token
            }, function (err, emailHTML) {
                if (err) {
                    next(err);
                    return promises.cancel();
                } else {
                    let mailOptions = {
                        to: user.user_email,
                        from: __config.mailer_config.mailer_from,
                        subject: 'Password Reset',
                        html: emailHTML
                    };

                    return __.sendMail(mailOptions).then(function (info) {
                        req.flash.success('An email has been sent to ' + user.user_email + ' with further instructions. Please follow the guide in email to reset password');
                        return coreModule.render(req, res, 'reset-password');
                    });
                }
            });
        }).catch(function (error) {
            req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
            return next();
        });
    });

    app.route('/' + __config.admin_prefix + '/reset/:userid/:token').get(function (req, res, next) {
        __models.user.find({
            where: {
                id: req.params.userid,
                reset_password_token: req.params.token,
                reset_password_expires: {
                    $gt: Date.now()
                }
            }
        }).then(function (user) {
            if (!user) {
                req.flash.error('Password reset token is invalid or has expired');
                return coreModule.render(req, res, 'reset-password');
            } else {
                return next();
            }
        });
    }, function (req, res) {
        coreModule.render(req, res, 'reset-password', {
            form: true
        });
    }).post(function (req, res) {
        let passwordDetails = req.body;

        let promises = __models.user.find({
            where: {
                id: req.params.userid,
                reset_password_token: req.params.token,
                reset_password_expires: {
                    $gt: Date.now()
                }
            }
        }).then(function (user) {
            if (user) {
                if (passwordDetails.newpassword === passwordDetails.retype_password) {
                    let data = {};
                    data.user_pass = user.hashPassword(passwordDetails.newpassword);
                    data.reset_password_token = '';
                    data.reset_password_expires = null;

                    return user.updateAttributes(data);
                } else {
                    req.flash.warning('Passwords do not match');
                    coreModule.render(req, res, 'reset-password', {form: true});
                    return promises.cancel();
                }
            } else {
                req.flash.warning('Password reset token is invalid or has expired');
                coreModule.render(req, res, 'reset-password');
                return promises.cancel();
            }
        }).then(function (user) {
            coreModule.render(req, res, 'email-templates/reset-password-confirm-email', {
                name: user.display_name,
                appName: __config.app.title,
                site: 'http://' + req.headers.host,
                login_url: 'http://' + req.headers.host + '/admin/login'
            }, function (err, emailHTML) {
                let mailOptions = {
                    to: user.user_email,
                    from: __config.mailer_config.mailer_from,
                    subject: 'Your password has been changed',
                    html: emailHTML
                };

                return __.sendMail(mailOptions).then(function (info) {
                    req.flash.success('Reset password successfully');
                    return coreModule.render(req, res, 'reset-password');
                });
            });
        }).catch(function (error) {
            req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
            return next();
        });
    });

    app.use('/' + __config.admin_prefix + '/*', function (req, res, next) {
        if (!req.isAuthenticated()) {
            return res.redirect('/admin/login');
        }

        next();
    });

    // Error in backend
    app.route('/' + __config.admin_prefix + '/err/500').get(function (req, res) {
        coreModule.render(req, res, '500');
    });

    app.route('/' + __config.admin_prefix + '/err/404').get(function (req, res) {
        coreModule.render(req, res, '404');
    });
};
