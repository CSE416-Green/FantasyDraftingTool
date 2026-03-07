export default function LeagueConfiguration() {
    function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const numTeams = formData.get("numTeams");
        const teamBudget = formData.get("teamBudget");
        
        console.log("Update League Configuration:");
        console.log("numTeams: ", numTeams);
        console.log("teamBudget: ", teamBudget);
    
    }

    return (
        <>
            <div className="form-wrap">
                <h2 className="form-header"> League Configuration</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label >Number of Teams: (min: 2, max: ?) </label>
                        <input type="number" id="numTeams" className="form-input" name="numTeams" min="2" max="15"/>
                    </div>
                    <div className="form-field">
                        <label>Team Budget: </label>
                        <input type="number" className="form-input" id="teamBudget" name="teamBudget" min="100"/>
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