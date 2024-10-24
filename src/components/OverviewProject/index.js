// import React, { useEffect, useState } from 'react';
// import { collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../../config/firebase';
// import { Button, ButtonGroup, Card, Col, Form, Modal, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

// const OverviewProject = () => {
//     const [projects, setProjects] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [editingProject, setEditingProject] = useState(null);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [selectedProjectId, setSelectedProjectId] = useState(null);
//     const [showToast, setShowToast] = useState(false);
//     const [toastMessage, setToastMessage] = useState('');
//     const [allProjects, setAllProjects] = useState([]);

//     const fetchProjects = async () => {
//         setIsLoading(true);
//         setError(null);

//         try {
//             const projectsRef = collection(db, 'projects');
//             const querySnapshot = await getDocs(projectsRef);
//             const projects = querySnapshot.docs.map((doc) => ({
//                 id: doc.id,
//                 ...doc.data(),
//             }));
//             projects.sort((a, b) => b.createdAt - a.createdAt);
//             setProjects(projects);
//             setAllProjects(projects);
//         } catch (err) {
//             console.error('Error fetching projects:', err);
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchProjects();
//     }, []);

//     const handleDelete = async () => {
//         try {
//             await deleteDoc(doc(db, 'projects', selectedProjectId));
//             setProjects((prevProjects) =>
//                 prevProjects.filter((project) => project.id !== selectedProjectId)
//             );
//             setShowDeleteModal(false);
//             setToastMessage('Project deleted successfully!');
//             setShowToast(true);
//         } catch (err) {
//             console.error('Error deleting project:', err);
//             setError('Failed to delete project');
//         }
//     };

//     const handleEdit = (project) => {
//         setEditingProject(project);
//         setShowEditModal(true);
//     };

//     const handleEditSubmit = async (event) => {
//         event.preventDefault();
//         const { id, title, subtitle, location, description, coverImage, coverMedia, sections, relatedProjects, isFeatured } = editingProject;

//         try {
//             const projectRef = doc(db, 'projects', id);
//             await updateDoc(projectRef, { 
//                 title, 
//                 subtitle, 
//                 location, 
//                 description,
//                 coverImage, 
//                 coverMedia,
//                 sections, 
//                 relatedProjects,
//                 isFeatured 
//             });
//             setProjects((prevProjects) =>
//                 prevProjects.map((project) =>
//                     project.id === id ? { ...project, title, subtitle, location, description, coverImage, coverMedia, sections, relatedProjects, isFeatured } : project
//                 )
//             );
//             setShowEditModal(false);
//             setToastMessage('Project updated successfully!');
//             setShowToast(true);
//         } catch (err) {
//             console.error('Error updating project:', err);
//             setError('Failed to update project');
//         }
//     };

//     const handleChange = (event) => {
//         const { name, value } = event.target;
//         setEditingProject((prevProject) => ({
//             ...prevProject,
//             [name]: value,
//         }));
//     };

//     const handleSectionChange = (index, content) => {
//         const updatedSections = [...editingProject.sections];
//         updatedSections[index].content = content;
//         setEditingProject((prevProject) => ({
//             ...prevProject,
//             sections: updatedSections,
//         }));
//     };

//     const handleFileChange = async (index, e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         try {
//             const fileRef = ref(storage, `project-${editingProject.sections[index].type}s/${file.name}`);
//             await uploadBytes(fileRef, file);
//             const url = await getDownloadURL(fileRef);

//             const updatedSections = [...editingProject.sections];
//             updatedSections[index].content = url;
//             setEditingProject((prevProject) => ({
//                 ...prevProject,
//                 sections: updatedSections,
//             }));
//         } catch (error) {
//             console.error('Error uploading file:', error);
//             setError('Failed to upload file');
//         }
//     };

//     const handleCoverImageChange = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         try {
//             const fileRef = ref(storage, `project-covers/${file.name}`);
//             await uploadBytes(fileRef, file);
//             const url = await getDownloadURL(fileRef);

//             setEditingProject((prevProject) => ({
//                 ...prevProject,
//                 coverImage: url,
//             }));
//         } catch (error) {
//             console.error('Error uploading cover image:', error);
//             setError('Failed to upload cover image');
//         }
//     };

//     const handleCoverMediaChange = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         try {
//             const fileRef = ref(storage, `project-covers/${file.name}`);
//             await uploadBytes(fileRef, file);
//             const url = await getDownloadURL(fileRef);

//             setEditingProject((prevProject) => ({
//                 ...prevProject,
//                 coverMedia: {
//                     url: url,
//                     type: file.type.startsWith('video') ? 'video' : 'image'
//                 },
//             }));
//         } catch (error) {
//             console.error('Error uploading cover media:', error);
//             setError('Failed to upload cover media');
//         }
//     };

//     const handleRelatedProjectToggle = (project) => {
//         setEditingProject((prevProject) => {
//             const updatedRelatedProjects = prevProject.relatedProjects.some(rp => rp.id === project.id)
//                 ? prevProject.relatedProjects.filter(rp => rp.id !== project.id)
//                 : [...prevProject.relatedProjects, {
//                     id: project.id,
//                     title: project.title,
//                     coverImage: project.coverImage
//                   }];

//             return {
//                 ...prevProject,
//                 relatedProjects: updatedRelatedProjects,
//             };
//         });
//     };

//     const handleVisibilityToggle = async (projectId, currentState) => {
//         try {
//             const projectRef = doc(db, 'projects', projectId);
//             await updateDoc(projectRef, { isVisible: !currentState });
//             setProjects((prevProjects) =>
//                 prevProjects.map((project) =>
//                     project.id === projectId ? { ...project, isVisible: !currentState } : project
//                 )
//             );
//             setToastMessage('Project visibility updated successfully!');
//             setShowToast(true);
//         } catch (err) {
//             console.error('Error updating project visibility:', err);
//             setError('Failed to update project visibility');
//         }
//     };

//     const handleFeaturedToggle = async (projectId, isChecked) => {
//         try {
//             const projectRef = doc(db, 'projects', projectId);
//             await updateDoc(projectRef, { isFeatured: isChecked });
//             setProjects((prevProjects) =>
//                 prevProjects.map((project) =>
//                     project.id === projectId ? { ...project, isFeatured: isChecked } : project
//                 )
//             );
//             setToastMessage('Project featured status updated successfully!');
//             setShowToast(true);
//         } catch (err) {
//             console.error('Error updating project featured status:', err);
//             setError('Failed to update featured status');
//         }
//     };

//     return (
//         <div className="container mt-5">
//             <h1>Projects</h1>
//             {isLoading && <Spinner animation="border" />}
//             {error && <p className="text-danger">Error: {error}</p>}
//             {!isLoading && projects.length === 0 && <p>No projects found.</p>}
//             {!isLoading && projects.length > 0 && (
//                 <Row xs={1} md={2} lg={3} className="g-4">
//                     {projects.map((project) => (
//                         <Col key={project.id}>
//                             <Card className="h-100">
//                                 <Card.Img
//                                     variant="top"
//                                     src={project.coverImage}
//                                     alt={project.title}
//                                     style={{ height: '200px', objectFit: 'cover' }}
//                                 />
//                                 <Card.Body className="d-flex flex-column">
//                                     <Card.Title>{project.title}</Card.Title>
//                                     <Card.Text>{project.subtitle}</Card.Text>
//                                     <div className="d-flex justify-content-between mt-auto">
//                                         <ButtonGroup>
//                                             <button
//                                                 className="custom-button"
//                                                 size="sm"
//                                                 onClick={() => handleEdit(project)}
//                                             >
//                                                 Edit
//                                             </button>
//                                             <Button
//                                                 variant="danger"
//                                                 size="sm"
//                                                 onClick={() => {
//                                                     setSelectedProjectId(project.id);
//                                                     setShowDeleteModal(true);
//                                                 }}
//                                             >
//                                                 Delete
//                                             </Button>
//                                         </ButtonGroup>
//                                         <Form.Check
//                                             type="switch"
//                                             id={`is-visible-${project.id}`}
//                                             label={project.isVisible ? 'Published' : 'Publish'}
//                                             checked={project.isVisible}
//                                             onChange={() =>
//                                                 handleVisibilityToggle(project.id, project.isVisible)
//                                             }
//                                             className="custom-switch"
//                                         />
//                                     </div>
//                                     <div className="mt-2">
//                                         <Form.Check
//                                             type="checkbox"
//                                             id={`is-featured-${project.id}`}
//                                             label="Featured"
//                                             checked={project.isFeatured || false}
//                                             onChange={(e) =>
//                                                 handleFeaturedToggle(project.id, e.target.checked)
//                                             }
//                                         />
//                                     </div>
//                                 </Card.Body>
//                             </Card>
//                         </Col>
//                     ))}
//                 </Row>
//             )}

//             {editingProject && (
//                 <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
//                     <Modal.Header closeButton>
//                         <Modal.Title>Edit Project</Modal.Title>
//                     </Modal.Header>
//                     <Modal.Body>
//                         <Form onSubmit={handleEditSubmit}>
//                             <Form.Group controlId="formTitle">
//                                 <Form.Label>Title</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="title"
//                                     value={editingProject.title}
//                                     onChange={handleChange}
//                                 />
//                             </Form.Group>
//                             <Form.Group controlId="formSubtitle">
//                                 <Form.Label>Subtitle</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="subtitle"
//                                     value={editingProject.subtitle}
//                                     onChange={handleChange}
//                                 />
//                             </Form.Group>
//                             <Form.Group controlId="formLocation">
//                                 <Form.Label>Location</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="location"
//                                     value={editingProject.location}
//                                     onChange={handleChange}
//                                 />
//                             </Form.Group>
//                             <Form.Group controlId="formDescription">
//                                 <Form.Label>Description</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="description"
//                                     value={editingProject.description}
//                                     onChange={handleChange}
//                                 />
//                             </Form.Group>
//                             <Form.Group controlId="formCoverImage">
//                                 <Form.Label>Cover Image</Form.Label>
//                                 <Form.Control
//                                     type="file"
//                                     name="coverImage"
//                                     onChange={handleCoverImageChange}
//                                 />
//                             </Form.Group>
//                             <Form.Group controlId="formCoverMedia">
//                                 <Form.Label>Cover Media</Form.Label>
//                                 <Form.Control
//                                     type="file"
//                                     name="coverMedia"
//                                     onChange={handleCoverMediaChange}
//                                 />
//                             </Form.Group>
//                             {editingProject.sections.map((section, index) => (
//                                 <Form.Group key={index} controlId={`section-${index}`}>
//                                     <Form.Label>Section {index + 1}</Form.Label>
//                                     <ReactQuill
//                                         theme="snow"
//                                         value={section.content}
//                                         onChange={(content) => handleSectionChange(index, content)}
//                                     />
//                                     <Form.Control
//                                         type="file"
//                                         name={`section-${index}`}
//                                         onChange={(e) => handleFileChange(index, e)}
//                                     />
//                                 </Form.Group>
//                             ))}
//                             <Form.Group controlId="relatedProjects">
//                                 <Form.Label>Related Projects</Form.Label>
//                                 <Row>
//                                     {allProjects.map((project) => (
//                                         <Col key={project.id} xs={4}>
//                                             <Card>
//                                                 <Card.Img
//                                                     variant="top"
//                                                     src={project.coverImage}
//                                                     alt={project.title}
//                                                 />
//                                                 <Card.Body>
//                                                     <Form.Check
//                                                         type="checkbox"
//                                                         label={project.title}
//                                                         checked={editingProject.relatedProjects.some(
//                                                             (rp) => rp.id === project.id
//                                                         )}
//                                                         onChange={() =>
//                                                             handleRelatedProjectToggle(project)
//                                                         }
//                                                     />
//                                                 </Card.Body>
//                                             </Card>
//                                         </Col>
//                                     ))}
//                                 </Row>
//                             </Form.Group>
//                             <Form.Group controlId="formIsFeatured">
//                                 <Form.Check
//                                     type="checkbox"
//                                     label="Featured"
//                                     name="isFeatured"
//                                     checked={editingProject.isFeatured || false}
//                                     onChange={(e) => handleChange({
//                                         target: {
//                                             name: 'isFeatured',    
//                                             value: e.target.checked,
//                                         },
//                                     })}
//                                 />
//                             </Form.Group>
//                             <Button type="submit" variant="primary">
//                                 Save Changes
//                             </Button>
//                         </Form>
//                     </Modal.Body>
//                 </Modal>
//             )}

