import axios from "axios";
import { useState } from "react";

export default function EditTaxiOrder({ team, onSubmit, onCancel }) {
  const [taxiPlayers, setTaxiPlayers] = useState(() => {
    return [...(team?.taxiPlayers ?? [])].sort(
        (a, b) => Number(a.position) - Number(b.position)
    );
});

  function handlePositionChange(index, newPosition) {
    const updated = [...taxiPlayers];

    updated[index] = {
      ...updated[index],
      position: newPosition,
    };

    setTaxiPlayers(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await axios.post("/draftPlayer/updateTaxiOrder", {
        teamId: team._id,
        taxiPlayers,
      });

      if (onSubmit) {
        onSubmit();
      }
    } catch (err) {
        console.error("Failed to update taxi order:", err);
        if (err.response && err.response.status === 400) {
                    alert("Invalid fields: " + err.response.data.error);
            }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Edit Taxi Order</h3>

      {taxiPlayers.map((player, index) => (
        <div className="form-row" key={player._id || index}>
          <label>{player.name}</label>

          <input
            className="form-input"
            type="number"
            value={player.position}
            onChange={(e) =>
              handlePositionChange(index, e.target.value)
            }
          />
        </div>
      ))}

      <button className="form-buttom" type="submit">
        Save
      </button>

      <button className="form-buttom" type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}