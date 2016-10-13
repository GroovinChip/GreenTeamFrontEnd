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

		// FOR CREATE MEMBER
		self.memberObj = {
			id: "",
			first_name: "",
			last_name: "",
			gs_grade: "",
			role: ""
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
			
		// FOR CREATE TEAM
		self.seletedItems = [];
		
		self.addToList = function(selectItem){
			self.seletedItems.push(selectItem);
			console.log(selectItem);
		};
		
		self.removeFromList = function($index){
			self.seletedItems.splice($index, 1);
		};
	}]) // end controller