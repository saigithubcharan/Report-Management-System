// import React, { useState } from 'react';
// import { Link, useNavigate} from 'react-router-dom';
// import { ArrowBack, Delete, Add } from '@mui/icons-material';
// import { Box, Button, Grid, IconButton, TextField, Typography, MenuItem, Select } from '@mui/material';
// import axios from "../../APIs/axios";
// import { config } from "../../config";
// import './CreateTemplate.css'; // Import CSS for animations
// import McqModal from '../McqModal/McqModal'; // Import the MCQ Modal component

// const CreateTemplate = () => {
//   const navigate = useNavigate()
//   const [formData, setFormData] = useState({
//     title: 'Untitled Template',
//     description: '',
//     questions: [
//       { id: 1, question: 'Site conducted', answer: '', type: 'text' },
//       { id: 2, question: new Date().toISOString().split('T')[0], type: 'text', answer: '' },
//       { id: 3, question: 'Prepared by', answer: '', type: 'text' },
//       { id: 4, question: 'Location', answer: '', type: 'text' }
//     ]
//   });
//   const [mobileViewActive, setMobileViewActive] = useState(false);
//   const [mcqModalOpen, setMcqModalOpen] = useState(false);
//   const [currentMcqId, setCurrentMcqId] = useState(null);
//   const [initialMcqOptions, setInitialMcqOptions] = useState([]);

//   const handleChange = (e, id) => {
//     const { name, value } = e.target;
//     setFormData(prevState => ({
//       ...prevState,
//       questions: prevState.questions.map(q => q.id === id ? { ...q, [name]: value } : q)
//     }));
//   };

//   const addQuestion = () => {
//     const newId = formData.questions.length ? formData.questions[formData.questions.length - 1].id + 1 : 1;
//     setFormData(prevState => ({
//       ...prevState,
//       questions: [...prevState.questions, { id: newId, question: '', answer: '', type: 'text' }]
//     }));
//   };

//   const removeQuestion = (id) => {
//     setFormData(prevState => ({
//       ...prevState,
//       questions: prevState.questions.filter(q => q.id !== id)
//     }));
//   };

//   const handlePublish = async () => {
//     try {
//       const response = await axios.post(`${config.PATH}/api/create-template`, formData);
//       navigate("/templates")
//     } catch (err) {
//       console.error({ "Error": err });
//     }
//   };

//   const handleMcqModalOpen = (id) => {
//     setCurrentMcqId(id);
//     const question = formData.questions.find(q => q.id === id);
//     setInitialMcqOptions(question ? question.mcqOptions || [] : []);
//     setMcqModalOpen(true);
//   };

//   const handleMcqModalClose = () => {
//     setMcqModalOpen(false);
//   };

//   const saveMcqOptions = (questionId, mcqOptions) => {
//     setFormData(prevState => ({
//       ...prevState,
//       questions: prevState.questions.map(q =>
//         q.id === questionId ? { ...q, mcqOptions: mcqOptions } : q
//       )
//     }));
//     setMcqModalOpen(false);
//   };

//   return (
//     <div style={{ height: "100vh", overflow: "auto" }}>
//       <Box p={3}>
//         <Grid container spacing={2}>
//           <Grid item xs={12} md={8}>
//             <Grid container spacing={2} alignItems="center" justifyContent="space-between">
//               <Grid item>
//                 <Grid container alignItems="center" spacing={1}>
//                   <Grid item>
//                     <IconButton component={Link} to="/templates">
//                       <ArrowBack />
//                     </IconButton>
//                   </Grid>
//                   <Grid item>
//                     <Typography variant="h5">Create Template</Typography>
//                   </Grid>
//                 </Grid>
//               </Grid>
//               <Grid item>
//                 <Button size='small' onClick={handlePublish} variant="contained" color="primary">Publish</Button>
//               </Grid>
//             </Grid>

//             <Box mt={3}>
//               <TextField
//                 fullWidth
//                 label="Template Title"
//                 variant="outlined"
//                 margin="dense"
//                 size="small"
//                 name="title"
//                 value={formData.title}
//                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//               />
//               <TextField
//                 fullWidth
//                 label="Add a description"
//                 variant="outlined"
//                 margin="dense"
//                 size="small"
//                 name="description"
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               />
//             </Box>

