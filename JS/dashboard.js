$(document).ready(function(){
	var today = new Date();
	$("#datepickerD").attr("min", today);
	$("#datepickerSD").attr("min", today);
	$( function() {
		$( "#datepickerD" ).datepicker({
			minDate: "-12M -0D", maxDate: "+12M +0D",
			dateFormat: "yy-mm-dd",
			showButtonPanel: true
		});
	} );
	$( function() {
		$( "#datepickerSD" ).datepicker({
			minDate: "-12M -0D", maxDate: "+12M +0D",
			dateFormat: "yy-mm-dd",
			showButtonPanel: true,
			setDate: today
		});
	} );
	// Need to get current date
	
	$("#datepickerD2").attr("min", today);
	$("#datepickerSD2").attr("min", today);
	$( function() {
		$( "#datepickerD2" ).datepicker({
			minDate: "-12M -0D", maxDate: "+12M +0D",
			dateFormat: "yy-mm-dd",
			showButtonPanel: true
		});
	} );
	$( function() {
		$( "#datepickerSD2" ).datepicker({
			minDate: "-12M -0D", maxDate: "+12M +0D",
			dateFormat: "yy-mm-dd",
			showButtonPanel: true,
			setDate: today
		});
	} );
	// Need to get current date
	
	var projects = [];		
	var event;
	$("#calendar").fullCalendar({
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month'
		},
		weekends: false,
		height: 650,
		events: function(start, end, callback){
			$.ajax({
				url: 'http://localhost:8080/projects'
			}).then(function(projects){
				//console.log("AJAX CALL PERFORMED");
				for(var count = 0; count < projects.length; count++){
					var project = projects[count];
					project.project_health = calcProjHealth(project.start_date, project.deadline,project.work_remaining);
					
					event = {
						allDay: true,
						title: projects[count].name,
						start: projects[count].deadline,
						end: projects[count].deadline,
						textColor: 'black',
						backgroundColor: changeColor(project.project_health),
						id: projects[count].id
					};
					$("#calendar").fullCalendar('renderEvent', event);
				}
			});		
		},
		eventClick: function(event, jsEvent, view){
			$("#viewProjModal").modal("show");
			$.ajax({
				url: 'http://localhost:8080/project/' + event.id
			}).then(function(resp){
				var project = resp;
				console.log(project);
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
		}
	});
	
	function calcProjHealth(startDate, deadline, work_remaining){
		var today = new Date();
		today.setHours(0,0,0,0);
		var dDate1 = new Date();
		if(startDate <= today){
			dDate1 = today;
		}
		else{
			dDate1 = new Date(startDate);
		}
		var dDate2 = new Date(deadline);
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
	function changeColor(health){
		if(health < 100 && health >= 90){
			return "#009900";
		}
		else if(health < 90 && health >= 80){
			return "orange";
		}
		else if(health < 80){
			return "red";
		}
	}
	
	$("#closeModal").click(function(){
		$("#popupNoteInput").val("");
	});
	$("#x").click(function(){
		$("#popupNoteInput").val("");
	});
	$("#clear").click(function(){
		$("#popupNoteInput").val("");
	});
	$("#addNoteBtn").click(function(){
		$("#popupNoteInput").val("");
	});
	
	var projects = [];
	var projectCount = 0;
	var lowCount = 0;
	var normalCount = 0;
	var highCount = 0;
	var criticalCount = 0;
	$.ajax({
		url: 'http://localhost:8080/projects'
	}).then(function(resp){
		projects = resp;
		projectCount = projects.length;

		for(var i = 0; i < projects.length; i++){
			switch(projects[i].priority){
				case 1: lowCount++;
				break;
				case 2: normalCount++;
				break;
				case 3: highCount++;
				break;
				case 4: criticalCount++;
				break;
			}
		}
		CanvasJS.addColorSet("priority",
			[//colorSet Array
			"#335EFF", //blue
			"#06C900", // green
			"#FF8633", // orange
			"#FC2525" // red
		]);
		var chart = new CanvasJS.Chart("chartContainer", {
			colorSet: "priority",
			title:{
				text: "Projects by Priority"
			},
			animationEnabled: true,
			theme: "theme2",
			data: [
			{
				// Change type to "doughnut", "line", "splineArea", etc.
				type: "pie",
				showInLegend: true,
				name: "Name",
				dataPoints: [
				{y: lowCount, legendText:"Low", label:"Low Priority"},
				{y: normalCount, legendText:"Normal", label:"Normal Priority"},
				{y: highCount, legendText:"High", label:"High Priority"},
				{y: criticalCount, legendText:"Critical", label:"Critical Priority"}
				]
			}
			] // end
		});
		chart.render();
	});
});