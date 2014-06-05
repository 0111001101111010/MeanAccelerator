app.controller('index', ['$rootScope', '$scope', 'Authenticate', 'Session', function($rootScope, $scope, Authenticate, Session) {
	$scope.navigateToSignUp = function() {
		window.location = '#/signUp';
	};

	$scope.navigateToSignIn = function() {
		window.location = '#/signIn';
	};

	$scope.navigateToDashboard = function() {
		window.location = '#/dashboard';
	};

	$scope.signOut = function() {
		Authenticate.signOut(function() {
			toastr.success('You have been signed out.');
        	window.location = '#/signIn';
		});
	};
	
}]);