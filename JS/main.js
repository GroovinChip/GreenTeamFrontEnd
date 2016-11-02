angular.module("AppMod", ["ngRoute"])
	.controller("AppCtrl", ['$http', '$routeParams', '$location', function($http, $routeParams, $location) {
		var self = this;
		self.id = $routeParams.memberId;
		self.today = new Date();
		self.today.setHours(0,0,0,0);
		self.problemProjects = 0;
		
		/* OBJECT SECTION 
		   --------------  */
		
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
	
		/* 'GET ALL X' SECTION 
		   -------------------  */
	
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
			},function(err) {

			});
		
		// Get all projects
		$http.get('http://localhost:8080/projects')
			.then(function(resp){
				self.projects = resp.data;
				for(var count = 0; count < self.projects.length; count++){                    
					var startDate = new Date(self.projects[count].start_date);
					var deadline = new Date(self.projects[count].deadline);
					
					startDate.setHours(0,0,0,0); // FIX FOR DATES
					deadline.setHours(0,0,0,0); // FIX FOR DATES
					self.projects[count].start_date = startDate; // FIX FOR DATES
					self.projects[count].deadline = deadline; // FIX FOR DATES
					
					if(self.projects[count].status == 1) {
						self.projects[count].project_health = self.calcProjHealth(startDate, deadline, self.projects[count].work_remaining);
					} else {
						self.projects[count].project_health = 100;
					}
					
					if( (self.projects[count].project_health < 100 && self.today <= self.projects[count].deadline) || self.projects[count].tracked == 1 ) { // FIX FOR DATES
						self.problemProjects++;
					}
			}
			// Solves project health sorting on dashboard - KYLE
			self.projects.sort(function(a,b){return a.project_health-b.project_health})		
			},function(err) {

			});
			
		// Get all notes
		$http.get('http://localhost:8080/notes')
			.then(function(resp){
				self.allNotes = resp.data;
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

			var hoursRemaining = (iDateDiff + 1) * 8;
			var projectHealth = hoursRemaining / work_remaining * 100;
			// TERNIARY
			projectHealth > 100 ? projectHealth = 100 : projectHealth = projectHealth;
			//self.projects[count].project_health = projectHealth;
			projectHealth = Math.round(projectHealth);
			return projectHealth;
		}
		
		// Based on the health level of a project, change the color
		self.changeColor = function(health){
			if(health < 100 && health >= 90){
				return { color: "#009900" };
			}
			else if(health < 90 && health >= 80){
				return { color: "orange" };
			}
			else if(health < 80){
				return { color: "red" };
			}
		}
		
		/* MEMBER ACTIONS SECTION 
		   ----------------------  */
		
		// Add new member
		self.addNewMember = function(){
			$http({
				method: 'POST',
				url: 'http://localhost:8080/member',
				data: self.memberObj
			}).then(
				window.location.href = "http://localhost:8081/start.html#/viewAllMembers"
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
		
		// Open modal to update member
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
		};
		
		// Update member
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
		
		// Delete member
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
		
		/* TEAM ACTIONS SECTION 
		   --------------------  */
		
		// Add new team
		self.addNewTeam = function(){
			$http({
				method: 'POST',
				url: 'http://localhost:8080/team',
				data: self.teamObj
			}).then(
				window.location.href = "http://localhost:8081/start.html#/viewAllTeams"
			).then(
                location.reload(true)
            )
		};
		
		// Open modal to update team
		self.openTeamUpdModal = function(id){
			$http.get("http://localhost:8080/team/" + id).
			then(function(resp) {
				var team = resp.data;
                $("#team-id").val(team.id);
                $("#description").val(team.description);
                $('#chooseMembers option[value="'+ team.member_id +'"]').attr('selected', true);
			}) // end get
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
		
		// Delete Team		
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
		
		/* PROJECTS ACTIONS SECTION 
		   ------------------------  */
		
		// Create Project
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
            project.tracked = self.projectObj.tracked; 
			$http({
                method: 'PUT',
                url: 'http://localhost:8080/updateproject',
                data: project
            }).then(function() {
                location.reload(true);
            });
        }; // end updateProject
		
		// Delete Project		
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
		
		// Open modal to update project
		self.openProjUpdModal = function(id){
			$http.get("http://localhost:8080/project/" + id).
			then(function(resp) {
				var project = resp.data;
				self.projectObj = project;
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
		
		// Populate the content of the 'view project' modal
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
		
		/* NOTES ACTIONS SECTION
		   ---------------------  */
		
		// Open the notes modal and get the notes for the specified project
		self.openNotesModal = function(id){
			$http.get("http://localhost:8080/project/" + id).
			then(function(resp) {
				// Store the specified project
				self.projectObj = resp.data;
				// Get the specified project's notes
				$http.get('http://localhost:8080/notes/'+id)
				.then(function(resp){
					self.notes = resp.data;
				});
			}) // end get
		};
		
		self.regex1 = new RegExp(/^[\s\S]*/);
		// Add a note to a project
		self.addProjNote = function(note, id){
			self.targetProjId = id;
			var notetrimmed = note.trim();//new
			var addNote ={}
			//addNote.message = note;
			addNote.message = notetrimmed;
			addNote.flagged = 0; //without this set the html would break if the default was changed to 1
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
					// for note button flagging implementation on dashboard
					self.allNotes.forEach(function(thisnote,index,list) {
						for(var i = 0; i < self.notes.length; i++) {
							if(thisnote.project_id == self.notes[i].project_id) {
								list.splice(index, 1);
							}
						}
					}) // end ForEach on self.allNotes
					self.notes.forEach(function(thisnote) {
						self.allNotes.push(thisnote);
					}) // end ForEach on self.notes
				})
			})
		};
		
		// Add a note to a project
		/* self.addProjNote = function(note, id){
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
					// for note button flagging implementation on dashboard
					self.allNotes.forEach(function(thisnote,index,list) {
						for(var i = 0; i < self.notes.length; i++) {
							if(thisnote.project_id == self.notes[i].project_id) {
								list.splice(index, 1);
							}
						}
					}) // end ForEach on self.allNotes
					self.notes.forEach(function(thisnote) {
						self.allNotes.push(thisnote);
					}) // end ForEach on self.notes
				})
			})
		}; */
		
		// Delete a note 
		self.deleteNote = function(noteId){
			var conf = confirm("Delete this note?");
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
						// Delete same note from allNotes list
						self.allNotes.forEach(function(note, index, list) {
							if(noteId === note.id) {
								list.splice(index, 1);
							}
						}); // end forEach
				})
			}
		};
		
		/* OTHER ACTIONS SECTION
		   ---------------------  */
		
		// Logout button
		self.confirmLogout = function() {
			var conf = confirm("Log out?");

			if(conf){
				window.location.href = "http://localhost:8081/";
			}
		}
		
		// Steve's flag button
		self.flagNote = function(note) {
			// flag the note and update the database
    		if (note.flagged == 0) {
					note.flagged = 1;
					self.updateNote(note);
			} else { //if (note.toggleText == "Resolve!")
					  note.flagged = 0;
			  self.updateNote(note);
			  // note.problemflag = 0;
			}
			// find same note in angular list and update that so that comment icon changes
			for(var i = 0; i < self.allNotes.length; i++) {
				if(note.id == self.allNotes[i].id) {
					self.allNotes[i] = note;
				}
			}
		}
		
		self.hasFlaggedNotes = function(projectId) {
			var hasFlaggedNotes = false;
			for(var i = 0; i < self.allNotes.length; i++) {
				if (projectId == self.allNotes[i].project_id && self.allNotes[i].flagged == 1) {
					hasFlaggedNotes = true;
					break;
				}
			}
			return hasFlaggedNotes;
		}
		
		// Steve's update note
		self.updateNote = function(note) {
			self.targetProjId = note.project_id;
			$http({
				method: 'PUT',
				url: 'http://localhost:8080/updatenote',
				data: note
			}).then(function(note) {
				  $http.get('http://localhost:8080/notes/' + self.targetProjId).
				  then(function(resp){
					  self.notes = resp.data;
			    }) // end get
		  }); // end update
		} // end updateNote
		
		// Toggle project tracking
		self.trackProject = function(project) {
			console.log("Clicked: ", project.id);
			if(project.tracked == 1) {
				project.tracked = 0;
				self.projectObj.track = 0;
			} else {
				project.tracked = 1;
				self.projectObj = 1;
			}
			delete project.project_health;
			self.projectObj = project;
			console.log(project);
		$http({
					method: 'PUT',
					url: 'http://localhost:8080/updateproject',
					data: project
			});
		}
		
		// Tracked implementation
		self.evaluateStatus = function(status) {
			var statusString = "";
			switch(status) {
				case 0: statusString = "Inactive";
				break;
				case 1: statusString = "Active";
				break;
				case 2: statusString = "Completed";
				break;
			}
			return statusString;
		}

		// Tracked implementation
		self.evaluatePriority = function(priority) {
			var priorityString = "";
			switch(priority) {
				case 1: priorityString = "Low";
				break;
				case 2: priorityString = "Normal";
				break;
				case 3: priorityString = "High";
				break;
				case 4: priorityString = "Critical";
				break;
			}
			return priorityString;
		}
		
		// Return member name given memberId
		self.loadMemberName = function(memberId) {
			var memberName = "";

			for (var i = 0; i < self.members.length; i++) {
				if (memberId == self.members[i].id) {
					memberName = self.members[i].first_name + " " + self.members[i].last_name;
					break;
				}
			}
			return memberName;
		}
		
		// Return team name given id
		self.loadTeamName = function(teamId) {
			var teamName = "";

			for (var i = 0; i < self.teams.length; i++) {
				if (teamId == self.teams[i].id) {
					teamName = self.teams[i].description;
					break;
				}
			}
			return teamName;
		}
	
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