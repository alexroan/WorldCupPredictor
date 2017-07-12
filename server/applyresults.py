import json, glob, operator

def find_match_in_predictions(predictions, match_number):
	returned = None
	if int(match_number) < 49:
		#its a group game
		groups = predictions["Groups"]
		for group_id in groups:
			fixtures = groups[group_id]["Fixtures"]
			for fixture_id in fixtures:
				if fixture_id == match_number:
					returned = fixtures[fixture_id]
					break
			if returned is not None:
				break
	else:
		#its a knockout game
		rounds = predictions["Knockouts"]["Fixtures"]
		for round_id in rounds:
			this_round_fixtures = rounds[round_id]
			for fixture_id in this_round_fixtures:
				if fixture_id == match_number:
					returned = this_round_fixtures[fixture_id]
					break
			if returned is not None:
				break
	return returned


def calculate_fixture_prediction_points(fixture_prediction, fixture_result):
	points = 0
	home_goals_prediction = fixture_prediction["HomeGoals"]
	away_goals_prediction = fixture_prediction["AwayGoals"]
	real_home_goals = fixture_result["HomeGoals"]
	real_away_goals = fixture_result["AwayGoals"]
	prediction_result = determine_winner(home_goals_prediction, away_goals_prediction)
	real_result = determine_winner(real_home_goals, real_away_goals)

	if prediction_result == real_result:
		points+=1
		if home_goals_prediction == real_home_goals and away_goals_prediction == real_away_goals:
			points += 2
	return points


def determine_winner(home_goals, away_goals):
	result = None
	if home_goals > away_goals:
		result = "Home"
	elif away_goals > home_goals:
		result = "Away"
	else:
		result = "Draw"
	return result


def update_table(table, home, home_goals, away, away_goals):
	if home not in table:
		table[home] = {"P": 0, "GF": 0, "GA": 0, "GD": 0, "W": 0, "D": 0, "L": 0, "Pts": 0}
	if away not in table:
		table[away] = {"P": 0, "GF": 0, "GA": 0, "GD": 0, "W": 0, "D": 0, "L": 0, "Pts": 0}
	t_home = table[home]
	t_home["P"] += 1
	t_home["GF"] += home_goals
	t_home["GA"] += away_goals
	t_home["GD"] = t_home["GF"] - t_home["GA"]
	t_away = table[away]
	t_away["P"] += 1
	t_away["GF"] += away_goals
	t_away["GA"] += home_goals
	t_away["GD"] = t_away["GF"] - t_away["GA"]
	if home_goals > away_goals:
		t_home["W"] += 1
		t_away["L"] += 1
	elif home_goals < away_goals:
		t_away["W"] += 1
		t_home["L"] += 1
	else:
		t_home["D"] += 1
		t_away["D"] += 1
	t_home["Pts"] = (t_home["W"] * 3) + t_home["D"]
	t_away["Pts"] = (t_away["W"] * 3) + t_away["D"]


def get_winning_and_losing_sides(fixture):
	winning_side = determine_winner(fixture)
	losing_side = None
	if winning_side == "Home":
		losing_side = "Away"
	elif winning_side == "Away":
		losing_side = "Home"
	else:
		print('draw in final?')
		#Handle draws and penalties by adding a field "Winner" to fixture?
	return (winning_side, losing_side)


print('Reading real model')
real_model = None
real_groups = None
with open('realmodel.json') as data_file:    
    data = json.load(data_file)
    real_model = data["Results"]
    real_groups = data["Groups"]
    
