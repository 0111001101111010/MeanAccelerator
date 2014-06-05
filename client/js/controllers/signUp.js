app.controller('signUp', ['$scope', 'Authenticate', '$cookieStore', function($scope, Authenticate, $cookieStore) {
	//if they're logged in, they shouldn't be on this page
	if(Authenticate.isAuthenticated()) {
		$state.go('dashboard');
	}

	//defaults
	$('[name="fullName"]').focus();
	var submitButtonTextDefault = "Sign Up";
	$scope.submitButtonText = submitButtonTextDefault;

	$scope.submit = function(){
		$scope.submitted = true;
		if(!$scope.form.$valid) {
			return;
		}

		$scope.processing = true;
		$scope.submitButtonText = "Processing...";

		Authenticate.signUp($scope.data, function(err, data) {
			if(err) {
				$scope.processing = false;
				$scope.submitButtonText = submitButtonTextDefault;
				toastr.error(err.data, 'Uh oh...');
				return;
			}

			//save email in cookie for the next time they sign in
			$cookieStore.put('email', $scope.data.email);

			toastr.success('Your account has been created', 'Success!');
			window.location = '#/dashboard';
		});
	};

}]);