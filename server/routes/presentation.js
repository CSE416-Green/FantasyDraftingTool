const express = require("express");
const presentationRouter = express.Router();
const Team = require("../models/TeamSchema");
const League = require("../models/LeagueSchema");
const DraftHistory = require("../models/DraftHistorySchema");
const User = require("../models/UserSchema");
const bcrypt=require("bcrypt");

async function createAccounts() {
    try {

        // firstName "Team"
        // lastName "A"
        // username "TeamA"
        // email "teama@gmail.com"

        const password = "password123";
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUserIds = [];
        const letters = ["A","B","C","D","E","F","G","H","I"];

        for (const letter of letters) {
            const username = `Team${letter}`;
            const email = `team${letter.toLowerCase()}@gmail.com`;

            let user = await User.findOne({
                $or: [{ username }, { email }]
            });

            if (!user) {
                user = new User({
                    firstName: "Team",
                    lastName: letter,
                    username,
                    email,
                    password: hashedPassword,
                    league: null
                });

                await user.save();
                // console.log(`Created ${username}`);
            } else {
                // console.log(`Skipped ${username}, already exists`);
            }

            createdUserIds.push(user._id);
        }

        // console.log("Created 9 accounts")
        return createdUserIds;

    } catch (error) {
        console.error("Error creating 9 accs:", error);
        throw error;
    }
}

async function createLeague(createdUserIds) {
    try {
        const leagueName = "Majur League";
        const year = 2026;

        let inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        while (await League.findOne({ InviteCode: inviteCode })) {
        inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        }

        const newLeague = new League({
        Name: leagueName,
        Year: year,
        TeamsID: [],
        InviteCode: inviteCode
        });

        await newLeague.save();

        const newDraftHistory = new DraftHistory({
        LeagueName: leagueName,
        Year: year,
        DraftedPlayers: [],
        League: newLeague._id
        });

        await newDraftHistory.save();

        const createdTeamIds = [];

        const letters = ["A","B","C","D","E","F","G","H","I"];

        for (let i = 0; i < letters.length; i++) {
            const letter = letters[i];
            const userId = createdUserIds[i];

            const team = new Team({
                teamName: `Team ${letter}`,
                rosterPlayers: [],
                farmPlayers: []
            });

            await team.save();

            createdTeamIds.push(team._id);
            newLeague.TeamsID.push(team._id);

            await User.findByIdAndUpdate(userId, {
                $set: { league: newLeague._id }
            });

            
        }
        await newLeague.save();
        // console.log("League created, _id", newLeague._id.toString());

        return {
        leagueId: newLeague._id,
        userIds: createdUserIds,
        teamIds: createdTeamIds
        };
    } catch (error) {
        console.error("Error initiating league with 9 given users:", error);
        throw error;
    }
    
}

// create 9 accounts, one league, let 9 accounts join the league
presentationRouter.post("/setup", async (req, res) => {
    try {
        const createdUserIds = await createAccounts();
        const result = await createLeague(createdUserIds);

        res.status(201).json({
            message: "Setup complete",
            result
        });
    } catch (error) {
        console.error("Error during setup:", error);
        res.status(500).json({ error: error.message });
    }
});

// delete that league, 9 users, 9 teams
presentationRouter.delete("/reset", async (req, res) => {
    try {
        const { leagueId, userIds, teamIds } = req.body;

        if (!leagueId || !userIds || !teamIds) {
            return res.status(400).json({
                error: "leagueId, userIds, and teamIds are required"
            });
        }

        await League.findByIdAndDelete(leagueId);
        await User.deleteMany({
            _id: { $in: userIds }
        });
        await Team.deleteMany({
            _id: { $in: teamIds }
        });
        await DraftHistory.deleteMany({
            League: leagueId
        });

        res.json({
            message: "Deleted presentation setup successfully"
        });
    } catch (error) {
        console.error("Error deleting setup:", error);
        res.status(500).json({ error: error.message });
    }
})

// load pre-drafted state


module.exports = presentationRouter;