if real_model is not None and real_groups is not None:
	#go through results and fill in table
	print('Updating real tables using results')
	for result_id in real_model:
		#if result_id is a group game, must update real model groups
		if int(result_id) < 49:
			#update table and apply positions to Groups
			result = real_model[result_id]
			home_team = result["Home"]
			away_team = result["Away"]
			group_id = home_team[:1]
			home_goals = result["HomeGoals"]
			away_goals = result["AwayGoals"]
			group_positions = real_groups[group_id]["Positions"]
			update_table(group_positions, home_team, home_goals, away_team, away_goals)
			print('Group %s table updated' % group_id)

	print('Real model read, Tables updated')
	print('Finding users')
	user_predictions_files = glob.glob('predictions/*.json')
	print('%d users found' % len(user_predictions_files))
	for prediction_file in user_predictions_files:
		print('Reading %s' % prediction_file)
		total_points = 0
		data_file = open(prediction_file)
		user_model = json.load(data_file)

		#Group fixture points
		print('Calculating group fixture points')
		for result_id in real_model:
			fixture_result = real_model[result_id]
			fixture_prediction = find_match_in_predictions(user_model, result_id)
			points = calculate_fixture_prediction_points(fixture_prediction, fixture_result)
			#knockout fixture
			if int(result_id) >= 49:				
				#more points if one or both teams in the game are correct
				if fixture_prediction["Home"] == fixture_result["Home"] or fixture_result["Away"]:
					points += 3
				if fixture_prediction["Away"] == fixture_result["Home"] or fixture_result["Away"]:
					points += 3
				#points for 1st,2nd,3rd,4th place predictions
				if int(result_id) == 63:
					predicted_3rd_side, predicted_4th_side = get_winning_and_losing_sides(fixture_prediction)
					predicted_3rd = fixture_prediction[predicted_3rd_side+"Id"]
					predicted_4th = fixture_prediction[predicted_4th_side+"Id"]
					real_3rd_side, real_4th_side = get_winning_and_losing_sides(fixture_result)
					real_3rd = fixture_prediction[real_3rd_side+"Id"]
					real_4th = fixture_prediction[real_4th_side+"Id"]
					if predicted_3rd == real_3rd:
						points += 3
					if predicted_4th == real_4th:
						points += 3
				elif int(result_id) == 64:
					predicted_winning_side, predicted_losing_side = get_winning_and_losing_sides(fixture_prediction)
					predicted_winner = fixture_prediction[predicted_winning_side+"Id"]
					predicted_runner_up = fixture_prediction[predicted_losing_side+"Id"]
					real_winning_side, real_losing_side = get_winning_and_losing_sides(fixture_result)
					real_winner = fixture_prediction[real_winning_side+"Id"]
					real_runner_up = fixture_prediction[real_losing_side+"Id"]
					if predicted_winner == real_winner:
						points += 10
					if predicted_runner_up == real_runner_up:
						points += 5

			fixture_prediction["Points"] = points
			total_points = total_points + points
		print('Group fixture points calculated')

		#Group position points
		print('Calculating group position points')
		total_groups_points = 0
		for group_id in real_groups:
			group_points = 0
			group = real_groups[group_id]["Positions"]
			#if group has teams in it
			if group and len(group) == 4:
				for team_id in group:
					group[team_id]["Team"] = team_id
				real_positions = sorted(group.values(), key=operator.itemgetter('Pts', 'GD', 'GF', 'GA'), reverse=True)
				predicted_group = user_model["Groups"][group_id]
				predicted_group_teams = predicted_group["Teams"]
				for team_id in predicted_group_teams:
					predicted_group_teams[team_id]["Team"] = team_id
				predicted_positions = sorted(predicted_group_teams.values(), key=operator.itemgetter('Pts', 'GD', 'GF', 'GA'), reverse=True)
				i=0
				while i < 4:
					real_team = real_positions[i]["Team"]
					predicted_team = predicted_positions[i]["Team"]
					print ("Position %d predicted: %s, actual: %s" % (i+1, predicted_team, real_team))
					if real_positions[i]["Team"] == predicted_positions[i]["Team"]:
						group_points += 3
					i += 1
				predicted_group["PositionPoints"] = group_points
				print("Group %s points: %d" % (group_id, group_points))
				total_groups_points += group_points

		user_model["Groups"]["Points"] = total_groups_points
		total_points += total_groups_points
		user_model["TotalPoints"] = total_points

		split_filepath = prediction_file.split('/')
		outfile = split_filepath[0]+"/test/"+split_filepath[1]
		print('Writing out to file: %s' % outfile)
		with open(outfile, 'w') as outfile:
			json.dump(user_model, outfile)
			print('File written')
else:
	print('Couldnt read real model. Aborting')





