import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../client';
import {
    Box, Container, Typography, Chip, Avatar, IconButton, Button,
    Divider, CircularProgress, Skeleton
} from '@mui/material';
import {
    ArrowBack, AccessTime, Person, Category, Share, Favorite
} from '@mui/icons-material';
import './NoticiaDetalle.css';

const NoticiaDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [noticia, setNoticia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        fetchNoticia();
    }, [id]);

    const fetchNoticia = async () => {
        try {
            setLoading(true);
            const { data: postData, error: postError } = await supabase
                .from('posts')
                .select('*')
                .eq('id', id)
                .eq('estado', 'Publicado')
                .single();

            if (postError) throw postError;
            if (!postData) throw new Error('Noticia no encontrada');

            if (postData.categoria) {
                const { data: seccionData } = await supabase
                    .from('secciones')
                    .select('nombre')
                    .eq('idseccion', postData.categoria)
                    .single();

                if (seccionData) {
                    postData.seccion_nombre = seccionData.nombre;
                }
            }

            setNoticia(postData);
        } catch (err) {
            console.error('Error al cargar noticia:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getChipColor = (cat) => {
        if (!cat) return "#808080";
        const normalized = cat.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        let hash = 0;
        for (let i = 0; i < normalized.length; i++) {
            hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash % 360);
        const saturation = 65 + (Math.abs(hash) % 20);
        const lightness = 50 + (Math.abs(hash >> 8) % 15);
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleShare = () => {
        const shareUrl = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: noticia.titulo,
                text: noticia.subtitulo || noticia.titulo,
                url: shareUrl
            }).catch(() => {
                navigator.clipboard.writeText(shareUrl);
                alert('Enlace copiado al portapapeles');
            });
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert('Enlace copiado al portapapeles');
        }
    };

    if (loading) {
        return (
            <Box className="noticia-detalle-container">
                <Container maxWidth="md" sx={{ py: 4 }}>
                    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 3 }} />
                    <Skeleton variant="text" height={60} />
                    <Skeleton variant="text" height={40} />
                    <Skeleton variant="text" height={200} />
                </Container>
            </Box>
        );
    }

    if (error || !noticia) {
        return (
            <Box className="noticia-detalle-container">
                <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: '#ffd700', mb: 2 }}>
                        {error || 'Noticia no encontrada'}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/')}
                        sx={{
                            background: 'linear-gradient(90deg, #ffd700, #ffb200)',
                            color: '#000',
                            fontWeight: 700,
                            '&:hover': {
                                background: 'linear-gradient(90deg, #ffed4e, #ffd700)',
                            }
                        }}
                    >
                        Volver al inicio
                    </Button>
                </Container>
            </Box>
        );
    }

    return (
        <Box className="noticia-detalle-container">
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/')}
                    sx={{
                        mb: 3,
                        color: '#ffd700',
                        fontWeight: 600,
                        '&:hover': {
                            backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        }
                    }}
                >
                    Volver
                </Button>

                {noticia.imagen && (
                    <Box
                        component="img"
                        src={noticia.imagen}
                        alt={noticia.titulo}
                        sx={{
                            width: '100%',
                            maxHeight: 500,
                            objectFit: 'cover',
                            borderRadius: 3,
                            mb: 3,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                        }}
                    />
                )}

                {noticia.seccion_nombre && (
                    <Chip
                        icon={<Category />}
                        label={noticia.seccion_nombre}
                        sx={{
                            mb: 2,
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            backgroundColor: getChipColor(noticia.seccion_nombre),
                            color: '#fff',
                            '& .MuiChip-icon': {
                                color: '#fff'
                            }
                        }}
                    />
                )}

                <Typography
                    variant="h3"
                    sx={{
                        color: '#ffd700',
                        fontWeight: 800,
                        mb: 2,
                        lineHeight: 1.2,
                        fontSize: { xs: '2rem', md: '3rem' }
                    }}
                >
                    {noticia.titulo}
                </Typography>

                {noticia.subtitulo && (
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#c0c0c0',
                            fontWeight: 500,
                            mb: 3,
                            lineHeight: 1.5,
                            fontSize: { xs: '1.1rem', md: '1.3rem' }
                        }}
                    >
                        {noticia.subtitulo}
                    </Typography>
                )}

                <Divider sx={{ borderColor: '#333', mb: 3 }} />

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                            sx={{
                                bgcolor: '#ffd700',
                                color: '#000',
                                fontWeight: 700,
                                width: 40,
                                height: 40
                            }}
                        >
                            {noticia.autor?.[0]?.toUpperCase() || 'A'}
                        </Avatar>
                        <Box>
                            <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
                                Autor
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#ffd700', fontWeight: 600 }}>
                                {noticia.autor || 'Anónimo'}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ color: '#ffd700', fontSize: 20 }} />
                        <Box>
                            <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
                                Publicado
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#c0c0c0' }}>
                                {formatDate(noticia.fechacreacion)}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
                        <IconButton
                            onClick={() => setLiked(!liked)}
                            sx={{
                                color: liked ? '#ff4444' : '#666',
                                '&:hover': {
                                    color: '#ff4444',
                                    transform: 'scale(1.1)',
                                }
                            }}
                        >
                            <Favorite />
                        </IconButton>
                        <IconButton
                            onClick={handleShare}
                            sx={{
                                color: '#ffd700',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                }
                            }}
                        >
                            <Share />
                        </IconButton>
                    </Box>
                </Box>

                <Divider sx={{ borderColor: '#333', mb: 4 }} />

                <Box
                    sx={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: 3,
                        p: 4,
                        border: '1px solid #333',
                    }}
                >
                    <Typography
                        sx={{
                            color: '#e0e0e0',
                            fontSize: '1.1rem',
                            lineHeight: 1.8,
                            whiteSpace: 'pre-line',
                            '& p': {
                                mb: 2
                            }
                        }}
                    >
                        {noticia.contenido}
                    </Typography>
                </Box>

                {noticia.fechaactualizacion && noticia.fechaactualizacion !== noticia.fechacreacion && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#666',
                            display: 'block',
                            mt: 3,
                            textAlign: 'center'
                        }}
                    >
                        Última actualización: {formatDate(noticia.fechaactualizacion)}
                    </Typography>
                )}
            </Container>
        </Box>
    );
};

export default NoticiaDetalle;