//             <Box mt={3}>
//               <Typography variant="h6">Title Page</Typography>
//               <Typography variant="body2">
//                 The Title Page is the first page of your inspection report. You can customize the Title Page below.
//               </Typography>

//               <Box mt={1}>
//                 {formData.questions.map((question, index) => (
//                   <Grid container spacing={1} key={question.id} alignItems="center">
//                     <Grid item xs={7}>
//                       <TextField
//                         fullWidth
//                         required
//                         label={`Question ${index + 1}`}
//                         variant="outlined"
//                         margin="dense"
//                         size="small"
//                         name="question"
//                         value={question.question}
//                         onChange={(e) => handleChange(e, question.id)}
//                       />
//                     </Grid>
//                     <Grid item xs={3}>
//                       <Select
//                         fullWidth
//                         variant="outlined"
//                         margin="dense"
//                         name="type"
//                         value={question.type}
//                         onChange={(e) => {
//                           handleChange(e, question.id);
//                           if (e.target.value === 'mcq') {
//                             handleMcqModalOpen(question.id);
//                           }
//                         }}
//                         size='small'
//                       >
//                         <MenuItem value="text">Text</MenuItem>
//                         <MenuItem value="checkbox">Checkbox</MenuItem>
//                         <MenuItem value="mcq">MCQ</MenuItem>
//                         <MenuItem value="date">Date</MenuItem>
//                       </Select>
//                     </Grid>
//                     <Grid item xs={1}>
//                       <IconButton onClick={() => removeQuestion(question.id)}>
//                         <Delete />
//                       </IconButton>
//                     </Grid>
//                   </Grid>
//                 ))}
//                 <Button
//                   startIcon={<Add />}
//                   onClick={addQuestion}
//                   variant="outlined"
//                   color="secondary"
//                   style={{ marginTop: '10px' }}
//                   size='small'
//                 >
//                   Add Question
//                 </Button>
//               </Box>
//             </Box>
//           </Grid>
//           <Grid item xs={12} md={4}>
//             <div style={{ textAlign: 'right' }}>
//               <Button
//                 onClick={() => setMobileViewActive(!mobileViewActive)}
//                 variant="outlined"
//                 color={mobileViewActive ? "secondary" : "primary"}
//                 style={{ marginBottom: "10px" }}
//               >
//                 {mobileViewActive ? "Hide Mobile View" : "Show Mobile Preview"}
//               </Button>
//               {mobileViewActive && (
//                 <Box className={`mobile-view-box ${mobileViewActive ? 'show' : 'hide'}`}>
//                   <Box p={2} border={5} borderColor="grey.300" height="500px" width="250px" borderRadius="20px">
//                     <Typography variant="h6">Mobile View</Typography>
//                   </Box>
//                 </Box>
//               )}
//             </div>
//           </Grid>
//         </Grid>
//       </Box>
//       <McqModal
//         open={mcqModalOpen}
//         handleClose={handleMcqModalClose}
//         questionId={currentMcqId}
//         saveMcqOptions={saveMcqOptions}
//         initialOptions={initialMcqOptions}
//       />
//     </div>
//   );
// };

// export default CreateTemplate;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowBack, Delete, Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Grid,
  IconButton,
  TextField,
  Typography,
  MenuItem,
  Select,
} from "@mui/material";
import axios from "../../APIs/axios";
import { config } from "../../config";
import "./CreateTemplate.css"; // Import CSS for animations
import McqModal from "../McqModal/McqModal"; // Import the MCQ Modal component

