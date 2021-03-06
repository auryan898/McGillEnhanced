/*
McGill Enhanced is a chrome extension that improves the functionality and navigability of McGill.ca
Copyright (C) 2016 Demetrios Koziris

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License 
as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied 
warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the GNU General Public License for more details.

A copy of the GNU General Public License is provided in the LICENSE.txt file along with this program.	
The GNU General Public License can also be found at <http://www.gnu.org/licenses/>.
*/

//jshint esversion: 6


setupScheduleExporter();


function setupScheduleExporter() {
	if (!(document.getElementById('term_id'))) {

		const schedDownloadDiv = document.createElement('div');

		const schedDownloadButton = document.createElement('button');
		schedDownloadButton.setAttribute("type", "button");
		schedDownloadButton.setAttribute("onclick", "document.dispatchEvent(new Event('mcenExportSchedule'));");
		schedDownloadButton.id = 'mcen-sched-download';
		schedDownloadButton.innerHTML = "McGill Enhanced:<br>Export Course Schedule as ICS file!";
		schedDownloadButton.title = "ICS file can be imported into many calendar apps\nsuch as Google Calendar, Apple iCal, or Outlook!";
		schedDownloadButton.setAttribute("onmouseover", "this.style.border=\"2px solid #E54944\"");
		schedDownloadButton.setAttribute("onmouseout", "this.style.border=\"2px solid #5B5B5A\"");
		schedDownloadDiv.appendChild(schedDownloadButton);

		const pagebodydiv = document.getElementsByClassName("pagebodydiv")[0];
		pagebodydiv.insertBefore(schedDownloadDiv, pagebodydiv.firstChild);

		document.addEventListener('mcenExportSchedule', function(data) {
			logForDebug('Received mcenExportSchedule event');
			exportSchedule();
		});

	}
}


