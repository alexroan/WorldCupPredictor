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


print('Reading real model')
real_model = None
with open('realmodel.json') as data_file:    
    data = json.load(data_file)
    real_model = data["Results"]
    
if real_model is not None:
	print('Real model read')
	print('Finding users')
	user_predictions_files = glob.glob('predictions/*.json')
	print('%d users found' % len(user_predictions_files))
	for prediction_file in user_predictions_files:
		print('Reading %s' % prediction_file)
		data_file = open(prediction_file)
		user_model = json.load(data_file)
		for result_id in real_model:
			fixture_result = real_model[result_id]
			fixture_prediction = find_match_in_predictions(user_model, result_id)
			points = calculate_points(fixture_prediction, fixture_result)
			print(fixture_prediction, fixture_result, points)
else:
	print('Couldnt read real model. Aborting')





	