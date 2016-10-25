angular.module("AppMod", ["ngRoute"])
	.controller("AppCtrl", ['$http', '$routeParams', '$location', function($http, $routeParams, $location) {
		var self = this;
		self.id = $routeParams.memberId;
		
		self.today = new Date();
	
		// Get all members
		$http.get('http://localhost:8080/members')
			.then(function(resp){
				self.members = resp.data;
			},function(err) {

			});
			
		// Get all teams
		$http.get('http://localhost:8080/teams')
			.then(function(resp){
				self.teams = resp.data;
				for(var i = 0; i < self.teams.length; i++) {
					for(var j = 0; j < self.members.length; j++){
						if(self.teams[i].member_id == self.members[j].id) {
							self.teams[i].member_name = self.members[j].first_name + " " + self.members[j].last_name;
						} // end if case
					} // end j for loop
				} // end i for loop
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
		
		//
		self.passToNotes = function(id){
			$http.get("http://localhost:8080/project/" + id).
			then(function(resp) {
				// Store the specified project
				self.projectObj = resp.data;
				// Get the specified project's notes
				$http.get('http://localhost:8080/notes/'+id)
				.then(function(resp){
					self.notes = resp.data;
					console.log(self.notes);
				});
			}) // end get
		};
		
		// Add a note to a project
		self.addProjNote = function(note, id){
			self.targetProjId = id;
			var addNote ={}
			addNote.message = note;
			addNote.project_id = id;
			addNote.time_stamp = new Date();
			$http({
				method: 'POST',
				url: 'http://localhost:8080/note',
				data: addNote
			}).then(function(){
				$http.get('http://localhost:8080/notes/'+self.targetProjId).
				then(function(resp){
					self.notes = resp.data;
				})
			})
		};
		
		// Delete a note | OPTIONAL (refreshing list doesn't work)
		self.deleteNote = function(noteId){
			var conf = confirm("Delete this note?");
			console.log(noteId);
			if(conf) {
				$http({
					method: 'DELETE',
					url: 'http://localhost:8080/deletenote/'+noteId
				}).then(function(){
					for(var i = 0; i < self.notes.length; i++){
						if(noteId == self.notes[i].id){
							self.notes.splice(i, 1);
						}
					}
				})
			}
		};
		
		// Get all projects
		$http.get('http://localhost:8080/projects')
			.then(function(resp){
				self.projects = resp.data;
				for(var count = 0; count < self.projects.length; count++){                    
                    switch(self.projects[count].status){
                        case 0:
                            self.projects[count].status = "Inactive";
                            break;
                        case 1:
                            self.projects[count].status = "Active";
                            break;
                        case 2:
                            self.projects[count].status = "Completed";
                            break;
                    }
					
					switch(self.projects[count].priority){
						case 0:
							self.projects[count].priority = "-";
							break;
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
				
				var startDate = new Date(self.projects[count].start_date);
				var deadline = new Date(self.projects[count].deadline);

                self.projects[count].project_health = self.calcProjHealth(startDate, deadline, self.projects[count].work_remaining);
			}
			// Solves project health sorting on dashboard - KYLE
			self.projects.sort(function(a,b){return a.project_health-b.project_health})		
			},function(err) {

			});
		
		// Calculate the health level of a project
		self.calcProjHealth = function(startDate, deadline, work_remaining){
			var today = new Date();
			today.setHours(0,0,0,0);
			var dDate1 = new Date();
			if(startDate <= today){
				dDate1 = today;
			}
			else{
				dDate1 = startDate;
			}
			var dDate2 = deadline;
			var iWeeks, iDateDiff, iAdjust = 0;
			if (dDate2 < dDate1) return -1; // error code if dates transposed
			var iWeekday1 = dDate1.getDay(); // day of week
			var iWeekday2 = dDate2.getDay();
			iWeekday1 = (iWeekday1 == 0) ? 7 : iWeekday1; // change Sunday from 0 to 7
			iWeekday2 = (iWeekday2 == 0) ? 7 : iWeekday2;
			if ((iWeekday1 > 5) && (iWeekday2 > 5)) iAdjust = 1; // adjustment if both days on weekend
			iWeekday1 = (iWeekday1 > 5) ? 5 : iWeekday1; // only count weekdays
			iWeekday2 = (iWeekday2 > 5) ? 5 : iWeekday2;

			// calculate differnece in weeks (1000mS * 60sec * 60min * 24hrs * 7 days = 604800000)
			iWeeks = Math.floor((dDate2.getTime() - dDate1.getTime()) / 604800000)

			if (iWeekday1 <= iWeekday2) {
				iDateDiff = (iWeeks * 5) + (iWeekday2 - iWeekday1)
			} else {
			   iDateDiff = ((iWeeks + 1) * 5) - (iWeekday1 - iWeekday2)
			}

			iDateDiff -= iAdjust // take into account both days on weekend

			self.hoursRemaining = (iDateDiff + 1) * 8;
			var projectHealth = self.hoursRemaining / work_remaining * 100;
			// TERNIARY
			projectHealth > 100 ? projectHealth = 100 : projectHealth = projectHealth;
			//self.projects[count].project_health = projectHealth;
			projectHealth = Math.round(projectHealth);
			return projectHealth;
		}
		
		// Based on the health level of a project, change the color
		self.changeColor = function(health){
			if(health < 100 && health >= 90){
				return { color: "#e6e600" };
			}
			else if(health < 90 && health >= 80){
				return { color: "orange" };
			}
			else if(health < 80){
				return { color: "red" };
			}
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
		
		// PROJECT OBJECT
		self.projectObj = {
			id: null,
			name: null,
			description: null,
			team_id: null,
			status: null,
			priority: null,
			start_date: null,
			deadline: null,
			work_remaining: null,
			phase: null
		};
		
		// NOTE OBJECT
		self.noteObj = {
			id: null,
			message: null,
			time_stamp: null,
			project_id: null
		}
		
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
		
		// Get member name by ID
		self.getMemberName = function(teamMembId){
			$http.get('http://localhost:8080/member/'+teamMembId).
			then(function(resp){
				var memberbyId = {}
				memberById = resp.data;
				var fullName = memberById.first_name + ' ' + memberById.last_name;
				alert("The member on this team is "+fullName);
			})
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
				location.reload(true);
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
            team.member_id = $("#chooseMembers").val();
            $http({
                method: 'PUT',
                url: 'http://localhost:8080/updateteam',
                data: team
            }).then(function() {
                //$location.path("/viewAllTeams");
				location.reload(true);
            });
        }; // end updateTeam
		
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
			
        // Update project
        self.updateProject = function(){
            console.log("¯\\_(ツ)_/¯");
			var project = {};
            project.id = $("#project-id").val();
            project.name = $("#project-name").val();
            project.description = $("#project-description").val();
			project.team_id = $("#team-select").val(); // NEW - BUILD 36
            project.status = $("#project-status").val();
            project.priority = $("#project-priority").val();
            project.start_date = $("#datepickerSD").datepicker("getDate");
            project.deadline = $("#datepickerD").datepicker("getDate");
            project.work_remaining = $("#project-work").val();
            project.phase = $("#project-phase").val();
            $http({
                method: 'PUT',
                url: 'http://localhost:8080/updateproject',
                data: project
            }).then(function() {
                location.reload(true);
            });
        }; // end updateProject
		
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
		
		// update member using modal
		self.openMemberUpdModal = function(id){
			$http.get("http://localhost:8080/member/" + id).
			then(function(resp) {
				var member = resp.data;

				$("#member-id").val(member.id);
				$("#first-name").val(member.first_name);
				$("#last-name").val(member.last_name);
				$('#gs-grade option:contains(' + member.gs_grade + ')').prop('selected', true);
				$('#role option:contains(' + member.role + ')').prop('selected', true);
			}) // end get
		}  
		
		// update team using modal
		self.openTeamUpdModal = function(id){
			$http.get("http://localhost:8080/team/" + id).
			then(function(resp) {
				var team = resp.data;
                $("#team-id").val(team.id);
                $("#description").val(team.description);
                $('#chooseMembers option[value="'+ team.member_id +'"]').attr('selected', true);
			}) // end get
		}
		
		// update team using modal
		self.openProjUpdModal = function(id){
			$http.get("http://localhost:8080/project/" + id).
			then(function(resp) {
				var project = resp.data;
                $("#project-id").val(project.id);
                $("#project-name").val(project.name);
                $("#project-description").val(project.description);
				$("#team-select").val(project.team_id);
                $('#project-status option[value="' + project.status + '"]').attr('selected', true);
                $('#project-priority option[value="' + project.priority + '"]').attr('selected', true);
                $("#datepickerSD").datepicker('setDate', new Date(project.start_date));
				$("#datepickerD").datepicker('setDate', new Date(project.deadline));
                $("#project-work").val(project.work_remaining);
                $('#project-phase option:contains(' + project.phase + ')').prop('selected', true);
			}) // end get
		} 
		
	self.viewProject = function(pid){
		$("#viewProjModal").modal("show");
		$http.get('http://localhost:8080/project/' + pid)
			.then(function(resp){
			var project = resp.data;
			$("#project-id2").val(project.id);
			$("#project-name2").val(project.name);
			$("#project-description2").val(project.description);
			$("#team-select2").val(project.team_id);
			$('#project-status2 option[value="' + project.status + '"]').attr('selected', true);
			$('#project-priority2 option[value="' + project.priority + '"]').attr('selected', true);
			$("#datepickerSD2").datepicker('setDate', new Date(project.start_date));
			$("#datepickerD2").datepicker('setDate', new Date(project.deadline));
			$("#project-work2").val(project.work_remaining);
			$('#project-phase2 option:contains(' + project.phase + ')').prop('selected', true);
		});
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
		.when('/viewProject/:projectId', {
			templateUrl: 'viewProject.html',
			controller: 'AppCtrl',
			controllerAs: 'ctrl'
		});
	}]) 