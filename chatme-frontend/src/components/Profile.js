// src/components/Profile.js
import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/profileService';

// MUI Components
import { 
  Container, 
  Box, 
  Typography, 
  Avatar, 
  Button, 
  TextField, 
  Paper, 
  Stack 
} from '@mui/material';

const Profile = () => {
    const [profile, setProfile] = useState({
        display_name: '',
        phone_number: '',
        image: null,
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getProfile();
                console.log(data);
                setPreviewImage(data.image || null);
                setProfile({
                    display_name: data.display_name || '',
                    phone_number: data.phone_number || '',
                    image: data.image || null,
                });
                setLoading(false);
            } catch (err) {
                setError('Failed to load profile');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image' && files && files.length > 0) {
            setProfile((prev) => ({
                ...prev,
                image: files[0],
            }));
            setPreviewImage(URL.createObjectURL(files[0]));
        } else {
            setProfile((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData();
        formData.append('display_name', profile.display_name);
        formData.append('phone_number', profile.phone_number);
        if (profile.image instanceof File) {
            formData.append('image', profile.image);
        }

        try {
            const updatedData = await updateProfile(formData);
            setProfile({
                display_name: updatedData.display_name,
                phone_number: updatedData.phone_number,
                image: updatedData.image,
            });
            if (updatedData.image) {
                setPreviewImage(updatedData.image);
            }
            alert('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update profile');
        }
    };

    if (loading) return <Container sx={{ mt: 5 }}><Typography>Loading...</Typography></Container>;
    if (error) return <Container sx={{ mt: 5 }}><Typography color="error">{error}</Typography></Container>;

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Box display="flex" flexDirection="column" alignItems="center">
                    <Typography variant="h4" gutterBottom>Your Profile</Typography>
                    <Avatar 
                        src={previewImage || ''}
                        alt="Profile" 
                        sx={{ width: 100, height: 100, mb: 2 }} 
                    />
                </Box>

                {!isEditing ? (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body1"><strong>Name:</strong> {profile.display_name}</Typography>
                        <Typography variant="body1"><strong>Phone:</strong> {profile.phone_number}</Typography>
                        
                        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={() => setIsEditing(true)}
                            >
                                Update
                            </Button>
                        </Stack>
                    </Box>
                ) : (
                    <Box 
                        component="form" 
                        onSubmit={handleSubmit} 
                        sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
                        encType="multipart/form-data"
                    >
                        <TextField
                            label="Name"
                            name="display_name"
                            value={profile.display_name}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Phone Number"
                            name="phone_number"
                            value={profile.phone_number}
                            onChange={handleChange}
                            fullWidth
                        />
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Profile Image</Typography>
                            <Button
                                variant="outlined"
                                component="label"
                            >
                                Choose File
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    hidden
                                    onChange={handleChange}
                                />
                            </Button>
                            {profile.image instanceof File && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Selected: {profile.image.name}
                                </Typography>
                            )}
                        </Box>
                        
                        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 3 }}>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                type="submit"
                            >
                                Save
                            </Button>
                            <Button 
                                variant="outlined" 
                                color="secondary" 
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </Button>
                        </Stack>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default Profile;
