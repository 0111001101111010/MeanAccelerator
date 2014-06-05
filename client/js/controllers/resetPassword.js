app.controller('resetPassword', ['$scope', 'Authenticate', '$state', '$stateParams', function($scope, Authenticate, $state, $stateParams) {
	var userId,
		userEmail;

	//if they're logged in, they shouldn't be on this page
	if(Authenticate.isAuthenticated()) {
		$state.go('dashboard');
	}
	
	var resetToken = $stateParams.passwordResetToken,
		submitButtonTextDefault = "Save new password";
	$scope.submitButtonText = submitButtonTextDefault;

    if(!resetToken) {
    	toastr.error('Cannot reset password without providing a password token!');
    	$state.go('home');
    	return;
    }

    Authenticate.validatePasswordResetToken(resetToken, function(err, userData) {
    	if(err) {
    		toastr.error('Invalid reset token.');
    		$state.go('home');
    		return;
    	}

    	console.log('userData: ', userData);
    	userId = userData.id;
    	email = userData.email;

    	$('[name="password"]').focus();
    });

	$scope.submit = function() {
		$scope.submitted = true;
		if(!$scope.form.$valid) {
			return;
		}

		$scope.processing = true;
		$scope.submitButtonText = "Processing...";

		Authenticate.resetPassword(userId, $scope.password, function(err, value) {
			if(err) {
				toastr.error(err.data, 'Uh oh...');
				$scope.processing = false;
				$scope.submitButtonText = submitButtonTextDefault;
				return;
			}

			//their password has been changed, now log them in
			var credentials = {
				email: email,
				password: $scope.password
			};

			Authenticate.signIn(credentials, function(err) {
				if(err) {
					$scope.processing = false;
					$scope.submitButtonText = submitButtonTextDefault;
					toastr.error(err.data, 'Uh oh...');
					return;
				}
			
				toastr.success('Your password has been changed, and you are now signed in');
				$state.go('dashboard');
			});
		});

	};
}]);