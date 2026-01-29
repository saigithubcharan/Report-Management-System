// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate, useParams } from 'react-router-dom';
// import { ArrowBack, Delete, Add } from '@mui/icons-material';
// import { Box, Button, Grid, IconButton, TextField, Typography, MenuItem, Select } from '@mui/material';
// import axios from "../../APIs/axios";
// import { config } from "../../config";
// import McqModal from '../McqModal/McqModal'; // Import the MCQ Modal component

// const UpdateTemplate = () => {
//   const navigate = useNavigate();
//   const { templateId } = useParams();
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     questions: []
//   });
//   const [mobileViewActive, setMobileViewActive] = useState(false);
//   const [mcqModalOpen, setMcqModalOpen] = useState(false);
//   const [currentMcqId, setCurrentMcqId] = useState(null);
//   const [initialMcqOptions, setInitialMcqOptions] = useState([]);

//   useEffect(() => {
//     const fetchTemplate = async () => {
//       try {
//         const response = await axios.get(`${config.PATH}/api/get-template-by-id/${templateId}`);
//         const template = response.data;

//         setFormData({
//           title: template.title,
//           description: template.description,
//           questions: template.Questions.map((q, index) => ({
//             id: index + 1,
//             question: q.question,
//             answer: q.answer,
//             type: q.type,
//             mcqOptions: q.mcq_options || []
//           }))
//         });
//       } catch (error) {
//         console.error("Error fetching template:", error);
//       }
//     };

//     if (templateId) {
//       fetchTemplate();
//     }
//   }, [templateId]);

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
//     const uuid = templateId
//     try {
//       const response = await axios.put(`${config.PATH}/api/update-template/${uuid}`, formData);
//       navigate("/templates");
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
//                     <Typography variant="h5">Update Template</Typography>
//                   </Grid>
//                 </Grid>
//               </Grid>
//               <Grid item>
//                 <Button size='small' onClick={handlePublish} variant="contained" color="primary">Update</Button>
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

// export default UpdateTemplate;

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import McqModal from "../McqModal/McqModal"; // Import the MCQ Modal component
import { v4 as uuidv4 } from 'uuid';