//             <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
//                 <Modal.Header closeButton>
//                     <Modal.Title>Delete Project</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>Are you sure you want to delete this project?</Modal.Body>
//                 <Modal.Footer>
//                     <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
//                         Cancel
//                     </Button>
//                     <Button variant="danger" onClick={handleDelete}>
//                         Delete
//                     </Button>
//                 </Modal.Footer>
//             </Modal>

//             <ToastContainer position="top-end" className="p-3">
//                 <Toast
//                     onClose={() => setShowToast(false)}
//                     show={showToast}
//                     delay={3000}
//                     autohide
//                 >
//                     <Toast.Body>{toastMessage}</Toast.Body>
//                 </Toast>
//             </ToastContainer>
//         </div>
//     );
// };

// export default OverviewProject;

















// import React, { useEffect, useState } from 'react';
// import { collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
// import { Button, ButtonGroup, Card, Col, Form, Modal, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap';
// import { db } from '../../config/firebase';

// const OverviewProject = () => {
//     const [projects, setProjects] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [selectedProjectId, setSelectedProjectId] = useState(null);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [showToast, setShowToast] = useState(false);
//     const [toastMessage, setToastMessage] = useState('');

//     const fetchProjects = async () => {
//         setIsLoading(true);
//         setError(null);

//         try {
//             const projectsRef = collection(db, 'projects');
//             const querySnapshot = await getDocs(projectsRef);
//             const projects = querySnapshot.docs.map((doc) => ({
//                 id: doc.id,
//                 ...doc.data(),
//             }));
//             projects.sort((a, b) => b.createdAt - a.createdAt);
//             setProjects(projects);
//         } catch (err) {
//             console.error('Error fetching projects:', err);
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchProjects();
//     }, []);

//     const handleDelete = async () => {
//         try {
//             await deleteDoc(doc(db, 'projects', selectedProjectId));
//             setProjects((prevProjects) =>
//                 prevProjects.filter((project) => project.id !== selectedProjectId)
//             );
//             setShowDeleteModal(false);
//             setToastMessage('Project deleted successfully!');
//             setShowToast(true);
//         } catch (err) {
//             console.error('Error deleting project:', err);
//             setError('Failed to delete project');
//         }
//     };

//     const handleFeaturedToggle = async (projectId, isChecked) => {
//         try {
//             const projectRef = doc(db, 'projects', projectId);
//             await updateDoc(projectRef, { isFeatured: isChecked });
//             setProjects((prevProjects) =>
//                 prevProjects.map((project) =>
//                     project.id === projectId ? { ...project, isFeatured: isChecked } : project
//                 )
//             );
//             setToastMessage('Project featured status updated successfully!');
//             setShowToast(true);
//         } catch (err) {
//             console.error('Error updating project featured status:', err);
//             setError('Failed to update featured status');
//         }
//     };

//     return (
//         <div className="container mt-5">
//             <h1>Projects</h1>
//             {isLoading && <Spinner animation="border" />}
//             {error && <p className="text-danger">Error: {error}</p>}
//             {!isLoading && projects.length === 0 && <p>No projects found.</p>}
//             {!isLoading && projects.length > 0 && (
//                 <Row xs={1} md={2} lg={3} className="g-4">
//                     {projects.map((project) => (
//                         <Col key={project.id}>
//                             <Card className="h-100">
//                                 <Card.Img
//                                     variant="top"
//                                     src={project.coverImage}
//                                     alt={project.title}
//                                     style={{ height: '200px', objectFit: 'cover' }}
//                                 />
//                                 <Card.Body className="d-flex flex-column">
//                                     <Card.Title>{project.title}</Card.Title>
//                                     <Card.Text>{project.subtitle}</Card.Text>
//                                     <div className="d-flex justify-content-between mt-auto">
//                                         <ButtonGroup>
//                                             <Button
//                                                 variant="danger"
//                                                 size="sm"
//                                                 onClick={() => {
//                                                     setSelectedProjectId(project.id);
//                                                     setShowDeleteModal(true);
//                                                 }}
//                                             >
//                                                 Delete
//                                             </Button>
//                                         </ButtonGroup>

//                                         {/* Featured Checkbox */}
//                                         <Form.Check
//                                             type="checkbox"
//                                             id={`is-featured-${project.id}`}
//                                             label="Featured"
//                                             checked={project.isFeatured || false}
//                                             onChange={(e) =>
//                                                 handleFeaturedToggle(project.id, e.target.checked)
//                                             }
//                                         />
//                                     </div>
//                                 </Card.Body>
//                             </Card>
//                         </Col>
//                     ))}
//                 </Row>
//             )}

//             <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
//                 <Modal.Header closeButton>
//                     <Modal.Title>Delete Project</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>Are you sure you want to delete this project?</Modal.Body>
//                 <Modal.Footer>
//                     <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
//                         Cancel
//                     </Button>
//                     <Button variant="danger" onClick={handleDelete}>
//                         Delete
//                     </Button>
//                 </Modal.Footer>
//             </Modal>

//             <ToastContainer position="top-end" className="p-3">
//                 <Toast
//                     onClose={() => setShowToast(false)}
//                     show={showToast}
//                     delay={3000}
//                     autohide
//                 >
//                     <Toast.Body>{toastMessage}</Toast.Body>
//                 </Toast>
//             </ToastContainer>
//         </div>
//     );
// };

// export default OverviewProject;









// import React, { useEffect, useState } from 'react';
// import { collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../../config/firebase';
// import { Button, ButtonGroup, Card, Col, Form, Modal, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

// const OverviewProject = () => {
//     const [projects, setProjects] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [editingProject, setEditingProject] = useState(null);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [selectedProjectId, setSelectedProjectId] = useState(null);
//     const [showToast, setShowToast] = useState(false);
//     const [toastMessage, setToastMessage] = useState('');
//     const [allProjects, setAllProjects] = useState([]);

//     const fetchProjects = async () => {
//         setIsLoading(true);
//         setError(null);

//         try {
//             const projectsRef = collection(db, 'projects');
//             const querySnapshot = await getDocs(projectsRef);
//             const projects = querySnapshot.docs.map((doc) => ({
//                 id: doc.id,
//                 ...doc.data(),
//             }));
//             projects.sort((a, b) => b.createdAt - a.createdAt);
//             setProjects(projects);
//             setAllProjects(projects);
//         } catch (err) {
//             console.error('Error fetching projects:', err);
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchProjects();
//     }, []);

//     const handleDelete = async () => {
//         try {
//             await deleteDoc(doc(db, 'projects', selectedProjectId));
//             setProjects((prevProjects) =>
//                 prevProjects.filter((project) => project.id !== selectedProjectId)
//             );
//             setShowDeleteModal(false);
//             setToastMessage('Project deleted successfully!');
//             setShowToast(true);
//         } catch (err) {
//             console.error('Error deleting project:', err);
//             setError('Failed to delete project');
//         }
//     };

//     const handleEdit = (project) => {
//         setEditingProject(project);
//         setShowEditModal(true);
//     };

//     const handleEditSubmit = async (event) => {
//         event.preventDefault();
//         const { id, title, subtitle, location, description, coverImage, coverMedia, sections, relatedProjects } = editingProject;

//         try {
//             const projectRef = doc(db, 'projects', id);
//             await updateDoc(projectRef, { 
//                 title, 
//                 subtitle, 
//                 location, 
//                 description,
//                 coverImage, 
//                 coverMedia,
//                 sections, 
//                 relatedProjects 
//             });
//             setProjects((prevProjects) =>
//                 prevProjects.map((project) =>
//                     project.id === id ? { ...project, title, subtitle, location, description, coverImage, coverMedia, sections, relatedProjects } : project
//                 )
//             );
//             setShowEditModal(false);
//             setToastMessage('Project updated successfully!');
//             setShowToast(true);
//         } catch (err) {
//             console.error('Error updating project:', err);
//             setError('Failed to update project');
//         }
//     };

//     const handleChange = (event) => {
//         const { name, value } = event.target;
//         setEditingProject((prevProject) => ({
//             ...prevProject,
//             [name]: value,
//         }));
//     };

//     const handleSectionChange = (index, content) => {
//         const updatedSections = [...editingProject.sections];
//         updatedSections[index].content = content;
//         setEditingProject((prevProject) => ({
//             ...prevProject,
//             sections: updatedSections,
//         }));
//     };

//     const handleFileChange = async (index, e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         try {
//             const fileRef = ref(storage, `project-${editingProject.sections[index].type}s/${file.name}`);
//             await uploadBytes(fileRef, file);
//             const url = await getDownloadURL(fileRef);

//             const updatedSections = [...editingProject.sections];
//             updatedSections[index].content = url;
//             setEditingProject((prevProject) => ({
//                 ...prevProject,
//                 sections: updatedSections,
//             }));
//         } catch (error) {
//             console.error('Error uploading file:', error);
//             setError('Failed to upload file');
//         }
//     };

//     const handleCoverImageChange = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         try {
//             const fileRef = ref(storage, `project-covers/${file.name}`);
//             await uploadBytes(fileRef, file);
//             const url = await getDownloadURL(fileRef);

