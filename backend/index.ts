import cors from 'cors';
import express , {Express, Request, Response} from 'express';
import bodyParser from 'body-parser'
import { reclaimprotocol } from '@reclaimprotocol/reclaim-sdk';
import {v4} from 'uuid';

const sqlite3 = require('sqlite3').verbose;

const app: Express = express();

// const db = new sqlite3.Database('database.db');
// db.run('CREATE TABLE IF NOT EXISTS users (pid INTEGER PRIMARY KEY AUTOINCREMENT, callbackid TEXT, reclaimurl TEXT, expectedproofsincallback TEXT, id TEXT)');

app.use(cors());
app.use(express.text({ type: "*/*" }));
app.use(bodyParser.json());

app.set('views', './views');
app.set('view engine', 'ejs');

const PORT = "3000";

// const callbackUrl = process.env.CALLBACK_URL;
// This is where the proof gets submitted when the user clicks on Submit button on the Reclaim app.
console.log('Change the callback url to your appropriate url')
const callbackUrl = `http://localhost:${PORT}/callback`;
// console.log(callbackUrl);

const sessionId = v4();
// let responseSelections = [{ responseMatch: "" }];
const reclaim = new reclaimprotocol.Reclaim();

app.get("/", (req:Request, res:Response, next) => {
    res.send("This is the backend server for Quora cancellers. It's likely that you are here accidentally here.");
});

// function writeData(callbackId:string, reclaimUrl:string, expectedProofsInCallback:string, id:string) {
//     return new Promise((resolve, reject) => {
//       const stmt = db.prepare('INSERT INTO users (callbackid, reclaimurl, expectedproofsincallback, id) VALUES (?, ?, ?, ?)');
//       stmt.run(callbackId, reclaimUrl, expectedProofsInCallback, id, function (err) {
//         if (err) {
//           console.error(err);
//           reject(err);
//         } else {
//           resolve(this.lastID);
//         }
//       });
//       stmt.finalize();
//     });
//   }

app.get("/block-profile/:blockedid", (req: Request, res: Response, next) =>{
    const blockedId = req.params.blockedid;
    console.log("The blocked id is " + blockedId);

    try{
        const request = reclaim.requestProofs({
            title: `Blocked ${blockedId} on Quora`,
            baseCallbackUrl: callbackUrl,
            requestedProofs: [
                new reclaim.HttpsProvider({
                    name: "Quora Cancellors",
                    logoUrl: "https://qph.cf2.quoracdn.net/main-qimg-4d340b8b704ccfc33ac16dd261b6c121-lq",
                    url: "https://www.quora.com/settings/muting",
                    loginUrl : "https://www.quora.com/settings/muting",
                    loginCookies : ["m-b"],
                    selectionRegex: `${blockedId}`,
                    // selectionRegex: `isBlockedByViewer.*\\\\"profileUrl\\\\":\\\\"\\\/profile\/{{username}}\\\\",\\\\"profileImageUrl.*mutedUsersList`,
                }),
            ]
        });
        const { callbackId, reclaimUrl, expectedProofsInCallback, id } = request;
        // { string, string, string, string }
        // writeData(callbackId, reclaimUrl, expectedProofsInCallback, id)
        // .then((lastInsertId) => {
        //     console.log('Data written to the database. Last inserted ID:', lastInsertId);
        // })
        // .catch((err) => {
        //     console.error('Error writing data to the database:', err);
        // });
        res.json({reclaimUrl});
    }
    catch (error)
    {
        console.log("Errors encountered in requesting proofs", error);
        res.status(500).json({error: "Failed to request proofs"});
    }
});

app.post('/callback/:id', async (req: Request, res: Response) => {
    try
    {
        const { callbackId } = req.params;
        const { proofs } = req.body;
        const isProofCorrect = await reclaim.verifyCorrectnessOfProofs(proofs);

        if (isProofCorrect)
        {
            console.log("Proof submitted:\n", proofs);
            console.log(proofs);
            // get expectedProofsInCallback;
            // const parsedParams = reclaimprotocol.utils.extractParameterValuesFromRegex(expectedProofsInCallback, proofs)
            res.send("Correct Proof received by callback successfully");
        }
    }
    catch (error) {
        console.error("Error processing the callback: ", error);
        res.status(500).json({error: "Failed to process callback"});
    }
});

app.listen(PORT);
// function readData() {
//     return new Promise((resolve, reject) => {
//       db.all('SELECT * FROM my_table', (err, rows) => {
//         if (err) {
//           console.error(err);
//           reject(err);
//         } else {
//           resolve(rows);
//         }
//       });
//     });
//   }
  