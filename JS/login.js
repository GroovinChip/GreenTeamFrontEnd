angular.module("AppMod", ["ngRoute"])
	.controller("AppCtrl", ['$http', '$routeParams', '$location', function($http, $routeParams, $location) {
		var self = this;
		self.accessDenied = false; //
		self.userNotFound = false; //


    self.login = function() { //
			var user = {
				id: null,
				username: self.uname,
				password: self.pword,
				first_name: null,
				last_name: null
			  };
				console.log(user);
			$http({
				method: 'POST',
				url: 'http://localhost:8080/login',
				data: user
			})
			.then(function(resp) {
				var respUser = resp.data;

				if(respUser.password == user.password){
					window.location.href = "http://localhost:8081/start.html";
				}else {
					self.accessDenied = true;
					self.userNotFound = false;
				}
			},function(error){
				self.accessDenied = false;
				self.userNotFound = true;
		});
		} // end testLogin
	}])