//             setEditingProject((prevProject) => ({
//                 ...prevProject,
//                 coverImage: url,
//             }));
//         } catch (error) {
//             console.error('Error uploading cover image:', error);
//             setError('Failed to upload cover image');
//         }
//     };

//     const handleCoverMediaChange = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         try {
//             const fileRef = ref(storage, `project-covers/${file.name}`);
//             await uploadBytes(fileRef, file);
//             const url = await getDownloadURL(fileRef);

//             setEditingProject((prevProject) => ({
//                 ...prevProject,
//                 coverMedia: {
//                     url: url,
//                     type: file.type.startsWith('video') ? 'video' : 'image'
//                 },
//             }));
//         } catch (error) {
//             console.error('Error uploading cover media:', error);
//             setError('Failed to upload cover media');
//         }
//     };

//     const handleRelatedProjectToggle = (project) => {
//         setEditingProject((prevProject) => {
//             const updatedRelatedProjects = prevProject.relatedProjects.some(rp => rp.id === project.id)
//                 ? prevProject.relatedProjects.filter(rp => rp.id !== project.id)
//                 : [...prevProject.relatedProjects, {
//                     id: project.id,
//                     title: project.title,
//                     coverImage: project.coverImage
//                   }];

//             return {
//                 ...prevProject,
//                 relatedProjects: updatedRelatedProjects,
//             };
//         });
//     };

//     const handleVisibilityToggle = async (projectId, currentState) => {
//         try {
//             const projectRef = doc(db, 'projects', projectId);
//             await updateDoc(projectRef, { isVisible: !currentState });
//             setProjects((prevProjects) =>
//                 prevProjects.map((project) =>
//                     project.id === projectId ? { ...project, isVisible: !currentState } : project
//                 )
//             );
//             setToastMessage('Project visibility updated successfully!');
//             setShowToast(true);
//         } catch (err) {
//             console.error('Error updating project visibility:', err);
//             setError('Failed to update project visibility');
//         }
//     };

//     return (
//         <div className="container mt-5">
//             <h1>Projects</h1>
//             {isLoading && <Spinner animation="border" />}
//             {error && <p className="text-danger">Error: {error}</p>}
//             {!isLoading && projects.length === 0 && <p>No projects found.</p>}
//             {!isLoading && projects.length > 0 && (
//                 <Row xs={1} md={2} lg={3} className="g-4">
//                     {projects.map((project) => (
//                         <Col key={project.id}>
//                             <Card className="h-100">
//                                 <Card.Img
//                                     variant="top"
//                                     src={project.coverImage}
//                                     alt={project.title}
//                                     style={{ height: '200px', objectFit: 'cover' }}
//                                 />
//                                 <Card.Body className="d-flex flex-column">
//                                     <Card.Title>{project.title}</Card.Title>
//                                     <Card.Text>{project.subtitle}</Card.Text>
//                                     <div className="d-flex justify-content-between mt-auto">
//                                         <ButtonGroup>
//                                             <button
//                                                 className="custom-button"
//                                                 size="sm"
//                                                 onClick={() => handleEdit(project)}
//                                             >
//                                                 Edit
//                                             </button>
//                                             <Button
//                                                 variant="danger"
//                                                 size="sm"
//                                                 onClick={() => {
//                                                     setSelectedProjectId(project.id);
//                                                     setShowDeleteModal(true);
//                                                 }}
//                                             >
//                                                 Delete
//                                             </Button>
//                                         </ButtonGroup>
//                                         <Form.Check
//                                             type="switch"
//                                             id={`is-visible-${project.id}`}
//                                             label={project.isVisible ? 'Published' : 'Publish'}
//                                             checked={project.isVisible}
//                                             onChange={() =>
//                                                 handleVisibilityToggle(project.id, project.isVisible)
//                                             }
//                                             className="custom-switch"
//                                         />
//                                     </div>
//                                 </Card.Body>
//                             </Card>
//                         </Col>
//                     ))}
//                 </Row>
//             )}

//             {editingProject && (
//                 <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
//                     <Modal.Header closeButton>
//                         <Modal.Title>Edit Project</Modal.Title>
//                     </Modal.Header>
//                     <Modal.Body>
//                         <Form onSubmit={handleEditSubmit}>
//                             <Form.Group controlId="formTitle">
//                                 <Form.Label>Title</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="title"
//                                     value={editingProject.title}
//                                     onChange={handleChange}
//                                 />
//                             </Form.Group>
//                             <Form.Group controlId="formSubtitle">
//                                 <Form.Label>Subtitle</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="subtitle"
//                                     value={editingProject.subtitle}
//                                     onChange={handleChange}
//                                 />
//                             </Form.Group>
//                             <Form.Group controlId="formLocation">
//                                 <Form.Label>Location</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="location"
//                                     value={editingProject.location}
//                                     onChange={handleChange}
//                                 />
//                             </Form.Group>
//                             <Form.Group controlId="formDescription">
//                                 <Form.Label>Description</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="description"
//                                     value={editingProject.description}
//                                     onChange={handleChange}
//                                 />
//                                 {/* <ReactQuill
//                                     value={editingProject.description || ''}
//                                     onChange={(content) => handleChange({ target: { name: 'description', value: content } })}
//                                     theme="snow"
//                                 /> */}
//                             </Form.Group>
//                             <Form.Group controlId="formCoverImage">
//                                 <Form.Label>Cover Image</Form.Label>
//                                 <Form.Control
//                                     type="file"
//                                     name="coverImage"
//                                     onChange={handleCoverImageChange}
//                                 />
//                             </Form.Group>
//                             <Form.Group controlId="formCoverMedia">
//                                 <Form.Label>Cover Media</Form.Label>
//                                 <Form.Control
//                                     type="file"
//                                     name="coverMedia"
//                                     onChange={handleCoverMediaChange}
//                                 />
//                             </Form.Group>
//                             {editingProject.sections.map((section, index) => (
//                                 <Form.Group key={index} controlId={`section-${index}`}>
//                                     <Form.Label>Section {index + 1}</Form.Label>
//                                     <ReactQuill
//                                         theme="snow"
//                                         value={section.content}
//                                         onChange={(content) => handleSectionChange(index, content)}
//                                     />
//                                     <Form.Control
//                                         type="file"
//                                         name={`section-${index}`}
//                                         onChange={(e) => handleFileChange(index, e)}
//                                     />
//                                 </Form.Group>
//                             ))}
//                             <Form.Group controlId="relatedProjects">
//                                 <Form.Label>Related Projects</Form.Label>
//                                 <Row>
//                                     {allProjects.map((project) => (
//                                         <Col key={project.id} xs={4}>
//                                             <Card>
//                                                 <Card.Img
//                                                     variant="top"
//                                                     src={project.coverImage}
//                                                     alt={project.title}
//                                                 />
//                                                 <Card.Body>
//                                                     <Form.Check
//                                                         type="checkbox"
//                                                         label={project.title}
//                                                         checked={editingProject.relatedProjects.some(
//                                                             (rp) => rp.id === project.id
//                                                         )}
//                                                         onChange={() =>
//                                                             handleRelatedProjectToggle(project)
//                                                         }
//                                                     />
//                                                 </Card.Body>
//                                             </Card>
//                                         </Col>
//                                     ))}
//                                 </Row>
//                             </Form.Group>
//                             <Button variant="primary" type="submit">
//                                 Save Changes
//                             </Button>
//                         </Form>
//                     </Modal.Body>
//                 </Modal>
//             )}

//             <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
//                 <Modal.Header closeButton>
//                     <Modal.Title>Delete Project</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>Are you sure you want to delete this project?</Modal.Body>
//                 <Modal.Footer>
//                     <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
//                         Cancel
//                     </Button>
//                     <Button variant="danger" onClick={handleDelete}>
//                         Delete
//                     </Button>
//                 </Modal.Footer>
//             </Modal>

//             <ToastContainer position="top-end" className="p-3">
//                 <Toast
//                     show={showToast}
//                     onClose={() => setShowToast(false)}
//                     delay={3000}
//                     autohide
//                     bg="success"
//                 >
//                     <Toast.Body>{toastMessage}</Toast.Body>
//                 </Toast>
//             </ToastContainer>
//         </div>
//     );
// };

// export default OverviewProject;












// import React, { useEffect, useState } from 'react';
// import { collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../../config/firebase';
// import { Button, ButtonGroup, Card, Col, Form, Modal, Row, Spinner, Toast, ToastContainer, Dropdown } from 'react-bootstrap';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

// const OverviewProject = () => {
//     const [projects, setProjects] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [editingProject, setEditingProject] = useState(null);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [selectedProjectId, setSelectedProjectId] = useState(null);
//     const [featureImage, setFeatureImage] = useState(null);
//     const [featureImageLink, setFeatureImageLink] = useState('');
//     const [showToast, setShowToast] = useState(false);
//     const [toastMessage, setToastMessage] = useState('');
//     const [allProjects, setAllProjects] = useState([]);

//     const fetchProjects = async () => {
//         setIsLoading(true);
//         setError(null);

//         try {
//             const projectsRef = collection(db, 'projects');
//             const querySnapshot = await getDocs(projectsRef);
//             const projects = querySnapshot.docs.map((doc) => ({
//                 id: doc.id,
//                 ...doc.data(),
//             }));
//             projects.sort((a, b) => b.createdAt - a.createdAt);
//             setProjects(projects);
//             setAllProjects(projects);
//         } catch (err) {
//             console.error('Error fetching projects:', err);
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchProjects();
//     }, []);

//     const handleDelete = async () => {
//         try {
//             await deleteDoc(doc(db, 'projects', selectedProjectId));
//             setProjects((prevProjects) =>
//                 prevProjects.filter((project) => project.id !== selectedProjectId)
//             );
//             setShowDeleteModal(false);
//             setToastMessage('Project deleted successfully!');
//             setShowToast(true);
//         } catch (err) {
//             console.error('Error deleting project:', err);
//             setError('Failed to delete project');
//         }
//     };

//     const handleFeatureImageChange = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;
    
//         try {
//             const fileRef = ref(storage, `project-features/${file.name}`);
//             await uploadBytes(fileRef, file);
//             const url = await getDownloadURL(fileRef);
    
//             setEditingProject((prevProject) => ({
//                 ...prevProject,
//                 featureImage: url,
//             }));
//         } catch (error) {
//             console.error('Error uploading feature image:', error);
//             setError('Failed to upload feature image');
//         }
//     };

//     const handleEdit = (project) => {
//         setEditingProject(project);
//         setShowEditModal(true);
//     };

