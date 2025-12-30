import "./Entry.css";

const Entry = () => {
  return (
    <div className="dashboard-card right-height">
      <div className="card-title">Entry</div>

      <div className="row card-scroll">
        {Array.from({ length: 18 }).map((_, i) => (
          <div className="col-12 entry-row" key={i}>
            VM_{i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Entry;
