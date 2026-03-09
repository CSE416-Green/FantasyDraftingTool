import axios from "axios"
import { useState, useEffect } from "react";
export default function LeagueConfiguration() {
    const [numTeams, setNumTeams] = useState("");
    const [teamBudget, setTeamBudget] = useState("");
    
    useEffect(() => {
        axios.get("/settings/league")
        .then(res => {
            if (res.data) {
            setNumTeams(res.data.numTeams);
            setTeamBudget(res.data.teamBudget);
            }
        })
        .catch(err => console.error("Error loading settings:", err));
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        // const formData = new FormData(e.target);
        // const numTeams = formData.get("numTeams");
        // const teamBudget = formData.get("teamBudget");
        
        console.log("Update League Configuration:");
        console.log("numTeams: ", numTeams);
        console.log("teamBudget: ", teamBudget);
        axios.post("/settings/league", { numTeams: Number(numTeams), teamBudget: Number(teamBudget)  })
        .then(res => console.log("Saved!", res.data))
        .catch(err => console.error("Error:", err));
    
    }

    return (
        <>
            <div className="form-wrap">
                <h2 className="form-header"> League Configuration</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label >Number of Teams: (min: 2) </label>
                        <input 
                            type="number" 
                            id="numTeams" 
                            className="form-input" 
                            name="numTeams" 
                            min="2" 
                            max="15"
                            value={numTeams}
                            onChange={e => setNumTeams(e.target.value)}
                        />
                    </div>
                    <div className="form-field">
                        <label>Team Budget: </label>
                        <input 
                            type="number" 
                            className="form-input" 
                            id="teamBudget" 
                            name="teamBudget" 
                            min="100"
                            value={teamBudget}
                            onChange={e => setTeamBudget(e.target.value)}
                        />
                    </div>
                    <div className="form-button-group">  
                        <button className="form-buttom" type="button">Cancel</button>
                        <button className="form-buttom" type="submit">Save</button>
                    </div>
                </form>
            </div>
        </>
    )
}