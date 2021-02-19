const express = require('express');
const fetchRouter = express.Router();

const STORE = [];

fetchRouter
    .route("/addPoints") 
    .post((req, res) => {
        const newRecord = req.body;
        if(newRecord.points <= 0) {
          res.status(400).send("Cannot add 0 or negative points")
        }
        const date = new Date(Date.now());
        const timeStamp = date.toISOString();
        const record = { ...newRecord, timestamp: timeStamp };
        STORE.push(record);
        console.log(record)
        res.status(201).send(`Successfully added ${record.points} points.`);
  });


fetchRouter
    .route("/spend")
    .post((req, res) => {
        const points = req.body.points;
        if(points <= 0) {
          res.status(400).send("Bad Request: Cannot spend negative points");
        } else {
            try {
              response = spendPoints(points);
              res.status(200).send(response);
            } 
            catch (e) {
              res.status(400).send("Could not spend points");
            }
          }
      });
    
    const spendPoints = (pointsToSpend) => {
      let spendRequest = pointsToSpend;
      let spendRecord = [];
      const l = STORE.length;
      for (let index = 0; index < l; index++) {
        console.log(spendRequest);
        if (spendRequest == 0) {
          break;
        }
        const record = STORE.shift();
        let payer = record["payer"];
        let points = record["points"];
        if (points <= spendRequest) {
          spendRequest -= points;
          spendRecord.push({ payer: payer, points: -points });
        } else {
          spendRecord.push({ payer: payer, points: -spendRequest });
          const date = new Date(Date.now());
          const timeStamp = date.toISOString();
          STORE.push({
            payer: payer,
            points: points - spendRequest,
            timeStamp: timeStamp,
          });
          console.log(STORE);
          spendRequest = 0;
        }
      }
      console.log(spendRecord);
      return [...spendRecord];
    };

fetchRouter
    .route("/points")
    .get((req, res) => {
        let points = new Map();
        STORE.forEach((record) => {
          if (points.has(record["payer"])) {
            const spendRequest = points.get(record["payer"]);
            points.set(record["payer"], spendRequest + record["points"]);
          } else {
            points.set(record["payer"], record["points"]);
          }
        });
        res.status(200).json(Object.fromEntries(points));
      });

module.exports = fetchRouter;