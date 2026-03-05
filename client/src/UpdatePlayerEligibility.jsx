export default function UpdatePlayerEligibility() {

    return (
        <>
            <div className="form-wrap">
                <h2 className="form-header">Update Player Eligibility</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label >Name: </label>
                        <input type="text" id="playerName" className="form-input" name="playerName" />
                    </div>
                    <div className="form-field">
                        <label>Position: </label>
                        <select id="playerPosition" className="form-input" name="playerPosition" defaultChecked="C">
                            <option value="CI">C</option>
                            <option value="1B">1B</option>
                            <option value="3B">3B</option>
                            <option value="2B">2B</option>
                            <option value="SS">SS</option>
                            <option value="MI">3B</option>
                            <option value="OF">OF</option>
                            <option value="U">U</option>
                            <option value="P">P</option>
                        </select>
                    </div>
                    <div className="form-buttom">  
                        <button type="button">Cancel</button>
                        <button type="submit">Save</button>
                    </div>
                </form>
            </div>
        </>
    )
}

function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const playerName = formData.get("playerName");
        const position = formData.get("playerPosition");

        console.log("Update Player Eligibility:");
        console.log("Player Name: ", playerName);
        console.log("Position: ", position);
}