function exportSchedule() {

	const mapData = getMapData();

	const calCourseSchedule = ics();

	const courseTables = document.getElementsByClassName("datadisplaytable");
	let courseSemester = '';

	for (i = 0; i < courseTables.length-1; ) {

		logForDebug(courseTables[i].getElementsByClassName("captiontext")[0].innerText);
		logForDebug(courseTables[i+1].getElementsByClassName("captiontext")[0].innerText);
		if (courseTables[i+1].getElementsByClassName("captiontext")[0].innerText === "Scheduled Meeting Times") {

			const courseInfoTable = courseTables[i].getElementsByClassName("dddefault");
			const courseSchedTable = courseTables[i+1].getElementsByClassName("dddefault");
			//console.log(courseSchedTable);

			for (j = 0; j < courseSchedTable.length; j+=6) {
				courseSemester = courseTables[0].getElementsByClassName("dddefault")[0].innerText.replace(" ","");
				const courseName = courseTables[i].getElementsByClassName("captiontext")[0].innerText.split(" - ")[0];
				const courseNumberArr = courseTables[i].getElementsByClassName("captiontext")[0].innerText.split(" - ");
				const courseNumber = courseNumberArr[1].replace(/\s/g,"") + "-" + courseNumberArr[2].replace(/\s/g,"");
				const courseType = courseSchedTable[j+4].innerText;
				const courseStartDay = courseSchedTable[j+3].innerText.split(" - ")[0];
				const startTime = courseSchedTable[j+0].innerText.split(" - ")[0];
				const endDay = courseSchedTable[j+3].innerText.split(" - ")[1];
				const endTime = courseSchedTable[j+0].innerText.split(" - ")[1];
				const courseDays = courseSchedTable[j+1].innerText.split("");
				let courseLocation = courseSchedTable[j+2].innerText;
				const courseLocationArr = courseLocation.split(" ");
				const courseBuilding = courseLocationArr.slice(0, -1).join(" ");
				const courseRoom = courseLocationArr[courseLocationArr.length-1];


				let eventName = courseNumber + " " + courseType.slice(0,3).toUpperCase();
				let eventDesc = courseName + "\\n" + courseType + " in " + courseLocation;
				const courseMapData = mapData[courseBuilding];
				if (courseMapData) {
					courseLocation = courseBuilding + " " + courseMapData.address;
					eventName = courseNumber + " " + courseType.slice(0,3).toUpperCase() + " (" + courseMapData.minerva + " " + courseRoom + ")";
					const mapIDs = courseMapData.map;
					for (let m = 0; m < mapIDs.length; m++) {
						eventDesc += "\\n" + "http://maps.mcgill.ca/?campus=DWT&txt=EN&id=" + mapIDs[m];
					}		
				}


				

				const days = ["U","M","T","W","R","F","S"];
				const startDate = new Date(courseStartDay);
				let startDateHasCourse = false;
				let count = 0;
				while (!startDateHasCourse && count < 7) {
					//console.log("round" + count + " startDate:" + startDate.toUTCString());
					for (l = 0; l < courseDays.length; l++) {
						//console.log("courseDays["+l+"]:" + courseDays[l]);
						//console.log("days[startDate.getDay()]:days["+startDate.getDay()+"]:" + days[startDate.getDay()] );
						if (courseDays[l] == days[startDate.getDay()]) {
							//console.log("true");
							startDateHasCourse = true;
						}
					}
					if (!startDateHasCourse) {
						startDate.setDate(startDate.getDate() + 1);
						count++;
					}
				}
				const startDayValues = startDate.toUTCString().split(" ");
				startDay = startDayValues[2] + " " + startDayValues[1] + ", " + startDayValues[3];
				//console.log(startDay);

				for (k = 0; k < courseDays.length; k++) {
					switch (courseDays[k]) {
						case "U":
								courseDays[k] = "SU";
								break;
						case "M":
								courseDays[k] = "MO";
								break;
						case "T":
								courseDays[k] = "TU";
								break;
						case "W":
								courseDays[k] = "WE";
								break;
						case "R":
								courseDays[k] = "TH";
								break;
						case "F":
								courseDays[k] = "FR";
								break;
						case "S":
								courseDays[k] = "SA";
								break;
					}
				}

				const validDays = ["SU","MO","TU","WE","TH","FR","SA"];
				let validEvent = true;
				for (m = 0; m < courseDays.length; m++) {
					validEventDay = false;
					for (n = 0; n < validDays.length; n++) {
						if (courseDays[m] == validDays[n]) {
							validEventDay = true;
						}
					}
					if (!validEventDay) {
						validEvent = false;
					}
				}
				if (validEvent) {
					const rrule = {
							freq:"WEEKLY",
							until:endDay,
							interval:1,
							byday:courseDays
					};
					calCourseSchedule.addEvent(eventName, eventDesc, courseLocation, startDay + " " + startTime, startDay + " " + endTime, rrule);
				}


				const courseData = {
					courseName:courseName,
					courseNumber:courseNumber,
					startTime:startTime,
					startDay:startDay,
					endTime:endTime,
					endDay:endDay,
					courseDays:courseDays,
					courseLocation:courseLocation,
					courseType:courseType
				};
				// console.log(courseData);
	
			}

			i+=2;
		}
		else {
			i++;
		}
	}

	if (courseTables.length > 0) {
		calCourseSchedule.download('CourseSchedule' + courseSemester);
	}
	else {
		alert("McGill Enhanced did not find any course events to export.");
	}
	
}


