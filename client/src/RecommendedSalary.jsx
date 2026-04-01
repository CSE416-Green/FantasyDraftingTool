import axios from "axios";
import { useEffect, useState } from "react";

function normalize(v, min, max) {
  if (v <= min) return 0;
  if (v >= max) return 1;
  return (v - min) / (max - min);
}

function reversedNormalized(v, min, max) {
  if (v <= min) return 1;
  if (v >= max) return 0;
  return (max - v) / (max - min);
}

function computeHitterPerformance(player, stats) {
  return (
    stats.AVG.weight * normalize(player.AVG, stats.AVG.min, stats.AVG.max) +
    stats.OBP.weight * normalize(player.OBP, stats.OBP.min, stats.OBP.max) +
    stats.SLG.weight * normalize(player.SLG, stats.SLG.min, stats.SLG.max) +
    stats.HR.weight * Math.min(1, player.HR / stats.HR.max) +
    stats.RBI.weight * Math.min(1, player.RBI / stats.RBI.max) +
    stats.SB.weight * Math.min(1, player.SB / stats.SB.max)
  );
}

function computePitcherPerformance(player, stats) {
  return (
    stats.ERA.weight * reversedNormalized(player.ERA, stats.ERA.min, stats.ERA.max) +
    stats.WHIP.weight * reversedNormalized(player.WHIP, stats.WHIP.min, stats.WHIP.max) +
    stats.K.weight * Math.min(1, player.K / stats.K.max) +
    stats.W.weight * Math.min(1, player.W / stats.W.max) +
    stats.SV.weight * Math.min(1, player.SV / stats.SV.max) +
    stats.IP.weight * Math.min(1, player.IP / stats.IP.max) +
    stats.BB.weight * reversedNormalized(player.BB, 0, stats.BB.max)
  );
}

export default function RecommendedSalary({ player, maxNextCost }) {
  const [salary, setSalary] = useState(null);

  useEffect(() => {
    async function calculateSalary() {
      if (!player) {
        setSalary(null);
        return;
      }

      try {
        const baseSalary = 1;
        let stats;
        let performance;

       const hitter = player.AVG !== undefined;

        if (hitter) {
          const response = await axios.get("/stat/hitter/2025");
          stats = response.data;
          performance = computeHitterPerformance(player, stats);
        } else {
          const response = await axios.get("/stat/pitcher/2025");
          stats = response.data;
          performance = computePitcherPerformance(player, stats);
        }

        const cap = maxNextCost * 0.3;

        let calculatedSalary =
          baseSalary + performance * (cap - baseSalary);


        calculatedSalary = Math.min(calculatedSalary, cap);
        calculatedSalary = Math.floor(calculatedSalary);


        setSalary(calculatedSalary);
      } catch (error) {
        console.error("Error calculating recommended salary:", error);
        setSalary(null);
      }
    }

    calculateSalary();
  }, [player, maxNextCost]);

  return (
    <div>
      Recommended Salary: {salary !== null ? salary : "-"}
    </div>
  );
}