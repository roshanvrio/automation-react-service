const VMUtilization = () => {
  return (
    <div className="card bg-secondary text-light">
      <div className="card-body">
        <h5 className="card-title mb-3">VM Utilization</h5>

        <div className="row g-2">
          {Array.from({ length: 16 }).map((_, index) => (
            <div className="col-3" key={index}>
              <div className="bg-success text-dark text-center rounded py-2 fw-bold">
                VM-{index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VMUtilization;