const UpdateTemplate = () => {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pages: [],
  });
  const [mobileViewActive, setMobileViewActive] = useState(false);
  const [mcqModalOpen, setMcqModalOpen] = useState(false);
  const [currentMcqId, setCurrentMcqId] = useState(null);
  const [initialMcqOptions, setInitialMcqOptions] = useState([]);

  useEffect(() => {
    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      const response = await axios.get(
        `${config.PATH}/api/get-template-by-id/${templateId}`
      );
      const template = response.data;

      setFormData({
        title: template.title,
        description: template.description,
        pages: template.Pages.map((page) => ({
          pageTitle: page.pageTitle,
          id: page.id,
          template_id: page.template_id,
          questions: page.Questions.map((q, index) => ({
            id: q.id,
            question: q.question,
            answer: q.answer,
            type: q.type,
            mcqOptions: q.mcq_options || [],
            page_id: q.page_id,
            template_id: templateId,
          })),
        })),
      });
    } catch (error) {
      console.error("Error fetching template:", error);
    }
  };

  const handleChange = (e, pageIdx, questionIdx) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      pages: prevState.pages.map((page, pIndex) =>
        pIndex === pageIdx
          ? {
              ...page,
              questions: page.questions.map((q, qIndex) =>
                qIndex === questionIdx
                  ? { ...q, [name]: value, page_id: q.page_id } // Access page_id from the question
                  : q
              ),
            }
          : page
      ),
    }));
  };
  


  // const addQuestion = (pageIdx, pageId) => {
  //   const newId = formData.pages[pageIdx].questions.length
  //     ? formData.pages[pageIdx].questions[
  //         formData.pages[pageIdx].questions.length - 1
  //       ].id + 1
  //     : 1;
  //   setFormData((prevState) => ({
  //     ...prevState,
  //     pages: prevState.pages.map((page, pIndex) =>
  //       pIndex === pageIdx
  //         ? {
  //             ...page,
  //             questions: [
  //               ...page.questions,
  //               {
  //                 id: newId,
  //                 question: "",
  //                 answer: "",
  //                 type: "text",
  //                 mcqOptions: [],
  //                 page_id: pageId,
  //                 template_id: templateId,
  //               },
  //             ],
  //           }
  //         : page
  //     ),
  //   }));
  // };

  const addQuestion = (pageIdx, pageId) => {
  
    const newId = formData.pages[pageIdx].questions.length
      ? formData.pages[pageIdx].questions[
          formData.pages[pageIdx].questions.length - 1
        ].id + 1
      : 1;
    
    setFormData((prevState) => {
      const updatedPages = prevState.pages.map((page, pIndex) => {
        if (pIndex === pageIdx) {
          return {
            ...page,
            questions: [
              ...page.questions,
              {
                id: newId,
                question: "",
                answer: "",
                type: "text",
                mcqOptions: [],
                page_id: page.id,
                template_id: templateId,
              },
            ],
          };
        }
        return page;
      });
      
      return {
        ...prevState,
        pages: updatedPages,
      };
    });
  };
  
  const removeQuestion = (pageIdx, questionId) => {
    setFormData((prevState) => {
      console.log("Previous state:", prevState);
      const updatedPages = [...prevState.pages];
      const updatedQuestions = updatedPages[pageIdx].questions.filter(
        (q) => q.id !== questionId
      );
      console.log("Updated questions:", updatedQuestions);
      updatedPages[pageIdx].questions = updatedQuestions;
      return { ...prevState, pages: updatedPages };
    });
  };

  const handlePublish = async () => {

    if (!validatePages()) {
      return;
    }

    const uuid = templateId;
    try {
      const response = await axios.put(
        `${config.PATH}/api/update-template/${uuid}`,
        formData
      );
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

  const handleMcqModalOpen = (questionId) => {
    setCurrentMcqId(questionId);
    const { pageIdx, questionIdx } = findQuestionIndices(questionId);
    const question = formData.pages[pageIdx].questions[questionIdx];
    setInitialMcqOptions(question ? question.mcqOptions || [] : []);
    setMcqModalOpen(true);
  };

  const handleMcqModalClose = () => {
    setMcqModalOpen(false);
  };

  const saveMcqOptions = (mcqOptions) => {
    const { pageIdx, questionIdx } = findQuestionIndices(currentMcqId);
    setFormData((prevState) => ({
      ...prevState,
      pages: prevState.pages.map((page, pIndex) =>
        pIndex === pageIdx
          ? {
              ...page,
              questions: page.questions.map((q, qIndex) =>
                qIndex === questionIdx ? { ...q, mcqOptions: mcqOptions } : q
              ),
            }
          : page
      ),
    }));
    setMcqModalOpen(false);
  };

  const findQuestionIndices = (questionId) => {
    for (let i = 0; i < formData.pages.length; i++) {
      const page = formData.pages[i];
      const questionIdx = page.questions.findIndex(
        (question) => question.id === questionId
      );
      if (questionIdx !== -1) {
        return { pageIdx: i, questionIdx };
      }
    }
    return { pageIdx: -1, questionIdx: -1 };
  };

  const addPage = async () => {
    const newPageTitle = `Page ${formData.pages.length + 1}`;
    const payload = {
      template_id:templateId,
      pageTitle:newPageTitle
    }
    try {
      await axios.post(`${config.PATH}/api/add-page`, payload);
      // fetchTemplate();
      // Update the local state with the new page
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
    } catch (error) {
      console.error("Error adding page:", error);
    }
  };
  

  console.log(formData)

  const removePage = async (pageIndex, pageId) => {
    await axios.delete(`${config.PATH}/api/delete-page/${pageId}`);
    fetchTemplate();
    // setFormData((prevState) => ({
    //   ...prevState,
    //   pages: prevState.pages.filter((page, idx) => idx !== pageIndex),
    // }));
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
                    <Typography variant="h5">Update Template</Typography>
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
                  Update
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

            {/* {formData.pages.map((page, pageIndex) => (
              <Box key={pageIndex} mt={3}>
                <Typography variant="h6">{page.pageTitle}</Typography>
                <Typography variant="body2">
                  The Title Page is the first page of your inspection report. You can customize the Title Page below.
                </Typography>

                <Box mt={1}>
                  {page.questions.map((question, index) => (
                    <Grid container spacing={1} key={question.id} alignItems="center">
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
                          onChange={(e) => handleChange(e, pageIndex, index)}
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
                            handleChange(e, pageIndex, index);
                            if (e.target.value === 'mcq') {
                              handleMcqModalOpen(question.id);
                            }
                          }}
                          size='small'
                        >
                          <MenuItem value="text">Text</MenuItem>
                          <MenuItem value="checkbox">Checkbox</MenuItem>
                          <MenuItem value="mcq">MCQ</MenuItem>
                          <MenuItem value="date">Date</MenuItem>
                        </Select>
                      </Grid>
                      <Grid item xs={1}>
                        <IconButton onClick={() => removeQuestion(pageIndex, question.id)}>
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                  <Button
                    startIcon={<Add />}
                    onClick={() => addQuestion(pageIndex)}
                    variant="outlined"
                    color="secondary"
                    style={{ marginTop: '10px' }}
                    size='small'
                  >
                    Add Question
                  </Button>
                </Box>
              </Box>
            ))} */}
            {formData.pages.map((page, pageIndex) => (
              <Box key={pageIndex} mt={3}>
                <Typography variant="h6">
                      {pageIndex === 0 ? "Title Page" : page.pageTitle}
                      {pageIndex===0?<Typography variant="body2">
                        The Title Page is the first page of your inspection report. You can customize the Title Page below.
                      </Typography>:null}
                      {pageIndex !== 0 ? (
                        <IconButton
                          onClick={() => removePage(pageIndex, page.id)}
                          aria-label="delete-page"
                        >
                          <Delete color="error" />
                        </IconButton>
                      ) : null}
                    </Typography>

                <Box mt={1}>
                  {page.questions.map((question, index) => (
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
                          onChange={(e) => handleChange(e, pageIndex, index)}
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
                            handleChange(e, pageIndex, index);
                            if (e.target.value === "mcq") {
                              handleMcqModalOpen(question.id);
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
                          onClick={() => removeQuestion(pageIndex, question.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                  <Button
                    startIcon={<Add />}
                    onClick={() => addQuestion(pageIndex, page.id)}
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

            <Button
              startIcon={<Add />}
              onClick={addPage}
              variant="outlined"
              color="secondary"
              style={{ marginTop: "10px" }}
              size="small"
            >
              Add Page
            </Button>
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
        handleClose={handleMcqModalClose}
        questionId={currentMcqId}
        saveMcqOptions={saveMcqOptions}
        initialOptions={initialMcqOptions}
      />
    </div>
  );
};

export default UpdateTemplate;