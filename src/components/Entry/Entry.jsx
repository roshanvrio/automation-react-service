import "./Entry.css";

const vms = [
  "VM_01", "VM_21", "VM_03", "VM_05", "VM_08", "VM_15", "VM_09", "VM_10",
  "VM_07", "VM_12", "VM_02", "VM_13", "VM_14", "VM_24", "VM_23", "VM_16",
  "VM_17", "VM_19", "VM_20", "VM_25", "VM_26", "VM_27", "VM_28", "VM_30",
  "VM_31", "VM_32"
];

const Entry = () => {
  return (
    <div className="dashboard-card right-height entry-card card-scroll">

      <div className="entry-title">ENTRY</div>

      <div className="entry-list">
        {vms.map((vm, i) => (
          <div className="entry-row" key={i}>
            <i className="bi bi-display"></i>
            <span>{vm}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Entry;
