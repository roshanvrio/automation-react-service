import "./BotsInQueue.css";

const bots = [
  { name: "Nigeria Reports - NG31", count: 312, icon: "bi-envelope" },
  { name: "Nigeria Reports - NG36", count: 300, icon: "bi-envelope" },
  { name: "InvoiceVetting", count: 289, icon: "bi-clock" },
  { name: "PO Creation_Posting GR_Remittance Advice", count: 245, icon: "bi-clock" },
  { name: "Shipment Instruction & Booking Advise Creatio", count: 234, icon: "bi-clock" },
  { name: "Invoice Indexing & Posting in OTM Automation", count: 198, icon: "bi-clock" },
  { name: "QualtricsAutomation", count: 176, icon: "bi-envelope" },
  { name: "TSF - MECR", count: 157, icon: "bi-clock" },
  { name: "PixelPilot88.bot", count: 143, icon: "bi-clock" },

];

const BotsInQueue = () => {
  return (
    <div className="dashboard-card card-scroll">
      <div className="card-title text-center">Bots in Queue</div>

      <div className="bots-list">
        {bots.map((bot, i) => (
          <div className="bot-row" key={i}>

            {/* LEFT ICON + NAME */}
            <div className="bot-left">
              <i className={`bi ${bot.icon}`}></i>
              <span className="bot-name">{bot.name}</span>
            </div>

            {/* RIGHT STATUS */}
            <div className="bot-right">
              <span className="queue-chip">
                <i className="bi bi-robot"></i> In Queue
              </span>
              <span className="queue-count">{bot.count}</span>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default BotsInQueue;
