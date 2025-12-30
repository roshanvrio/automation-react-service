import "./TopPerformingVM.css";

const TopPerformingVM = () => {
  return (
    <div className="dashboard-card small-card-height">
      <div className="card-title">Top Performing VM</div>

      <div className="row card-scroll">
        {["VM-22", "VM-18", "VM-04"].map((vm, i) => (
          <div className="col-12 top-vm" key={i}>
            {vm}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPerformingVM;
