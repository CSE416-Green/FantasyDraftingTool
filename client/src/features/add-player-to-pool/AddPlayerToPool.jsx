import axios from "axios";

export default function AddPlayerToPool() {
    async function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const firstName = formData.get("firstName");
        const lastName = formData.get("lastName");
        const position=formData.get("position");
        const team=formData.get("team");
        const note = formData.get("note");

        const name = `${firstName} ${lastName}`.trim();
        try {
            await axios.post("/addedPlayerPool/add", { name, position, team, note });
            alert("player added to pool");
            e.target.reset();
        } catch (err) {
            console.error("Failed to add player:", err);
            alert("Failed to add player. Please try again.");
        }
    }

    return (
        <>
            <div className="form-wrap">
                <h2 className="form-header">Add Player to Pool</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label >First Name: </label>
                        <input type="text" id="firstName" className="form-input" name="firstName"/>
                    </div>
                    <div className="form-field">
                        <label >Last Name: </label>
                        <input type="text" id="lastName" className="form-input" name="lastName"/>
                    </div>
                    <div className="form-field">
                    <label>Position: </label>
                    <select className="form-input" name="position" required>
                        <option value="">-- Select Position --</option>
                        <option value="C">C</option>
                        <option value="1B">1B</option>
                        <option value="2B">2B</option>
                        <option value="3B">3B</option>
                        <option value="SS">SS</option>
                        <option value="OF">OF</option>
                        <option value="SP">SP</option>
                        <option value="RP">RP</option>
                        <option value="DH">DH</option>
                    </select>
                    </div>
                    <div className="form-field">
                        <label>Team: </label>
                        <input type="text" className="form-input" name="team" />
                    </div>
                    <div className="form-field">
                        <label>Note: </label>
                        <textarea className="form-input" name="note" />
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

