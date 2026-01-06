import "./Entry.css";

const Entry = ({ idleVmUpdate }) => {
  console.log("idle", idleVmUpdate)
  return (
    <div className="dashboard-card right-height entry-card card-scroll">

      <div className="entry-title">ENTRY</div>

      <div className="entry-list">
        {Array.isArray(idleVmUpdate) && idleVmUpdate.map((vm, i) => (
          <div className="entry-row" key={i}>
            <i className="bi bi-display"></i>
            <span>{typeof vm === 'string' ? vm : vm.name || vm.id}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Entry;
