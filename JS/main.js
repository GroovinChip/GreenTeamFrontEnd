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
		self.memberObj = {
			id: "",
			first_name: "",
			last_name: "",
			gs_grade: "",
			role: ""
		};
		// setter
		self.setMemberObj = function(obj){
			self.memberObj = obj;
		};
		
		// TEAM OBJECT
		self.teamObj = {
			id: "",
			description: "",
			member_id: ""
		};
		
		self.projectObj = {
			id: null,
			name: null,
			description: null,
			active: null,
			priority: null,
			start_date: null,
			deadline: null,
			work_remaining: null,
			phase: null
		};
		
		// Add new member
		self.addNewMember = function(){
			$http({
				method: 'POST',
				url: 'http://localhost:8080/member',
				data: self.memberObj
			}).then(
				window.location.href = "http://localhost:8081/#/viewAllMembers"
			).then(
                location.reload(true)
            )
		};
		
		// KYLE'S Update member
		self.updateMember = function(){
			var member = {};
			member.id = $("#member-id").val();
			member.first_name = $("#first-name").val();
			member.last_name = $("#last-name").val();
			member.gs_grade = $("#gs-grade").val();
			member.role = $("#role").val();

			$http({
				method: 'PUT',
				url: 'http://localhost:8080/updatemember',
				data: member
			}).then(function() {
				$location.path("/viewAllMembers");
			});
		}; // end updateMember
		
		// KYLE'S Delete member
		self.deleteMember = function(id){
			var conf = confirm("Delete member with ID: " + id + "?");
			if(conf) {
				$http({
					method: 'DELETE',
					url: 'http://localhost:8080/deletemember/'+id
				}).then(
					location.reload(true)
				)
			}
		};
		
		// Add new team
		self.addNewTeam = function(){
			$http({
				method: 'POST',
				url: 'http://localhost:8080/team',
				data: self.teamObj
			}).then(
				window.location.href = "http://localhost:8081/#/viewAllTeams"
			).then(
                location.reload(true)
            )
		};
		
		// Update team
		self.updateTeam = function(){
			var team = {};
			team.id = $("#team-id").val();
			team.description = $("#description").val();
			team.team_id = $("#chooseMembers").val();

			$http({
				method: 'PUT',
				url: 'http://localhost:8080/updateteam',
				data: team
			}).then(function() {
				$location.path("/viewAllTeams");
			});
		}; // end updateMember
		
		// Delete member		
		self.deleteTeam = function(id){
			var conf = confirm("Delete team with ID: " + id + "?");
			if(conf) {
				$http({
					method: 'DELETE',
					url: 'http://localhost:8080/deleteteam/'+id
				}).then(
					location.reload(true)
				)
			}
		};
		
		// KYLE'S CREATE PROJECT
		self.createProject = function() {
			self.projectObj.deadline = $("#datepickerD").datepicker("getDate");
		    self.projectObj.start_date = $("#datepickerSD").datepicker("getDate");
			$http({
					method: 'POST',
					url: "http://localhost:8080/project",
					data: self.projectObj
				}).then(function() {
					$location.path("/viewAllProjects");
				});
			}
		
		// Delete member		
		self.deleteProject = function(id){
			var conf = confirm("Delete project with ID: " + id + "?");
			if(conf) {
				$http({
					method: 'DELETE',
					url: 'http://localhost:8080/deleteproject/'+id
				}).then(
					location.reload(true)
				)
			}
		};
		
		//self.memberObj = {};
		
		// nav to member upd page
		self.toUpdMem = function(memberId){
			$http.get("http://localhost:8080/member/" + memberId).
			then(function(resp) {
				var member = resp.data;

				$("#member-id").val(member.id);
				$("#first-name").val(member.first_name);
				$("#last-name").val(member.last_name);
				$('#gs-grade option:contains(' + member.gs_grade + ')').prop('selected', true);
				$('#role option:contains(' + member.role + ')').prop('selected', true);
			}) // end get
			//self.memberObj = member;
			$location.path ('/updateMember');
		};
		
		// nav to team upd page
		self.toUpdTeam = function(teamId, teamMemberId){
			$http.get("http://localhost:8080/team/" + teamId).
			then(function(resp) {
				var team = resp.data;

				$("#team-id").val(team.id);
				$("#description").val(team.description);
				$('#chooseMembers option[value="'+teamMemberId+'"]').attr("selected", "selected");
				console.log(teamMemberId);
			}) // end get
			$location.path ('/updateTeam');
		};
		
		// nav to proj upd page
		self.toUpdProj = function(projId){
			$http.get("http://localhost:8080/project/" + projId).
			then(function(resp) {
				var project = resp.data;
				
			}) // end get
			$location.path ('/updateProject');
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