function getMapData() {
	const mapData = {
		"Adams Building": {
			"minerva":"ADAMS",
			"address":"3450 rue University",
			"map":["Adams"]
		},
		"Arts Building": {
			"minerva":"ARTS",
			"address":"853 rue Sherbrooke ouest",
			"map":["Arts"]
		},
		"Birks Building": {
			"minerva":"BIRKS",
			"address":"3520 rue University",
			"map":["Birks"]
		},
		"Bronfman Building": {
			"minerva":"BRONF",
			"address":"1001 rue Sherbrooke Ouest",
			"map":["Bronfman"]
		},
		"Burnside Hall": {
			"minerva":"BURN",
			"address":"805 rue Sherbrooke ouest",
			"map":["Burnside"]
		},
		"Charles Meredith House": {
			"minerva":"CMH",
			"address":"1130 av des Pins Ouest",
			"map":["MeredithHouse"]
		},
		"Cote Des Neiges 5858": {
			"minerva":"COTE",
			"address":"5858 chemin Cote des Neiges",
			"map":["CDN5858"]
		},
		"Currie Gymnasium": {
			"minerva":"CURRIE",
			"address":"475 ave des Pins ouest",
			"map":["CurrieGym"]
		},
		"Davis House": {
			"minerva":"DAVIS",
			"address":"3654 promenade Sir William Osler",
			"map":["Davis"]
		},
		"Dawson Hall": {
			"minerva":"DAWSON",
			"address":"853 rue Sherbrooke ouest",
			"map":["Dawson"]
		},
		"Duff Medical Building": {
			"minerva":"DUFF",
			"address":"3775 rue University",
			"map":["Duff"]
		},
		"Duggan House": {
			"minerva":"DUGGAN",
			"address":"3724 rue McTavish",
			"map":["Duggan"]
		},
		"Education Building": {
			"minerva":"EDUC",
			"address":"3700 rue McTavish",
			"map":["Education"]
		},
		"Hosmer House": {
			"minerva":"HOSMER",
			"address":"3630 Sir William Osler",
			"map":["Hosmer"]
		},
		"Hosmer Coach House": {
			"minerva":"HOSMCH",
			"address":"3541 rue de la Montagne",
			"map":["HosmerAnnex"]
		},
		"Hugessen House": {
			"minerva":"HUGE",
			"address":"3666 rue McTavish",
			"map":["Hugessen"]
		},
		"James Administration Building": {
			"minerva":"JAMES",
			"address":"845 rue Sherbrooke ouest",
			"map":["JamesAdmin"]
		},
		"Lady Meredith House": {
			"minerva":"LMH",
			"address":"1110 ave Des Pins ouest",
			"map":["Meredith"]
		},
		"Leacock Building": {
			"minerva":"LEA",
			"address":"855 rue Sherbrooke ouest",
			"map":["Leacock"]
		},
		"Life Sciences Complex": {
			"minerva":"LIFE",
			"address":"3649 Sir William Osler",
			"map":["LifeSci"]
		},
		"Ludmer Building": {
			"minerva":"PN1033",
			"address":"1033 ave Des Pins ouest",
			"map":["Ludmer"]
		},
		"Maass Chemistry Building": {
			"minerva":"MAASS",
			"address":"801 rue Sherbrooke ouest",
			"map":["Maass"]
		},
		"Macdonald Engineering Building": {
			"minerva":"ENGMD",
			"address":"817 rue Sherbrooke ouest",
			"map":["MacdonaldEng"]
		},
		"Macdonald Harrington Building": {
			"minerva":"MDHAR",
			"address":"815 rue Sherbrooke ouest",
			"map":["MacdonaldHarr"]
		},
		"McConnell Arena": {
			"minerva":"RINK",
			"address":"3883 rue University",
			"map":["McConnellArena"]
		},
		"McConnell Engineering Building": {
			"minerva":"ENGMC",
			"address":"3480 rue University",
			"map":["McConnellEng"]
		},
		"McGill College 2001": {
			"minerva":"MC2001",
			"address":"2001 av McGill College",
			"map":["McGillCollege2001"]
		},
		"McIntyre Medical Building": {
			"minerva":"MCMED",
			"address":"3655 promenade Sir William Osler",
			"map":["McIntyre"]
		},
		"McLennan Library Building": {
			"minerva":"MCLIB",
			"address":"3459 McTavish Street",
			"map":["McLennan"]
		},
		"McTavish 3430": {
			"minerva":"MT3430",
			"address":"3430 rue McTavish",
			"map":["McTavish3430"]
		},
		"McTavish 3434": {
			"minerva":"MT3434",
			"address":"3434 rue McTavish",
			"map":["McTavish3434"]
		},
		"McTavish 3438": {
			"minerva":"MT3438",
			"address":"3438 rue McTavish",
			"map":["McTavish3438"]
		},
		"McTavish 3610": {
			"minerva":"MT3610",
			"address":"3610 rue McTavish",
			"map":["McTavish3610"]
		},
		"Montreal Neurological Institute": {
			"minerva":"MNI",
			"address":"3801 rue University",
			"map":["MNI"]
		},
		"Morrice Hall": {
			"minerva":"MOR",
			"address":"3485 rue McTavish",
			"map":["Morrice"]
		},
		"Chancellor Day Hall": {
			"minerva":"CDH",
			"address":"3644 rue Peel",
			"map":["NewChancellorDay", "OldChancellorDay"]
		},
		"Peel 1555": {
			"minerva":"PL1555",
			"address":"1555 rue Peel",
			"map":["Peel1555"]
		},
		"Peel 3437": {
			"minerva":"PL3437",
			"address":"3437 rue Peel",
			"map":["Peel3437"]
		},
		"Peel 3459": {
			"minerva":"PL3459",
			"address":"3459 rue Peel",
			"map":["Peel3459"]
		},
		"Peel 3463": {
			"minerva":"PL3463",
			"address":"3463 rue Peel",
			"map":["Peel3463"]
		},
		"Peel 3465": {
			"minerva":"PL3465",
			"address":"3465 rue Peel",
			"map":["Peel3465"]
		},
		"Peel 3471": {
			"minerva":"PL3471",
			"address":"3471 rue Peel",
			"map":["Peel3471"]
		},
		"Peel 3475": {
			"minerva":"PL3475",
			"address":"3475 rue Peel",
			"map":["Peel3475"]
		},
		"Peel 3479": {
			"minerva":"PL3479",
			"address":"3479 rue Peel",
			"map":["Peel3479"]
		},
		"Peel 3483": {
			"minerva":"PL3483",
			"address":"3483 rue Peel",
			"map":["Peel3483"]
		},
		"Peel 3487": {
			"minerva":"PL3487",
			"address":"3487 rue Peel",
			"map":["Peel3487"]
		},
		"Peel 3491": {
			"minerva":"PL3491",
			"address":"3491 rue Peel",
			"map":["Peel3491"]
		},
		"Peel 3495": {
			"minerva":"PL3495",
			"address":"3495 rue Peel",
			"map":["Peel3495"]
		},
		"Peel 3505 (First People's House)": {
			"minerva":"PL3505",
			"address":"3505 rue Peel",
			"map":["Peel3505"]
		},
		"Peel 3647": {
			"minerva":"PL3647",
			"address":"3647 rue Peel",
			"map":["Peel3647"]
		},
		"Peel 3661": {
			"minerva":"PL3661",
			"address":"3661 rue Peel",
			"map":["Peel3661"]
		},
		"Peel 3661A": {
			"minerva":"PL3661A",
			"address":"3661a rue Peel",
			"map":["Peel3661A"]
		},
		"Peel 3674": {
			"minerva":"PL3674",
			"address":"3674 rue Peel",
			"map":["Peel3674"]
		},
		"Peel 3690": {
			"minerva":"PL3690",
			"address":"3690 rue Peel",
			"map":["Peel3690"]
		},
		"Peel 3704": {
			"minerva":"PL3704",
			"address":"3704 rue Peel",
			"map":["Peel3704"]
		},
		"Peel 3710": {
			"minerva":"PL3710",
			"address":"3710 rue Peel",
			"map":["Peel3710"]
		},
		"Peel 3715": {
			"minerva":"PL3715",
			"address":"3715 rue Peel",
			"map":["Peel3715"]
		},
		"Dr. Penfield 1085": {
			"minerva":"PE1085",
			"address":"1085 rue Docteur Penfield",
			"map":["Penfield1085"]
		},
		"Peterson Hall": {
			"minerva":"PETH",
			"address":"3460 rue McTavish",
			"map":["Peterson"]
		},
		"Pine 499": {
			"minerva":"PN499",
			"address":"449 av Des Pins",
			"map":["Pine499"]
		},
		"Pine 501": {
			"minerva":"PN501",
			"address":"501 rue des Pins",
			"map":["Pine501"]
		},
		"Pine 509": {
			"minerva":"PN509",
			"address":"509 rue Des Pins",
			"map":["Pine509"]
		},
		"Pine 515-517": {
			"minerva":"PN515",
			"address":"515-517 rue Des Pins",
			"map":["Pine515-517"]
		},
		"Pine 523": {
			"minerva":"PN523",
			"address":"523 rue Des Pins",
			"map":["Pine523"]
		},
		"Pine 527": {
			"minerva":"PN527",
			"address":"527 rue Des Pins",
			"map":["Pine527"]
		},
		"Pine 546": {
			"minerva":"PN546",
			"address":"546 rue Des Pins",
			"map":["Pine546"]
		},
		"Pine 1140": {
			"minerva":"PN1140",
			"address":"1140 rue des Pins",
			"map":["Pine1140"]
		},
		"Pulp and Paper Building": {
			"minerva":"PULP",
			"address":"3420 rue University",
			"map":["PulpPaper"]
		},
		"Purvis Hall": {
			"minerva":"PURVIS",
			"address":"1020 ave Des Pins ouest",
			"map":["Purvis"]
		},
		"Pine 505": {
			"minerva":"PN505",
			"address":"505 rue Des Pins",
			"map":["Pine505"]
		},
		"Redpath Library Building": {
			"minerva":"REDLIB",
			"address":"3459 rue McTavish",
			"map":["RedpathLibrary"]
		},
		"Redpath Museum": {
			"minerva":"REDMUS",
			"address":"859 rue Sherbrooke ouest",
			"map":["RedpathMuseum"]
		},
		"Rutherford Physics Building": {
			"minerva":"RPHYS",
			"address":"3600 rue University",
			"map":["Rutherford"]
		},
		"Sherbrooke 550": {
			"minerva":"SH550",
			"address":"550 ave Sherbrooke",
			"map":["Sherbrooke550"]
		},
		"Sherbrooke 680-688": {
			"minerva":"SH688",
			"address":"680-688 rue Sherbrooke ouest",
			"map":["Sherbrooke680_688"]
		},
		"Sherbrooke 1010": {
			"minerva":"SH1010",
			"address":"1010 av Sherbrooke ouest",
			"map":["Sherbrooke1010"]
		},
		"Steinberg Centre for Simulation and Interactive Learning": {
			"minerva":"MEDSKL",
			"address":"3675 rue Parc",
			"map":["Steinberg"]
		},
		"Stewart Biology Building": {
			"minerva":"STBIO",
			"address":"1205 ave du Docteur-Penfield",
			"map":["StewartBio"]
		},
		"Strathcona Anatomy & Dentistry": {
			"minerva":"SADB",
			"address":"3640 rue University",
			"map":["StrathconaAD"]
		},
		"Strathcona Music Building": {
			"minerva":"MUSIC",
			"address":"555 rue Sherbrooke ouest",
			"map":["StrathconaMusic"]
		},
		"Trottier Building": {
			"minerva":"ENGTR",
			"address":"3630 rue University",
			"map":["Trottier"]
		},
		"University Hall Residence": {
			"minerva":"Dioceasan College",
			"address":"3473 rue University",
			"map":["UniversityHallRes"]
		},
		"Wilson Hall": {
			"minerva":"WILSON",
			"address":"3506 rue University",
			"map":["Wilson"]
		},
		"Wirth Music Building": {
			"minerva":"WIRTH",
			"address":"527 rue Sherbrooke ouest",
			"map":["Wirth"]
		},
		"Wong Building": {
			"minerva":"WONG",
			"address":"3610 rue University",
			"map":["Wong"]
		},
		"Barton Building": {
			"minerva":"BARTON",
			"address":"21111 Lakeshore Road",
			"map":["Barton"]
		},
		"Centennial Centre": {
			"minerva":"CENTEN",
			"address":"21111 Lakeshore Road",
			"map":["Centennial"]
		},
		"Centre for Indigenous People's Nutrition and Environment (CINE)": {
			"minerva":"CINE",
			"address":"21111 Lakeshore Road",
			"map":["CINE"]
		},
		"Farm Centre": {
			"minerva":"FARM",
			"address":"21111 Lakeshore Road",
			"map":["FarmCentre"]
		},
		"Macdonald Stewart Building": {
			"minerva":"MACSTW",
			"address":"21111 Lakeshore Road",
			"map":["MacStewart"]
		},
		"Marshall Radar Observatory": {
			"minerva":"RADAR",
			"address":"3 chemin des Pins",
			"map":["MarshallRadar"]
		},
		"North Power House": {
			"minerva":"NPOWER",
			"address":"21111 Lakeshore road",
			"map":["NorthPowerHouse"]
		},
		"Old Dairy Barn": {
			"minerva":"CBARN",
			"address":"21111 Lakeshore Road",
			"map":["OldDairy"]
		},
		"Parasitology Institute": {
			"minerva":"PARA",
			"address":"21111 Lakeshore Road",
			"map":["Parasitology"]
		},
		"Raymond Building": {
			"minerva":"RAYMND",
			"address":"21111 Lakeshore Road",
			"map":["Raymond"]
		},
		"Pilot House": {
			"minerva":"PILOT",
			"address":"21111 Lakeshore Road",
			"map":["SouthPowerHouse"]
		},
		"Stewart Hall": {
			"minerva":"STHALL",
			"address":"21111 Lakeshore Road",
			"map":["StewartAthletics"]
		},
		"Swine Research Complex": {
			"minerva":"SWINE",
			"address":"21111 Lakeshore Road",
			"map":["FarmSwine"]
		},
		"Agriculture & Engineering Labs": {
			"minerva":"AGTECH",
			"address":"21111 Lakeshore Road",
			"map":["TechicalServices"]
		}
	};
	return mapData;
}