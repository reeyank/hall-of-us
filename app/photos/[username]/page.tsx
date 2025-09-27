"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function UserPhotosPage() {
  const { username } = useParams();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;

    async function fetchUserPhotos() {
      try {
        const response = await fetch(`http://localhost:8000/photos/user/${username}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPhotos(data.photos);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserPhotos();
  }, [username]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
        <h1 style={{ color: '#333' }}>Loading {username}'s photos...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
        <h1 style={{ color: 'red' }}>Error: {error.message}</h1>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', paddingTop: '20px', paddingBottom: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '24px' }}>{username}'s Photos</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px', margin: '0 auto' }}>
        {photos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#555' }}>No photos found for {username}.</p>
        ) : (
          photos.map((photo: any, index: number) => (
            <div key={index} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ padding: '12px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
                <span style={{ fontWeight: 'bold', color: '#333' }}>@{photo.user_id || 'anonymous'}</span>
              </div>
              <img src={photo.url} alt={`Photo by ${photo.user_id || 'anonymous'}`} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
              <div style={{ padding: '12px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', marginRight: '8px', color: '#ff69b4' }}>❤️</button>
                  <span style={{ color: '#555' }}>{photo.likes} likes</span>
                </div>
                <p style={{ marginBottom: '8px', color: '#333', lineHeight: '1.4' }}>{photo.description || 'No description available.'}</p>
                <div style={{ color: '#888', fontSize: '0.9em', cursor: 'pointer' }}>
                  <span>View all comments</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
