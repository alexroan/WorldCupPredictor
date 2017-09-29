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

console.log(caulculatePrizeMoney(10, 100));