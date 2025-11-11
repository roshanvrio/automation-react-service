import React, {useEffect, useState} from "react";
import { fetchOverview } from "../api/api";
import robotError from "../images/robot-error.png";
import robotLoading from "../images/robot-loading.png";

export default function OverviewTiles(){
  const [data, setData] = useState(null);
  useEffect(()=>{ fetchOverview().then(setData).catch(()=>{}); }, []);
  
  // fallback display values
  const d = data || { 
    total_bots: 25, 
    in_queue: 9, 
    in_progress: 7, 
    completed: 25, 
    avg_exec_time_mins: 20,
    errors: 5
  };
  
  return (
    <div className="overview-wrapper">
      <div className="overview-grid">
        {/* Left Card - Error & Total Bots */}
        <div className="left-card stats-card">
          <div className="error-box">
            <img src={robotError} alt="Error Bot" style={{width: '80px', height: '80px', objectFit: 'contain'}} />
            <div>
            <div style={{fontSize: '0.9rem', color: '#D7E4E3', marginBottom: '0.5rem'}}>Error</div>
              <div className="err-count">{String(d.errors || 5).padStart(2, '0')}</div>
            </div>
          </div>
          <div className="total-bots-box">
            <img src={robotLoading} alt="Total Bots" style={{width: '80px', height: '80px', objectFit: 'contain'}} />
            <div>
              <div style={{fontSize: '0.9rem', color: '#ffffff', marginBottom: '0.5rem'}}>Total Bots</div>
              <div style={{fontSize: '2rem', fontWeight: '700', color: '#ffffff'}}>{d.total_bots}</div>
            </div>
          </div>
        </div>

        {/* Small Cards - Row 1 */}
        <div className="small-card">
          In Queue 
          <div className="val" data-change="+5%">{String(d.in_queue).padStart(2, '0')}</div>
        </div>
        <div className="small-card">
          In Progress 
          <div className="val" data-change="+5%">{String(d.in_progress).padStart(2, '0')}</div>
        </div>
        <div className="date-card" style={{gridRow: '1 / 3', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start', width: '100%', justifyContent: 'space-between'}}>
          <span style={{fontSize: '0.85rem', color: '#FFFFFF', fontWeight: '500'}}>Completed</span>
          <span style={{fontSize: '0.85rem', color: '#FFFFFF'}}>•••</span>
          </div>
          <div style={{fontSize: '2.5rem', fontWeight: '700', color: '#ffffff', textShadow: '0 0 10px rgba(255, 255, 255, 0.3)', alignSelf: 'flex-start'}}>{d.completed}</div>
          <div style={{fontSize: '0.75rem', color: '#00FFDD', textShadow: '0 0 8px rgba(0, 255, 221, 0.5)', alignSelf: 'flex-start'}}>+5%</div>
          <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#ffffff', lineHeight: '1.6', textAlign: 'right', alignSelf: 'flex-end'}}>
            4th September<br/>2025
          </div>
        </div>

        {/* Wide Card - Row 2 */}
        <div className="wide-card">
          Avg. Execution Time 
          <div className="val">{d.avg_exec_time_mins} mins</div>
        </div>
      </div>
    </div>
  );
}