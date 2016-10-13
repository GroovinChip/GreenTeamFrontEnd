angular.module("AppMod", ["ngRoute"])
	.controller("AppCtrl", ['$http', '$routeParams', function($http, $routeParams) {
		var self = this;
		self.id = $routeParams.memberId;
	
		// Get all members
		$http.get('http://localhost:8080/members')
			.then(function(resp){
				self.members = resp.data;
			},function(err) {

			});
		
		// Get a member by ID
		$http.get('http://localhost:8080/members/'+self.id)
			.then(function(resp){
				self.member = resp.data;
			},function(err) {

			});
			
		// Get all teams
		$http.get('http://localhost:8080/teams')
			.then(function(resp){
				self.teams = resp.data;
			},function(err) {

			});
		
		// Delete Team
		self.deleteMember = function(id){
			$http({
				method: 'DELETE',
				url: 'http://localhost:8080/deleteteam/'+id
			}).then(
				location.reload(true)
			)
		};

		// MEMBER OBJECT
		self.memberObj = {
			id: "",
			first_name: "",
			last_name: "",
			gs_grade: "",
			role: ""
		};
		
		// TEAM OBJECT
		self.teamObj = {
			id: "",
			description: "",
			member_id: ""
		};
		
		// Add new member
		self.addNewMember = function(){
			$http({
				method: 'POST',
				url: 'http://localhost:8080/member',
				data: self.memberObj
			}).then(
				window.location.href = "viewAllMembers.html"
			)
		};
		
		// Delete member
		self.deleteMember = function(id){
			$http({
				method: 'DELETE',
				url: 'http://localhost:8080/deletemember/'+id
			}).then(
				location.reload(true)
			)
		};
		
		// Add new team
		self.addNewTeam = function(){
			$http({
				method: 'POST',
				url: 'http://localhost:8080/team',
				data: self.teamObj
			}).then(
				window.location.href = "viewAllTeams.html"
			)
		};
		
		// Delete member
		self.deleteTeam = function(id){
			$http({
				method: 'DELETE',
				url: 'http://localhost:8080/deleteteam/'+id
			}).then(
				location.reload(true)
			)
		};
		
	}]) // end controller