//     // const handleEditSubmit = async (event) => {
//     //     event.preventDefault();
//     //     // const { id, title, subtitle, location, description, coverImage, featureImage, coverMedia, sections, relatedProjects } = editingProject;
//     //     // const { id, title, subtitle, location, description, coverImage, featureImage, coverMedia, sections, relatedProjects, isFeatured } = editingProject;
//     //     const { id, title, subtitle, location, description, coverImage, coverMedia, sections, relatedProjects, isFeatured } = editingProject;

//     //     console.log("Editing Project:", editingProject);

//     //     let featureImage = editingProject.featureImage || null;

//     //     try {
//     //         const projectRef = doc(db, 'projects', id);
//     //         await updateDoc(projectRef, { 
//     //             title, 
//     //             subtitle, 
//     //             location, 
//     //             description,
//     //             coverImage,
//     //             // featureImage, 
//     //             coverMedia,
//     //             sections, 
//     //             relatedProjects,
//     //             isFeatured 
//     //         });
//     //         setProjects((prevProjects) =>
//     //             prevProjects.map((project) =>
//     //                 project.id === id ? { ...project, title, subtitle, location, description, coverImage, coverMedia, featureImage, sections, relatedProjects, isFeatured } : project
//     //             )
//     //         );
//     //         setShowEditModal(false);
//     //         setToastMessage('Project updated successfully!');
//     //         setShowToast(true);
//     //     } catch (err) {
//     //         console.error('Error updating project:', err);
//     //         setError('Failed to update project');
//     //     }
//     // };


//     const handleEditSubmit = async (event) => {
//         event.preventDefault();
//         const { id, title, subtitle, location, description, coverImage, coverMedia, sections, relatedProjects, isFeatured, slug } = editingProject;
    
//         // Log the entire editingProject for debugging
//         console.log("Editing Project:", editingProject);
    
//         let featureImage = editingProject.featureImage || null;
    
//         // Create an object with the fields to update
//         const updateData = { 
//             title, 
//             subtitle, 
//             location, 
//             description,
//             coverImage,
//             coverMedia,
//             sections, 
//             relatedProjects,
//             isFeatured,
//             slug 
//         };
    
//         // Only include featureImage if it's not null or undefined
//         if (featureImage) {
//             updateData.featureImage = featureImage;
//         }
    
//         // Log the update data for debugging
//         console.log("Update Data:", updateData);
    
//         try {
//             const projectRef = doc(db, 'projects', id);
//             await updateDoc(projectRef, updateData);
            
//             setProjects((prevProjects) =>
//                 prevProjects.map((project) =>
//                     project.id === id ? { ...project, ...updateData, featureImage: featureImage, slug } : project
//                 )
//             );
//             setShowEditModal(false);
//             setToastMessage('Project updated successfully!');
//             setShowToast(true);
//         } catch (err) {
//             console.error('Error updating project:', err);
//             setError(`Failed to update project: ${err.message}`);
//         }
//     };


//     const generateSlug = (title) => {
//         return title
//             .toLowerCase()
//             .replace(/[^\w ]+/g, '')
//             .replace(/ +/g, '-');
//     };

//     const handleTitleChange = (event) => {
//         const newTitle = event.target.value;
//         setEditingProject((prevProject) => {
//             const newSlug = prevProject.slug || generateSlug(newTitle);
//             return {
//                 ...prevProject,
//                 title: newTitle,
//                 slug: newSlug,
//             };
//         });
//     };

//     const handleSlugChange = (event) => {
//         const newSlug = event.target.value;
//         setEditingProject((prevProject) => ({
//             ...prevProject,
//             slug: generateSlug(newSlug),
//         }));
//     };


//     const handleChange = (event) => {
//         const { name, value } = event.target;
//         setEditingProject((prevProject) => ({
//             ...prevProject,
//             [name]: value,
//         }));
//     };

//     // const handleSectionChange = (index, content) => {
//     //     const updatedSections = [...editingProject.sections];
//     //     updatedSections[index].content = content;
//     //     setEditingProject((prevProject) => ({
//     //         ...prevProject,
//     //         sections: updatedSections,
//     //     }));
//     // };

//     const handleSectionChange = (index, field, value) => {
//         setEditingProject((prevProject) => {
//             const updatedSections = [...prevProject.sections];
//             updatedSections[index] = { ...updatedSections[index], [field]: value };
//             return { ...prevProject, sections: updatedSections };
//         });
//     };

//     const handleFileChange = async (index, e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         try {
//             const fileRef = ref(storage, `project-${editingProject.sections[index].type}s/${file.name}`);
//             await uploadBytes(fileRef, file);
//             const url = await getDownloadURL(fileRef);

//             setEditingProject((prevProject) => {
//                 const updatedSections = [...prevProject.sections];
//                 updatedSections[index] = { ...updatedSections[index], content: url };
//                 return { ...prevProject, sections: updatedSections };
//             });
//         } catch (error) {
//             console.error('Error uploading file:', error);
//             setError('Failed to upload file');
//         }
//     };

//     const handleCoverImageChange = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         try {
//             const fileRef = ref(storage, `project-covers/${file.name}`);
//             await uploadBytes(fileRef, file);
//             const url = await getDownloadURL(fileRef);

//             setEditingProject((prevProject) => ({
//                 ...prevProject,
//                 coverImage: url,
//             }));
//         } catch (error) {
//             console.error('Error uploading cover image:', error);
//             setError('Failed to upload cover image');
//         }
//     };

//     const handleCoverMediaChange = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         try {
//             const fileRef = ref(storage, `project-covers/${file.name}`);
//             await uploadBytes(fileRef, file);
//             const url = await getDownloadURL(fileRef);

//             setEditingProject((prevProject) => ({
//                 ...prevProject,
//                 coverMedia: {
//                     url: url,
//                     type: file.type.startsWith('video') ? 'video' : 'image'
//                 },
//             }));
//         } catch (error) {
//             console.error('Error uploading cover media:', error);
//             setError('Failed to upload cover media');
//         }
//     };

//     const handleRelatedProjectToggle = (project) => {
//         setEditingProject((prevProject) => {
//             const updatedRelatedProjects = prevProject.relatedProjects.some(rp => rp.id === project.id)
//                 ? prevProject.relatedProjects.filter(rp => rp.id !== project.id)
//                 : [...prevProject.relatedProjects, {
//                     id: project.id,
//                     title: project.title,
//                     coverImage: project.coverImage
//                   }];

//             return {
//                 ...prevProject,
//                 relatedProjects: updatedRelatedProjects,
//             };
//         });
//     };

//     const handleVisibilityToggle = async (projectId, currentState) => {
//         try {
//             const projectRef = doc(db, 'projects', projectId);
//             await updateDoc(projectRef, { isVisible: !currentState });
//             setProjects((prevProjects) =>
//                 prevProjects.map((project) =>
//                     project.id === projectId ? { ...project, isVisible: !currentState } : project
//                 )
//             );
//             setToastMessage('Project visibility updated successfully!');
//             setShowToast(true);
//         } catch (err) {
//             console.error('Error updating project visibility:', err);
//             setError('Failed to update project visibility');
//         }
//     };

//     const handleFeaturedToggle = async (projectId, isChecked) => {
//         try {
//             const projectRef = doc(db, 'projects', projectId);
//             await updateDoc(projectRef, { isFeatured: isChecked });
//             setProjects((prevProjects) =>
//                 prevProjects.map((project) =>
//                     project.id === projectId ? { ...project, isFeatured: isChecked } : project
//                 )
//             );
//             setToastMessage('Project featured status updated successfully!');
//             setShowToast(true);
//         } catch (err) {
//             console.error('Error updating project featured status:', err);
//             setError('Failed to update featured status');
//         }
//     };

//     // const handleAddSection = (type) => {
//     //     setEditingProject((prevProject) => ({
//     //         ...prevProject,
//     //         sections: [...prevProject.sections, { type, content: '', files: [], isLink: false }],
//     //     }));
//     // };

//     const handleRemoveSection = (index) => {
//         setEditingProject((prevProject) => ({
//             ...prevProject,
//             sections: prevProject.sections.filter((_, i) => i !== index),
//         }));
//     };

    
//     // const handleAddSection = (type, index) => {
//     //     const newSection = { type, content: '', files: [], isLink: false };
//     //     setEditingProject((prevProject) => {
//     //         const updatedSections = [...prevProject.sections];
//     //         updatedSections.splice(index, 0, newSection); 
//     //         return { ...prevProject, sections: updatedSections };
//     //     });
//     // };


//     const handleAddSection = (type, index) => {
//         setEditingProject((prevProject) => {
//             const newSection = { type, content: '', files: [], isLink: false };
//             const updatedSections = [...prevProject.sections];
//             updatedSections.splice(index, 0, newSection);
//             return { ...prevProject, sections: updatedSections };
//         });
//     };
    


//     return (
//         <div className="container mt-5">
//             <h1>Projects</h1>
//             {isLoading && <Spinner animation="border" />}
//             {error && <p className="text-danger">Error: {error}</p>}
//             {!isLoading && projects.length === 0 && <p>No projects found.</p>}
//             {!isLoading && projects.length > 0 && (
//                 <Row xs={1} md={2} lg={3} className="g-4">
//                     {projects.map((project) => (
//                         <Col key={project.id}>
//                             <Card className="h-100">
//                                 <Card.Img
//                                     variant="top"
//                                     src={project.coverImage}
//                                     alt={project.title}
//                                     style={{ height: '200px', objectFit: 'cover' }}
//                                 />
//                                 <Card.Body className="d-flex flex-column">
//                                     <Card.Title>{project.title}</Card.Title>
//                                     <Card.Text>{project.subtitle}</Card.Text>
//                                     <Card.Text>{project.description}</Card.Text>
//                                     <div className="d-flex justify-content-between mt-auto">
//                                         <ButtonGroup>
//                                             <Button
//                                                 className="custom-button"
//                                                 size="sm"
//                                                 onClick={() => handleEdit(project)}
//                                             >
//                                                 Edit
//                                             </Button>
//                                             <Button
//                                                 variant="danger"
//                                                 size="sm"
//                                                 onClick={() => {
//                                                     setSelectedProjectId(project.id);
//                                                     setShowDeleteModal(true);
//                                                 }}
//                                             >
//                                                 Delete
//                                             </Button>
//                                         </ButtonGroup>
//                                         <Form.Check
//                                             type="switch"
//                                             id={`is-visible-${project.id}`}
//                                             label={project.isVisible ? 'Visible' : 'Hidden'}
//                                             checked={project.isVisible}
//                                             onChange={() =>
//                                                 handleVisibilityToggle(project.id, project.isVisible)
//                                             }
//                                             className="custom-switch"
//                                         />
//                                     </div>
//                                     <div className="mt-2">
//                                         <Form.Check
//                                             type="checkbox"
//                                             id={`is-featured-${project.id}`}
//                                             label="Featured"
//                                             checked={project.isFeatured || false}
//                                             onChange={(e) =>
//                                                 handleFeaturedToggle(project.id, e.target.checked)
//                                             }
//                                         />
//                                     </div>
//                                 </Card.Body>
//                             </Card>
//                         </Col>
//                     ))}
//                 </Row>
//             )}

