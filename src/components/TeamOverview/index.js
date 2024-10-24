import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { Button, ButtonGroup, Card, Col, Form, Modal, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const TeamMemberOverview = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingMember, setEditingMember] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageLink, setProfileImageLink] = useState('');
    const [useImageLink, setUseImageLink] = useState(false);
    const [photos, setPhotos] = useState([]);

    const fetchTeamMembers = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const teamMemberRef = collection(db, 'team-members');
            const querySnapshot = await getDocs(teamMemberRef);
            const members = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            members.sort((a, b) => b.createdAt - a.createdAt);
            setTeamMembers(members);
        } catch (err) {
            console.error('Error fetching team members:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, 'team-members', selectedMemberId));
            setTeamMembers((prevMembers) =>
                prevMembers.filter((member) => member.id !== selectedMemberId)
            );
            setShowDeleteModal(false);
            setToastMessage('Team member deleted successfully!');
            setShowToast(true);
        } catch (err) {
            console.error('Error deleting team member:', err);
            setError('Failed to delete team member');
        }
    };

    const handleEdit = (member) => {
        setEditingMember(member);
        setUseImageLink(member.profileImage.startsWith('http'));
        setProfileImageLink(member.profileImage.startsWith('http') ? member.profileImage : '');
        setProfileImage(null);
        setPhotos(member.photos || []);
        setShowEditModal(true);
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const { id, name, slug, position, moreBio } = editingMember;

        try {
            let imageUrl = editingMember.profileImage;
            if (useImageLink) {
                imageUrl = profileImageLink;
            } else if (profileImage) {
                const imageRef = ref(storage, `team-members/${profileImage.name}`);
                await uploadBytes(imageRef, profileImage);
                imageUrl = await getDownloadURL(imageRef);
            }

            const uploadedPhotos = [];
            for (const photo of photos) {
                if (photo instanceof File) {
                    const photoRef = ref(storage, `team-members/${photo.name}`);
                    await uploadBytes(photoRef, photo);
                    const photoUrl = await getDownloadURL(photoRef);
                    uploadedPhotos.push(photoUrl);
                } else {
                    uploadedPhotos.push(photo);
                }
            }

            const memberRef = doc(db, 'team-members', id);
            await updateDoc(memberRef, { 
                name, 
                slug,
                position, 
                moreBio,
                profileImage: imageUrl,
                photos: uploadedPhotos
            });

            setTeamMembers((prevMembers) =>
                prevMembers.map((member) =>
                    member.id === id ? { ...member, name, slug, position, moreBio, profileImage: imageUrl, photos: uploadedPhotos } : member
                )
            );
            setShowEditModal(false);
            setToastMessage('Team member updated successfully!');
            setShowToast(true);
        } catch (err) {
            console.error('Error updating team member:', err);
            setError('Failed to update team member');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setEditingMember((prevMember) => ({
            ...prevMember,
            [name]: value,
        }));
    };

    const handleQuillChange = (value) => {
        setEditingMember((prevMember) => ({
            ...prevMember,
            moreBio: value,
        }));
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        setProfileImage(file);
        setProfileImageLink('');
    };

    const handleProfileImageLinkChange = (e) => {
        setProfileImageLink(e.target.value);
        setProfileImage(null);
    };

    const handlePhotosChange = (e) => {
        const files = Array.from(e.target.files);
        setPhotos((prevPhotos) => [...prevPhotos, ...files]);
    };

    return (
        <div className="container mt-5">
            <h1>Team Members</h1>
            {isLoading && <Spinner animation="border" />}
            {error && <p className="text-danger">Error: {error}</p>}
            {!isLoading && teamMembers.length === 0 && <p>No team members found.</p>}
            {!isLoading && teamMembers.length > 0 && (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {teamMembers.map((member) => (
                        <Col key={member.id}>
                            <Card className="h-100">
                                <Card.Img
                                    variant="top"
                                    src={member.profileImage}
                                    alt={member.name}
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{member.name}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">{member.position}</Card.Subtitle>
                                    <div className="d-flex justify-content-between mt-auto">
                                        <ButtonGroup>
                                            <button
                                                className="custom-button"
                                                size="sm"
                                                onClick={() => handleEdit(member)}
                                            >
                                                Edit
                                            </button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedMemberId(member.id);
                                                    setShowDeleteModal(true);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
            {editingMember && (
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Team Member</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleEditSubmit}>
                            <Form.Group controlId="formName">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={editingMember.name}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="formSlug" className="mt-3">
                                <Form.Label>Slug</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="slug"
                                    value={editingMember.slug}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="formPosition" className="mt-3">
                                <Form.Label>Position</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="position"
                                    value={editingMember.position}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="formMoreBio" className="mt-3">
                                <Form.Label>More Bio</Form.Label>
                                <ReactQuill
                                    value={editingMember.moreBio}
                                    onChange={handleQuillChange}
                                    modules={{
                                        toolbar: [
                                            [{ header: [1, 2, 3, 4, 5, 6, false] }],
                                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                            [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
                                            [{ color: [] }],
                                            [{ align: [] }],
                                            ['link', 'image', 'video'],
                                            ['clean'],
                                        ],
                                    }}
                                    formats={[
                                        'header',
                                        'bold', 'italic', 'underline', 'strike', 'blockquote',
                                        'list', 'bullet', 'indent',
                                        'link', 'image', 'video',
                                        'color',
                                        'align',
                                        'clean',
                                    ]}
                                    style={{ height: '300px' }}
                                />
                            </Form.Group>
                            <Form.Group controlId="formProfileImage" className="mt-3">
                                <Form.Label>Profile Image</Form.Label>
                                <Form.Check 
                                    type="switch"
                                    id="profile-image-switch"
                                    label={useImageLink ? "Image Link" : "Image File"}
                                    checked={useImageLink}
                                    onChange={() => setUseImageLink(!useImageLink)}
                                    className="mb-2"
                                />
                                {useImageLink ? (
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Enter image URL"
                                        value={profileImageLink}
                                        onChange={handleProfileImageLinkChange}
                                    />
                                ) : (
                                    <Form.Control 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleProfileImageChange}
                                    />
                                )}
                            </Form.Group>
                            <Form.Group controlId="formPhotos" className="mt-3">
                                <Form.Label>Additional Photos</Form.Label>
                                <Form.Control
                                    type="file"
                                    multiple
                                    onChange={handlePhotosChange}
                                />
                                {photos.length > 0 && (
                                    <div className="mt-2">
                                        <p>Current photos:</p>
                                        {photos.map((photo, index) => (
                                            <img 
                                                key={index} 
                                                src={photo instanceof File ? URL.createObjectURL(photo) : photo} 
                                                alt={`Additional photo ${index + 1}`} 
                                                style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '5px' }} 
                                            />
                                        ))}
                                    </div>
                                )}
                            </Form.Group>
                            <Button
                                type="submit"
                                className="create_button mt-16"
                                disabled={isLoading}
                            >
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
                <Modal.Body>Are you sure you want to delete this team member?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer className="p-3" position="top-end">
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
};

export default TeamMemberOverview;











// import React, { useEffect, useState } from 'react';
// import { collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../../config/firebase';
// import { Button, ButtonGroup, Card, Col, Form, Modal, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap';

// const TeamMemberOverview = () => {
//     const [teamMembers, setTeamMembers] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [editingMember, setEditingMember] = useState(null);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [selectedMemberId, setSelectedMemberId] = useState(null);
//     const [showToast, setShowToast] = useState(false);
//     const [toastMessage, setToastMessage] = useState('');
//     const [profileImage, setProfileImage] = useState(null);
//     const [profileImageLink, setProfileImageLink] = useState('');
//     const [useImageLink, setUseImageLink] = useState(false);
//     const [photos, setPhotos] = useState([]);

//     const fetchTeamMembers = async () => {
//         setIsLoading(true);
//         setError(null);

//         try {
//             const teamMemberRef = collection(db, 'team-members');
//             const querySnapshot = await getDocs(teamMemberRef);
//             const members = querySnapshot.docs.map((doc) => ({
//                 id: doc.id,
//                 ...doc.data(),
//             }));
//             members.sort((a, b) => b.createdAt - a.createdAt);
//             setTeamMembers(members);
//         } catch (err) {
//             console.error('Error fetching team members:', err);
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchTeamMembers();
//     }, []);

//     const handleDelete = async () => {
//         try {
//             await deleteDoc(doc(db, 'team-members', selectedMemberId));
//             setTeamMembers((prevMembers) =>
//                 prevMembers.filter((member) => member.id !== selectedMemberId)
//             );
//             setShowDeleteModal(false);
//             setToastMessage('Team member deleted successfully!');
//             setShowToast(true);
//         } catch (err) {
//             console.error('Error deleting team member:', err);
//             setError('Failed to delete team member');
//         }
//     };

//     const handleEdit = (member) => {
//         setEditingMember(member);
//         setUseImageLink(member.profileImage.startsWith('http'));
//         setProfileImageLink(member.profileImage.startsWith('http') ? member.profileImage : '');
//         setProfileImage(null);
//         setPhotos(member.photos || []);
//         setShowEditModal(true);
//     };

//     const handleEditSubmit = async (event) => {
//         event.preventDefault();
//         setIsLoading(true);
//         const { id, name, slug, position, bio, moreBio, title } = editingMember;

//         try {
//             let imageUrl = editingMember.profileImage;
//             if (useImageLink) {
//                 imageUrl = profileImageLink;
//             } else if (profileImage) {
//                 const imageRef = ref(storage, `team-members/${profileImage.name}`);
//                 await uploadBytes(imageRef, profileImage);
//                 imageUrl = await getDownloadURL(imageRef);
//             }

//             const uploadedPhotos = [];
//             for (const photo of photos) {
//                 if (photo instanceof File) {
//                     const photoRef = ref(storage, `team-members/${photo.name}`);
//                     await uploadBytes(photoRef, photo);
//                     const photoUrl = await getDownloadURL(photoRef);
//                     uploadedPhotos.push(photoUrl);
//                 } else {
//                     uploadedPhotos.push(photo);
//                 }
//             }

//             const memberRef = doc(db, 'team-members', id);
//             await updateDoc(memberRef, { 
//                 name, 
//                 slug,
//                 position, 
//                 bio, 
//                 moreBio,
//                 title,
//                 profileImage: imageUrl,
//                 photos: uploadedPhotos
//             });

//             setTeamMembers((prevMembers) =>
//                 prevMembers.map((member) =>
//                     member.id === id ? { ...member, name, slug, position, bio, moreBio, title, profileImage: imageUrl, photos: uploadedPhotos } : member
//                 )
//             );
//             setShowEditModal(false);
//             setToastMessage('Team member updated successfully!');
//             setShowToast(true);
//         } catch (err) {
//             console.error('Error updating team member:', err);
//             setError('Failed to update team member');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleChange = (event) => {
//         const { name, value } = event.target;
//         setEditingMember((prevMember) => ({
//             ...prevMember,
//             [name]: value,
//         }));
//     };

//     const handleProfileImageChange = (e) => {
//         const file = e.target.files[0];
//         setProfileImage(file);
//         setProfileImageLink('');
//     };

//     const handleProfileImageLinkChange = (e) => {
//         setProfileImageLink(e.target.value);
//         setProfileImage(null);
//     };

//     const handlePhotosChange = (e) => {
//         const files = Array.from(e.target.files);
//         setPhotos((prevPhotos) => [...prevPhotos, ...files]);
//     };

//     return (
//         <div className="container mt-5">
//             <h1>Team Members</h1>
//             {isLoading && <Spinner animation="border" />}
//             {error && <p className="text-danger">Error: {error}</p>}
//             {!isLoading && teamMembers.length === 0 && <p>No team members found.</p>}
//             {!isLoading && teamMembers.length > 0 && (
//                 <Row xs={1} md={2} lg={3} className="g-4">
//                     {teamMembers.map((member) => (
//                         <Col key={member.id}>
//                             <Card className="h-100">
//                                 <Card.Img
//                                     variant="top"
//                                     src={member.profileImage}
//                                     alt={member.name}
//                                     style={{ height: '200px', objectFit: 'cover' }}
//                                 />
//                                 <Card.Body className="d-flex flex-column">
//                                     <Card.Title>{member.name}</Card.Title>
//                                     <Card.Subtitle className="mb-2 text-muted">{member.position}</Card.Subtitle>
//                                     <Card.Text>{member.bio}</Card.Text>
//                                     <div className="d-flex justify-content-between mt-auto">
//                                         <ButtonGroup>
//                                             <Button
//                                                 variant="primary"
//                                                 size="sm"
//                                                 onClick={() => handleEdit(member)}
//                                             >
//                                                 Edit
//                                             </Button>
//                                             <Button
//                                                 variant="danger"
//                                                 size="sm"
//                                                 onClick={() => {
//                                                     setSelectedMemberId(member.id);
//                                                     setShowDeleteModal(true);
//                                                 }}
//                                             >
//                                                 Delete
//                                             </Button>
//                                         </ButtonGroup>
//                                     </div>
//                                 </Card.Body>
//                             </Card>
//                         </Col>
//                     ))}
//                 </Row>
//             )}
//             {editingMember && (
//                 <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
//                     <Modal.Header closeButton>
//                         <Modal.Title>Edit Team Member</Modal.Title>
//                     </Modal.Header>
//                     <Modal.Body>
//                         <Form onSubmit={handleEditSubmit}>
//                             <Form.Group controlId="formName">
//                                 <Form.Label>Name</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="name"
//                                     value={editingMember.name}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </Form.Group>
//                             <Form.Group controlId="formSlug" className="mt-3">
//                                 <Form.Label>Slug</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="slug"
//                                     value={editingMember.slug}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </Form.Group>
//                             <Form.Group controlId="formTitle" className="mt-3">
//                                 <Form.Label>Title</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="title"
//                                     value={editingMember.title}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </Form.Group>
//                             <Form.Group controlId="formPosition" className="mt-3">
//                                 <Form.Label>Position</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="position"
//                                     value={editingMember.position}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </Form.Group>
//                             <Form.Group controlId="formBio" className="mt-3">
//                                 <Form.Label>Bio</Form.Label>
//                                 <Form.Control
//                                     as="textarea"
//                                     rows={3}
//                                     name="bio"
//                                     value={editingMember.bio}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </Form.Group>
//                             <Form.Group controlId="formMoreBio" className="mt-3">
//                                 <Form.Label>More Bio</Form.Label>
//                                 <Form.Control
//                                     as="textarea"
//                                     rows={5}
//                                     name="moreBio"
//                                     value={editingMember.moreBio}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </Form.Group>
//                             <Form.Group controlId="formProfileImage" className="mt-3">
//                                 <Form.Label>Profile Image</Form.Label>
//                                 <Form.Check 
//                                     type="switch"
//                                     id="profile-image-switch"
//                                     label={useImageLink ? "Image Link" : "Image File"}
//                                     checked={useImageLink}
//                                     onChange={() => setUseImageLink(!useImageLink)}
//                                     className="mb-2"
//                                 />
//                                 {useImageLink ? (
//                                     <Form.Control 
//                                         type="text" 
//                                         placeholder="Enter image URL"
//                                         value={profileImageLink}
//                                         onChange={handleProfileImageLinkChange}
//                                     />
//                                 ) : (
//                                     <Form.Control 
//                                         type="file" 
//                                         accept="image/*"
//                                         onChange={handleProfileImageChange}
//                                     />
//                                 )}
//                             </Form.Group>
//                             <Form.Group controlId="formPhotos" className="mt-3">
//                                 <Form.Label>Additional Photos</Form.Label>
//                                 <Form.Control
//                                     type="file"
//                                     multiple
//                                     onChange={handlePhotosChange}
//                                 />
//                                 {photos.length > 0 && (
//                                     <div className="mt-2">
//                                         <p>Current photos:</p>
//                                         {photos.map((photo, index) => (
//                                             <img 
//                                                 key={index} 
//                                                 src={photo instanceof File ? URL.createObjectURL(photo) : photo} 
//                                                 alt={`Additional photo ${index + 1}`} 
//                                                 style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '5px' }} 
//                                             />
//                                         ))}
//                                     </div>
//                                 )}
//                             </Form.Group>
//                             <Button variant="primary" type="submit" className="mt-3">
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
//                 <Modal.Body>Are you sure you want to delete this team member?</Modal.Body>
//                 <Modal.Footer>
//                     <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
//                         Cancel
//                     </Button>
//                     <Button variant="danger" onClick={handleDelete}>
//                         Delete
//                     </Button>
//                 </Modal.Footer>
//             </Modal>
//             <ToastContainer className="p-3" position="top-end">
//                 <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
//                     <Toast.Body>{toastMessage}</Toast.Body>
//                 </Toast>
//             </ToastContainer>
//         </div>
//     );
// };

// export default TeamMemberOverview;