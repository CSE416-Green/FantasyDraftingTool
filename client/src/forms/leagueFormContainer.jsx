
import JoinLeagueForm from './joinLeagueForm'
import CreateLeagueForm from './createLeagueForm'
import { useState } from "react";
import '../css/league.css'

export default function LeagueFormContainer({ user, setUser }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);

    function showCreate() {
        setShowCreateForm(true);
        setShowJoinForm(false);
    }

    function showJoin() {
        setShowCreateForm(false);
        setShowJoinForm(true);
    }

    return (
        <div className="league-form-container">
            <div className="league-form-welcome-message">
                <h2>Welcome to Fantasy Baseball Draft Kit, you are not in a league yet!</h2>
                <h2>Select an option to join a league: </h2>
            </div>
            <div className="league-form-buttons">
                <button onClick={() => showCreate()}>Create League</button>
                <button onClick={() => showJoin()}>Join League</button>
            </div>
            <div className="league-forms">
                {showCreateForm && <CreateLeagueForm user={user} setUser={setUser} />}
                {showJoinForm && <JoinLeagueForm user={user} setUser={setUser} />}
            </div>

        </div>
    )
}