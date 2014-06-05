app.controller('profile', ['$scope', 'Users', 'Session', '$state', function($scope, Users, Session, $state) {
	//defaults
	var submitButtonTextDefault = 'Save';
	$scope.submitButtonText = submitButtonTextDefault;
	$scope.doChangePassword = false;


	//on load
	Users.get({ userId: Session.getUserId() }, function(user) {
		//password is a hash, so no need to include that
		user.password = null;
		$scope.data = user;
	});

	$scope.submit = function(){
		$scope.submitted = true;
		if(!$scope.form.$valid) {
			return;
		}

		$scope.processing = true;
		$scope.submitButtonText = 'Processing...';

		Users.update({ userId: Session.getUserId() }, $scope.data, function(user){
			Session.update($scope.data.fullName);
			toastr.success('Your profile has been updated');
			$state.go('dashboard');
		}, function(err) {
			$scope.processing = false;
			$scope.submitButtonText = submitButtonTextDefault;
			toastr.error(err.data);
		});
		
	};

}]);