//             {editingProject && (
//                 <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
//                     <Modal.Header closeButton>
//                         <Modal.Title>Edit Project</Modal.Title>
//                     </Modal.Header>
//                     <Modal.Body>
//                         <Form onSubmit={handleEditSubmit}>
//                             <Form.Group controlId="formTitle">
//                                 <Form.Label>Title</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="title"
//                                     value={editingProject.title || ''}
//                                     onChange={handleChange}
//                                 />
//                             </Form.Group>

//                             <Form.Group controlId="slug">
//                                 <Form.Label>Slug</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="slug"
//                                     value={editingProject.slug}
//                                     onChange={handleSlugChange}
//                                     required
//                                 />
//                             </Form.Group>

//                             <Form.Group controlId="formSubtitle">
//                                 <Form.Label>Subtitle</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="subtitle"
//                                     value={editingProject.subtitle || ''}
//                                     onChange={handleChange}
//                                 />
//                             </Form.Group>

//                             <Form.Group controlId="formLocation">
//                                 <Form.Label>Location</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="location"
//                                     value={editingProject.location || ''}
//                                     onChange={handleChange}
//                                 />
//                             </Form.Group>

//                             {/* <Form.Group controlId="formDescription">
//                                 <Form.Label>Description</Form.Label>
//                                 <ReactQuill
//                                     value={editingProject.description || ''}
//                                     onChange={(content) => handleChange({ target: { name: 'description', value: content } })}
//                                     theme="snow"
//                                 />
//                             </Form.Group> */}

//                             <Form.Group controlId="formDescription">
//                                 <Form.Label>Description</Form.Label>
//                                 <Form.Control 
//                                     as="textarea" 
//                                     rows={1} 
//                                     className="form-control"
//                                     value={editingProject.description} 
//                                     onChange={(e) => handleChange({ target: { name: 'description', value: e.target.value } })}
//                                 />
//                             </Form.Group>

//                             <Form.Group controlId="formCoverImage">
//                                 <Form.Label>Cover Image</Form.Label>
//                                 <Form.Control
//                                     type="file"
//                                     onChange={handleCoverImageChange}
//                                 />
//                             </Form.Group>

//                             <Form.Group controlId="formCoverMedia">
//                                 <Form.Label>Cover Media</Form.Label>
//                                 <Form.Control
//                                     type="file"
//                                     onChange={handleCoverMediaChange}
//                                 />
//                             </Form.Group>

//                             {/* <Form.Group controlId="formSections">
//                                 <Form.Label>Sections</Form.Label>
//                                 {editingProject.sections && editingProject.sections.map((section, index) => (
//                                     <div key={index} className="mb-3 p-3 border rounded">
//                                         <Form.Label>{section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section</Form.Label>
//                                         <Form.Check 
//                                             type="switch"
//                                             id={`section-type-switch-${index}`}
//                                             label={section.isLink ? "Link" : "File"}
//                                             checked={section.isLink}
//                                             onChange={(e) => handleSectionChange(index, 'isLink', e.target.checked)}
//                                             className="mb-2"
//                                         />
//                                         {section.isLink ? (
//                                             <Form.Control 
//                                                 type="text" 
//                                                 placeholder={`Enter ${section.type} URL(s), comma-separated for pairs`}
//                                                 value={section.content}
//                                                 onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
//                                             />
//                                         ) : (
//                                             <Form.Control 
//                                                 type="file" 
//                                                 onChange={(e) => handleFileChange(index, e)}
//                                             />
//                                         )}
//                                         {section.type === 'text' && (
//                                             <ReactQuill
//                                                 value={section.content || ''}
//                                                 onChange={(content) => handleSectionChange(index, 'content', content)}
//                                                 theme="snow"
//                                             />
//                                         )}
//                                         <Button 
//                                             variant="danger" 
//                                             size="sm" 
//                                             onClick={() => handleRemoveSection(index)} 
//                                             className="mt-2"
//                                         >
//                                             Remove Section
//                                         </Button>
//                                     </div>
//                                 ))}
//                                 <div className="mt-3">
//                                     <Button onClick={() => handleAddSection('text')} className="me-2">Add Text Section</Button>
//                                     <Button onClick={() => handleAddSection('image')} className="me-2">Add Image Section</Button>
//                                     <Button onClick={() => handleAddSection('image_pair')} className="me-2">Add Image Pair Section</Button>
//                                     <Button onClick={() => handleAddSection('video')} className="me-2">Add Video Section</Button>
//                                     <Button onClick={() => handleAddSection('video_pair')} className="me-2">Add Video Pair Section</Button>
//                                 </div>
//                             </Form.Group> */}


//                             <Form.Group controlId="formSections">
//                                 <Form.Label>Sections</Form.Label>
//                                 {editingProject.sections && editingProject.sections.map((section, index) => (
//                                     <div key={index} className="mb-3 p-3 border rounded">
//                                         <Form.Label>{section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section</Form.Label>
//                                         <Form.Check 
//                                             type="switch"
//                                             id={`section-type-switch-${index}`}
//                                             label={section.isLink ? "Link" : "File"}
//                                             checked={section.isLink}
//                                             onChange={(e) => handleSectionChange(index, 'isLink', e.target.checked)}
//                                             className="mb-2"
//                                         />
//                                         {section.isLink ? (
//                                             <Form.Control 
//                                                 type="text" 
//                                                 placeholder={`Enter ${section.type} URL(s), comma-separated for pairs`}
//                                                 value={section.content}
//                                                 onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
//                                             />
//                                         ) : (
//                                             <Form.Control 
//                                                 type="file" 
//                                                 onChange={(e) => handleFileChange(index, e)}
//                                             />
//                                         )}
//                                         {section.type === 'text' && (
//                                             <ReactQuill
//                                                 value={section.content || ''}
//                                                 onChange={(content) => handleSectionChange(index, 'content', content)}
//                                                 modules={{
//                                                     toolbar: [
//                                                         [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
//                                                         [{size: []}],
//                                                         ['bold', 'italic', 'underline', 'strike', 'blockquote'],
//                                                         [{'list': 'ordered'}, {'list': 'bullet'}, 
//                                                         {'indent': '-1'}, {'indent': '+1'}],
//                                                         ['link', 'image', 'video'],
//                                                         ['clean']
//                                                     ],
//                                                 }}
//                                                 formats={[
//                                                     'header', 'font', 'size',
//                                                     'bold', 'italic', 'underline', 'strike', 'blockquote',
//                                                     'list', 'bullet', 'indent',
//                                                     'link', 'image', 'video'
//                                                 ]}
//                                                 theme="snow"
//                                             />
//                                         )}
//                                         <Button 
//                                             variant="danger" 
//                                             size="sm" 
//                                             onClick={() => handleRemoveSection(index)} 
//                                             className="mt-2"
//                                         >
//                                             Remove Section
//                                         </Button>

//                                         <div className="mt-3">
//                                             <Button onClick={() => handleAddSection('text', index)} className="me-2 create_button">Add Text Above</Button>
//                                             <Button onClick={() => handleAddSection('image', index + 1)} className="me-2 create_button">Add Image Below</Button>
//                                             <Button onClick={() => handleAddSection('image_pair', index + 1)} className="me-2 create_button">Add Image Pair Below</Button>
//                                             <Button onClick={() => handleAddSection('video', index + 1)} className="me-2 create_button">Add Video Below</Button>
//                                             <Button onClick={() => handleAddSection('video_pair', index + 1)} className="me-2 create_button">Add Video Pair Below</Button>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </Form.Group>


//                             {/* <Form.Group controlId="formSections">
//                                 <Form.Label>Sections</Form.Label>
//                                 {editingProject.sections && editingProject.sections.map((section, index) => (
//                                     <div key={index} className="mb-3 p-3 border rounded">
//                                         <Form.Label>{section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section</Form.Label>
//                                         <Form.Check 
//                                             type="switch"
//                                             id={`section-type-switch-${index}`}
//                                             label={section.isLink ? "Link" : "File"}
//                                             checked={section.isLink}
//                                             onChange={(e) => handleSectionChange(index, 'isLink', e.target.checked)}
//                                             className="mb-2"
//                                         />
//                                         {section.isLink ? (
//                                             <Form.Control 
//                                                 type="text" 
//                                                 placeholder={`Enter ${section.type} URL(s), comma-separated for pairs`}
//                                                 value={section.content}
//                                                 onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
//                                             />
//                                         ) : (
//                                             <Form.Control 
//                                                 type="file" 
//                                                 onChange={(e) => handleFileChange(index, e)}
//                                             />
//                                         )}
//                                         {section.type === 'text' && (
//                                             <ReactQuill
//                                                 value={section.content || ''}
//                                                 onChange={(content) => handleSectionChange(index, 'content', content)}
//                                                 theme="snow"
//                                             />
//                                         )}
//                                         <div className="mt-2 d-flex justify-content-between align-items-center">
//                                             <Button 
//                                                 variant="danger" 
//                                                 size="sm" 
//                                                 onClick={() => handleRemoveSection(index)}
//                                             >
//                                                 Remove Section
//                                             </Button>
//                                             <Dropdown>
//                                                 <Dropdown.Toggle variant="success" id={`dropdown-add-section-${index}`}>
//                                                     Add Section
//                                                 </Dropdown.Toggle>
//                                                 <Dropdown.Menu>
//                                                     <Dropdown.Item onClick={() => handleAddSection('text', index + 1)}>Add Text Section</Dropdown.Item>
//                                                     <Dropdown.Item onClick={() => handleAddSection('image', index + 1)}>Add Image Section</Dropdown.Item>
//                                                     <Dropdown.Item onClick={() => handleAddSection('image_pair', index + 1)}>Add Image Pair Section</Dropdown.Item>
//                                                     <Dropdown.Item onClick={() => handleAddSection('video', index + 1)}>Add Video Section</Dropdown.Item>
//                                                     <Dropdown.Item onClick={() => handleAddSection('video_pair', index + 1)}>Add Video Pair Section</Dropdown.Item>
//                                                 </Dropdown.Menu>
//                                             </Dropdown>
//                                         </div>
//                                     </div>
//                                 ))}
//                                 <Dropdown className="mt-3">
//                                     <Dropdown.Toggle variant="primary" id="dropdown-add-first-section">
//                                         Add First Section
//                                     </Dropdown.Toggle>
//                                     <Dropdown.Menu>
//                                         <Dropdown.Item onClick={() => handleAddSection('text', 0)}>Add Text Section</Dropdown.Item>
//                                         <Dropdown.Item onClick={() => handleAddSection('image', 0)}>Add Image Section</Dropdown.Item>
//                                         <Dropdown.Item onClick={() => handleAddSection('image_pair', 0)}>Add Image Pair Section</Dropdown.Item>
//                                         <Dropdown.Item onClick={() => handleAddSection('video', 0)}>Add Video Section</Dropdown.Item>
//                                         <Dropdown.Item onClick={() => handleAddSection('video_pair', 0)}>Add Video Pair Section</Dropdown.Item>
//                                     </Dropdown.Menu>
//                                 </Dropdown>
//                             </Form.Group> */}


