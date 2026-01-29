import React, {useEffect, useRef} from 'react';
import './ObservationsDrawer.css'

const ObservationsDrawer = ({
  isOpen,
  onClose,
  groupedData,
  globalSearchTerm,
  setGlobalSearchTerm,
}) => {
  const drawerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        onClose(); // Close the drawer if clicked outside
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div ref={drawerRef} className="observations-drawer">
      <div className="drawer-header">
        <div style={{display:"flex", justifyContent:"space-between"}}>
        <h3>All Observations</h3>
        <button onClick={onClose} className="close-drawer-button">
          &#10005; {/* Unicode for 'X' */}
        </button>
        </div>
      </div>
      <div className="observations-container" style={{ maxHeight: "75vh", overflow:"auto", maxWidth:"45vw", margin:"10px" }}>
        <input
          type="text"
          placeholder="Search from all observations"
          value={globalSearchTerm}
          onChange={(e) => setGlobalSearchTerm(e.target.value)}
          className="search-input"
          style={{marginTop:"10px"}}
        />
        {Object.keys(groupedData).length > 0 ? (
          <div className="observations-list">
            {Object.entries(groupedData).map(
              ([area, observationsInArea]) => (
                <div key={area} className="area-group">
                  <h4>
                    <u>
                      <em>{area}</em>
                    </u>
                  </h4>
                  {/* {observationsInArea.map((observation, index) => (
                    <div
                      key={index}
                      className="observation-item-checkbox"
                    >
                      {`${index + 1}.`}&nbsp;
                      <span>
                        
                        {observation.observation?.replace(/\s+/g, ' ').trim()}(

                        <span style={{ fontWeight: "bold" }}>
                          {observation.category}
                        </span>
                        )
                      </span>
                      {observation.isNote && (
                        <span className="note-label">(Note)</span>
                      )}
                    </div>
                  ))} */}
                  {Array.from(
  new Map(
    observationsInArea.map((obs) => [
      `${obs.observation?.replace(/\s+/g, ' ').trim()}|${obs.category}`,
      obs,
    ])
  ).values()
  ).map((observation, index) => (
  <div key={index} className="observation-item-checkbox">
    {`${index + 1}.`}&nbsp;
    <span>
      {observation.observation?.replace(/\s+/g, ' ').trim()}(
      <span style={{ fontWeight: "bold" }}>{observation.category}</span>
      )
    </span>
    {observation.isNote && <span className="note-label">(Note)</span>}
  </div>
))}

                </div>
              )
            )}
          </div>
        ) : (
          <div className="no-observations">No observations available.</div>
        )}
      </div>
    </div>
  );
};

export default ObservationsDrawer;
