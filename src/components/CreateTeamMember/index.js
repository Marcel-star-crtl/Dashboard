// import React, { useState } from 'react';
// import { Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';
// import { auth, db, storage } from '../../config/firebase';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

// const TeamMemberForm = () => {
//   const [validated, setValidated] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [name, setName] = useState('');
//   const [slug, setSlug] = useState('');
//   const [position, setPosition] = useState('');
//   const [bio, setBio] = useState('');
//   const [moreBio, setMoreBio] = useState('');
//   const [profileImage, setProfileImage] = useState(null);
//   const [profileImageLink, setProfileImageLink] = useState('');
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [title, setTitle] = useState('');
//   const [photos, setPhotos] = useState([]);

//   const handleProfileImageChange = (e) => {
//     setProfileImage(e.target.files[0]);
//     setProfileImageLink('');
//   };

//   const handlePhotosChange = (e) => {
//     const files = Array.from(e.target.files);
//     setPhotos(files);
//   };

//   const handleSubmit = async (event) => {
//     const form = event.currentTarget;
//     event.preventDefault();
//     setValidated(true);
//     setLoading(true);
//     setErrorMessage(null);
//     setSuccessMessage(null);

//     if (form.checkValidity() === false) {
//       setLoading(false);
//       return;
//     }

//     try {
//       let imageUrl = profileImageLink;
//       if (profileImage) {
//         const imageRef = ref(storage, `team-members/${profileImage.name}`);
//         await uploadBytes(imageRef, profileImage);
//         imageUrl = await getDownloadURL(imageRef);
//       }

//       const uploadedPhotos = [];
//       for (const photo of photos) {
//         const photoRef = ref(storage, `team-members/${photo.name}`);
//         await uploadBytes(photoRef, photo);
//         const photoUrl = await getDownloadURL(photoRef);
//         uploadedPhotos.push(photoUrl);
//       }

//       const teamMemberData = {
//         name,
//         slug,
//         position,
//         bio,
//         moreBio,
//         profileImage: imageUrl,
//         photos: uploadedPhotos,
//         title,
//         createdAt: serverTimestamp(),
//       };

//       const teamMemberRef = collection(db, 'team-members');
//       await addDoc(teamMemberRef, teamMemberData);

//       setSuccessMessage('Team member added successfully!');
//       console.log('Team member added successfully!');

//       // Reset form
//       setName('');
//       setSlug('');
//       setPosition('');
//       setBio('');
//       setMoreBio('');
//       setTitle('');
//       setProfileImage(null);
//       setProfileImageLink('');
//       setPhotos([]);
//       setValidated(false);
//     } catch (error) {
//       setErrorMessage(error.message);
//     }
//     setLoading(false);
//   };

//   return (
//     <Row className="justify-content-md-center">
//       <Col md={8}>
//         <Card>
//           <Card.Header>
//             <Card.Title>Add New Team Member</Card.Title>
//           </Card.Header>
//           <Card.Body>
//             {errorMessage && <Alert variant="danger" className="mb-4">{errorMessage}</Alert>}
//             {successMessage && <Alert variant="success" className="mb-4">{successMessage}</Alert>}
//             <Form noValidate validated={validated} onSubmit={handleSubmit}>
//               <Form.Group className="mb-3" controlId="formBasicName">
//                 <Form.Label>Name</Form.Label>
//                 <Form.Control
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   type="text"
//                   placeholder="Enter name"
//                   required
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   Please provide a name.
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group className="mb-3" controlId="formBasicSlug">
//                 <Form.Label>Slug</Form.Label>
//                 <Form.Control
//                   value={slug}
//                   onChange={(e) => setSlug(e.target.value)}
//                   type="text"
//                   placeholder="Enter slug"
//                   required
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   Please provide a slug.
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group className="mb-3" controlId="formBasicTitle">
//                 <Form.Label>Title</Form.Label>
//                 <Form.Control
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)}
//                   type="text"
//                   placeholder="Enter title"
//                   required
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   Please provide a title.
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group className="mb-3" controlId="formBasicPosition">
//                 <Form.Label>Position</Form.Label>
//                 <Form.Control
//                   value={position}
//                   onChange={(e) => setPosition(e.target.value)}
//                   type="text"
//                   placeholder="Enter position"
//                   required
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   Please provide a position.
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group className="mb-3" controlId="formBasicBio">
//                 <Form.Label>Bio</Form.Label>
//                 <Form.Control
//                   as="textarea"
//                   rows={3}
//                   value={bio}
//                   onChange={(e) => setBio(e.target.value)}
//                   placeholder="Enter bio"
//                   required
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   Please provide a bio.
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group className="mb-3" controlId="formBasicMoreBio">
//                 <Form.Label>More Bio</Form.Label>
//                 <ReactQuill
//                   value={moreBio}
//                   onChange={setMoreBio}
//                   placeholder="Enter more detailed bio"
//                   modules={{
//                     toolbar: [
//                       [{ header: [1, 2, 3, 4, 5, 6, false] }],
//                       ['bold', 'italic', 'underline', 'strike', 'blockquote'],
//                       [
//                         { list: 'ordered' },
//                         { list: 'bullet' },
//                         { indent: '-1' },
//                         { indent: '+1' },
//                       ],
//                       [{ color: [] }],
//                       [{ align: [] }],
//                       ['link', 'image', 'video'],
//                       ['clean'],
//                     ],
//                   }}
//                   formats={[
//                     'header',
//                     'bold',
//                     'italic',
//                     'underline',
//                     'strike',
//                     'blockquote',
//                     'list',
//                     'bullet',
//                     'indent',
//                     'link',
//                     'image',
//                     'video',
//                     'color',
//                     'align',
//                     'clean',
//                   ]}
//                   style={{ height: '300px' }}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   Please provide a more detailed bio.
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group controlId="profileImage" className="mb-3">
//                 <Form.Label>Profile Image</Form.Label>
//                 <Form.Check 
//                   type="switch"
//                   id="profile-image-switch"
//                   label={profileImageLink ? "Image Link" : "Image File"}
//                   checked={!!profileImageLink}
//                   onChange={() => {
//                     setProfileImageLink(profileImageLink ? '' : 'http://');
//                     setProfileImage(null);
//                   }}
//                   className="mb-2"
//                 />
//                 {profileImageLink ? (
//                   <Form.Control 
//                     type="text" 
//                     placeholder="Enter image URL"
//                     value={profileImageLink}
//                     onChange={(e) => setProfileImageLink(e.target.value)}
//                     required
//                   />
//                 ) : (
//                   <Form.Control 
//                     type="file" 
//                     onChange={handleProfileImageChange}
//                     required 
//                   />
//                 )}
//               </Form.Group>