//                             <Form.Group controlId="formRelatedProjects" style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '40px', marginBottom: '20px', padding: '10px', border: '2px solid #cccccc'}}>
//                                 <Form.Label style={{ fontSize: '18px'}}>Related Projects</Form.Label>
//                                 {allProjects.map((project) => (
//                                     <Form.Check
//                                         key={project.id}
//                                         type="checkbox"
//                                         label={project.title}
//                                         checked={editingProject.relatedProjects.some(rp => rp.id === project.id)}
//                                         onChange={() => handleRelatedProjectToggle(project)}
//                                     />
//                                 ))}
//                             </Form.Group>
//                             <Form.Group controlId="formIsFeatured">
//                                 <Form.Check
//                                     type="checkbox"
//                                     label="Featured"
//                                     name="isFeatured"
//                                     checked={editingProject.isFeatured || false}
//                                     onChange={(e) => handleChange({
//                                         target: {
//                                             name: 'isFeatured',    
//                                             value: e.target.checked,
//                                         },
//                                     })}
//                                 />
//                             </Form.Group>

//                             <Form.Group controlId="formFeatureImage">
//                                 <Form.Label>Feature Image</Form.Label>
//                                 <Form.Check 
//                                     type="switch"
//                                     id="feature-image-switch"
//                                     label={editingProject.featureImage ? "Image Link" : "Image File"}
//                                     checked={!!editingProject.featureImage}
//                                     onChange={() => {
//                                         setEditingProject(prev => ({
//                                             ...prev,
//                                             featureImage: prev.featureImage ? '' : 'http://'
//                                         }));
//                                     }}
//                                     className="mb-2"
//                                 />
//                                 {editingProject.featureImage ? (
//                                     <Form.Control 
//                                         type="text" 
//                                         placeholder="Enter feature image URL"
//                                         value={editingProject.featureImage}
//                                         onChange={(e) => handleChange({ target: { name: 'featureImage', value: e.target.value } })}
//                                     />
//                                 ) : (
//                                     <Form.Control 
//                                         type="file" 
//                                         onChange={handleFeatureImageChange}
//                                     />
//                                 )}
//                             </Form.Group>
                            
//                             <Button variant="primary" type="submit" className={`create_button mt-4`}>
//                                 Save Changes
//                             </Button>
//                         </Form>
//                     </Modal.Body>
//                 </Modal>
//             )}

//             <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
//                 <Modal.Header closeButton>
//                     <Modal.Title>Confirm Delete</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>Are you sure you want to delete this project?</Modal.Body>
//                 <Modal.Footer>
//                     <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
//                         Cancel
//                     </Button>
//                     <Button variant="danger" onClick={handleDelete}>
//                         Delete
//                     </Button>
//                 </Modal.Footer>
//             </Modal>

//             <ToastContainer position="bottom-end" className="p-3">
//                 <Toast
//                     onClose={() => setShowToast(false)}
//                     show={showToast}
//                     delay={3000}
//                     autohide
//                 >
//                     <Toast.Body>{toastMessage}</Toast.Body>
//                 </Toast>
//             </ToastContainer>
//         </div>
//     );
// };

// export default OverviewProject;










// import React, { useEffect, useState } from 'react';
// import { collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../../config/firebase';
// import { Button, ButtonGroup, Card, Col, Form, Modal, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

// const Overview = () => {
//     const [projects, setProjects] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [editingProject, setEditingProject] = useState(null);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [selectedProjectId, setSelectedProjectId] = useState(null);
//     const [showToast, setShowToast] = useState(false);
//     const [toastMessage, setToastMessage] = useState('');
//     const [allProjects, setAllProjects] = useState([]);

//     const fetchProjects = async () => {
//         setIsLoading(true);
//         setError(null);

//         try {
//             const projectsRef = collection(db, 'projects');
//             const querySnapshot = await getDocs(projectsRef);
//             const projects = querySnapshot.docs.map((doc) => ({
//                 id: doc.id,
//                 ...doc.data(),
//             }));
//             projects.sort((a, b) => b.createdAt - a.createdAt);
//             setProjects(projects);
//             setAllProjects(projects);
//         } catch (err) {
//             console.error('Error fetching projects:', err);
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchProjects();
//     }, []);

//     const handleDelete = async () => {
//         try {
//             await deleteDoc(doc(db, 'projects', selectedProjectId));
//             setProjects((prevProjects) =>
//                 prevProjects.filter((project) => project.id !== selectedProjectId)
//             );
//             setShowDeleteModal(false);
//             setToastMessage('Project deleted successfully!');
//             setShowToast(true);
//         } catch (err) {
//             console.error('Error deleting project:', err);
//             setError('Failed to delete project');
//         }
//     };

//     const handleEdit = (project) => {
//         setEditingProject(project);
//         setShowEditModal(true);
//     };

//     const handleEditSubmit = async (event) => {
//         event.preventDefault();
//         const { id, title, subtitle, location, coverImage, coverMedia, sections, relatedProjects, slug } = editingProject;

//         try {
//             const projectRef = doc(db, 'projects', id);
//             await updateDoc(projectRef, { 
//                 title, 
//                 subtitle, 
//                 location, 
//                 coverImage, 
//                 coverMedia,
//                 sections, 
//                 relatedProjects,
//                 slug
//             });
//             setProjects((prevProjects) =>
//                 prevProjects.map((project) =>
//                     project.id === id ? { ...project, title, subtitle, location, coverImage, coverMedia, sections, relatedProjects, slug } : project
//                 )
//             );
//             setShowEditModal(false);
//             setToastMessage('Project updated successfully!');
//             setShowToast(true);
//         } catch (err) {
//             console.error('Error updating project:', err);
//             setError('Failed to update project');
//         }
//     };

//     const handleChange = (event) => {
//         const { name, value } = event.target;
//         setEditingProject((prevProject) => ({
//             ...prevProject,
//             [name]: value,
//         }));
//     };

//     const generateSlug = (title) => {
//         return title
//             .toLowerCase()
//             .replace(/[^\w ]+/g, '')
//             .replace(/ +/g, '-');
//     };

//     const handleTitleChange = (event) => {
//         const newTitle = event.target.value;
//         setEditingProject((prevProject) => {
//             const newSlug = prevProject.slug || generateSlug(newTitle);
//             return {
//                 ...prevProject,
//                 title: newTitle,
//                 slug: newSlug,
//             };
//         });
//     };

//     const handleSlugChange = (event) => {
//         const newSlug = event.target.value;
//         setEditingProject((prevProject) => ({
//             ...prevProject,
//             slug: generateSlug(newSlug),
//         }));
//     };

//     const handleSectionChange = (index, content) => {
//         const updatedSections = [...editingProject.sections];
//         updatedSections[index].content = content;
//         setEditingProject((prevProject) => ({
//             ...prevProject,
//             sections: updatedSections,
//         }));
//     };

//     const handleFileChange = async (index, e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         try {
//             const fileRef = ref(storage, `project-${editingProject.sections[index].type}s/${file.name}`);
//             await uploadBytes(fileRef, file);
//             const url = await getDownloadURL(fileRef);

//             const updatedSections = [...editingProject.sections];
//             updatedSections[index].content = url;
//             setEditingProject((prevProject) => ({
//                 ...prevProject,
//                 sections: updatedSections,
//             }));
//         } catch (error) {
//             console.error('Error uploading file:', error);
//             setError('Failed to upload file');
//         }
//     };

//     const handleCoverImageChange = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         try {
//             const fileRef = ref(storage, `project-covers/${file.name}`);
//             await uploadBytes(fileRef, file);
//             const url = await getDownloadURL(fileRef);

//             setEditingProject((prevProject) => ({
//                 ...prevProject,
//                 coverImage: url,
//             }));
//         } catch (error) {
//             console.error('Error uploading cover image:', error);
//             setError('Failed to upload cover image');
//         }
//     };

//     const handleCoverMediaChange = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         try {
//             const fileRef = ref(storage, `project-covers/${file.name}`);
//             await uploadBytes(fileRef, file);
//             const url = await getDownloadURL(fileRef);

//             setEditingProject((prevProject) => ({
//                 ...prevProject,
//                 coverMedia: {
//                     url: url,
//                     type: file.type.startsWith('video') ? 'video' : 'image'
//                 },
//             }));
//         } catch (error) {
//             console.error('Error uploading cover media:', error);
//             setError('Failed to upload cover media');
//         }
//     };

//     const handleRelatedProjectToggle = (project) => {
//         setEditingProject((prevProject) => {
//             const updatedRelatedProjects = prevProject.relatedProjects.some(rp => rp.id === project.id)
//                 ? prevProject.relatedProjects.filter(rp => rp.id !== project.id)
//                 : [...prevProject.relatedProjects, {
//                     id: project.id,
//                     title: project.title,
//                     coverImage: project.coverImage
//                   }];

//             return {
//                 ...prevProject,
//                 relatedProjects: updatedRelatedProjects,
//             };
//         });
//     };

//     const handleVisibilityToggle = async (projectId, currentState) => {
//         try {
//             const projectRef = doc(db, 'projects', projectId);
//             await updateDoc(projectRef, { isVisible: !currentState });
//             setProjects((prevProjects) =>
//                 prevProjects.map((project) =>
//                     project.id === projectId ? { ...project, isVisible: !currentState } : project
//                 )
//             );
//             setToastMessage('Project visibility updated successfully!');
//             setShowToast(true);
//         } catch (err) {
//             console.error('Error updating project visibility:', err);
//             setError('Failed to update project visibility');
//         }
//     };

