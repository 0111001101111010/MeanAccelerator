var cookieName = 'session',
    app = angular.module('app', ['ngResource', 'ui.router', 'ngCookies'])


//the closest thing Angular has to a 'main' function. Runs when the app starts up
.run(function ($rootScope, $state, $cookieStore, Users, Session) {
  //see if user previously authenticated
  var userIdFromCookie = $cookieStore.get(cookieName);

  if(userIdFromCookie) {
    //set userId right away in case the user navigated to a partial view which needs it (ex: profile)
    $rootScope.userId = userIdFromCookie;
    $rootScope.isAuthenticated = true;

    Users.get({ userId: userIdFromCookie }, function(user){
      Session.create(user._id, user.fullName, user.role);
    });
  }

  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
    var doIgnoreCheck;

    if(userIdFromCookie && !fromState.name) {
      doIgnoreCheck = true;
    }

    //if being loaded from cookie, then we won't have set the session just yet. So if fromState isn't valid, don't check.
    if (!doIgnoreCheck && toState.authenticate && !Session.isAuthenticated()){
      // User isn’t authenticated
      $state.transitionTo('signIn');
      toastr.error('You must sign in first');
      event.preventDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider){
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'views/home.html',
      controller: 'home'
    })
    .state('signUp', {
      url: '/signUp',
      templateUrl: 'views/signUp.html',
      controller: 'signUp'
    })
    .state('signIn', {
      url: '/signIn',
      templateUrl: 'views/signIn.html',
      controller: 'signIn'
    })
    .state('rewards', {
      url: '/rewards',
      templateUrl: 'views/rewards.html',
      controller: 'rewards'
    })
    .state('blog', {
      url: '/blog',
      templateUrl: 'views/blog.html',
      controller: 'blog'
    })
    .state('forgotPassword', {
      url: '/forgotPassword',
      templateUrl: 'views/forgotPassword.html',
      controller: 'forgotPassword'
    })
    .state('resetPassword', {
      url: '/resetPassword/:passwordResetToken',
      templateUrl: 'views/resetPassword.html',
      controller: 'resetPassword'
    })
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: 'views/dashboard.html',
      controller: 'dashboard',
      authenticate: true
    })
    .state('profile', {
      url: '/profile',
      templateUrl: 'views/profile.html',
      controller: 'profile',
      authenticate: true
    })
    ;

    $urlRouterProvider.otherwise("/");
})

.factory('Session', function($rootScope, $cookieStore){
  return {
    create: function(userId, fullName, role) {
      $rootScope.isAuthenticated = true;
      $rootScope.userId = userId;
      $rootScope.fullName = fullName;
      $rootScope.role = role;

      $cookieStore.put(cookieName, userId);
    },
    update: function(fullName, role) {
      $rootScope.fullName = fullName;

      if(role) {
        $rootScope.role = role;
      }
    },
    destroy: function() {
      $rootScope.isAuthenticated = false;
      $rootScope.userId = null;
      $rootScope.fullName = null;
      $rootScope.role = null;

      $cookieStore.remove(cookieName);
    },
    getUserId: function(){
      return $rootScope.userId;
    },
    isAuthenticated: function() {
      return $rootScope.isAuthenticated;
    }
  };
})

.factory('Authenticate', function($resource, Session) {
  return {
    signUp: function(signUpData, callback) {
      var cb = callback || {};

      $resource('/api/authenticate').save(signUpData, function(data) {
        Session.create(data.userId, signUpData.fullName, data.role);
        cb(null, data);
      }, function(err){
        cb(err, null);
      });
    },

    signIn: function(credentials, callback) {
      var cb = callback || {};

      $resource('/api/authenticate').get(credentials, function(data) {
        Session.create(data.userId, data.fullName, data.role);
        cb(data.user);
      }, function(err){
        cb(err, null);
      });
    },

    signOut: function(callback) {
      var cb = callback || {};

      $resource('/api/authenticate').delete(function() {
        Session.destroy();
        cb(null, null);
      });
    },

    initiateForgotPassword: function(email, callback) {
      var cb = callback || {};

      $resource('/api/authenticate/forgotPassword').save({ email: email }, function() {
        cb(null, null);
      }, function(err) {
        cb(err, null);
      });
    },

    validatePasswordResetToken: function(passwordResetToken, callback) {
      var cb = callback || {};

      $resource('/api/authenticate/forgotPassword/:passwordResetToken').get({ passwordResetToken: passwordResetToken }, function(data) {
        cb(null, data);
      }, function(err) {
        cb(err, null);
      });
    },

    resetPassword: function(userId, newPassword, callback) {
      var cb = callback || {};

      $resource('/api/authenticate/resetPassword').save({
        userId: userId,
        newPassword: newPassword
      }, function() {
        cb(null, null);
      }, function(err) {
        cb(err, null);
      });
    },

    isAuthenticated: function () {
      return Session.isAuthenticated();
    }
/*
    ,

    isAuthorized: function (authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }

      return (this.isAuthenticated() &&
        authorizedRoles.indexOf(Session.role) !== -1);
    }
    */
  }
})

.factory('Users', function($resource){
  return $resource('/api/users/:userId', null, {
    'update': { method:'PUT' }
  });
})


;