//               <Form.Group controlId="photos" className="mb-3">
//                 <Form.Label>Additional Photos</Form.Label>
//                 <Form.Control
//                   type="file"
//                   multiple
//                   onChange={handlePhotosChange}
//                 />
//               </Form.Group>

//               <Button type="submit" className={`create_button mt-3 ${loading ? 'submitting-button' : ''}`} disabled={loading}>
//                 {loading ? (
//                   <>
//                     <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
//                     Submitting...
//                   </>
//                 ) : (
//                   "Add Team Member"
//                 )}
//               </Button>
//             </Form>
//           </Card.Body>
//         </Card>
//       </Col>
//     </Row>
//   );
// };

// export default TeamMemberForm;








import React, { useState } from 'react';
import { Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { auth, db, storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const TeamMemberForm = () => {
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [position, setPosition] = useState('');
  const [moreBio, setMoreBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageLink, setProfileImageLink] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [photos, setPhotos] = useState([]);

  const handleProfileImageChange = (e) => {
    setProfileImage(e.target.files[0]);
    setProfileImageLink('');
  };

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
  };

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    setValidated(true);
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (form.checkValidity() === false) {
      setLoading(false);
      return;
    }

    try {
      let imageUrl = profileImageLink;
      if (profileImage) {
        const imageRef = ref(storage, `team-members/${profileImage.name}`);
        await uploadBytes(imageRef, profileImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      const uploadedPhotos = [];
      for (const photo of photos) {
        const photoRef = ref(storage, `team-members/${photo.name}`);
        await uploadBytes(photoRef, photo);
        const photoUrl = await getDownloadURL(photoRef);
        uploadedPhotos.push(photoUrl);
      }

      const teamMemberData = {
        name,
        slug,
        position,
        moreBio,
        profileImage: imageUrl,
        photos: uploadedPhotos,
        createdAt: serverTimestamp(),
      };

      const teamMemberRef = collection(db, 'team-members');
      await addDoc(teamMemberRef, teamMemberData);

      setSuccessMessage('Team member added successfully!');
      console.log('Team member added successfully!');

      // Reset form
      setName('');
      setSlug('');
      setPosition('');
      setMoreBio('');
      setProfileImage(null);
      setProfileImageLink('');
      setPhotos([]);
      setValidated(false);
    } catch (error) {
      setErrorMessage(error.message);
    }
    setLoading(false);
  };

  return (
    <Row className="justify-content-md-center">
      <Col md={8}>
        <Card>
          <Card.Header>
            <Card.Title>Add New Team Member</Card.Title>
          </Card.Header>
          <Card.Body>
            {errorMessage && <Alert variant="danger" className="mb-4">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success" className="mb-4">{successMessage}</Alert>}
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Enter name"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a name.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicSlug">
                <Form.Label>Slug</Form.Label>
                <Form.Control
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  type="text"
                  placeholder="Enter slug"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a slug.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPosition">
                <Form.Label>Position</Form.Label>
                <Form.Control
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  type="text"
                  placeholder="Enter position"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a position.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicMoreBio">
                <Form.Label>More Bio</Form.Label>
                <ReactQuill
                  value={moreBio}
                  onChange={setMoreBio}
                  placeholder="Enter more detailed bio"
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
                  style={{ height: '300px' }}
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a more detailed bio.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="profileImage" className="mb-3 mt-16">
                <Form.Label>Profile Image</Form.Label>
                <Form.Check 
                  type="switch"
                  id="profile-image-switch"
                  label={profileImageLink ? "Image Link" : "Image File"}
                  checked={!!profileImageLink}
                  onChange={() => {
                    setProfileImageLink(profileImageLink ? '' : 'http://');
                    setProfileImage(null);
                  }}
                  className="mb-2"
                />
                {profileImageLink ? (
                  <Form.Control 
                    type="text" 
                    placeholder="Enter image URL"
                    value={profileImageLink}
                    onChange={(e) => setProfileImageLink(e.target.value)}
                    required
                  />
                ) : (
                  <Form.Control 
                    type="file" 
                    onChange={handleProfileImageChange}
                    required 
                  />
                )}
              </Form.Group>

              <Form.Group controlId="photos" className="mb-3">
                <Form.Label>Additional Photos</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={handlePhotosChange}
                />
              </Form.Group>

              <Button type="submit" className={`create_button mt-3 ${loading ? 'submitting-button' : ''}`} disabled={loading}>
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    Submitting...
                  </>
                ) : (
                  "Add Team Member"
                )}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default TeamMemberForm;



