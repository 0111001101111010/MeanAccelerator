app.controller('forgotPassword', ['$scope', 'Authenticate', '$cookieStore', '$state', function($scope, Authenticate, $cookieStore, $state) {
	//if they're logged in, they shouldn't be on this page
	if(Authenticate.isAuthenticated()) {
		$state.go('dashboard');
	}

	//defaults
	var submitButtonTextDefault = "Initiate a password reset";
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
		$scope.submitButtonText = "Processing...";

		Authenticate.initiateForgotPassword($scope.email, function(err, value) {
			if(err) {
				toastr.error(err.data, 'Uh oh...');
				$scope.processing = false;
				$scope.submitButtonText = submitButtonTextDefault;
				return;
			}

			toastr.success('Please check your email for instructions to reset your password');
			$state.go('home');
		});

	};
}]);