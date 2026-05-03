import axios from "axios";

export default function CreateAnotherLeague({ userId }) {
  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const leagueName = formData.get("leagueName");
    const year = formData.get("year");
    const teamName = formData.get("teamName");

    try {
      const res = await axios.post("/createLeague", {
        leagueName,
        year,
        userId,
        teamName,
      });

      const updatedUser = res.data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Successfully created league!");
      e.target.reset();

      window.location.reload();
    } catch (err) {
      console.error("Failed to create league:", err);
      alert(err.response?.data?.message || "Failed to create league. Please try again.");
    }
  }

  return (
    <div className="form-wrap">
      <h2 className="form-header">Create Another League</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>League Name: </label>
          <input
            type="text"
            className="form-input"
            name="leagueName"
            required
          />
        </div>

        <div className="form-field">
          <label>Year: </label>
          <input
            type="number"
            className="form-input"
            name="year"
            required
          />
        </div>

        <div className="form-field">
          <label>Your Team Name: </label>
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
            Create League
          </button>
        </div>
      </form>
    </div>
  );
}