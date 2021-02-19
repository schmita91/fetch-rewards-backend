const express = require('express');
const fetchRouter = express.Router();

// Create empty userPoints object to store payers and point balances.
userPoints = {};
// Create empty transaction history array to store transaction records.
transactionHistory = [];

fetchRouter
    .route("/addPoints") 
    .post((req, res) => {
      transaction = req.body;
      // Create timestamps for new transactions.
      transaction.time= new Date(Date.now())
      transaction.time.toISOString();

      // Add transaction record to transaction history.
      transactionHistory.push(transaction);
      if(userPoints[transaction.payer]) {
        userPoints[transaction.payer]+=transaction.points;
      } else {
        userPoints[transaction.payer]=transaction.points;
      }
      res
        .status(200)
        .send(`Successfully added ${transaction.points} points from ${transaction.payer}`);  
    });


fetchRouter
    .route("/spend")
    .post((req,res)=>{
      let availablePoints = 0;
      let spendRequest = req.body.points;
      
      // Check user point balance and compare to spend request
      for (var value in userPoints) {
          availablePoints += userPoints[value];
      }
      if (availablePoints < spendRequest) {
          res.send("Uh oh! You don't have enough points for this request.");
      } else {
      // Sort transaction history by date, so that oldest points will
      // be spent first. transactionHistory array is transformed by date.
          transactionHistory = transactionHistory.sort((a,b) => { 
            return new Date(a.time) - new Date(b.time) 
          });
          
      // Create payer spend object to store response with points deducted
      // from each payer.
          payerSpend={};
      
      // Store spendRequest in remaining variable
          remaining = spendRequest;

      // Loop through each transaction in the transaction history, comparing
      // the spendRequest to the amount of points in each transaction, starting 
      // with the oldest transaction. If the amount of spend is greater than points,
      // max out the points and move to the next transaction. If it is less, 
      // deduct the spend request points and end loop.
          for(let i = 0; i < transactionHistory.length; i++) {
            var spend = 0;
            currentRecord = transactionHistory[i];
            if(currentRecord.points - remaining >= 0) {
              spend = remaining;
              transactionHistory[i].points -= spend;
            } else {
              spend = currentRecord.points;
              transactionHistory[i].points=0;
            }
            
        // Deduct the spent amount from the previous record and continue iterating
            spend *= parseInt(-1);
            remaining += spend;
        // If points have already been deducted from payer, continue deducting.
              if(payerSpend[currentRecord.payer]) {
                payerSpend[currentRecord.payer]+= spend;
              } else { 
                payerSpend[currentRecord.payer] = spend;
              }
              if(remaining <= 0) {  
                for(var k in userPoints) {
                  userPoints[k] = 0;
                }
                for(var j = 0; j < transactionHistory.length; j++) {
                  if(transactionHistory[j].points==0) {
                    transactionHistory.splice(j,1);
                    i--;
                  } else if(userPoints[transactionHistory[j].payer]) {
                      userPoints[transactionHistory[j].payer]+=transactionHistory[j].points;
                    } else {
                      userPoints[transactionHistory[j].payer]=transactionHistory[j].points;
                      }
                }
                res.send(payerSpend);
              }
          }
      }
    });

fetchRouter
    .route("/points")
    .get((req,res)=>{
      res
        .send(userPoints);
    });
    
module.exports = fetchRouter;