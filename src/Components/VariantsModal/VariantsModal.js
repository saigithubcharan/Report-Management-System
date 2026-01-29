import React, { useState } from 'react';
import { Modal, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import './VariantsModal.css';
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";

const VariantsModal = ({ data, open, handleClose, handleConfirmSelection }) => {
    const [selectedVariants, setSelectedVariants] = useState([]);
    const [removedItems, setRemovedItems] = useState([]);

    const doneAndClose = () => {
        handleConfirmSelection(selectedVariants, removedItems);
        handleClose();
        setRemovedItems([]);
    };

  
    const handleCheckboxChange = (item, index) => {
        const selectedIndex = selectedVariants.findIndex(selectedItem => selectedItem.sr_no === item.sr_no);
    
        if (selectedIndex === -1) {
            // If item is not selected, add it to the selected variants with variant field set to true and is_selected set to 1
            const newItem = { ...item, variant: true, is_selected: 1 };
            setSelectedVariants(prevSelected => [...prevSelected, newItem]);
        } else {
            setRemovedItems([...removedItems, item.sr_no])
            setSelectedVariants(selectedVariants.filter( e => e.sr_no !== item.sr_no))
        }
        // else {
        //     // If item is already selected, remove it from the selected variants and remove is_selected flag
        //     setSelectedVariants(prevSelected => 
        //         prevSelected.filter(selectedItem => selectedItem.sr_no !== item.sr_no)
        //     );
        // }
    };

    // console.log(selectedVariants)
    

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-table-title"
            aria-describedby="modal-table-description"
        >
            <div className="modal-container-center">
                <Paper className="modal-content-custom">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <h2 className="modal-heading-custom">Observation Variants</h2>
                        {/* <IconButton
                            size="small"
                            onClick={handleClose}
                            className="close-icon"
                        >
                            <CloseIcon />
                        </IconButton> */}
                    </div>
                    {data.length > 0 ? (
                        <TableContainer>
                            <Table className="modal-table-custom" aria-label="modal-table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Sr. No</TableCell>
                                        <TableCell>Area</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Check Points</TableCell>
                                        <TableCell>Observations</TableCell>
                                        <TableCell>Criticality</TableCell>
                                        <TableCell>Recommendations</TableCell>
                                        <TableCell>Is Reference</TableCell>
                                        <TableCell>Selection</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.area}</TableCell>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell>{item.check_points}</TableCell>
                                            <TableCell>{item.observation}</TableCell>
                                            <TableCell>{item.criticality}</TableCell>
                                            <TableCell>{item.recommendations}</TableCell>
                                            <TableCell>{item.is_reference}</TableCell>
                                            <TableCell>
                                                <input
                                                    type='checkbox'
                                                    onChange={() => handleCheckboxChange(item, index)}
                                                    checked={selectedVariants.some(selectedItem => selectedItem.sr_no === item.sr_no)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <div className="no-variants-message">No Variants Available</div>
                    )}
                    <div className="modal-footer">
                        <Button onClick={doneAndClose} variant="contained" color="primary">
                            Done
                        </Button>
                    </div>
                </Paper>
            </div>
        </Modal>
    );
};

export default VariantsModal;
