import React, { useState } from 'react';
import { Row, Col, Card, Form, Button, DropdownButton, Dropdown, Spinner, Alert } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { auth, db, storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import 'react-quill/dist/quill.snow.css';

const AdminNewsForm = () => {
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Articles');
  const [coverImage, setCoverImage] = useState(null);
  const [coverImageLink, setCoverImageLink] = useState('');
  const [isCoverArticle, setIsCoverArticle] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [file, setFile] = useState(null);

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  const handleCoverImageChange = (e) => {
    setCoverImage(e.target.files[0]);
    setCoverImageLink('');
  };

  const handleCoverArticleChange = (e) => {
    setIsCoverArticle(e.target.checked);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setFile(file);
    try {
      if (file.type === "application/pdf") {
        const content = await extractTextFromPDF(file);
        setContent(content);
      } else if (file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const content = await extractTextFromWord(file);
        setContent(content);
      }
    } catch (error) {
      console.error('Error extracting text from file:', error);
      setErrorMessage('Error extracting text from file. Please try again.');
    }
  };

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    let text = '';
    pages.forEach(page => {
      text += page.getTextContent();
    });
    return text;
  };

  const extractTextFromWord = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value;
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
      let imageUrl = coverImageLink;
      if (coverImage) {
        const imageRef = ref(storage, `news-covers/${coverImage.name}`);
        await uploadBytes(imageRef, coverImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      const newsData = {
        title,
        category,
        content,
        coverImage: imageUrl,
        isCoverArticle,
        createdAt: serverTimestamp(),
        isPublished: true, 
      };

      const newsRef = collection(db, 'news');
      await addDoc(newsRef, newsData);

      setSuccessMessage('News article submitted successfully!');
      console.log('News article submitted successfully!');

      // Reset form
      setTitle('');
      setCategory('Articles');
      setContent('');
      setCoverImage(null);
      setCoverImageLink('');
      setIsCoverArticle(false);
      setFile(null);
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
            <Card.Title>Create News Article</Card.Title>
          </Card.Header>
          <Card.Body>
            {errorMessage && <Alert variant="danger" className="mb-4">{errorMessage}</Alert>}
            {successMessage && <Alert variant="success" className="mb-4">{successMessage}</Alert>}
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  type="text"
                  placeholder="Enter title"
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a title for the news article.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="category" className="mb-3">
                <Form.Label>Category</Form.Label>
                <DropdownButton id="dropdown-category" title={category}>
                  <Dropdown.Item onClick={() => handleCategorySelect('Articles')}>Articles</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleCategorySelect('Events')}>Events</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleCategorySelect('News')}>News</Dropdown.Item>
                </DropdownButton>
              </Form.Group>

              <Form.Group controlId="coverImage" className="mb-3">
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

              <Form.Group controlId="isCoverArticle" className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Set as cover article"
                  checked={isCoverArticle}
                  onChange={handleCoverArticleChange}
                />
              </Form.Group>

              <Form.Group className="mb-8" controlId="formBasicContent">
                <Form.Label>Content</Form.Label>
                <ReactQuill
                  value={content}
                  onChange={setContent}
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
                  style={{ height: '300px' }}
                />
                <Form.Control.Feedback type="invalid">
                  Please provide content for the news article.
                </Form.Control.Feedback>
              </Form.Group>  
              <Button type="submit" className={`create_button mt-5 ${loading ? 'submitting-button' : ''}`} disabled={loading}>
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AdminNewsForm;









// import React, { useState } from 'react';
// import { Row, Col, Card, Form, Button, DropdownButton, Dropdown, Spinner, Alert } from 'react-bootstrap';
// import { EditorState, convertToRaw } from 'draft-js';
// import { Editor } from 'react-draft-wysiwyg';
// import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
// import draftToHtml from 'draftjs-to-html';
// import { auth, db, storage } from '../../config/firebase';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
// import { PDFDocument } from 'pdf-lib';
// import mammoth from 'mammoth';

// const AdminNewsForm = () => {
//   const [validated, setValidated] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [content, setContent] = useState(EditorState.createEmpty());
//   const [title, setTitle] = useState('');
//   const [category, setCategory] = useState('Articles');
//   const [coverImage, setCoverImage] = useState(null);
//   const [coverImageUrl, setCoverImageUrl] = useState(null);
//   const [isCoverArticle, setIsCoverArticle] = useState(false);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [file, setFile] = useState(null);

//   const handleCategorySelect = (selectedCategory) => {
//     setCategory(selectedCategory);
//   };

//   const handleCoverImageChange = (e) => {
//     const file = e.target.files[0];
//     setCoverImage(file);
//   };

//   const handleCoverArticleChange = (e) => {
//     setIsCoverArticle(e.target.checked);
//   };

//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     setFile(file);
//     try {
//       if (file.type === "application/pdf") {
//         const content = await extractTextFromPDF(file);
//         setContent(EditorState.createWithContent(content));
//       } else if (file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
//         const content = await extractTextFromWord(file);
//         setContent(EditorState.createWithContent(content));
//       }
//     } catch (error) {
//       console.error('Error extracting text from file:', error);
//       setErrorMessage('Error extracting text from file. Please try again.');
//     }
//   };

//   const extractTextFromPDF = async (file) => {
//     const arrayBuffer = await file.arrayBuffer();
//     const pdfDoc = await PDFDocument.load(arrayBuffer);
//     const pages = pdfDoc.getPages();
//     let text = '';
//     pages.forEach(page => {
//       text += page.getTextContent();
//     });
//     return text;
//   };

//   const extractTextFromWord = async (file) => {
//     const arrayBuffer = await file.arrayBuffer();
//     const { value } = await mammoth.extractRawText({ arrayBuffer });
//     return value;
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
//       let imageUrl;
//       if (coverImage) {
//         const imageRef = ref(storage, `news-covers/${coverImage.name}`);
//         await uploadBytes(imageRef, coverImage);
//         imageUrl = await getDownloadURL(imageRef);
//         setCoverImageUrl(imageUrl);
//       }

//       const rawContentState = convertToRaw(content.getCurrentContent());
//       const htmlContent = draftToHtml(rawContentState);

//       const newsData = {
//         title,
//         category,
//         content: htmlContent,
//         coverImage: imageUrl,
//         isCoverArticle,
//         createdAt: serverTimestamp(), 
//       };

//       const newsRef = collection(db, 'news');
//       await addDoc(newsRef, newsData);

//       setSuccessMessage('News article submitted successfully!');
//       console.log('News article submitted successfully!');

//       // Reset form
//       setTitle('');
//       setCategory('Articles');
//       setContent(EditorState.createEmpty());
//       setCoverImage(null);
//       setCoverImageUrl(null);
//       setIsCoverArticle(false);
//       setFile(null);
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
//             <Card.Title>Create News Article</Card.Title>
//           </Card.Header>
//           <Card.Body>
//             {errorMessage && <Alert variant="danger" className="mb-4">{errorMessage}</Alert>}
//             {successMessage && <Alert variant="success" className="mb-4">{successMessage}</Alert>}
//             <Form noValidate validated={validated} onSubmit={handleSubmit}>
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
//                   Please provide a title for the news article.
//                 </Form.Control.Feedback>
//               </Form.Group>

//               <Form.Group controlId="category" className="mb-3">
//                 <Form.Label>Category</Form.Label>
//                 <DropdownButton id="dropdown-category" title={category}>
//                   <Dropdown.Item onClick={() => handleCategorySelect('Articles')}>Articles</Dropdown.Item>
//                   <Dropdown.Item onClick={() => handleCategorySelect('Events')}>Events</Dropdown.Item>
//                   <Dropdown.Item onClick={() => handleCategorySelect('News')}>News</Dropdown.Item>
//                 </DropdownButton>
//               </Form.Group>

//               <Form.Group controlId="coverImage" className="mb-3">
//                 <Form.Label>Cover Image</Form.Label>
//                 <Form.Control type="file" onChange={handleCoverImageChange} />
//               </Form.Group>

//               <Form.Group controlId="isCoverArticle" className="mb-3">
//                 <Form.Check
//                   type="checkbox"
//                   label="Set as cover article"
//                   checked={isCoverArticle}
//                   onChange={handleCoverArticleChange}
//                 />
//               </Form.Group>

//               <Form.Group className="mb-8" controlId="formBasicContent">
//                 <Form.Label>Content</Form.Label>
//                 <Editor
//                   editorState={content}
//                   toolbarClassName="toolbarClassName"
//                   wrapperClassName="wrapperClassName"
//                   editorClassName="editorClassName"
//                   onEditorStateChange={setContent}
//                   placeholder="Enter content"
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   Please provide content for the news article.
//                 </Form.Control.Feedback>
//               </Form.Group>  
//               <Button type="submit" className='create_button mt-5' disabled={loading}>
//                 {loading ? (
//                   <>
//                     <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
//                     Submitting...
//                   </>
//                 ) : (
//                   "Submit"
//                 )}
//               </Button>
//             </Form>
//           </Card.Body>
//         </Card>
//       </Col>
//     </Row>
//   );
// };

// export default AdminNewsForm;