//     return (
//         <div className="container mt-5">
//             <h1>Projects</h1>
//             {isLoading && <Spinner animation="border" />}
//             {error && <p className="text-danger">Error: {error}</p>}
//             {!isLoading && projects.length === 0 && <p>No projects found.</p>}
//             {!isLoading && projects.length > 0 && (
//                 <Row xs={1} md={2} lg={3} className="g-4">
//                     {projects.map((project) => (
//                         <Col key={project.id}>
//                             <Card className="h-100">
//                                 <Card.Img
//                                     variant="top"
//                                     src={project.coverImage}
//                                     alt={project.title}
//                                     style={{ height: '200px', objectFit: 'cover' }}
//                                 />
//                                 <Card.Body className="d-flex flex-column">
//                                     <Card.Title>{project.title}</Card.Title>
//                                     <Card.Text>{project.subtitle}</Card.Text>
//                                     <div className="d-flex justify-content-between mt-auto">
//                                         <ButtonGroup>
//                                             <button
//                                                 className="custom-button"
//                                                 size="sm"
//                                                 onClick={() => handleEdit(project)}
//                                             >
//                                                 Edit
//                                             </button>
//                                             <Button
//                                                 variant="danger"
//                                                 size="sm"
//                                                 onClick={() => {
//                                                     setSelectedProjectId(project.id);
//                                                     setShowDeleteModal(true);
//                                                 }}
//                                             >
//                                                 Delete
//                                             </Button>
//                                         </ButtonGroup>
//                                         <Form.Check
//                                             type="switch"
//                                             id={`is-visible-${project.id}`}
//                                             label={project.isVisible ? 'Visible' : 'Hidden'}
//                                             checked={project.isVisible}
//                                             onChange={() => handleVisibilityToggle(project.id, project.isVisible)}
//                                         />
//                                     </div>
//                                 </Card.Body>
//                             </Card>
//                         </Col>
//                     ))}
//                 </Row>
//             )}
//             {/* Edit Modal */}
//             <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
//                 <Modal.Header closeButton>
//                     <Modal.Title>Edit Project</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>
//                     {editingProject && (
//                         <Form onSubmit={handleEditSubmit}>
//                             <Row className="mb-3">
//                                 <Col>
//                                     <Form.Group controlId="title">
//                                         <Form.Label>Title</Form.Label>
//                                         <Form.Control
//                                             type="text"
//                                             name="title"
//                                             value={editingProject.title}
//                                             onChange={handleTitleChange}
//                                             required
//                                         />
//                                     </Form.Group>
//                                 </Col>
//                                 <Col>
//                                     <Form.Group controlId="slug">
//                                         <Form.Label>Slug</Form.Label>
//                                         <Form.Control
//                                             type="text"
//                                             name="slug"
//                                             value={editingProject.slug}
//                                             onChange={handleSlugChange}
//                                             required
//                                         />
//                                     </Form.Group>
//                                 </Col>
//                             </Row>
//                             <Row className="mb-3">
//                                 <Col>
//                                     <Form.Group controlId="subtitle">
//                                         <Form.Label>Subtitle</Form.Label>
//                                         <Form.Control
//                                             type="text"
//                                             name="subtitle"
//                                             value={editingProject.subtitle}
//                                             onChange={handleChange}
//                                         />
//                                     </Form.Group>
//                                 </Col>
//                                 <Col>
//                                     <Form.Group controlId="location">
//                                         <Form.Label>Location</Form.Label>
//                                         <Form.Control
//                                             type="text"
//                                             name="location"
//                                             value={editingProject.location}
//                                             onChange={handleChange}
//                                             required
//                                         />
//                                     </Form.Group>
//                                 </Col>
//                             </Row>
//                             <Row className="mb-3">
//                                 <Col>
//                                     <Form.Group controlId="coverImage">
//                                         <Form.Label>Cover Image</Form.Label>
//                                         <Form.Control
//                                             type="file"
//                                             accept="image/*"
//                                             onChange={handleCoverImageChange}
//                                         />
//                                     </Form.Group>
//                                 </Col>
//                                 <Col>
//                                     <Form.Group controlId="coverMedia">
//                                         <Form.Label>Cover Media (Video/Image)</Form.Label>
//                                         <Form.Control
//                                             type="file"
//                                             accept="image/*,video/*"
//                                             onChange={handleCoverMediaChange}
//                                         />
//                                     </Form.Group>
//                                 </Col>
//                             </Row>
//                             {/* Sections */}
//                             {editingProject.sections.map((section, index) => (
//                                 <Row className="mb-3" key={index}>
//                                     <Col>
//                                         <Form.Group controlId={`section-${index}`}>
//                                             <Form.Label>{section.type.charAt(0).toUpperCase() + section.type.slice(1)}</Form.Label>
//                                             {section.type === 'text' && (
//                                                 <ReactQuill
//                                                     value={section.content}
//                                                     onChange={(content) => handleSectionChange(index, content)}
//                                                 />
//                                             )}
//                                             {section.type === 'image' && (
//                                                 <>
//                                                     <Form.Control
//                                                         type="file"
//                                                         accept="image/*"
//                                                         onChange={(e) => handleFileChange(index, e)}
//                                                     />
//                                                     {section.content && <img src={section.content} alt="" style={{ maxWidth: '100%', marginTop: '10px' }} />}
//                                                 </>
//                                             )}
//                                             {section.type === 'video' && (
//                                                 <>
//                                                     <Form.Control
//                                                         type="file"
//                                                         accept="video/*"
//                                                         onChange={(e) => handleFileChange(index, e)}
//                                                     />
//                                                     {section.content && (
//                                                         <video controls style={{ maxWidth: '100%', marginTop: '10px' }}>
//                                                             <source src={section.content} />
//                                                             Your browser does not support the video tag.
//                                                         </video>
//                                                     )}
//                                                 </>
//                                             )}
//                                         </Form.Group>
//                                     </Col>
//                                 </Row>
//                             ))}
//                             {/* Related Projects */}
//                             <Form.Group className="mb-3" controlId="relatedProjects">
//                                 <Form.Label>Related Projects</Form.Label>
//                                 <div className="d-flex flex-wrap">
//                                     {allProjects
//                                         .filter((p) => p.id !== editingProject.id)
//                                         .map((project) => (
//                                             <Button
//                                                 key={project.id}
//                                                 variant={
//                                                     editingProject.relatedProjects.some((rp) => rp.id === project.id)
//                                                         ? 'success'
//                                                         : 'outline-secondary'
//                                                 }
//                                                 size="sm"
//                                                 className="m-1"
//                                                 onClick={() => handleRelatedProjectToggle(project)}
//                                             >
//                                                 {project.title}
//                                             </Button>
//                                         ))}
//                                 </div>
//                             </Form.Group>
//                             <Button variant="primary" type="submit">
//                                 Save Changes
//                             </Button>
//                         </Form>
//                     )}
//                 </Modal.Body>
//             </Modal>
//             {/* Delete Modal */}
//             <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
//                 <Modal.Header closeButton>
//                     <Modal.Title>Delete Project</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>Are you sure you want to delete this project?</Modal.Body>
//                 <Modal.Footer>
//                     <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
//                         Cancel
//                     </Button>
//                     <Button variant="danger" onClick={handleDelete}>
//                         Delete
//                     </Button>
//                 </Modal.Footer>
//             </Modal>
//             {/* Toast Notification */}
//             <ToastContainer position="bottom-end" className="p-3">
//                 <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
//                     <Toast.Body>{toastMessage}</Toast.Body>
//                 </Toast>
//             </ToastContainer>
//         </div>
//     );
// };

// export default Overview;









