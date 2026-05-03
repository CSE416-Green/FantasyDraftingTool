import axios from "axios";

export default function JoinAnotherLeague({ userId }) {
  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const inviteCode = formData.get("inviteCode");
    const teamName = formData.get("teamName");

    try {
        const res = await axios.post("/joinLeague", {
            inviteCode,
            userId,
            teamName,
        });

        const updatedUser = res.data.user;

        localStorage.setItem("user", JSON.stringify(updatedUser));

        window.location.reload();

        alert("Successfully joined league!");
        e.target.reset();

    } catch (err) {
      console.error("Failed to join league:", err);
      alert(err.response?.data?.message || "Failed to join league. Please try again.");
    }
  }

  return (
    <div className="form-wrap">
      <h2 className="form-header">Join Another League</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Invitation Code: </label>
          <input
            type="text"
            className="form-input"
            name="inviteCode"
            required
          />
        </div>

        <div className="form-field">
          <label>Team Name: </label>
          <input
            type="text"
            className="form-input"
            name="teamName"
            required
          />
        </div>

        <div className="form-button-group">
          <button className="form-buttom" type="button">
            Cancel
          </button>
          <button className="form-buttom" type="submit">
            Join League
          </button>
        </div>
      </form>
    </div>
  );
}