const CreateTemplate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "Untitled Template",
    description: "",
    pages: [
      {
        pageTitle: "Page 1",
        questions: [
          { id: 1, question: "Site conducted", answer: "", type: "text" },
          {
            id: 2,
            question: "Conducted On",
            type: "date",
            answer: "",
          },
          { id: 3, question: "Prepared by", answer: "", type: "text" },
          { id: 4, question: "Location", answer: "", type: "text" },
        ],
      },
    ],
  });
  const [mobileViewActive, setMobileViewActive] = useState(false);
  const [mcqModalOpen, setMcqModalOpen] = useState(false);
  const [currentMcqId, setCurrentMcqId] = useState(null);
  const [initialMcqOptions, setInitialMcqOptions] = useState([]);
  const [pageIndex, setPageIndex] = useState(null);

  const handleChange = (e, pageIdx, questionIdx) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      pages: prevState.pages.map((page, pIdx) =>
        pIdx === pageIdx
          ? {
              ...page,
              questions: page.questions.map((q, qIdx) =>
                qIdx === questionIdx ? { ...q, [name]: value } : q
              ),
            }
          : page
      ),
    }));
  };

  const addQuestion = (pageIdx) => {
    const newId = formData.pages[pageIdx].questions.length
      ? formData.pages[pageIdx].questions[
          formData.pages[pageIdx].questions.length - 1
        ].id + 1
      : 1;
    setFormData((prevState) => ({
      ...prevState,
      pages: prevState.pages.map((page, pIdx) =>
        pIdx === pageIdx
          ? {
              ...page,
              questions: [
                ...page.questions,
                { id: newId, question: "", answer: "", type: "text" },
              ],
            }
          : page
      ),
    }));
  };

  const removeQuestion = (pageIdx, questionId) => {
    setFormData((prevState) => ({
      ...prevState,
      pages: prevState.pages.map((page, pIdx) =>
        pIdx === pageIdx
          ? {
              ...page,
              questions: page.questions.filter((q) => q.id !== questionId),
            }
          : page
      ),
    }));
  };

  const handlePublish = async () => {

    if (!validatePages()) {
      return;
    }

    try {
      await axios.post(`${config.PATH}/api/create-template`, formData);
      navigate("/templates");
    } catch (err) {
      console.error({ Error: err });
    }
  };

  const validatePages = () => {
    for (const page of formData.pages) {
      if (page.questions.length === 0) {
        alert(`Page "${page.pageTitle}" has no questions. Please add at least one question or delete the page.`);
        return false;
      }
    }
    return true;
  };

  const handleMcqModalOpen = (pageIdx, questionIdx, id) => {
    setCurrentMcqId(id);
    const question = formData.pages[pageIdx].questions[questionIdx];
    setInitialMcqOptions(question ? question.mcqOptions || [] : []);
    setMcqModalOpen(true);
    setPageIndex(pageIdx);
  };

  const saveMcqOptions = (pageIndex, questionId, mcqOptions) => {
    setFormData((prevState) => ({
      ...prevState,
      pages: prevState.pages.map((page, idx) =>
        idx === pageIndex
          ? {
              ...page,
              questions: page.questions.map((q) =>
                q.id === questionId ? { ...q, mcqOptions: mcqOptions } : q
              ),
            }
          : page
      ),
    }));
    setMcqModalOpen(false);
  };

  const addPage = () => {
    setFormData((prevState) => ({
      ...prevState,
      pages: [
        ...prevState.pages,
        {
          pageTitle: `Page ${prevState.pages.length + 1}`,
          questions: [],
        },
      ],
    }));
  };

  const removePage = (pageIndex) => {
    setFormData((prevState) => ({
      ...prevState,
      pages: prevState.pages.filter((page, idx) => idx !== pageIndex),
    }));
  };

  return (
    <div style={{ height: "100vh", overflow: "auto" }}>
      <Box p={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Grid
              container
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Grid item>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item>
                    <IconButton component={Link} to="/templates">
                      <ArrowBack />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <Typography variant="h5">Create Template</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Button
                  size="small"
                  onClick={handlePublish}
                  variant="contained"
                  color="primary"
                >
                  Publish
                </Button>
              </Grid>
            </Grid>

            <Box mt={3}>
              <TextField
                fullWidth
                label="Template Title"
                variant="outlined"
                margin="dense"
                size="small"
                name="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Add a description"
                variant="outlined"
                margin="dense"
                size="small"
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Box>

            <Box mt={3}>
              {formData.pages &&
                formData.pages.map((page, pageIdx) => (
                  <Box mt={3} key={pageIdx}>
                    <Typography variant="h6">
                      {pageIdx !==0?<hr/>:null}
                      {pageIdx === 0 ? "Title Page" : page.pageTitle}
                      {pageIdx===0?<Typography variant="body2">
                        The Title Page is the first page of your inspection report. You can customize the Title Page below.
                      </Typography>:null}
                      {pageIdx !== 0 ? (
                        <IconButton
                          onClick={() => removePage(pageIdx)}
                          aria-label="delete-page"
                        >
                          <Delete color="error" />
                        </IconButton>
                      ) : null}
                    </Typography>

                    <Box mt={1}>
                      {page.questions &&
                        page.questions.map((question, index) => (
                          <Grid
                            container
                            spacing={1}
                            key={question.id}
                            alignItems="center"
                          >
                            <Grid item xs={7}>
                              <TextField
                                fullWidth
                                required
                                label={`Question ${index + 1}`}
                                variant="outlined"
                                margin="dense"
                                size="small"
                                name="question"
                                value={question.question}
                                onChange={(e) =>
                                  handleChange(e, pageIdx, index)
                                }
                              />
                            </Grid>
                            <Grid item xs={3}>
                              <Select
                                fullWidth
                                variant="outlined"
                                margin="dense"
                                name="type"
                                value={question.type}
                                onChange={(e) => {
                                  handleChange(e, pageIdx, index);
                                  if (e.target.value === "mcq") {
                                    handleMcqModalOpen(
                                      pageIdx,
                                      index,
                                      question.id
                                    );
                                  }
                                }}
                                size="small"
                              >
                                <MenuItem value="text">Text</MenuItem>
                                <MenuItem value="checkbox">Checkbox</MenuItem>
                                <MenuItem value="mcq">MCQ</MenuItem>
                                <MenuItem value="date">Date</MenuItem>
                              </Select>
                            </Grid>
                            <Grid item xs={1}>
                              <IconButton
                                onClick={() =>
                                  removeQuestion(pageIdx, question.id)
                                }
                              >
                                <Delete />
                              </IconButton>
                            </Grid>
                          </Grid>
                        ))}
                      <Button
                        startIcon={<Add />}
                        onClick={() => addQuestion(pageIdx)}
                        variant="outlined"
                        color="secondary"
                        style={{ marginTop: "10px" }}
                        size="small"
                      >
                        Add Question
                      </Button>
                    </Box>
                  </Box>
                ))}
                <hr/>
              <Button
                startIcon={<Add />}
                onClick={addPage}
                variant="outlined"
                color="primary"
                style={{ marginTop: "10px" }}
                size="small"
              >
                Add Page
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <div style={{ textAlign: "right" }}>
              <Button
                onClick={() => setMobileViewActive(!mobileViewActive)}
                variant="outlined"
                color={mobileViewActive ? "secondary" : "primary"}
                style={{ marginBottom: "10px" }}
                size="small"
              >
                {mobileViewActive ? "Close Preview" : "Mobile Preview"}
              </Button>
            </div>
            {mobileViewActive && (
              <Box
                className="mobile-view-box"
                style={{
                  textAlign: "left",
                  height: "70vh",
                  overflowY: "scroll",
                }}
              >
                <Box className="mobile-view-content">
                  <Typography variant="h6" align="center">
                    Mobile Preview
                  </Typography>
                  <Typography
                    variant="body1"
                    align="center"
                    color="textSecondary"
                  >
                    This is how the template will appear on a mobile device.
                  </Typography>
                  <Box mt={3}>
                    <Typography variant="subtitle1">
                      {formData.title}
                    </Typography>
                    <Typography variant="body2">
                      {formData.description}
                    </Typography>
                  </Box>
                  {formData.pages.map((page, pageIdx) => (
                    <Box key={pageIdx} mt={3}>
                      <Typography variant="subtitle1">
                        {page.pageTitle}
                      </Typography>
                      {page.questions.map((question, index) => (
                        <Box key={index} mt={1}>
                          <Typography variant="body2">{`${index + 1}. ${
                            question.question
                          }`}</Typography>
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
      <McqModal
        open={mcqModalOpen}
        handleClose={() => setMcqModalOpen(false)}
        questionId={currentMcqId}
        saveMcqOptions={(mcqOptions) =>
          saveMcqOptions(pageIndex, currentMcqId, mcqOptions)
        }
        initialOptions={initialMcqOptions}
      />
    </div>
  );
};

export default CreateTemplate;
