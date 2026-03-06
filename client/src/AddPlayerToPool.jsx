export default function AddPlayerToPool() {
    function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const firstName = formData.get("firstName");
        const lastName = formData.get("lastName");
        const note = formData.get("note");

        console.log("Add Player to Pool:");
        console.log("First Name: ", firstName);
        console.log("Last Name: ", lastName);
        console.log("Note: ", note);
    
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
                        <label>Note: </label>
                        <textarea className="form-input" id="note" name="note"/>
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
