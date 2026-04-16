import axios from "axios";
import { useEffect, useState } from "react";

export default function RecommendedSalary({ player, maxNextCost }) {
  const [salary, setSalary] = useState(-1);

  useEffect(() => {
    async function calculateSalary() {
      if (!player) {
        setSalary(-1);
        return;
      }

      try {
        const baseSalary = 1;

        const requestBody = {
          DraftState: true,
          maxNextCost: maxNextCost,
          baseSalary: baseSalary,
          players: [player],
        };

        const response = await axios.post(
          // "http://localhost:3000/GetSalaryForPlayers/compute/",
          "https://fantasydraftingtool.onrender.com/GetSalaryForPlayers/compute/",
          requestBody,
        );

        const recommendedSalary = response.data?.result?.[0]?.recommendedSalary;
        setSalary(recommendedSalary ?? -1);

      } catch (error) {
        console.error("Error calculating recommended salary:", error);
        setSalary(-1);
      }
    }

    calculateSalary();
  }, [player, maxNextCost]);

  return (
    <div>
      Recommended Salary: {salary !== -1 ? salary : "Not Available"}
    </div>
  );
}