import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { Button, ButtonGroup, Card, Col, Form, Modal, Row, Spinner, Toast, ToastContainer, Dropdown } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const OverviewProject = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingProject, setEditingProject] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [featureImage, setFeatureImage] = useState(null);
    const [featureImageLink, setFeatureImageLink] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [allProjects, setAllProjects] = useState([]);

    const fetchProjects = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const projectsRef = collection(db, 'projects');
            const querySnapshot = await getDocs(projectsRef);
            const projects = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            projects.sort((a, b) => b.createdAt - a.createdAt);
            setProjects(projects);
            setAllProjects(projects);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, 'projects', selectedProjectId));
            setProjects((prevProjects) =>
                prevProjects.filter((project) => project.id !== selectedProjectId)
            );
            setShowDeleteModal(false);
            setToastMessage('Project deleted successfully!');
            setShowToast(true);
        } catch (err) {
            console.error('Error deleting project:', err);
            setError('Failed to delete project');
        }
    };

    const handleFeatureImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        try {
            const fileRef = ref(storage, `project-features/${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
    
            setEditingProject((prevProject) => ({
                ...prevProject,
                featureImage: url,
            }));
        } catch (error) {
            console.error('Error uploading feature image:', error);
            setError('Failed to upload feature image');
        }
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setShowEditModal(true);
    };


    const handleEditSubmit = async (event) => {
        event.preventDefault();
        const { id, title, subtitle, location, description, coverImage, coverMedia, sections, isFeatured, relatedProjects, slug } = editingProject;
    
        // Log the entire editingProject for debugging
        console.log("Editing Project:", editingProject);
    
        let featureImage = editingProject.featureImage || null;
    
        // Create an object with the fields to update
        const updateData = { 
            title, 
            subtitle, 
            location, 
            description,
            coverImage,
            coverMedia,
            sections, 
            isFeatured,
            relatedProjects,
            slug 
        };
    
        // Only include featureImage if it's not null or undefined
        if (featureImage) {
            updateData.featureImage = featureImage;
        }

        // Only include isFeatured if it's explicitly set to true or false
        // if (editingProject.isFeatured === true || editingProject.isFeatured === false) {
        //     updateData.isFeatured = editingProject.isFeatured;
        // }

    
        try {
            const projectRef = doc(db, 'projects', id);
            await updateDoc(projectRef, updateData);
            
            setProjects((prevProjects) =>
                prevProjects.map((project) =>
                    project.id === id ? { ...project, ...updateData, featureImage: featureImage } : project
                )
            );
            setShowEditModal(false);
            setToastMessage('Project updated successfully!');
            setShowToast(true);
        } catch (err) {
            console.error('Error updating project:', err);
            setError(`Failed to update project: ${err.message}`);
        }
    };


    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    };

    const handleTitleChange = (event) => {
        const newTitle = event.target.value;
        setEditingProject((prevProject) => {
            const newSlug = prevProject.slug || generateSlug(newTitle);
            return {
                ...prevProject,
                title: newTitle,
                slug: newSlug,
            };
        });
    };

    const handleSlugChange = (event) => {
        const newSlug = event.target.value;
        setEditingProject((prevProject) => ({
            ...prevProject,
            slug: generateSlug(newSlug),
        }));
    };


    const handleChange = (event) => {
        const { name, value } = event.target;
        setEditingProject((prevProject) => ({
            ...prevProject,
            [name]: value,
        }));
    };

    const handleSectionChange = (index, field, value) => {
        setEditingProject((prevProject) => {
            const updatedSections = [...prevProject.sections];
            updatedSections[index] = { ...updatedSections[index], [field]: value };
            return { ...prevProject, sections: updatedSections };
        });
    };

    const handleFileChange = async (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const fileRef = ref(storage, `project-${editingProject.sections[index].type}s/${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);

            setEditingProject((prevProject) => {
                const updatedSections = [...prevProject.sections];
                updatedSections[index] = { ...updatedSections[index], content: url };
                return { ...prevProject, sections: updatedSections };
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            setError('Failed to upload file');
        }
    };

    const handleCoverImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const fileRef = ref(storage, `project-covers/${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);

            setEditingProject((prevProject) => ({
                ...prevProject,
                coverImage: url,
            }));
        } catch (error) {
            console.error('Error uploading cover image:', error);
            setError('Failed to upload cover image');
        }
    };

    const handleCoverMediaChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const fileRef = ref(storage, `project-covers/${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);

            setEditingProject((prevProject) => ({
                ...prevProject,
                coverMedia: {
                    url: url,
                    type: file.type.startsWith('video') ? 'video' : 'image'
                },
            }));
        } catch (error) {
            console.error('Error uploading cover media:', error);
            setError('Failed to upload cover media');
        }
    };

    const handleRelatedProjectToggle = (project) => {
        setEditingProject((prevProject) => {
            const updatedRelatedProjects = prevProject.relatedProjects.some(rp => rp.id === project.id)
                ? prevProject.relatedProjects.filter(rp => rp.id !== project.id)
                : [...prevProject.relatedProjects, {
                    id: project.id,
                    title: project.title,
                    slug: project.slug,
                    coverImage: project.coverImage
                  }];

            return {
                ...prevProject,
                relatedProjects: updatedRelatedProjects,
            };
        });
    };

    const handleVisibilityToggle = async (projectId, currentState) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, { isVisible: !currentState });
            setProjects((prevProjects) =>
                prevProjects.map((project) =>
                    project.id === projectId ? { ...project, isVisible: !currentState } : project
                )
            );
            setToastMessage('Project visibility updated successfully!');
            setShowToast(true);
        } catch (err) {
            console.error('Error updating project visibility:', err);
            setError('Failed to update project visibility');
        }
    };

    const handleFeaturedToggle = async (projectId, isChecked) => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, { isFeatured: isChecked });
            setProjects((prevProjects) =>
                prevProjects.map((project) =>
                    project.id === projectId ? { ...project, isFeatured: isChecked } : project
                )
            );
            setToastMessage('Project featured status updated successfully!');
            setShowToast(true);
        } catch (err) {
            console.error('Error updating project featured status:', err);
            setError('Failed to update featured status');
        }
    };


    const handleRemoveSection = (index) => {
        setEditingProject((prevProject) => ({
            ...prevProject,
            sections: prevProject.sections.filter((_, i) => i !== index),
        }));
    };


    const handleAddSection = (type, index) => {
        setEditingProject((prevProject) => {
            const newSection = { type, content: '', files: [], isLink: false };
            const updatedSections = [...prevProject.sections];
            updatedSections.splice(index, 0, newSection);
            return { ...prevProject, sections: updatedSections };
        });
    };
    


    return (
        <div className="container mt-5">
            <h1>Projects</h1>
            {isLoading && <Spinner animation="border" />}
            {error && <p className="text-danger">Error: {error}</p>}
            {!isLoading && projects.length === 0 && <p>No projects found.</p>}
            {!isLoading && projects.length > 0 && (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {projects.map((project) => (
                        <Col key={project.id}>
                            <Card className="h-100">
                                <Card.Img
                                    variant="top"
                                    src={project.coverImage}
                                    alt={project.title}
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{project.title}</Card.Title>
                                    <Card.Text>{project.subtitle}</Card.Text>
                                    <Card.Text>{project.description}</Card.Text>
                                    <div className="d-flex justify-content-between mt-auto">
                                        <ButtonGroup>
                                            <Button
                                                className="custom-button"
                                                size="sm"
                                                onClick={() => handleEdit(project)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedProjectId(project.id);
                                                    setShowDeleteModal(true);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </ButtonGroup>
                                        <Form.Check
                                            type="switch"
                                            id={`is-visible-${project.id}`}
                                            label={project.isVisible ? 'Visible' : 'Hidden'}
                                            checked={project.isVisible}
                                            onChange={() =>
                                                handleVisibilityToggle(project.id, project.isVisible)
                                            }
                                            className="custom-switch"
                                        />
                                    </div>
                                    {/* <div className="mt-2">
                                        <Form.Check
                                            type="checkbox"
                                            label="Featured"
                                            name="isFeatured"
                                            checked={editingProject.isFeatured || false}
                                            onChange={(e) => handleChange({
                                                target: {
                                                    name: 'isFeatured',    
                                                    value: e.target.checked,
                                                },
                                            })}
                                        />
                                    </div> */}
                                    <div className="mt-2">
                                        <Form.Check
                                            type="checkbox"
                                            // id={is-featured-${project.id}}
                                            label="Featured"
                                            checked={project.isFeatured || false}
                                            onChange={(e) =>
                                                handleFeaturedToggle(project.id, e.target.checked)
                                            }
                                        />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {editingProject && (
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Project</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleEditSubmit}>
                            <Form.Group controlId="formTitle">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={editingProject.title || ''}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group controlId="slug">
                                <Form.Label>Slug</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="slug"
                                    value={editingProject.slug}
                                    onChange={handleSlugChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formSubtitle">
                                <Form.Label>Subtitle</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="subtitle"
                                    value={editingProject.subtitle || ''}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group controlId="formLocation">
                                <Form.Label>Location</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="location"
                                    value={editingProject.location || ''}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group controlId="formDescription">
                                <Form.Label>Description</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={1} 
                                    className="form-control"
                                    value={editingProject.description} 
                                    onChange={(e) => handleChange({ target: { name: 'description', value: e.target.value } })}
                                />
                            </Form.Group>

                            <Form.Group controlId="formCoverImage">
                                <Form.Label>Cover Image</Form.Label>
                                <Form.Control
                                    type="file"
                                    onChange={handleCoverImageChange}
                                />
                            </Form.Group>

                            <Form.Group controlId="formCoverMedia">
                                <Form.Label>Cover Media</Form.Label>
                                <Form.Control
                                    type="file"
                                    onChange={handleCoverMediaChange}
                                />
                            </Form.Group>


                            <Form.Group controlId="formSections">
                                <Form.Label>Sections</Form.Label>
                                {editingProject.sections && editingProject.sections.map((section, index) => (
                                    <div key={index} className="mb-3 p-3 border rounded">
                                        <Form.Label>{section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section</Form.Label>
                                        <Form.Check 
                                            type="switch"
                                            id={`section-type-switch-${index}`}
                                            label={section.isLink ? "Link" : "File"}
                                            checked={section.isLink}
                                            onChange={(e) => handleSectionChange(index, 'isLink', e.target.checked)}
                                            className="mb-2"
                                        />
                                        {section.isLink ? (
                                            <Form.Control 
                                                type="text" 
                                                placeholder={`Enter ${section.type} URL(s), comma-separated for pairs`}
                                                value={section.content}
                                                onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                                            />
                                        ) : (
                                            <Form.Control 
                                                type="file" 
                                                onChange={(e) => handleFileChange(index, e)}
                                            />
                                        )}
                                        {section.type === 'text' && (
                                            <ReactQuill
                                                value={section.content || ''}
                                                onChange={(content) => handleSectionChange(index, 'content', content)}
                                                modules={{
                                                    toolbar: [
                                                        [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                                                        [{size: []}],
                                                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                                        [{'list': 'ordered'}, {'list': 'bullet'}, 
                                                        {'indent': '-1'}, {'indent': '+1'}],
                                                        ['link', 'image', 'video'],
                                                        ['clean']
                                                    ],
                                                }}
                                                formats={[
                                                    'header', 'font', 'size',
                                                    'bold', 'italic', 'underline', 'strike', 'blockquote',
                                                    'list', 'bullet', 'indent',
                                                    'link', 'image', 'video'
                                                ]}
                                                theme="snow"
                                            />
                                        )}
                                        <Button 
                                            variant="danger" 
                                            size="sm" 
                                            onClick={() => handleRemoveSection(index)} 
                                            className="mt-2"
                                        >
                                            Remove Section
                                        </Button>

                                        <div className="mt-3">
                                            <Button onClick={() => handleAddSection('text', index)} className="me-2 create_button">Add Text Above</Button>
                                            <Button onClick={() => handleAddSection('image', index + 1)} className="me-2 create_button">Add Image Below</Button>
                                            <Button onClick={() => handleAddSection('image_pair', index + 1)} className="me-2 create_button">Add Image Pair Below</Button>
                                            <Button onClick={() => handleAddSection('video', index + 1)} className="me-2 create_button">Add Video Below</Button>
                                            <Button onClick={() => handleAddSection('video_pair', index + 1)} className="me-2 create_button">Add Video Pair Below</Button>
                                        </div>
                                    </div>
                                ))}
                            </Form.Group>


                            <Form.Group controlId="formRelatedProjects" style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '40px', marginBottom: '20px', padding: '10px', border: '2px solid #cccccc'}}>
                                <Form.Label style={{ fontSize: '18px'}}>Related Projects</Form.Label>
                                {allProjects.map((project) => (
                                    <Form.Check
                                        key={project.slug}
                                        type="checkbox"
                                        label={project.title}
                                        checked={editingProject.relatedProjects.some(rp => rp.slug === project.slug)}
                                        onChange={() => handleRelatedProjectToggle(project)}
                                    />
                                ))}
                            </Form.Group>
                            <Form.Group controlId="formIsFeatured">
                                <Form.Check
                                    type="checkbox"
                                    label="Featured"
                                    name="isFeatured"
                                    checked={editingProject.isFeatured || false}
                                    onChange={(e) => handleChange({
                                        target: {
                                            name: 'isFeatured',    
                                            value: e.target.checked,
                                        },
                                    })}
                                />
                            </Form.Group>

                            <Form.Group controlId="formFeatureImage">
                                <Form.Label>Feature Image</Form.Label>
                                <Form.Check 
                                    type="switch"
                                    id="feature-image-switch"
                                    label={editingProject.featureImage ? "Image Link" : "Image File"}
                                    checked={!!editingProject.featureImage}
                                    onChange={() => {
                                        setEditingProject(prev => ({
                                            ...prev,
                                            featureImage: prev.featureImage ? '' : 'http://'
                                        }));
                                    }}
                                    className="mb-2"
                                />
                                {editingProject.featureImage ? (
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Enter feature image URL"
                                        value={editingProject.featureImage}
                                        onChange={(e) => handleChange({ target: { name: 'featureImage', value: e.target.value } })}
                                    />
                                ) : (
                                    <Form.Control 
                                        type="file" 
                                        onChange={handleFeatureImageChange}
                                    />
                                )}
                            </Form.Group>
                            
                            <Button variant="primary" type="submit" className={`create_button mt-4`}>
                                Save Changes
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            )}

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this project?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer position="bottom-end" className="p-3">
                <Toast
                    onClose={() => setShowToast(false)}
                    show={showToast}
                    delay={3000}
                    autohide
                >
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
};

export default OverviewProject;

