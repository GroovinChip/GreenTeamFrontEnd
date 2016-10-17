angular.module("AppMod", ["ngRoute"])
	.controller("AppCtrl", ['$http', '$routeParams', '$location', function($http, $routeParams, $location) {
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
		
		// Get all projects
		$http.get('http://localhost:8080/projects')
			.then(function(resp){
				self.projects = resp.data;
				for(var count = 0; count < self.projects.length; count++){
					var activeStatus = (self.projects[count].active == 1)?self.projects[count].active = "Inactive":self.projects[count].active = "Active"
					
					switch(self.projects[count].priority){
						case 1:
							self.projects[count].priority = "Low";
							break;
						case 2:
							self.projects[count].priority = "Normal";
							break;
						case 3:
							self.projects[count].priority = "High";
							break;
						case 4:
							self.projects[count].priority = "Critical";
							break;
					}
				}
				
			},function(err) {

			});
		
		self.console = function(project){
			self.projObj.active = project.active,
			console.log(self.projObj.active)
		}

		// MEMBER OBJECT
		/* self.memberObj = {
			id: "",
			first_name: "",
			last_name: "",
			gs_grade: "",
			role: ""
		}; */
		
		// TEAM OBJECT
		self.teamObj = {
			id: "",
			description: "",
			member_id: ""
		};
		
		self.projObj = {
			id: "",
			description: "",
			active: "",
			priority: "",
			start_date: "",
			deadline: "",
			phase: ""
		};
		
		// Add new member
		self.addNewMember = function(){
			$http({
				method: 'POST',
				url: 'http://localhost:8080/member',
				data: self.memberObj
			}).then(
				window.location.href = "http://localhost:8081/#/viewAllMembers"
			)
		};
		
		// Update member
		self.updateMember = function(){
			$http({
				method: 'PUT',
				url: 'http://localhost:8080/member',
				data: self.memberObj
			}).then(
				//window.location.href = "viewAllMembers.html"
				console.log(self.memberObj)
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
				window.location.href = "http://localhost:8081/#/viewAllTeams"
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
		
		self.memberObj = {};
		
		// nav to member upd page
		self.toUpdMem = function(member){
			self.memberObj = member;
			console.log(self.memberObj);
			$location.path ('/updateMember');
			console.log(self.memberObj);
		};

		self.logMember = function(){
			console.log(self.memberObj);
		};
		
	}]) // end controller
	.config(['$routeProvider', function($routeProvider){
		$routeProvider
		.when('/', {
			templateUrl: 'dashboard.html',
			controller: 'AppCtrl',
			controllerAs: 'ctrl'
		}).when('/viewAllMembers', {
			templateUrl: 'viewAllMembers.html',
			controller: 'AppCtrl',
			controllerAs: 'ctrl'
		}).when('/viewAllTeams', {
			templateUrl: 'viewAllTeams.html',
			controller: 'AppCtrl',
			controllerAs: 'ctrl'
		}).when('/viewAllProjects', {
			templateUrl: 'viewAllProjects.html',
			controller: 'AppCtrl',
			controllerAs: 'ctrl'
		})
		.when('/createMember', {
			templateUrl: 'createMember.html',
			controller: 'AppCtrl',
			controllerAs: 'ctrl'
		})
		.when('/createTeam', {
			templateUrl: 'createTeam.html',
			controller: 'AppCtrl',
			controllerAs: 'ctrl'
		})
		.when('/createProject', {
			templateUrl: 'createProject.html',
			controller: 'AppCtrl',
			controllerAs: 'ctrl'
		})
		.when('/updateMember', {
			templateUrl: 'updateMember.html',
			controller: 'AppCtrl',
			controllerAs: 'ctrl'
		})
		.when('/updateTeam', {
			templateUrl: 'updateTeam.html',
			controller: 'AppCtrl',
			controllerAs: 'ctrl'
		})
		.when('/updateProject', {
			templateUrl: 'updateProject.html',
			controller: 'AppCtrl',
			controllerAs: 'ctrl'
		});
	}]) 