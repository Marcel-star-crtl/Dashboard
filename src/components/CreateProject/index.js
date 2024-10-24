import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { auth, db, storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, getDocs, query, serverTimestamp } from 'firebase/firestore';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CreateProject = () => {
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverImageLink, setCoverImageLink] = useState('');
  const [coverMedia, setCoverMedia] = useState(null);
  const [coverMediaLink, setCoverMediaLink] = useState('');
  const [coverMediaType, setCoverMediaType] = useState('image');
  const [featureImage, setFeatureImage] = useState(null);
  const [featureImageLink, setFeatureImageLink] = useState('');
  const [sections, setSections] = useState([]);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsQuery = query(collection(db, 'projects'));
        const querySnapshot = await getDocs(projectsQuery);
        const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllProjects(projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const uploadFile = async (file) => {
    const storageRef = ref(storage, `project-files/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleCoverImageChange = (e) => {
    setCoverImage(e.target.files[0]);
    setCoverImageLink('');
  };

  const handleCoverMediaChange = (e) => {
    setCoverMedia(e.target.files[0]);
    setCoverMediaLink('');
    setCoverMediaType(e.target.files[0].type.startsWith('video') ? 'video' : 'image');
  };

  const addSection = (type) => {
    setSections([...sections, { type, content: '', files: [], isLink: false }]);
  };

  const updateSection = (index, content) => {
    const updatedSections = [...sections];
    updatedSections[index].content = content;
    setSections(updatedSections);
  };

  const handleFileChange = (index, e) => {
    const updatedSections = [...sections];
    updatedSections[index].files = Array.from(e.target.files);
    setSections(updatedSections);
  };

  const handleRelatedProjectToggle = (project) => {
    setRelatedProjects(prevRelated => {
      if (prevRelated.some(rp => rp.id === project.id)) {
        return prevRelated.filter(rp => rp.id !== project.id);
      } else {
        return [...prevRelated, {
          id: project.id,
          title: project.title,
          slug: project.slug,
          subtitle: project.subtitle || '',
          description: project.description || '',
          location: project.location || '',
          coverImage: project.coverImage
        }];
      }
    });
  };

  const removeSection = (index) => {
    const updatedSections = [...sections];
    updatedSections.splice(index, 1);
    setSections(updatedSections);
  };

  const handleFeatureImageChange = (e) => {
    setFeatureImage(e.target.files[0]);
    setFeatureImageLink('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidated(true);
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (event.currentTarget.checkValidity() === false) {
      setLoading(false);
      return;
    }

    if (!title || !description || !slug || (!coverImage && !coverImageLink) || (!coverMedia && !coverMediaLink) || (!featureImage && !featureImageLink) ) {
      setErrorMessage('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {

      let featureImageUrl = featureImageLink;
      if (featureImage) {
        featureImageUrl = await uploadFile(featureImage);
      }

      let coverImageUrl = coverImageLink;
      if (coverImage) {
        coverImageUrl = await uploadFile(coverImage);
      }

      let coverMediaUrl = coverMediaLink;
      if (coverMedia) {
        coverMediaUrl = await uploadFile(coverMedia);
      }

      const processedSections = await Promise.all(sections.map(async (section) => {
        if (section.type === 'image' || section.type === 'video') {
          const layout = section.files && section.files.length > 1 ? 'double' : 'single';
          if (section.isLink) {
            return { type: section.type, content: section.content, isLink: true, layout };
          } else {
            const urls = await Promise.all(section.files.map(uploadFile));
            return { type: section.type, content: urls, isLink: false, layout };
          }
        }
        return section;
      }));

      const projectRef = await addDoc(collection(db, 'projects'), {
        title,
        subtitle,
        slug,
        description,
        location,
        coverImage: coverImageUrl,
        coverMedia: {
          url: coverMediaUrl,
          type: coverMediaType
        },
        featureImage: featureImageUrl,
        sections: processedSections,
        relatedProjects: relatedProjects.map(rp => ({
          id: rp.id,
          title: rp.title,
          slug: rp.slug,
          subtitle: rp.subtitle || '',
          description: rp.description || '',
          location: rp.location || '',
          coverImage: rp.coverImage
        })),
        createdAt: serverTimestamp(),
      });

      setSuccessMessage('Project case study submitted successfully!');
      console.log('Project added with ID: ', projectRef.id);

      // Reset form
      setTitle('');
      setSubtitle('');
      setSlug('');
      setDescription('');
      setLocation('');
      setCoverImage(null);
      setCoverImageLink('');
      setCoverMedia(null);
      setCoverMediaLink('');
      setCoverMediaType('image');
      setSections([]);
      setRelatedProjects([]);
      setValidated(false);
    } catch (error) {
      console.error('Error submitting project:', error);
      setErrorMessage(`Error submitting project: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = allProjects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!slug) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSlugChange = (e) => {
    setSlug(generateSlug(e.target.value));
  };


  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <Card.Title>Create Project Case Study</Card.Title>
            </Card.Header>
            <Card.Body>
              {errorMessage && <Alert variant="danger" className="mb-4">{errorMessage}</Alert>}
              {successMessage && <Alert variant="success" className="mb-4">{successMessage}</Alert>}
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Subtitle</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={subtitle} 
                    onChange={(e) => setSubtitle(e.target.value)} 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Slug</Form.Label>
                  <Form.Control
                    type="text"
                    value={slug}
                    onChange={handleSlugChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    The slug is used for the URL of your project. It's automatically generated from the title, but you can edit it.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Cover Image</Form.Label>
                  <Form.Check 
                    type="switch"
                    id="cover-image-switch"
                    label={coverImageLink ? "Image Link" : "Image File"}
                    checked={!!coverImageLink}
                    onChange={() => {
                      setCoverImageLink(coverImageLink ? '' : 'http://');
                      setCoverImage(null);
                    }}
                    className="mb-2"
                  />
                  {coverImageLink ? (
                    <Form.Control 
                      type="text" 
                      placeholder="Enter image URL"
                      value={coverImageLink}
                      onChange={(e) => setCoverImageLink(e.target.value)}
                      required
                    />
                  ) : (
                    <Form.Control 
                      type="file" 
                      onChange={handleCoverImageChange}
                      required 
                    />
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Cover Media (for inside project page)</Form.Label>
                  <Form.Check 
                    type="switch"
                    id="cover-media-switch"
                    label={coverMediaLink ? "Media Link" : "Media File"}
                    checked={!!coverMediaLink}
                    onChange={() => {
                      setCoverMediaLink(coverMediaLink ? '' : 'http://');
                      setCoverMedia(null);
                    }}
                    className="mb-2"
                  />
                  {coverMediaLink ? (
                    <>
                      <Form.Control 
                        type="text" 
                        placeholder="Enter media URL"
                        value={coverMediaLink}
                        onChange={(e) => setCoverMediaLink(e.target.value)}
                        required
                      />
                      <Form.Select 
                        className="mt-2"
                        value={coverMediaType}
                        onChange={(e) => setCoverMediaType(e.target.value)}
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </Form.Select>
                    </>
                  ) : (
                    <Form.Control 
                      type="file" 
                      onChange={handleCoverMediaChange}
                      accept="image/*,video/*"
                      required 
                    />
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Feature Image</Form.Label>
                  <Form.Check 
                    type="switch"
                    id="feature-image-switch"
                    label={featureImageLink ? "Image Link" : "Image File"}
                    checked={!!featureImageLink}
                    onChange={() => {
                      setFeatureImageLink(featureImageLink ? '' : 'http://');
                      setFeatureImage(null);
                    }}
                    className="mb-2"
                  />
                  {featureImageLink ? (
                    <Form.Control 
                      type="text" 
                      placeholder="Enter feature image URL"
                      value={featureImageLink}
                      onChange={(e) => setFeatureImageLink(e.target.value)}
                    />
                  ) : (
                    <Form.Control 
                      type="file" 
                      onChange={handleFeatureImageChange}
                    />
                  )}
                </Form.Group>
                
                {sections.map((section, index) => (
                  <Form.Group key={index} className="mb-3">
                    <Form.Label>{section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section</Form.Label>
                    {section.type === 'text' ? (
                      <ReactQuill
                        value={section.content}
                        onChange={(content) => updateSection(index, content)}
                        placeholder="Enter content"
                        modules={{
                          toolbar: [
                            [{ header: [1, 2, 3, 4, 5, 6, false] }],
                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                            [
                              { list: 'ordered' },
                              { list: 'bullet' },
                              { indent: '-1' },
                              { indent: '+1' },
                            ],
                            [{ color: [] }],
                            [{ align: [] }],
                            ['link', 'image', 'video'],
                            ['clean'],
                          ],
                        }}
                        formats={[
                          'header',
                          'bold',
                          'italic',
                          'underline',
                          'strike',
                          'blockquote',
                          'list',
                          'bullet',
                          'indent',
                          'link',
                          'image',
                          'video',
                          'color',
                          'align',
                          'clean',
                        ]}
                        style={{ height: 'auto' }}
                      />
                    ) : ['image', 'image_pair', 'video', 'video_pair'].includes(section.type) ? (
                      <>
                        <Form.Check 
                          type="switch"
                          id={`${section.type}-type-switch-${index}`}
                          label={section.isLink ? "Link" : "File"}
                          checked={section.isLink}
                          onChange={() => {
                            const updatedSections = [...sections];
                            updatedSections[index].isLink = !updatedSections[index].isLink;
                            updatedSections[index].content = section.isLink ? '' : [];
                            updatedSections[index].files = [];
                            setSections(updatedSections);
                          }}
                          className="mb-2"
                        />
                        {section.isLink ? (
                          <Form.Control 
                            type="text" 
                            placeholder={`Enter ${section.type} URL(s), comma-separated for pairs`}
                            value={section.content}
                            onChange={(e) => {
                              const updatedSections = [...sections];
                              updatedSections[index].content = e.target.value;
                              setSections(updatedSections);
                            }}
                          />
                        ) : (
                          <Form.Control 
                            type="file" 
                            multiple={section.type.includes('pair')}
                            onChange={(e) => handleFileChange(index, e)}
                          />
                        )}
                      </>
                    ) : null}
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => removeSection(index)} 
                      className="mt-2"
                    >
                      Remove Section
                    </Button>
                  </Form.Group>
                ))}

                <Button onClick={() => addSection('text')} className="section_button me-2">Add Text Section</Button>
                <Button onClick={() => addSection('image')} className="section_button me-2">Add Image Section</Button>
                <Button onClick={() => addSection('image_pair')} className="section_button me-2">Add Image Pair Section</Button>
                <Button onClick={() => addSection('video')} className="section_button me-2">Add Video Section</Button>
                <Button onClick={() => addSection('video_pair')} className="section_button mb-3">Add Video Pair Section</Button>

                {/* <Form.Group className="mb-3">
                  <Form.Label>Search Related Projects</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Search projects"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <Form.Label>Related Projects */}
                <Form.Group className="mb-3">
                  <Form.Label>Search Related Projects</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Search projects"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Form.Group>
                
                {/* <Form.Group className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <Form.Label>Related Projects</Form.Label>
                  {filteredProjects.map(project => (
                    <Form.Check 
                      key={project.id}
                      type="checkbox"
                      // label={`${project.title} (${project.subtitle || 'No subtitle'} - ${project.location || 'No location'})`}
                      label={`${project.title}`}
                      checked={relatedProjects.some(rp => rp.id === project.id)}
                      onChange={() => handleRelatedProjectToggle(project)}
                    />
                  ))}
                </Form.Group> */}

                <Form.Group className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <Form.Label>Related Projects</Form.Label>
                  {filteredProjects.map(project => (
                    <Form.Check 
                      key={project.id}
                      type="checkbox"
                      label={`${project.title}`} // You can adjust the label as needed
                      checked={relatedProjects.some(rp => rp.id === project.id)}
                      onChange={() => handleRelatedProjectToggle(project)}
                    />
                  ))}
                </Form.Group>
                
                <Button type="submit" className={`create_button mt-5 ${loading ? 'submitting-button' : ''}`} disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      Submitting...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateProject;















// import React, { useState, useEffect } from 'react';
// import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
// import { auth, db, storage } from '../../config/firebase';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { addDoc, collection, getDocs, query, serverTimestamp } from 'firebase/firestore';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

// const CreateProject = () => {
//   const [validated, setValidated] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [title, setTitle] = useState('');
//   const [subtitle, setSubtitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [location, setLocation] = useState('');
//   const [coverImage, setCoverImage] = useState(null);
//   const [coverImageLink, setCoverImageLink] = useState('');
//   const [coverMedia, setCoverMedia] = useState(null);
//   const [coverMediaLink, setCoverMediaLink] = useState('');
//   const [coverMediaType, setCoverMediaType] = useState('image');
//   const [sections, setSections] = useState([]);
//   const [relatedProjects, setRelatedProjects] = useState([]);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [allProjects, setAllProjects] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const projectsQuery = query(collection(db, 'projects'));
//         const querySnapshot = await getDocs(projectsQuery);
//         const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setAllProjects(projects);
//       } catch (error) {
//         console.error('Error fetching projects:', error);
//       }
//     };

//     fetchProjects();
//   }, []);

//   const handleCoverImageChange = (e) => {
//     setCoverImage(e.target.files[0]);
//     setCoverImageLink('');
//   };

//   const handleCoverMediaChange = (e) => {
//     setCoverMedia(e.target.files[0]);
//     setCoverMediaLink('');
//     setCoverMediaType(e.target.files[0].type.startsWith('video') ? 'video' : 'image');
//   };

//   const addSection = (type) => {
//     setSections([...sections, { type, content: '', files: [], isLink: false }]);
//   };

//   const updateSection = (index, content) => {
//     const updatedSections = [...sections];
//     updatedSections[index].content = content;
//     setSections(updatedSections);
//   };

//   const handleFileChange = (index, e) => {
//     const updatedSections = [...sections];
//     updatedSections[index].files = Array.from(e.target.files);
//     setSections(updatedSections);
//   };

//   const handleRelatedProjectToggle = (project) => {
//     setRelatedProjects(prevRelated => {
//       if (prevRelated.some(rp => rp.id === project.id)) {
//         return prevRelated.filter(rp => rp.id !== project.id);
//       } else {
//         return [...prevRelated, {
//           id: project.id,
//           title: project.title,
//           subtitle: project.subtitle || '',
//           description: project.description || '',
//           location: project.location || '',
//           coverImage: project.coverImage
//         }];
//       }
//     });
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setValidated(true);
//     setLoading(true);
//     setErrorMessage(null);
//     setSuccessMessage(null);

//     if (event.currentTarget.checkValidity() === false) {
//       setLoading(false);
//       return;
//     }

//     if (!title || !description || (!coverImage && !coverImageLink) || (!coverMedia && !coverMediaLink)) {
//       setErrorMessage('Please fill in all required fields');
//       setLoading(false);
//       return;
//     }

//     try {
//       let coverImageUrl = coverImageLink;
//       if (coverImage) {
//         const imageRef = ref(storage, `project-covers/${coverImage.name}`);
//         await uploadBytes(imageRef, coverImage);
//         coverImageUrl = await getDownloadURL(imageRef);
//       }

//       let coverMediaUrl = coverMediaLink;
//       if (coverMedia) {
//         const mediaRef = ref(storage, `project-covers/${coverMedia.name}`);
//         await uploadBytes(mediaRef, coverMedia);
//         coverMediaUrl = await getDownloadURL(mediaRef);
//       }

//       const processedSections = await Promise.all(sections.map(async (section) => {
//         if (section.type === 'image' || section.type === 'video') {
//           const layout = section.files && section.files.length > 1 ? 'double' : 'single';
//           if (section.isLink) {
//             return { type: section.type, content: section.content, isLink: true, layout };
//           } else {
//             const urls = await Promise.all(
//               section.files.map(async (file) => {
//                 const fileRef = ref(storage, `project-${section.type}s/${file.name}`);
//                 await uploadBytes(fileRef, file);
//                 return getDownloadURL(fileRef);
//               })
//             );
//             return { type: section.type, content: urls, isLink: false, layout };
//           }
//         }
//         return section;
//       }));

//       const projectRef = await addDoc(collection(db, 'projects'), {
//         title,
//         subtitle,
//         description,
//         location,
//         coverImage: coverImageUrl,
//         coverMedia: {
//           url: coverMediaUrl,
//           type: coverMediaType
//         },
//         sections: processedSections,
//         relatedProjects: relatedProjects.map(rp => ({
//           id: rp.id,
//           title: rp.title,
//           subtitle: rp.subtitle || '',
//           description: rp.description || '',
//           location: rp.location || '',
//           coverImage: rp.coverImage
//         })),
//         createdAt: serverTimestamp(),
//       });

//       setSuccessMessage('Project case study submitted successfully!');
//       console.log('Project added with ID: ', projectRef.id);

//       // Reset form
//       setTitle('');
//       setSubtitle('');
//       setDescription('');
//       setLocation('');
//       setCoverImage(null);
//       setCoverImageLink('');
//       setCoverMedia(null);
//       setCoverMediaLink('');
//       setCoverMediaType('image');
//       setSections([]);
//       setRelatedProjects([]);
//       setValidated(false);
//     } catch (error) {
//       console.error('Error submitting project:', error);
//       setErrorMessage(`Error submitting project: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredProjects = allProjects.filter(project =>
//     project.title.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <Container>
//       <Row className="justify-content-md-center">
//         <Col md={8}>
//           <Card>
//             <Card.Header>
//               <Card.Title>Create Project Case Study</Card.Title>
//             </Card.Header>
//             <Card.Body>
//               {errorMessage && <Alert variant="danger" className="mb-4">{errorMessage}</Alert>}
//               {successMessage && <Alert variant="success" className="mb-4">{successMessage}</Alert>}
//               <Form noValidate validated={validated} onSubmit={handleSubmit}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Title</Form.Label>
//                   <Form.Control 
//                     type="text" 
//                     value={title} 
//                     onChange={(e) => setTitle(e.target.value)} 
//                     required
//                   />
//                 </Form.Group>
                
//                 <Form.Group className="mb-3">
//                   <Form.Label>Subtitle</Form.Label>
//                   <Form.Control 
//                     type="text" 
//                     value={subtitle} 
//                     onChange={(e) => setSubtitle(e.target.value)} 
//                   />
//                 </Form.Group>

//                 <Form.Group className="mb-3">
//                   <Form.Label>Description</Form.Label>
//                   <Form.Control 
//                     type="text" 
//                     value={description} 
//                     onChange={(e) => setDescription(e.target.value)} 
//                   />
//                 </Form.Group>

//                 {/* <Form.Group className="mb-3">
//                   <Form.Label>Description</Form.Label>
//                   <ReactQuill 
//                     value={description} 
//                     onChange={(content) => setDescription(content)} 
//                   />
//                 </Form.Group> */}
                
//                 <Form.Group className="mb-3">
//                   <Form.Label>Location</Form.Label>
//                   <Form.Control 
//                     type="text" 
//                     value={location} 
//                     onChange={(e) => setLocation(e.target.value)} 
//                   />
//                 </Form.Group>
                
//                 <Form.Group className="mb-3">
//                   <Form.Label>Cover Image</Form.Label>
//                   <Form.Check 
//                     type="switch"
//                     id="cover-image-switch"
//                     label={coverImageLink ? "Image Link" : "Image File"}
//                     checked={!!coverImageLink}
//                     onChange={() => {
//                       setCoverImageLink(coverImageLink ? '' : 'http://');
//                       setCoverImage(null);
//                     }}
//                     className="mb-2"
//                   />
//                   {coverImageLink ? (
//                     <Form.Control 
//                       type="text" 
//                       placeholder="Enter image URL"
//                       value={coverImageLink}
//                       onChange={(e) => setCoverImageLink(e.target.value)}
//                       required
//                     />
//                   ) : (
//                     <Form.Control 
//                       type="file" 
//                       onChange={handleCoverImageChange}
//                       required 
//                     />
//                   )}
//                 </Form.Group>

//                 <Form.Group className="mb-3">
//                   <Form.Label>Cover Media (for inside project page)</Form.Label>
//                   <Form.Check 
//                     type="switch"
//                     id="cover-media-switch"
//                     label={coverMediaLink ? "Media Link" : "Media File"}
//                     checked={!!coverMediaLink}
//                     onChange={() => {
//                       setCoverMediaLink(coverMediaLink ? '' : 'http://');
//                       setCoverMedia(null);
//                     }}
//                     className="mb-2"
//                   />
//                   {coverMediaLink ? (
//                     <>
//                       <Form.Control 
//                         type="text" 
//                         placeholder="Enter media URL"
//                         value={coverMediaLink}
//                         onChange={(e) => setCoverMediaLink(e.target.value)}
//                         required
//                       />
//                       <Form.Select 
//                         className="mt-2"
//                         value={coverMediaType}
//                         onChange={(e) => setCoverMediaType(e.target.value)}
//                       >
//                         <option value="image">Image</option>
//                         <option value="video">Video</option>
//                       </Form.Select>
//                     </>
//                   ) : (
//                     <Form.Control 
//                       type="file" 
//                       onChange={handleCoverMediaChange}
//                       accept="image/*,video/*"
//                       required 
//                     />
//                   )}
//                 </Form.Group>
                
//                 {sections.map((section, index) => (
//                   <Form.Group key={index} className="mb-3">
//                     <Form.Label>{section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section</Form.Label>
//                     {section.type === 'text' ? (
//                       <ReactQuill
//                         value={section.content}
//                         onChange={(content) => updateSection(index, content)}
//                         placeholder="Enter content"
//                         modules={{
//                           toolbar: [
//                             [{ header: [1, 2, 3, 4, 5, 6, false] }],
//                             ['bold', 'italic', 'underline', 'strike', 'blockquote'],
//                             [
//                               { list: 'ordered' },
//                               { list: 'bullet' },
//                               { indent: '-1' },
//                               { indent: '+1' },
//                             ],
//                             [{ color: [] }],
//                             [{ align: [] }],
//                             ['link', 'image', 'video'],
//                             ['clean'],
//                           ],
//                         }}
//                         formats={[
//                           'header',
//                           'bold',
//                           'italic',
//                           'underline',
//                           'strike',
//                           'blockquote',
//                           'list',
//                           'bullet',
//                           'indent',
//                           'link',
//                           'image',
//                           'video',
//                           'color',
//                           'align',
//                           'clean',
//                         ]}
//                         style={{ height: 'auto' }}
//                       />
//                     ) : ['image', 'image_pair', 'video', 'video_pair'].includes(section.type) ? (
//                       <>
//                         <Form.Check 
//                           type="switch"
//                           id={`${section.type}-type-switch-${index}`}
//                           label={section.isLink ? "Link" : "File"}
//                           checked={section.isLink}
//                           onChange={() => {
//                             const updatedSections = [...sections];
//                             updatedSections[index].isLink = !updatedSections[index].isLink;
//                             updatedSections[index].content = section.isLink ? '' : [];
//                             updatedSections[index].files = [];
//                             setSections(updatedSections);
//                           }}
//                           className="mb-2"
//                         />
//                         {section.isLink ? (
//                           <Form.Control 
//                             type="text" 
//                             placeholder={`Enter ${section.type} URL(s), comma-separated for pairs`}
//                             value={section.content}
//                             onChange={(e) => {
//                               const updatedSections = [...sections];
//                               updatedSections[index].content = e.target.value;
//                               setSections(updatedSections);
//                             }}
//                           />
//                         ) : (
//                           <Form.Control 
//                             type="file" 
//                             multiple={section.type.includes('pair')}
//                             onChange={(e) => handleFileChange(index, e)}
//                           />
//                         )}
//                       </>
//                     ) : null}
//                   </Form.Group>
//                 ))}

//                 <Button onClick={() => addSection('text')} className="section_button me-2">Add Text Section</Button>
//                 <Button onClick={() => addSection('image')} className="section_button me-2">Add Image Section</Button>
//                 <Button onClick={() => addSection('image_pair')} className="section_button me-2">Add Image Pair Section</Button>
//                 <Button onClick={() => addSection('video')} className="section_button me-2">Add Video Section</Button>
//                 <Button onClick={() => addSection('video_pair')} className="section_button mb-3">Add Video Pair Section</Button>

//                 <Form.Group className="mb-3">
//                   <Form.Label>Search Related Projects</Form.Label>
//                   <Form.Control 
//                     type="text" 
//                     placeholder="Search projects"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </Form.Group>
                
//                 <Form.Group className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
//                   <Form.Label>Related Projects</Form.Label>
//                   {filteredProjects.map(project => (
//                     <Form.Check 
//                       key={project.id}
//                       type="checkbox"
//                       // label={`${project.title} (${project.subtitle || 'No subtitle'} - ${project.location || 'No location'})`}
//                       label={`${project.title}`}
//                       checked={relatedProjects.some(rp => rp.id === project.id)}
//                       onChange={() => handleRelatedProjectToggle(project)}
//                     />
//                   ))}
//                 </Form.Group>
                
//                 <Button type="submit" className={`create_button mt-5 ${loading ? 'submitting-button' : ''}`} disabled={loading}>
//                   {loading ? (
//                     <>
//                       <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
//                       Submitting...
//                     </>
//                   ) : (
//                     "Create Project"
//                   )}
//                 </Button>
//               </Form>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default CreateProject;







// import React, { useState, useEffect } from 'react';
// import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
// import { auth, db, storage } from '../../config/firebase';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { addDoc, collection, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

// const CreateProject = () => {
//   const [validated, setValidated] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [title, setTitle] = useState('');
//   const [subtitle, setSubtitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [location, setLocation] = useState('');
//   const [coverImage, setCoverImage] = useState(null);
//   const [coverImageLink, setCoverImageLink] = useState('');
//   const [coverMedia, setCoverMedia] = useState(null);
//   const [coverMediaLink, setCoverMediaLink] = useState('');
//   const [coverMediaType, setCoverMediaType] = useState('image');
//   const [sections, setSections] = useState([]);
//   const [relatedProjects, setRelatedProjects] = useState([]);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [allProjects, setAllProjects] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const projectsQuery = query(collection(db, 'projects'));
//         const querySnapshot = await getDocs(projectsQuery);
//         const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setAllProjects(projects);
//       } catch (error) {
//         console.error('Error fetching projects:', error);
//       }
//     };

//     fetchProjects();
//   }, []);

//   const handleCoverImageChange = (e) => {
//     setCoverImage(e.target.files[0]);
//     setCoverImageLink('');
//   };

//   const handleCoverMediaChange = (e) => {
//     setCoverMedia(e.target.files[0]);
//     setCoverMediaLink('');
//     setCoverMediaType(e.target.files[0].type.startsWith('video') ? 'video' : 'image');
//   };

//   const addSection = (type) => {
//     setSections([...sections, { type, content: '', files: [], isLink: false }]);
//   };

//   const updateSection = (index, content) => {
//     const updatedSections = [...sections];
//     updatedSections[index].content = content;
//     setSections(updatedSections);
//   };

//   const handleFileChange = (index, e) => {
//     const updatedSections = [...sections];
//     updatedSections[index].files = Array.from(e.target.files);
//     setSections(updatedSections);
//   };

//   // const handleRelatedProjectToggle = (project) => {
//   //   setRelatedProjects(prevRelated => {
//   //     if (prevRelated.some(rp => rp.id === project.id)) {
//   //       return prevRelated.filter(rp => rp.id !== project.id);
//   //     } else {
//   //       return [...prevRelated, {
//   //         id: project.id,
//   //         title: project.title,
//   //         coverImage: project.coverImage
//   //       }];
//   //     }
//   //   });
//   // };

//   const handleRelatedProjectChange = (e) => {
//     const selectedProjects = Array.from(e.target.selectedOptions, option => ({
//       id: option.value,
//       title: option.text,
//       coverImage: allProjects.find(p => p.id === option.value)?.coverImage || ''
//     }));
//     setRelatedProjects(selectedProjects);
//   };

//   const handleRelatedProjectToggle = (project) => {
//     setRelatedProjects(prevRelated => {
//       if (prevRelated.some(rp => rp.id === project.id)) {
//         return prevRelated.filter(rp => rp.id !== project.id);
//       } else {
//         return [...prevRelated, {
//           id: project.id,
//           title: project.title,
//           subtitle: project.subtitle || '',
//           description: project.description || '',
//           location: project.location || '',
//           coverImage: project.coverImage
//         }];
//       }
//     });
//   };


//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setValidated(true);
//     setLoading(true);
//     setErrorMessage(null);
//     setSuccessMessage(null);

//     if (event.currentTarget.checkValidity() === false) {
//       setLoading(false);
//       return;
//     }

//     try {
//       let coverImageUrl = coverImageLink;
//       if (coverImage) {
//         const imageRef = ref(storage, `project-covers/${coverImage.name}`);
//         await uploadBytes(imageRef, coverImage);
//         coverImageUrl = await getDownloadURL(imageRef);
//       }

//       let coverMediaUrl = coverMediaLink;
//       if (coverMedia) {
//         const mediaRef = ref(storage, `project-covers/${coverMedia.name}`);
//         await uploadBytes(mediaRef, coverMedia);
//         coverMediaUrl = await getDownloadURL(mediaRef);
//       }

//       const processedSections = await Promise.all(sections.map(async (section) => {
//         if (section.type === 'image' || section.type === 'image_pair' || section.type === 'video' || section.type === 'video_pair') {
//           if (section.isLink) {
//             return { type: section.type, content: section.content, isLink: true };
//           } else {
//             const urls = await Promise.all(
//               section.files.map(async (file) => {
//                 const fileRef = ref(storage, `project-${section.type}s/${file.name}`);
//                 await uploadBytes(fileRef, file);
//                 return getDownloadURL(fileRef);
//               })
//             );
//             return { type: section.type, content: urls, isLink: false };
//           }
//         }
//         return section;
//       }));

//       const projectRef = await addDoc(collection(db, 'projects'), {
//         title,
//         subtitle,
//         description,
//         location,
//         coverImage: coverImageUrl,
//         coverMedia: {
//           url: coverMediaUrl,
//           type: coverMediaType
//         },
//         sections: processedSections,
//         relatedProjects: relatedProjects.map(rp => ({
//           id: rp.id,
//           title: rp.title,
//           subtitle: rp.subtitle || '',
//           description: rp.description || '',
//           location: rp.location || '',
//           coverImage: rp.coverImage
//         })),
//         createdAt: serverTimestamp(),
//       });

//       setSuccessMessage('Project case study submitted successfully!');
//       console.log('Project added with ID: ', projectRef.id);

//       // Reset form
//       setTitle('');
//       setSubtitle('');
//       setDescription('');
//       setLocation('');
//       setCoverImage(null);
//       setCoverImageLink('');
//       setCoverMedia(null);
//       setCoverMediaLink('');
//       setCoverMediaType('image');
//       setSections([]);
//       setRelatedProjects([]);
//       setValidated(false);
//     } catch (error) {
//       setErrorMessage(error.message);
//     }
//     setLoading(false);
//   };

//   const filteredProjects = allProjects.filter(project =>
//     project.title.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <Container>
//       <Row className="justify-content-md-center">
//         <Col md={8}>
//           <Card>
//             <Card.Header>
//               <Card.Title>Create Project Case Study</Card.Title>
//             </Card.Header>
//             <Card.Body>
//               {errorMessage && <Alert variant="danger" className="mb-4">{errorMessage}</Alert>}
//               {successMessage && <Alert variant="success" className="mb-4">{successMessage}</Alert>}
//               <Form noValidate validated={validated} onSubmit={handleSubmit}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Title</Form.Label>
//                   <Form.Control 
//                     type="text" 
//                     value={title} 
//                     onChange={(e) => setTitle(e.target.value)} 
//                     required 
//                   />
//                 </Form.Group>
                
//                 <Form.Group className="mb-3">
//                   <Form.Label>Subtitle</Form.Label>
//                   <Form.Control 
//                     type="text" 
//                     value={subtitle} 
//                     onChange={(e) => setSubtitle(e.target.value)} 
//                   />
//                 </Form.Group>

//                 <Form.Group className="mb-3">
//                   <Form.Label>Description</Form.Label>
//                   <ReactQuill 
//                     value={description} 
//                     onChange={(content) => setDescription(content)} 
//                   />
//                 </Form.Group>
                
//                 <Form.Group className="mb-3">
//                   <Form.Label>Location</Form.Label>
//                   <Form.Control 
//                     type="text" 
//                     value={location} 
//                     onChange={(e) => setLocation(e.target.value)} 
//                   />
//                 </Form.Group>
                
//                 <Form.Group className="mb-3">
//                   <Form.Label>Cover Image</Form.Label>
//                   <Form.Check 
//                     type="switch"
//                     id="cover-image-switch"
//                     label={coverImageLink ? "Image Link" : "Image File"}
//                     checked={!!coverImageLink}
//                     onChange={() => {
//                       setCoverImageLink(coverImageLink ? '' : 'http://');
//                       setCoverImage(null);
//                     }}
//                     className="mb-2"
//                   />
//                   {coverImageLink ? (
//                     <Form.Control 
//                       type="text" 
//                       placeholder="Enter image URL"
//                       value={coverImageLink}
//                       onChange={(e) => setCoverImageLink(e.target.value)}
//                       required
//                     />
//                   ) : (
//                     <Form.Control 
//                       type="file" 
//                       onChange={handleCoverImageChange}
//                       required 
//                     />
//                   )}
//                 </Form.Group>

//                 <Form.Group className="mb-3">
//                   <Form.Label>Cover Media (for inside project page)</Form.Label>
//                   <Form.Check 
//                     type="switch"
//                     id="cover-media-switch"
//                     label={coverMediaLink ? "Media Link" : "Media File"}
//                     checked={!!coverMediaLink}
//                     onChange={() => {
//                       setCoverMediaLink(coverMediaLink ? '' : 'http://');
//                       setCoverMedia(null);
//                     }}
//                     className="mb-2"
//                   />
//                   {coverMediaLink ? (
//                     <>
//                       <Form.Control 
//                         type="text" 
//                         placeholder="Enter media URL"
//                         value={coverMediaLink}
//                         onChange={(e) => setCoverMediaLink(e.target.value)}
//                         required
//                       />
//                       <Form.Select 
//                         className="mt-2"
//                         value={coverMediaType}
//                         onChange={(e) => setCoverMediaType(e.target.value)}
//                       >
//                         <option value="image">Image</option>
//                         <option value="video">Video</option>
//                       </Form.Select>
//                     </>
//                   ) : (
//                     <Form.Control 
//                       type="file" 
//                       onChange={handleCoverMediaChange}
//                       accept="image/*,video/*"
//                       required 
//                     />
//                   )}
//                 </Form.Group>
                
//                 {sections.map((section, index) => (
//                   <Form.Group key={index} className="mb-3">
//                     <Form.Label>{section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section</Form.Label>
//                     {section.type === 'text' ? (
//                       <ReactQuill 
//                         value={section.content} 
//                         onChange={(content) => updateSection(index, content)} 
//                       />
//                     ) : ['image', 'image_pair', 'video', 'video_pair'].includes(section.type) ? (
//                       <>
//                         <Form.Check 
//                           type="switch"
//                           id={`${section.type}-type-switch-${index}`}
//                           label={section.isLink ? "Link" : "File"}
//                           checked={section.isLink}
//                           onChange={() => {
//                             const updatedSections = [...sections];
//                             updatedSections[index].isLink = !updatedSections[index].isLink;
//                             updatedSections[index].content = section.isLink ? '' : [];
//                             updatedSections[index].files = [];
//                             setSections(updatedSections);
//                           }}
//                           className="mb-2"
//                         />
//                         {section.isLink ? (
//                           <Form.Control 
//                             type="text" 
//                             placeholder={`Enter ${section.type} URL(s), comma-separated for pairs`}
//                             value={section.content}
//                             onChange={(e) => {
//                               const updatedSections = [...sections];
//                               updatedSections[index].content = e.target.value;
//                               setSections(updatedSections);
//                             }}
//                           />
//                         ) : (
//                           <Form.Control 
//                             type="file" 
//                             multiple={section.type.includes('pair')}
//                             onChange={(e) => handleFileChange(index, e)}
//                           />
//                         )}
//                       </>
//                     ) : null}
//                   </Form.Group>
//                 ))}

//                 <Button onClick={() => addSection('text')} className="section_button me-2">Add Text Section</Button>
//                 <Button onClick={() => addSection('image')} className="section_button me-2">Add Image Section</Button>
//                 <Button onClick={() => addSection('image_pair')} className="section_button me-2">Add Image Pair Section</Button>
//                 <Button onClick={() => addSection('video')} className="section_button me-2">Add Video Section</Button>
//                 <Button onClick={() => addSection('video_pair')} className="section_button mb-3">Add Video Pair Section</Button>

//                 {/* <Form.Group className="mb-3">
//                   <Form.Label>Related Projects</Form.Label>
//                   <div className="related-projects-grid">
//                     {allProjects.map((project) => (
//                       <div key={project.id} className="related-project-item">
//                         <Form.Check 
//                           type="checkbox"
//                           id={`project-${project.id}`}
//                           label={project.title}
//                           checked={relatedProjects.some(rp => rp.id === project.id)}
//                           onChange={() => handleRelatedProjectToggle(project)}
//                         />
//                         {project.coverImage && (
//                           <img src={project.coverImage} alt={project.title} className="related-project-thumbnail" />
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </Form.Group> */}
//                 <Form.Group className="mb-3">
//                   <Form.Label>Search Related Projects</Form.Label>
//                   <Form.Control 
//                     type="text" 
//                     placeholder="Search projects"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </Form.Group>
                
//                 <Form.Group className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
//                   <Form.Label>Related Projects</Form.Label>
//                   {filteredProjects.map(project => (
//                     <Form.Check 
//                       key={project.id}
//                       type="checkbox"
//                       label={`${project.title} (${project.subtitle || 'No subtitle'} - ${project.location || 'No location'})`}
//                       checked={relatedProjects.some(rp => rp.id === project.id)}
//                       onChange={() => handleRelatedProjectToggle(project)}
//                     />
//                   ))}
//                 </Form.Group>
                
                
//                 <Button type="submit" className={`create_button mt-5 ${loading ? 'submitting-button' : ''}`} disabled={loading}>
//                   {loading ? (
//                     <>
//                       <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
//                       Submitting...
//                     </>
//                   ) : (
//                     "Create Project"
//                   )}
//                 </Button>
//               </Form>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default CreateProject;












// import React, { useState, useEffect } from 'react';
// import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
// import { auth, db, storage } from '../../config/firebase';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { addDoc, collection, getDocs, query, where, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

// const CreateProject = () => {
//   const [validated, setValidated] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [title, setTitle] = useState('');
//   const [subtitle, setSubtitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [location, setLocation] = useState('');
//   const [coverImage, setCoverImage] = useState(null);
//   const [coverImageLink, setCoverImageLink] = useState('');
//   const [coverMedia, setCoverMedia] = useState(null);
//   const [coverMediaLink, setCoverMediaLink] = useState('');
//   const [coverMediaType, setCoverMediaType] = useState('image');
//   const [sections, setSections] = useState([]);
//   const [relatedProjects, setRelatedProjects] = useState([]);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [allProjects, setAllProjects] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [featuredProjects, setFeaturedProjects] = useState([]);

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const projectsQuery = query(collection(db, 'projects'));
//         const querySnapshot = await getDocs(projectsQuery);
//         const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setAllProjects(projects);

//         // Fetch currently featured projects
//         const featuredQuery = query(collection(db, 'projects'), where('featured', '==', true));
//         const featuredSnapshot = await getDocs(featuredQuery);
//         const featured = featuredSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setFeaturedProjects(featured);
//       } catch (error) {
//         console.error('Error fetching projects:', error);
//       }
//     };

//     fetchProjects();
//   }, []);

//   const handleCoverImageChange = (e) => {
//     setCoverImage(e.target.files[0]);
//     setCoverImageLink('');
//   };

//   const handleCoverMediaChange = (e) => {
//     setCoverMedia(e.target.files[0]);
//     setCoverMediaLink('');
//     setCoverMediaType(e.target.files[0].type.startsWith('video') ? 'video' : 'image');
//   };

//   const addSection = (type) => {
//     setSections([...sections, { type, content: '', files: [], isLink: false }]);
//   };

//   const updateSection = (index, content) => {
//     const updatedSections = [...sections];
//     updatedSections[index].content = content;
//     setSections(updatedSections);
//   };

//   const handleFileChange = (index, e) => {
//     const updatedSections = [...sections];
//     updatedSections[index].files = Array.from(e.target.files);
//     setSections(updatedSections);
//   };

//   const handleRelatedProjectToggle = (project) => {
//     setRelatedProjects(prevRelated => {
//       if (prevRelated.some(rp => rp.id === project.id)) {
//         return prevRelated.filter(rp => rp.id !== project.id);
//       } else {
//         return [...prevRelated, {
//           id: project.id,
//           title: project.title,
//           subtitle: project.subtitle || '',
//           description: project.description || '',
//           location: project.location || '',
//           coverImage: project.coverImage
//         }];
//       }
//     });
//   };

//   const handleFeaturedProjectToggle = (project) => {
//     setFeaturedProjects(prevFeatured => {
//       if (prevFeatured.some(fp => fp.id === project.id)) {
//         return prevFeatured.filter(fp => fp.id !== project.id);
//       } else if (prevFeatured.length < 4) {
//         return [...prevFeatured, project];
//       } else {
//         alert("You can only select up to 4 featured projects.");
//         return prevFeatured;
//       }
//     });
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setValidated(true);
//     setLoading(true);
//     setErrorMessage(null);
//     setSuccessMessage(null);

//     if (event.currentTarget.checkValidity() === false) {
//       setLoading(false);
//       return;
//     }

//     if (!title || !description || (!coverImage && !coverImageLink) || (!coverMedia && !coverMediaLink)) {
//       setErrorMessage('Please fill in all required fields');
//       setLoading(false);
//       return;
//     }

//     try {
//       let coverImageUrl = coverImageLink;
//       if (coverImage) {
//         const imageRef = ref(storage, `project-covers/${coverImage.name}`);
//         await uploadBytes(imageRef, coverImage);
//         coverImageUrl = await getDownloadURL(imageRef);
//       }

//       let coverMediaUrl = coverMediaLink;
//       if (coverMedia) {
//         const mediaRef = ref(storage, `project-covers/${coverMedia.name}`);
//         await uploadBytes(mediaRef, coverMedia);
//         coverMediaUrl = await getDownloadURL(mediaRef);
//       }

//       const processedSections = await Promise.all(sections.map(async (section) => {
//         if (section.type === 'image' || section.type === 'video') {
//           const layout = section.files && section.files.length > 1 ? 'double' : 'single';
//           if (section.isLink) {
//             return { type: section.type, content: section.content, isLink: true, layout };
//           } else {
//             const urls = await Promise.all(
//               section.files.map(async (file) => {
//                 const fileRef = ref(storage, `project-${section.type}s/${file.name}`);
//                 await uploadBytes(fileRef, file);
//                 return getDownloadURL(fileRef);
//               })
//             );
//             return { type: section.type, content: urls, isLink: false, layout };
//           }
//         }
//         return section;
//       }));

//       const projectRef = await addDoc(collection(db, 'projects'), {
//         title,
//         subtitle,
//         description,
//         location,
//         coverImage: coverImageUrl,
//         coverMedia: {
//           url: coverMediaUrl,
//           type: coverMediaType
//         },
//         sections: processedSections,
//         relatedProjects: relatedProjects.map(rp => ({
//           id: rp.id,
//           title: rp.title,
//           subtitle: rp.subtitle || '',
//           description: rp.description || '',
//           location: rp.location || '',
//           coverImage: rp.coverImage
//         })),
//         featured: featuredProjects.some(fp => fp.id === projectRef.id),
//         createdAt: serverTimestamp(),
//       });

//       // Update featured status for all projects
//       const batch = db.batch();
//       allProjects.forEach(project => {
//         const projectDoc = doc(db, 'projects', project.id);
//         batch.update(projectDoc, {
//           featured: featuredProjects.some(fp => fp.id === project.id)
//         });
//       });
//       await batch.commit();

//       setSuccessMessage('Project case study submitted successfully!');
//       console.log('Project added with ID: ', projectRef.id);

//       // Reset form
//       setTitle('');
//       setSubtitle('');
//       setDescription('');
//       setLocation('');
//       setCoverImage(null);
//       setCoverImageLink('');
//       setCoverMedia(null);
//       setCoverMediaLink('');
//       setCoverMediaType('image');
//       setSections([]);
//       setRelatedProjects([]);
//       setFeaturedProjects([]);
//       setValidated(false);
//     } catch (error) {
//       console.error('Error submitting project:', error);
//       setErrorMessage(`Error submitting project: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredProjects = allProjects.filter(project =>
//     project.title.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <Container>
//       <Row className="justify-content-md-center">
//         <Col md={8}>
//           <Card>
//             <Card.Header>
//               <Card.Title>Create Project Case Study</Card.Title>
//             </Card.Header>
//             <Card.Body>
//               {errorMessage && <Alert variant="danger" className="mb-4">{errorMessage}</Alert>}
//               {successMessage && <Alert variant="success" className="mb-4">{successMessage}</Alert>}
//               <Form noValidate validated={validated} onSubmit={handleSubmit}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Title</Form.Label>
//                   <Form.Control 
//                     type="text" 
//                     value={title} 
//                     onChange={(e) => setTitle(e.target.value)} 
//                     required
//                   />
//                 </Form.Group>
                
//                 <Form.Group className="mb-3">
//                   <Form.Label>Subtitle</Form.Label>
//                   <Form.Control 
//                     type="text" 
//                     value={subtitle} 
//                     onChange={(e) => setSubtitle(e.target.value)} 
//                   />
//                 </Form.Group>

//                 <Form.Group className="mb-3">
//                   <Form.Label>Description</Form.Label>
//                   <Form.Control 
//                     as="textarea" 
//                     rows={3}
//                     value={description} 
//                     onChange={(e) => setDescription(e.target.value)} 
//                     required
//                   />
//                 </Form.Group>
                
//                 <Form.Group className="mb-3">
//                   <Form.Label>Location</Form.Label>
//                   <Form.Control 
//                     type="text" 
//                     value={location} 
//                     onChange={(e) => setLocation(e.target.value)} 
//                   />
//                 </Form.Group>
                
//                 <Form.Group className="mb-3">
//                   <Form.Label>Cover Image</Form.Label>
//                   <Form.Check 
//                     type="switch"
//                     id="cover-image-switch"
//                     label={coverImageLink ? "Image Link" : "Image File"}
//                     checked={!!coverImageLink}
//                     onChange={() => {
//                       setCoverImageLink(coverImageLink ? '' : 'http://');
//                       setCoverImage(null);
//                     }}
//                     className="mb-2"
//                   />
//                   {coverImageLink ? (
//                     <Form.Control 
//                       type="text" 
//                       placeholder="Enter image URL"
//                       value={coverImageLink}
//                       onChange={(e) => setCoverImageLink(e.target.value)}
//                       required
//                     />
//                   ) : (
//                     <Form.Control 
//                       type="file" 
//                       onChange={handleCoverImageChange}
//                       required 
//                     />
//                   )}
//                 </Form.Group>

//                 <Form.Group className="mb-3">
//                   <Form.Label>Cover Media (for inside project page)</Form.Label>
//                   <Form.Check 
//                     type="switch"
//                     id="cover-media-switch"
//                     label={coverMediaLink ? "Media Link" : "Media File"}
//                     checked={!!coverMediaLink}
//                     onChange={() => {
//                       setCoverMediaLink(coverMediaLink ? '' : 'http://');
//                       setCoverMedia(null);
//                     }}
//                     className="mb-2"
//                   />
//                   {coverMediaLink ? (
//                     <>
//                       <Form.Control 
//                         type="text" 
//                         placeholder="Enter media URL"
//                         value={coverMediaLink}
//                         onChange={(e) => setCoverMediaLink(e.target.value)}
//                         required
//                       />
//                       <Form.Select 
//                         className="mt-2"
//                         value={coverMediaType}
//                         onChange={(e) => setCoverMediaType(e.target.value)}
//                       >
//                         <option value="image">Image</option>
//                         <option value="video">Video</option>
//                       </Form.Select>
//                     </>
//                   ) : (
//                     <Form.Control 
//                       type="file" 
//                       onChange={handleCoverMediaChange}
//                       accept="image/*,video/*"
//                       required 
//                     />
//                   )}
//                 </Form.Group>
                
//                 {sections.map((section, index) => (
//                   <Form.Group key={index} className="mb-3">
//                     <Form.Label>{section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section</Form.Label>
//                     {section.type === 'text' ? (
//                       <ReactQuill
//                         value={section.content}
//                         onChange={(content) => updateSection(index, content)}
//                         placeholder="Enter content"
//                         modules={{
//                           toolbar: [
//                             [{ header: [1, 2, 3, 4, 5, 6, false] }],
//                             ['bold', 'italic', 'underline', 'strike', 'blockquote'],
//                             [
//                               { list: 'ordered' },
//                               { list: 'bullet' },
//                               { indent: '-1' },
//                               { indent: '+1' },
//                             ],
//                             [{ color: [] }],
//                             [{ align: [] }],
//                             ['link', 'image', 'video'],
//                             ['clean'],
//                           ],
//                         }}
//                         formats={[
//                           'header',
//                           'bold',
//                           'italic',
//                           'underline',
//                           'strike',
//                           'blockquote',
//                           'list',
//                           'bullet',
//                           'indent',
//                           'link',
//                           'image',
//                           'video',
//                           'color',
//                           'align',
//                           'clean',
//                         ]}
//                         style={{ height: 'auto' }}
//                       />
//                     ) : ['image', 'image_pair', 'video', 'video_pair'].includes(section.type) ? (
//                       <>
//                         <Form.Check 
//                           type="switch"
//                           id={`${section.type}-type-switch-${index}`}
//                           label={section.isLink ? "Link" : "File"}
//                           checked={section.isLink}
//                           onChange={() => {
//                             const updatedSections = [...sections];
//                             updatedSections[index].isLink = !updatedSections[index].isLink;
//                             updatedSections[index].content = section.isLink ? '' : [];
//                             updatedSections[index].files = [];
//                             setSections(updatedSections);
//                           }}
//                           className="mb-2"
//                         />
//                         {section.isLink ? (
//                           <Form.Control 
//                             type="text" 
//                             placeholder={`Enter ${section.type} URL(s) separated by commas`}
//                             value={section.content}
//                             onChange={(e) => updateSection(index, e.target.value)}
//                           />
//                         ) : (
//                           <Form.Control 
//                             type="file" 
//                             onChange={(e) => handleFileChange(index, e)}
//                             multiple={section.type.includes('pair')}
//                             accept={section.type.startsWith('image') ? "image/*" : "video/*"}
//                           />
//                         )}
//                       </>
//                     ) : null}
//                   </Form.Group>
//                 ))}
                
//                 <Button variant="secondary" onClick={() => addSection('text')} className="me-2 mb-3">
//                   Add Text Section
//                 </Button>
//                 <Button variant="secondary" onClick={() => addSection('image')} className="me-2 mb-3">
//                   Add Image Section
//                 </Button>
//                 <Button variant="secondary" onClick={() => addSection('image_pair')} className="me-2 mb-3">
//                   Add Image Pair Section
//                 </Button>
//                 <Button variant="secondary" onClick={() => addSection('video')} className="me-2 mb-3">
//                   Add Video Section
//                 </Button>
//                 <Button variant="secondary" onClick={() => addSection('video_pair')} className="mb-3">
//                   Add Video Pair Section
//                 </Button>

//                 <Form.Group className="mb-3">
//                   <Form.Label>Related Projects</Form.Label>
//                   <Form.Control 
//                     type="text"
//                     placeholder="Search projects..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="mb-2"
//                   />
//                   {filteredProjects.map(project => (
//                     <Form.Check 
//                       key={project.id}
//                       type="checkbox"
//                       id={`related-project-${project.id}`}
//                       label={project.title}
//                       checked={relatedProjects.some(rp => rp.id === project.id)}
//                       onChange={() => handleRelatedProjectToggle(project)}
//                     />
//                   ))}
//                 </Form.Group>

//                 <Form.Group className="mb-3">
//                   <Form.Label>Featured Projects (max 4)</Form.Label>
//                   {allProjects.map(project => (
//                     <Form.Check 
//                       key={project.id}
//                       type="checkbox"
//                       id={`featured-project-${project.id}`}
//                       label={project.title}
//                       checked={featuredProjects.some(fp => fp.id === project.id)}
//                       onChange={() => handleFeaturedProjectToggle(project)}
//                       disabled={featuredProjects.length >= 4 && !featuredProjects.some(fp => fp.id === project.id)}
//                     />
//                   ))}
//                 </Form.Group>

//                 <Button type="submit" disabled={loading}>
//                   {loading ? (
//                     <>
//                       <Spinner
//                         as="span"
//                         animation="border"
//                         size="sm"
//                         role="status"
//                         aria-hidden="true"
//                       />
//                       {' '}Loading...
//                     </>
//                   ) : (
//                     'Submit Project'
//                   )}
//                 </Button>
//               </Form>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default CreateProject;








// import React, { useState, useEffect } from 'react';
// import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
// import { auth, db, storage } from '../../config/firebase';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { addDoc, collection, getDocs, query, serverTimestamp } from 'firebase/firestore';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

// const CreateProject = () => {
//   const [validated, setValidated] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [title, setTitle] = useState('');
//   const [subtitle, setSubtitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [location, setLocation] = useState('');
//   const [coverImage, setCoverImage] = useState(null);
//   const [coverImageLink, setCoverImageLink] = useState('');
//   const [coverMedia, setCoverMedia] = useState(null);
//   const [coverMediaLink, setCoverMediaLink] = useState('');
//   const [coverMediaType, setCoverMediaType] = useState('image');
//   const [sections, setSections] = useState([]);
//   const [relatedProjects, setRelatedProjects] = useState([]);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [allProjects, setAllProjects] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const projectsQuery = query(collection(db, 'projects'));
//         const querySnapshot = await getDocs(projectsQuery);
//         const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setAllProjects(projects);
//       } catch (error) {
//         console.error('Error fetching projects:', error);
//       }
//     };

//     fetchProjects();
//   }, []);

//   const handleCoverImageChange = (e) => {
//     setCoverImage(e.target.files[0]);
//     setCoverImageLink('');
//   };

//   const handleCoverMediaChange = (e) => {
//     setCoverMedia(e.target.files[0]);
//     setCoverMediaLink('');
//     setCoverMediaType(e.target.files[0].type.startsWith('video') ? 'video' : 'image');
//   };

//   const addSection = (type) => {
//     setSections([...sections, { type, content: '', files: [], isLink: false }]);
//   };

//   const updateSection = (index, content) => {
//     const updatedSections = [...sections];
//     updatedSections[index].content = content;
//     setSections(updatedSections);
//   };

//   const handleFileChange = (index, e) => {
//     const updatedSections = [...sections];
//     updatedSections[index].files = Array.from(e.target.files);
//     setSections(updatedSections);
//   };

//   const handleRelatedProjectToggle = (project) => {
//     setRelatedProjects(prevRelated => {
//       if (prevRelated.some(rp => rp.id === project.id)) {
//         return prevRelated.filter(rp => rp.id !== project.id);
//       } else {
//         return [...prevRelated, {
//           id: project.id,
//           title: project.title,
//           subtitle: project.subtitle || '',
//           description: project.description || '',
//           location: project.location || '',
//           coverImage: project.coverImage
//         }];
//       }
//     });
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setValidated(true);
//     setLoading(true);
//     setErrorMessage(null);
//     setSuccessMessage(null);

//     if (event.currentTarget.checkValidity() === false) {
//       setLoading(false);
//       return;
//     }

//     if (!title || !description || (!coverImage && !coverImageLink) || (!coverMedia && !coverMediaLink)) {
//       setErrorMessage('Please fill in all required fields');
//       setLoading(false);
//       return;
//     }

//     try {
//       let coverImageUrl = coverImageLink;
//       if (coverImage) {
//         const imageRef = ref(storage, `project-covers/${coverImage.name}`);
//         await uploadBytes(imageRef, coverImage);
//         coverImageUrl = await getDownloadURL(imageRef);
//       }

//       let coverMediaUrl = coverMediaLink;
//       if (coverMedia) {
//         const mediaRef = ref(storage, `project-covers/${coverMedia.name}`);
//         await uploadBytes(mediaRef, coverMedia);
//         coverMediaUrl = await getDownloadURL(mediaRef);
//       }

//       const processedSections = await Promise.all(sections.map(async (section) => {
//         if (section.type === 'image' || section.type === 'video') {
//           const layout = section.files && section.files.length > 1 ? 'double' : 'single';
//           if (section.isLink) {
//             return { type: section.type, content: section.content, isLink: true, layout };
//           } else {
//             const urls = await Promise.all(
//               section.files.map(async (file) => {
//                 const fileRef = ref(storage, `project-${section.type}s/${file.name}`);
//                 await uploadBytes(fileRef, file);
//                 return getDownloadURL(fileRef);
//               })
//             );
//             return { type: section.type, content: urls, isLink: false, layout };
//           }
//         }
//         return section;
//       }));

//       const projectRef = await addDoc(collection(db, 'projects'), {
//         title,
//         subtitle,
//         description,
//         location,
//         coverImage: coverImageUrl,
//         coverMedia: {
//           url: coverMediaUrl,
//           type: coverMediaType
//         },
//         sections: processedSections,
//         relatedProjects: relatedProjects.map(rp => ({
//           id: rp.id,
//           title: rp.title,
//           subtitle: rp.subtitle || '',
//           description: rp.description || '',
//           location: rp.location || '',
//           coverImage: rp.coverImage
//         })),
//         createdAt: serverTimestamp(),
//       });

//       setLoading(false);
//       setSuccessMessage('Project created successfully!');
//       setTitle('');
//       setSubtitle('');
//       setDescription('');
//       setLocation('');
//       setCoverImage(null);
//       setCoverImageLink('');
//       setCoverMedia(null);
//       setCoverMediaLink('');
//       setCoverMediaType('image');
//       setSections([]);
//       setRelatedProjects([]);
//       setValidated(false);
//     } catch (error) {
//       console.error('Error adding project:', error);
//       setErrorMessage('Error creating project. Please try again.');
//       setLoading(false);
//     }
//   };

//   return (
//     <Container className="my-5">
//       <Row className="justify-content-center">
//         <Col lg={8}>
//           <Card>
//             <Card.Body>
//               <Card.Title>Create Project</Card.Title>
//               <Form noValidate validated={validated} onSubmit={handleSubmit}>
//                 <Form.Group controlId="projectTitle" className="mb-3">
//                   <Form.Label>Title</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Enter title"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     required
//                   />
//                   <Form.Control.Feedback type="invalid">Please provide a title.</Form.Control.Feedback>
//                 </Form.Group>

//                 <Form.Group controlId="projectSubtitle" className="mb-3">
//                   <Form.Label>Subtitle</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Enter subtitle"
//                     value={subtitle}
//                     onChange={(e) => setSubtitle(e.target.value)}
//                   />
//                 </Form.Group>

//                 <Form.Group controlId="projectDescription" className="mb-3">
//                   <Form.Label>Description</Form.Label>
//                   <ReactQuill
//                     value={description}
//                     onChange={(content) => setDescription(content)}
//                     placeholder="Enter description"
//                     modules={{
//                       toolbar: [
//                         [{ header: [1, 2, 3, 4, 5, 6, false] }],
//                         ['bold', 'italic', 'underline', 'strike', 'blockquote'],
//                         [
//                           { list: 'ordered' },
//                           { list: 'bullet' },
//                           { indent: '-1' },
//                           { indent: '+1' },
//                         ],
//                         [{ color: [] }],
//                         [{ align: [] }],
//                         ['link', 'image', 'video'],
//                         ['clean'],
//                       ],
//                     }}
//                     formats={[
//                       'header',
//                       'bold',
//                       'italic',
//                       'underline',
//                       'strike',
//                       'blockquote',
//                       'list',
//                       'bullet',
//                       'indent',
//                       'link',
//                       'image',
//                       'video',
//                       'color',
//                       'align',
//                       'clean',
//                     ]}
//                     style={{ height: '200px' }}
//                   />
//                   <Form.Control.Feedback type="invalid">Please provide a description.</Form.Control.Feedback>
//                 </Form.Group>

//                 <Form.Group controlId="projectLocation" className="mb-3">
//                   <Form.Label>Location</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Enter location"
//                     value={location}
//                     onChange={(e) => setLocation(e.target.value)}
//                   />
//                 </Form.Group>

//                 <Form.Group controlId="projectCoverImage" className="mb-3">
//                   <Form.Label>Cover Image</Form.Label>
//                   <Form.Control
//                     type="file"
//                     onChange={handleCoverImageChange}
//                   />
//                 </Form.Group>

//                 <Form.Group controlId="projectCoverImageLink" className="mb-3">
//                   <Form.Label>Cover Image Link (optional)</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Enter image URL"
//                     value={coverImageLink}
//                     onChange={(e) => setCoverImageLink(e.target.value)}
//                   />
//                 </Form.Group>

//                 <Form.Group controlId="projectCoverMedia" className="mb-3">
//                   <Form.Label>Cover Media</Form.Label>
//                   <Form.Control
//                     type="file"
//                     onChange={handleCoverMediaChange}
//                   />
//                 </Form.Group>

//                 <Form.Group controlId="projectCoverMediaLink" className="mb-3">
//                   <Form.Label>Cover Media Link (optional)</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Enter media URL"
//                     value={coverMediaLink}
//                     onChange={(e) => setCoverMediaLink(e.target.value)}
//                   />
//                 </Form.Group>

//                 <hr />

//                 <h5>Sections</h5>
//                 {sections.map((section, index) => (
//                   <Form.Group key={index} className="mb-3">
//                     <Form.Label>{section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section</Form.Label>
//                     {section.type === 'text' ? (
//                       <ReactQuill
//                         value={section.content}
//                         onChange={(content) => updateSection(index, content)}
//                         placeholder="Enter content"
//                         modules={{
//                           toolbar: [
//                             [{ header: [1, 2, 3, 4, 5, 6, false] }],
//                             ['bold', 'italic', 'underline', 'strike', 'blockquote'],
//                             [
//                               { list: 'ordered' },
//                               { list: 'bullet' },
//                               { indent: '-1' },
//                               { indent: '+1' },
//                             ],
//                             [{ color: [] }],
//                             [{ align: [] }],
//                             ['link', 'image', 'video'],
//                             ['clean'],
//                           ],
//                         }}
//                         formats={[
//                           'header',
//                           'bold',
//                           'italic',
//                           'underline',
//                           'strike',
//                           'blockquote',
//                           'list',
//                           'bullet',
//                           'indent',
//                           'link',
//                           'image',
//                           'video',
//                           'color',
//                           'align',
//                           'clean',
//                         ]}
//                         style={{ height: '300px' }}
//                       />
//                     ) : ['image', 'image_pair', 'video', 'video_pair'].includes(section.type) ? (
//                       <>
//                         <Form.Check
//                           type="switch"
//                           id={`${section.type}-type-switch-${index}`}
//                           label={section.isLink ? "Link" : "File"}
//                           checked={section.isLink}
//                           onChange={() => {
//                             const updatedSections = [...sections];
//                             updatedSections[index].isLink = !updatedSections[index].isLink;
//                             updatedSections[index].content = section.isLink ? '' : [];
//                             updatedSections[index].files = [];
//                             setSections(updatedSections);
//                           }}
//                           className="mb-2"
//                         />
//                         {section.isLink ? (
//                           <Form.Control
//                             type="text"
//                             placeholder={`Enter ${section.type} URL(s), comma-separated for pairs`}
//                             value={section.content}
//                             onChange={(e) => {
//                               const updatedSections = [...sections];
//                               updatedSections[index].content = e.target.value;
//                               setSections(updatedSections);
//                             }}
//                           />
//                         ) : (
//                           <Form.Control
//                             type="file"
//                             multiple={section.type.includes('pair')}
//                             onChange={(e) => handleFileChange(index, e)}
//                           />
//                         )}
//                       </>
//                     ) : null}
//                   </Form.Group>
//                 ))}

//                 <Button variant="outline-primary" onClick={() => addSection('text')} className="me-2">Add Text Section</Button>
//                 <Button variant="outline-primary" onClick={() => addSection('image')} className="me-2">Add Image Section</Button>
//                 <Button variant="outline-primary" onClick={() => addSection('image_pair')} className="me-2">Add Image Pair Section</Button>
//                 <Button variant="outline-primary" onClick={() => addSection('video')} className="me-2">Add Video Section</Button>
//                 <Button variant="outline-primary" onClick={() => addSection('video_pair')} className="me-2">Add Video Pair Section</Button>

//                 <hr />

//                 <h5>Related Projects</h5>
//                 <Form.Control
//                   type="text"
//                   placeholder="Search projects"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="mb-3"
//                 />
//                 {allProjects.filter(project => project.title.toLowerCase().includes(searchTerm.toLowerCase())).map(project => (
//                   <Form.Check
//                     key={project.id}
//                     type="checkbox"
//                     id={`related-project-${project.id}`}
//                     label={project.title}
//                     checked={relatedProjects.some(rp => rp.id === project.id)}
//                     onChange={() => handleRelatedProjectToggle(project)}
//                   />
//                 ))}

//                 <hr />

//                 {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
//                 {successMessage && <Alert variant="success">{successMessage}</Alert>}

//                 <Button variant="primary" type="submit" disabled={loading}>
//                   {loading ? <Spinner animation="border" size="sm" /> : 'Create Project'}
//                 </Button>
//               </Form>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default CreateProject;
