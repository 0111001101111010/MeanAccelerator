app.controller('signIn', ['$scope', 'Authenticate', '$cookieStore', '$state', function($scope, Authenticate, $cookieStore, $state) {
	//if they're logged in, they shouldn't be on this page
	if(Authenticate.isAuthenticated()) {
		$state.go('dashboard');
	}

	//defaults
	var submitButtonTextDefault = 'Sign In';
	$scope.submitButtonText = submitButtonTextDefault;
	
	//if email was previously saved, populate the form
	var emailFromCookie = $cookieStore.get('email');
	if(emailFromCookie) {
		$scope.email = emailFromCookie;
		$('[name="password"]').focus();
	} else {
		$('[name="email"]').focus();
	}

	$scope.submit = function() {
		$scope.submitted = true;
		if(!$scope.form.$valid) {
			return;
		}

		$scope.processing = true;
		$scope.submitButtonText = 'Processing...';

		var credentials = {
			email: $scope.email,
			password: $scope.password
		};

		Authenticate.signIn(credentials, function(err) {
			if(err) {
				$scope.processing = false;
				$scope.submitButtonText = submitButtonTextDefault;
				toastr.error(err.data, 'Uh oh...');
				return;
			}

			//save email in cookie for the next time they sign in
			$cookieStore.put('email', $scope.email);
			
			toastr.success('You are now signed in');
			$state.go('dashboard');
		});

	};
}]);