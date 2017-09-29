$(window).ready(function(){
    GetAllUsersScores();
});

function HandleResults(jsonData){
    var users = jsonData.length;
    $("#prize-description").append("There are currently "+users+" users playing, meaning that the prize money will be distributed the following way");
    var prizes = caulculatePrizeMoney(10, users);
    for(var i = 0; i < users; i++){
        var row = ConstructRow(i, prizes);
        $("#prize-table-body").append(row);
    }
}

function ConstructRow(position, prizes){
    if(prizes[position] != null){
        var row = "<tr>";
        row += "<td>"+(position+1)+"</td>";
        row += "<td>"+prizes[position]+"</td>";
        row += "</td>";
        return row;
    }   
    return "";
}

//Rounds to 2 decimal places
function roundMe(number){
    return Math.round(number * 100) / 100;
}

//Coefficient calculation function
function getDivisionCoefficient(entrants){
    var length = String(entrants).length;
    var nextLengthMinimum = Math.pow(10, length);
    var coef = length + (entrants / nextLengthMinimum);
    return coef;
}

//Calculate prize money
function caulculatePrizeMoney(entryFee, numberOfEntrants){
    if(numberOfEntrants < 6){
        return [20];
    }
    else if (numberOfEntrants >= 6 && numberOfEntrants <10){
        return [20,10];
    }
    var prizePotPercentage = 0.6;    
    var stripeFee = (entryFee * 0.014) + .2;
    var totalEntryFees = (entryFee - stripeFee) * numberOfEntrants;
    var prizePotAmount = prizePotPercentage * totalEntryFees;
    var divisionCoefficient = getDivisionCoefficient(numberOfEntrants);
    var firstPlacePrize = prizePotAmount / divisionCoefficient;
    var nextPlacePrize = 0;
    var totalPrizeAwarded = firstPlacePrize; 
    var prizes = [roundMe(firstPlacePrize)];
    var count = 1;
    while (true){
        if(nextPlacePrize == 0){
            nextPlacePrize = ((divisionCoefficient-1)/divisionCoefficient) * firstPlacePrize;
        }
        else{
            nextPlacePrize = ((divisionCoefficient-1)/divisionCoefficient) * nextPlacePrize;
        }
        totalPrizeAwarded += nextPlacePrize;
        prizes[count] = roundMe(nextPlacePrize);
        if(nextPlacePrize < (entryFee * 2)){
            while (totalPrizeAwarded < prizePotAmount){
                count++;
                nextPlacePrize = entryFee;
                if((nextPlacePrize + totalPrizeAwarded) > prizePotAmount){
                    break;
                }
                totalPrizeAwarded += nextPlacePrize;                
                prizes[count] = roundMe(nextPlacePrize);
            }
            break;
        }
        count++;
    }
    var houseProfitAmount = totalEntryFees - totalPrizeAwarded;
    return prizes;
}

