import json, glob

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


def calculate_points(fixture_prediction, fixture_result):
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
	print('Tables updated')

	print('Real model read')
	print('Finding users')
	user_predictions_files = glob.glob('predictions/*.json')
	print('%d users found' % len(user_predictions_files))
	for prediction_file in user_predictions_files:
		print('Reading %s' % prediction_file)
		total_points = 0
		data_file = open(prediction_file)
		user_model = json.load(data_file)
		for result_id in real_model:
			fixture_result = real_model[result_id]
			fixture_prediction = find_match_in_predictions(user_model, result_id)
			points = calculate_points(fixture_prediction, fixture_result)
			print(fixture_prediction, fixture_result, points)
			fixture_prediction["Points"] = points
			total_points = total_points + points
		user_model["TotalPoints"] = total_points
		split_filepath = prediction_file.split('/')
		outfile = split_filepath[0]+"/test/"+split_filepath[1]
		with open(outfile, 'w') as outfile:
			json.dump(user_model, outfile)
else:
	print('Couldnt read real model. Aborting')





