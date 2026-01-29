// import React, { useState, useEffect } from 'react';
// import { Box, Button, Typography, TextField, Modal, List, ListItem, ListItemSecondaryAction, IconButton } from '@mui/material';
// import { Delete, Close } from '@mui/icons-material';
// import { ToastContainer, toast } from 'react-toastify';
// import './McqModal.css';

// const McqModal = ({ open, handleClose, questionId, saveMcqOptions, initialOptions }) => {
//   const [mcqOptions, setMcqOptions] = useState([]);

//   useEffect(() => {
//     setMcqOptions(initialOptions);
//   }, [initialOptions]);

//   const handleAddMcqOption = () => {
//     setMcqOptions([...mcqOptions, '']);
//   };

//   const handleMcqOptionChange = (index, value) => {
//     setMcqOptions(mcqOptions.map((option, i) => (i === index ? value : option)));
//   };

//   const handleRemoveMcqOption = (index) => {
//     setMcqOptions(mcqOptions.filter((_, i) => i !== index));
//   };

//   const handleSave = () => {
//     saveMcqOptions(questionId, mcqOptions);
//   };

//   return (
//     <Modal open={open} onClose={handleClose}>
//       <Box className="mcq-modal-box">
//         <div className="modal-header">
//           <Typography variant="h6">Manage MCQ Options</Typography>
//           <IconButton className="modal-close-button" onClick={handleClose}>
//             <Close />
//           </IconButton>
//         </div>
//         <List>
//           {mcqOptions.map((option, index) => (
//             <ListItem key={index}>
//               <TextField
//                 fullWidth
//                 margin="dense"
//                 value={option}
//                 onChange={(e) => handleMcqOptionChange(index, e.target.value)}
//                 size='small'
//                 label={`Option ${index+1}`}
//               />
//               <ListItemSecondaryAction>
//                 <IconButton edge="end" onClick={() => handleRemoveMcqOption(index)}>
//                   <Delete />
//                 </IconButton>
//               </ListItemSecondaryAction>
//             </ListItem>
//           ))}
//         </List>
//         <Button disabled={mcqOptions.length === 5} variant="outlined" color="primary" onClick={handleAddMcqOption}>+ ADD</Button>
//         <Button disabled={mcqOptions.map(e => e.trim()).includes("") || mcqOptions.length === 0} variant="contained" color="primary" onClick={handleSave} style={{ marginLeft: '10px' }}>Save</Button>
//       </Box>
//     </Modal>
//   );
// };

// export default McqModal;

import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Modal, List, ListItem, ListItemSecondaryAction, IconButton } from '@mui/material';
import { Delete, Close } from '@mui/icons-material';
import './McqModal.css';

const McqModal = ({ open, handleClose, questionId, saveMcqOptions, initialOptions }) => {
  const [mcqOptions, setMcqOptions] = useState([]);

  useEffect(() => {
    setMcqOptions(initialOptions);
  }, [initialOptions]);

  const handleAddMcqOption = () => {
    setMcqOptions([...mcqOptions, '']);
  };

  const handleMcqOptionChange = (index, value) => {
    setMcqOptions(mcqOptions.map((option, i) => (i === index ? value : option)));
  };

  const handleRemoveMcqOption = (index) => {
    setMcqOptions(mcqOptions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    saveMcqOptions(mcqOptions);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box className="mcq-modal-box">
        <div className="modal-header">
          <Typography variant="h6">Manage MCQ Options</Typography>
          <IconButton className="modal-close-button" onClick={handleClose}>
            <Close />
          </IconButton>
        </div>
        <List>
          {mcqOptions.map((option, index) => (
            <ListItem key={index}>
              <TextField
                fullWidth
                margin="dense"
                value={option}
                onChange={(e) => handleMcqOptionChange(index, e.target.value)}
                size='small'
                label={`Option ${index + 1}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleRemoveMcqOption(index)}>
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Button disabled={mcqOptions.length === 5} variant="outlined" color="primary" onClick={handleAddMcqOption}>+ ADD</Button>
        <Button disabled={mcqOptions.map(e => e.trim()).includes("") || mcqOptions.length === 0} variant="contained" color="primary" onClick={handleSave} style={{ marginLeft: '10px' }}>Save</Button>
      </Box>
    </Modal>
  );
};

export default McqModal;

