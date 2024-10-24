import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Button, Card, Col, Row, Spinner } from 'react-bootstrap';

const Moderation = () => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const newsRef = collection(db, 'news');
        const querySnapshot = await getDocs(newsRef);
        const unapprovedArticles = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(article => !article.isApproved);
        setArticles(unapprovedArticles);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleApprove = async (articleId) => {
    try {
      const articleRef = doc(db, 'news', articleId);
      await updateDoc(articleRef, { isApproved: true });
      setArticles(articles.filter(article => article.id !== articleId));
    } catch (err) {
      console.error('Error approving article:', err);
    }
  };

  const handleReject = async (articleId) => {
    try {
      const articleRef = doc(db, 'news', articleId);
      await updateDoc(articleRef, { isApproved: false });
      setArticles(articles.filter(article => article.id !== articleId));
    } catch (err) {
      console.error('Error rejecting article:', err);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Moderate News Articles</h1>
      {isLoading && <Spinner animation="border" />}
      {error && <p className="text-danger">Error: {error}</p>}
      {!isLoading && articles.length === 0 && <p>No articles to moderate.</p>}
      {!isLoading && articles.length > 0 && (
        <Row xs={1} md={2} lg={3} className="g-4">
          {articles.map(article => (
            <Col key={article.id}>
              <Card>
                <Card.Img variant="top" src={article.coverImage} alt={article.title} style={{ padding: 15 }} />
                <Card.Body>
                  <Card.Title>{article.title}</Card.Title>
                  <Card.Text>{article.content.substring(0, 100)}...</Card.Text>
                  <div className="d-flex justify-content-between mt-auto">
                    <Button className='create_button' size="sm" onClick={() => handleApprove(article.id)}>Approve</Button>
                    <Button variant="danger" size="sm" onClick={() => handleReject(article.id)}>Reject</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Moderation;
