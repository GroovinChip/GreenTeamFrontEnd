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
						event = {
							allDay: true,
							title: projects[count].name,
							start: projects[count].deadline,
							end: projects[count].deadline,
							textColor: 'black',
							backgroundColor: '#33ccff',
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