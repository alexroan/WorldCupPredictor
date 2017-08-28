var serverAddress = "http://worldcup.dev/server";

//Sorts into table according to pts,gd,gf....
function SortTeamTable(teams, tableArray){
	for(var teamId in teams){
		var teamData = teams[teamId];
		var teamArrayObj = {
			name: teamId, 
			p: teamData.P,
			w: teamData.W,
			d: teamData.D,
			l: teamData.L,
			gf: teamData.GF,
			ga: teamData.GA,
			gd: teamData.GD,
			pts: teamData.Pts
		};
		tableArray[tableArray.length] = teamArrayObj;
	}
	//Sort table array
	tableArray.sort(function(a,b){
		return b.pts - a.pts || b.gd - a.gd || b.gf - a.gf;
	});
	return tableArray;
}