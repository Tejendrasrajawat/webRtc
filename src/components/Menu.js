import "./Menu.css";

function Menu({ joinCode, setJoinCode, setPage }) {
  return (
    <div className="home">
      <div className="create_box">
        <button onClick={() => setPage("create")}>Create Call</button>
      </div>

      <div className="answer_box">
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Join with code"
        />
        <button onClick={() => setPage("join")}>Answer</button>
      </div>
    </div>
  );
}

export default Menu;
