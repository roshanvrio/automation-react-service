import "./Entry.css";

const Entry = ({ idleVmUpdate }) => {
  console.log("idle", idleVmUpdate)
  return (
    <div className="dashboard-card entry-card">

      <div className="entry-title">ENTRY</div>

      <div className="entry-list">
        {Array.isArray(idleVmUpdate) && idleVmUpdate.reduce((rows, vm, i) => {
          if (i % 2 === 0) {
            rows.push([vm]);
          } else {
            rows[rows.length - 1].push(vm);
          }
          return rows;
        }, []).map((pair, rowIndex) => (
          <div className="entry-row-pair" key={rowIndex}>
            {pair.map((vm, i) => (
              <div className="entry-row" key={i}>
                <i className="bi bi-display"></i>
                <span>{typeof vm === 'string' ? vm : vm.name || vm.id}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

    </div>
  );
};

export default Entry;
