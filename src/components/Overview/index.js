import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { Button, ButtonGroup, Card, Col, Form, Modal, Row, Spinner, Toast, ToastContainer, DropdownButton, Dropdown } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Overview = () => {
    const [newsArticles, setNewsArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingArticle, setEditingArticle] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedArticleId, setSelectedArticleId] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [coverImageLink, setCoverImageLink] = useState('');
    const [useImageLink, setUseImageLink] = useState(false);

    const fetchNewsArticles = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const newsRef = collection(db, 'news');
            const querySnapshot = await getDocs(newsRef);
            const articles = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            articles.sort((a, b) => b.createdAt - a.createdAt);
            setNewsArticles(articles);
        } catch (err) {
            console.error('Error fetching news articles:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNewsArticles();
    }, []);

    const handlePublishToggle = async (articleId, currentState) => {
        try {
            const articleRef = doc(db, 'news', articleId);
            await updateDoc(articleRef, {
                isPublished: !currentState,
            });
            setNewsArticles((prevArticles) =>
                prevArticles.map((article) =>
                    article.id === articleId ? { ...article, isPublished: !currentState } : article
                )
            );
            setToastMessage('Article publish state updated successfully!');
            setShowToast(true);
        } catch (err) {
            console.error('Error updating article publish state:', err);
            setError('Failed to update publish state');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, 'news', selectedArticleId));
            setNewsArticles((prevArticles) =>
                prevArticles.filter((article) => article.id !== selectedArticleId)
            );
            setShowDeleteModal(false);
            setToastMessage('Article deleted successfully!');
            setShowToast(true);
        } catch (err) {
            console.error('Error deleting article:', err);
            setError('Failed to delete article');
        }
    };

    const handleEdit = (article) => {
        setEditingArticle(article);
        setUseImageLink(article.coverImage.startsWith('http'));
        setCoverImageLink(article.coverImage.startsWith('http') ? article.coverImage : '');
        setCoverImage(null);
        setShowEditModal(true);
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const { id, title, content, category, isCoverArticle } = editingArticle;

        try {
            let imageUrl = editingArticle.coverImage;
            if (useImageLink) {
                imageUrl = coverImageLink;
            } else if (coverImage) {
                const imageRef = ref(storage, `news-covers/${coverImage.name}`);
                await uploadBytes(imageRef, coverImage);
                imageUrl = await getDownloadURL(imageRef);
            }

            const articleRef = doc(db, 'news', id);
            await updateDoc(articleRef, { 
                title, 
                content, 
                category, 
                coverImage: imageUrl, 
                isCoverArticle 
            });

            setNewsArticles((prevArticles) =>
                prevArticles.map((article) =>
                    article.id === id ? { ...article, title, content, category, coverImage: imageUrl, isCoverArticle } : article
                )
            );
            setShowEditModal(false);
            setToastMessage('Article updated successfully!');
            setShowToast(true);
        } catch (err) {
            console.error('Error updating article:', err);
            setError('Failed to update article');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setEditingArticle((prevArticle) => ({
            ...prevArticle,
            [name]: value,
        }));
    };

    const handleQuillChange = (value) => {
        setEditingArticle((prevArticle) => ({
            ...prevArticle,
            content: value,
        }));
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        setCoverImage(file);
        setCoverImageLink('');
    };

    const handleCoverImageLinkChange = (e) => {
        setCoverImageLink(e.target.value);
        setCoverImage(null);
    };

    const handleCategorySelect = (selectedCategory) => {
        setEditingArticle((prevArticle) => ({
            ...prevArticle,
            category: selectedCategory,
        }));
    };

    const createMarkup = (html) => {
        return { __html: html };
    };

    return (
        <div className="container mt-5">
            <h1>News Articles</h1>
            {isLoading && <Spinner animation="border" />}
            {error && <p className="text-danger">Error: {error}</p>}
            {!isLoading && newsArticles.length === 0 && <p>No news articles found.</p>}
            {!isLoading && newsArticles.length > 0 && (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {newsArticles.map((article) => (
                        <Col key={article.id}>
                            <Card className="h-100">
                                <Card.Img
                                    variant="top"
                                    src={article.coverImage}
                                    alt={article.title}
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{article.title}</Card.Title>
                                    <Card.Text style={{ color: '#888' }} dangerouslySetInnerHTML={createMarkup(article.content.length > 180 ? article.content.substring(0, 100) + '...' : article.content)}></Card.Text>
                                    <div className="d-flex justify-content-between mt-auto">
                                        <ButtonGroup>
                                            <button
                                                className="custom-button"
                                                size="sm"
                                                onClick={() => handleEdit(article)}
                                            >
                                                Edit
                                            </button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedArticleId(article.id);
                                                    setShowDeleteModal(true);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </ButtonGroup>
                                        <Form.Check
                                            type="switch"
                                            id={`is-published-${article.id}`}
                                            label={article.isPublished ? 'Published' : 'Publish'}
                                            checked={article.isPublished}
                                            onChange={() =>
                                                handlePublishToggle(article.id, article.isPublished)
                                            }
                                            className="custom-switch"
                                        />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
            {editingArticle && (
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Article</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleEditSubmit}>
                            <Form.Group controlId="formTitle">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={editingArticle.title}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group controlId="category" className="mt-3">
                                <Form.Label>Category</Form.Label>
                                <DropdownButton id="dropdown-category" title={editingArticle.category}>
                                    <Dropdown.Item onClick={() => handleCategorySelect('Articles')}>Articles</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleCategorySelect('Events')}>Events</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleCategorySelect('News')}>News</Dropdown.Item>
                                </DropdownButton>
                            </Form.Group>
                            <Form.Group controlId="formCoverImage" className="mt-3">
                                <Form.Label>Cover Image</Form.Label>
                                <Form.Check 
                                    type="switch"
                                    id="cover-image-switch"
                                    label={useImageLink ? "Image Link" : "Image File"}
                                    checked={useImageLink}
                                    onChange={() => setUseImageLink(!useImageLink)}
                                    className="mb-2"
                                />
                                {useImageLink ? (
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Enter image URL"
                                        value={coverImageLink}
                                        onChange={handleCoverImageLinkChange}
                                    />
                                ) : (
                                    <Form.Control 
                                        type="file" 
                                        onChange={handleCoverImageChange}
                                    />
                                )}
                            </Form.Group>
                            <Form.Group controlId="isCoverArticle" className="mt-3">
                                <Form.Check
                                    type="checkbox"
                                    label="Set as cover article"
                                    name="isCoverArticle"
                                    checked={editingArticle.isCoverArticle}
                                    onChange={(e) =>
                                        setEditingArticle((prevArticle) => ({
                                            ...prevArticle,
                                            isCoverArticle: e.target.checked,
                                        }))
                                    }
                                />
                            </Form.Group>
                            <Form.Group controlId="formContent" className="mt-3">
                                <Form.Label>Content</Form.Label>
                                <ReactQuill
                                    value={editingArticle.content}
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
                                    style={{ height: 'auto' }}
                                />
                            </Form.Group>
                            <Button
                                type="submit"
                                className=" create_button mt-16"
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
                <Modal.Body>Are you sure you want to delete this article?</Modal.Body>
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
                <Toast
                    onClose={() => setShowToast(false)}
                    show={showToast}
                    delay={3000}
                    autohide
                    bg="success"
                >
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
};

export default Overview;