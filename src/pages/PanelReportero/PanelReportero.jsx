import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { supabase } from '../../client';
import {
    Box, Button, Card, CardContent, CardActions, Typography, TextField,
    Chip, Grid, Alert, Select, MenuItem, InputLabel, FormControl,
    Stack, InputAdornment, OutlinedInput, Switch, FormControlLabel
} from '@mui/material';
import { Add, Edit, Logout, Article, CategoryOutlined, FlagOutlined } from '@mui/icons-material';
import CardsNews from '../../Components/CardsNews/CardsNews';
import './PanelReportero.css';

const PanelReportero = () => {
    const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'news';
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [noticias, setNoticias] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingNoticia, setEditingNoticia] = useState(null);
    const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fieldErrors, setFieldErrors] = useState({});
    const [form, setForm] = useState({
        titulo: '',
        subtitulo: '',
        contenido: '',
        imagen: '',
        categoria: '',
        destacado: false
    });

    useEffect(() => {
        if (!user || user.role !== 'reportero') {
            navigate('/login');
            return;
        }
        fetchNoticias();
        fetchSecciones();
    }, [user, navigate]);

    const fetchNoticias = async () => {
        try {
            const { data: postsData, error: postsError } = await supabase
                .from('posts')
                .select('*')
                .eq('autor', user.nombre)
                .order('fechacreacion', { ascending: false });

            if (postsError) throw postsError;

            // Luego obtenemos las secciones para hacer el join manualmente
            if (postsData && postsData.length > 0) {
                const { data: seccionesData } = await supabase
                    .from('secciones')
                    .select('*');

                // Unir los datos manualmente
                const noticiasConSeccion = postsData.map(post => {
                    const seccion = seccionesData?.find(s => s.idseccion === post.categoria);
                    return {
                        ...post,
                        secciones: seccion ? { nombre: seccion.nombre } : null
                    };
                });
                setNoticias(noticiasConSeccion);
            } else {
                setNoticias([]);
            }
        } catch (error) {
            console.error('Error al cargar noticias:', error);
            showAlert('Error al cargar noticias: ' + error.message, 'error');
        }
    };

    const fetchSecciones = async () => {
        try {
            const { data, error } = await supabase
                .from('secciones')
                .select('*')
                .eq('estado', true);
            if (error) throw error;
            setSecciones(data || []);
        } catch (error) {
            console.error('Error al cargar secciones:', error);
        }
    };

    const showAlert = (message, type = 'success') => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 4000);
    };

    const handleOpenForm = (noticia = null) => {
        if (noticia) {
            setEditingNoticia(noticia);
            const sec = secciones.find(s => s.idseccion === noticia.categoria);
            setForm({
                titulo: noticia.titulo,
                subtitulo: noticia.subtitulo || '',
                contenido: noticia.contenido,
                imagen: noticia.imagen || '',
                categoria: sec?.nombre || '',
                destacado: noticia.destacado || false
            });
            if (noticia.imagen) {
                setImagePreview(noticia.imagen);
            }
        } else {
            setEditingNoticia(null);
            setForm({ titulo: '', subtitulo: '', contenido: '', imagen: '', categoria: '', destacado: false });
            setImagePreview('');
            setImageFile(null);
        }
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingNoticia(null);
        setForm({ titulo: '', subtitulo: '', contenido: '', imagen: '', categoria: '', destacado: false });
        setImageFile(null);
        setImagePreview('');
        setUploadProgress(0);
        setFieldErrors({});
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const url = URL.createObjectURL(file);
        setImagePreview(url);
        setForm((f) => ({ ...f, imagen: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.titulo.trim()) errs.titulo = 'El título es obligatorio';
        if (!form.contenido.trim()) errs.contenido = 'El contenido es obligatorio';
        if (!form.categoria) errs.categoria = 'La sección es obligatoria';
        return errs;
    };

    const withTimeout = async (promise, ms = 25000, label = 'operación') => {
        let timeoutId;
        const timeout = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
                reject(new Error(`Tiempo de espera excedido (${label})`));
            }, ms);
        });
        try {
            const result = await Promise.race([promise, timeout]);
            return result;
        } finally {
            clearTimeout(timeoutId);
        }
    };

    const handleSubmit = async (e) => {
        e?.preventDefault?.();
        setFieldErrors({});

        const errs = validate();
        if (Object.keys(errs).length) {
            setFieldErrors(errs);
            showAlert('Por favor corrige los campos marcados', 'error');
            return;
        }

        try {
            setLoading(true);
            let imageUrl = form.imagen;

            // Subir imagen si hay un archivo nuevo
            if (imageFile) {
                console.log('[upload] iniciando subida a Supabase Storage', { bucket: BUCKET });
                const filePath = `posts/${Date.now()}_${imageFile.name}`;
                await withTimeout(
                    supabase.storage.from(BUCKET).upload(filePath, imageFile, {
                        cacheControl: '3600',
                        upsert: false,
                    }),
                    25000,
                    'subida de imagen'
                );
                const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
                imageUrl = pub?.publicUrl || '';
                setUploadProgress(100);
                console.log('[upload] subida completa, url:', imageUrl);
            }

            const nowIso = new Date().toISOString();
            const seccion = secciones.find(s => s.nombre === form.categoria);
            const payload = {
                autor: user?.nombre || 'Anónimo',
                titulo: form.titulo,
                subtitulo: form.subtitulo || '',
                categoria: seccion?.idseccion || null,
                contenido: form.contenido,
                imagen: imageUrl || '',
                estado: 'Edicion', // Reportero crea noticias en estado Edicion
                destacado: Boolean(form.destacado),
                fechacreacion: editingNoticia ? editingNoticia.fechacreacion : nowIso,
                fechaactualizacion: nowIso,
            };

            if (editingNoticia) {
                // Solo puede editar si está en Edicion o Terminado
                if (editingNoticia.estado === 'Publicado' || editingNoticia.estado === 'Desactivado') {
                    showAlert('No puedes editar una noticia publicada o desactivada', 'error');
                    setLoading(false);
                    return;
                }
                const { error } = await withTimeout(
                    supabase.from('posts').update(payload).eq('id', editingNoticia.id),
                    20000,
                    'actualización de la noticia'
                );
                if (error) throw error;
                showAlert('Noticia actualizada correctamente');
            } else {
                const { data: created, error: insertErr } = await withTimeout(
                    supabase.from('posts').insert([payload]).select().single(),
                    20000,
                    'registro de la noticia'
                );
                if (insertErr) throw insertErr;
                showAlert('Noticia creada correctamente (pendiente de aprobación)');
            }

            handleCloseForm();
            fetchNoticias();
        } catch (error) {
            console.error('[submit] Error:', error);
            showAlert(error?.message || 'Error inesperado durante el guardado', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getEstadoChip = (estado) => {
        const estados = {
            'Edicion': { label: 'En Edición', color: 'default' },
            'Terminado': { label: 'Terminado', color: 'info' },
            'Publicado': { label: 'Publicado', color: 'success' },
            'Desactivado': { label: 'Desactivado', color: 'error' }
        };
        const config = estados[estado] || { label: 'Desconocido', color: 'default' };
        return <Chip label={config.label} color={config.color} size="small" />;
    };

    return (
        <Box className="panel-reportero">
            <Box className="panel-header">
                <Box className="header-content">
                    <Article sx={{ fontSize: 40, color: '#ffd700' }} />
                    <Box>
                        <Typography variant="h4" sx={{ color: '#ffd700', fontWeight: 700 }}>
                            Panel de Reportero
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                            Bienvenido, {user?.nombre}
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Logout />}
                    onClick={handleLogout}
                    sx={{
                        borderColor: '#ffd700',
                        color: '#ffd700',
                        '&:hover': {
                            borderColor: '#ffed4e',
                            backgroundColor: 'rgba(255, 215, 0, 0.1)'
                        }
                    }}
                >
                    Cerrar Sesión
                </Button>
            </Box>

            {alert.show && (
                <Alert severity={alert.type} sx={{ mb: 3 }}>
                    {alert.message}
                </Alert>
            )}

            <Box className="panel-content">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600 }}>
                        Mis Noticias
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenForm()}
                        sx={{
                            background: 'linear-gradient(90deg, #ffd700, #ffb200)',
                            color: '#000',
                            fontWeight: 700,
                            '&:hover': {
                                background: 'linear-gradient(90deg, #ffed4e, #ffd700)',
                            }
                        }}
                    >
                        Nueva Noticia
                    </Button>
                </Box>

                {showForm && (
                    <Box className="form-card-wrapper" sx={{ mb: 4 }}>
                        <Card
                            elevation={6}
                            className="form-card"
                            sx={{
                                backgroundColor: '#1a1a1a',
                                border: '2px solid #ffd700',
                                boxShadow: '0 8px 32px rgba(255, 215, 0, 0.15)',
                            }}
                        >
                            <CardContent>
                                <Stack spacing={1} sx={{ mb: 2 }}>
                                    <Typography variant="h5" component="div" sx={{ color: '#ffd700', fontWeight: 600 }}>
                                        {editingNoticia ? 'Editar Noticia' : 'Nueva Noticia'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#c0c0c0' }}>
                                        {editingNoticia ? 'Modifica los campos necesarios' : 'Las noticias quedarán pendientes de aprobación por un editor'}
                                    </Typography>
                                </Stack>

                                <Stack spacing={2} sx={{
                                    '& > *': { width: '100%' },
                                    '& .MuiTextField-root': {
                                        '& .MuiOutlinedInput-root': {
                                            color: '#f0f0f0',
                                            backgroundColor: '#0a0a0a',
                                            '& fieldset': { borderColor: '#444' },
                                            '&:hover fieldset': { borderColor: '#ffd700' },
                                            '&.Mui-focused fieldset': { borderColor: '#ffd700', borderWidth: '2px' },
                                        },
                                        '& .MuiInputLabel-root': { color: '#c0c0c0' },
                                        '& .MuiInputLabel-root.Mui-focused': { color: '#ffd700' },
                                    }
                                }}>
                                    <TextField
                                        label="Título"
                                        name="titulo"
                                        value={form.titulo}
                                        onChange={handleChange}
                                        error={Boolean(fieldErrors.titulo)}
                                        helperText={fieldErrors.titulo}
                                        required
                                        fullWidth
                                    />

                                    <TextField
                                        label="Subtítulo"
                                        name="subtitulo"
                                        value={form.subtitulo}
                                        onChange={handleChange}
                                        fullWidth
                                    />

                                    <FormControl fullWidth size="medium" error={Boolean(fieldErrors.categoria)} sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: '#f0f0f0',
                                            backgroundColor: '#0a0a0a',
                                            '& fieldset': { borderColor: '#444' },
                                            '&:hover fieldset': { borderColor: '#ffd700' },
                                            '&.Mui-focused fieldset': { borderColor: '#ffd700', borderWidth: '2px' },
                                        },
                                        '& .MuiInputLabel-root': { color: '#c0c0c0' },
                                        '& .MuiInputLabel-root.Mui-focused': { color: '#ffd700' },
                                        '& .MuiSvgIcon-root': { color: '#ffd700' },
                                    }}>
                                        <InputLabel id="section-label">Sección *</InputLabel>
                                        <Select
                                            labelId="section-label"
                                            label="Sección *"
                                            name="categoria"
                                            value={form.categoria}
                                            onChange={handleChange}
                                            input={
                                                <OutlinedInput
                                                    label="Sección *"
                                                    startAdornment={
                                                        <InputAdornment position="start">
                                                            <CategoryOutlined fontSize="small" />
                                                        </InputAdornment>
                                                    }
                                                />
                                            }
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        backgroundColor: '#1a1a1a',
                                                        border: '1px solid #444',
                                                        '& .MuiMenuItem-root': {
                                                            color: '#f0f0f0',
                                                            '&:hover': { backgroundColor: '#2a2a2a' },
                                                            '&.Mui-selected': { backgroundColor: '#ffd70020', '&:hover': { backgroundColor: '#ffd70030' } },
                                                        },
                                                    }
                                                }
                                            }}
                                        >
                                            <MenuItem value="">
                                                <em>Seleccione una sección</em>
                                            </MenuItem>
                                            {secciones.map((s) => (
                                                <MenuItem key={s.idseccion} value={s.nombre}>
                                                    {s.nombre}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldErrors.categoria && (
                                            <Typography variant="caption" sx={{ color: '#d32f2f', ml: 2, mt: 0.5 }}>
                                                {fieldErrors.categoria}
                                            </Typography>
                                        )}
                                    </FormControl>

                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={Boolean(form.destacado)}
                                                onChange={(e) => setForm((f) => ({ ...f, destacado: e.target.checked }))}
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                                        color: '#ffd700',
                                                    },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                        backgroundColor: '#ffd700',
                                                    },
                                                }}
                                            />
                                        }
                                        label="Destacado"
                                        sx={{ color: '#f0f0f0' }}
                                    />

                                    <TextField
                                        label="Contenido"
                                        name="contenido"
                                        value={form.contenido}
                                        onChange={handleChange}
                                        error={Boolean(fieldErrors.contenido)}
                                        helperText={fieldErrors.contenido}
                                        required
                                        fullWidth
                                        multiline
                                        minRows={4}
                                    />

                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            disabled={loading}
                                            sx={{
                                                borderColor: '#ffd700',
                                                color: '#ffd700',
                                                '&:hover': {
                                                    borderColor: '#ffaa00',
                                                    backgroundColor: '#ffd70010',
                                                },
                                            }}
                                        >
                                            Seleccionar imagen
                                            <input
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                onChange={handleFileChange}
                                            />
                                        </Button>
                                        <Typography variant="body2" sx={{ color: '#c0c0c0' }}>
                                            {imageFile ? imageFile.name : imagePreview ? 'Imagen actual' : 'No hay archivo seleccionado'}
                                        </Typography>
                                        {uploadProgress > 0 && uploadProgress < 100 && (
                                            <Typography variant="caption" sx={{ color: '#ffd700' }}>
                                                Subiendo: {uploadProgress}%
                                            </Typography>
                                        )}
                                    </Stack>
                                    <Box>
                                        {imagePreview || form.imagen ? (
                                            <Box className="img-preview-wrapper">
                                                <img
                                                    src={imagePreview || form.imagen}
                                                    alt="Vista previa"
                                                    className="img-preview"
                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                />
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">
                                                Vista previa de imagen
                                            </Typography>
                                        )}
                                    </Box>
                                </Stack>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'flex-end' }}>
                                <Button
                                    variant="text"
                                    onClick={handleCloseForm}
                                    disabled={loading}
                                    sx={{
                                        color: '#c0c0c0',
                                        '&:hover': {
                                            backgroundColor: '#2a2a2a',
                                        },
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    sx={{
                                        backgroundColor: '#ffd700',
                                        color: '#0a0a0a',
                                        fontWeight: 600,
                                        '&:hover': {
                                            backgroundColor: '#ffaa00',
                                        },
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : editingNoticia ? 'Actualizar' : 'Crear Noticia'}
                                </Button>
                            </CardActions>
                        </Card>
                    </Box>
                )}

                <Box className="noticias-container">
                    {noticias.length === 0 ? (
                        <Typography sx={{ color: '#999', textAlign: 'center', py: 4, width: '100%' }}>
                            No has creado ninguna noticia aún
                        </Typography>
                    ) : (
                        noticias.map((noticia) => (
                            <Box key={noticia.id} className="noticia-wrapper">
                                <CardsNews post={noticia} />
                                <Box className="noticia-actions">
                                    <Chip
                                        label={noticia.estado === 'Edicion' ? 'En Edición' :
                                            noticia.estado === 'Terminado' ? 'Terminado - Pendiente de Aprobación' :
                                                noticia.estado === 'Publicado' ? 'Publicado' : 'Desactivado'}
                                        color={noticia.estado === 'Publicado' ? 'success' :
                                            noticia.estado === 'Terminado' ? 'info' :
                                                noticia.estado === 'Desactivado' ? 'error' : 'default'}
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                    />
                                    {(noticia.estado === 'Edicion' || noticia.estado === 'Terminado') && (
                                        <>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<Edit />}
                                                onClick={() => handleOpenForm(noticia)}
                                                sx={{
                                                    background: 'linear-gradient(90deg, #ffd700, #ffb200)',
                                                    color: '#000',
                                                    fontWeight: 700,
                                                    '&:hover': {
                                                        background: 'linear-gradient(90deg, #ffed4e, #ffd700)',
                                                    }
                                                }}
                                            >
                                                Editar
                                            </Button>
                                            {noticia.estado === 'Edicion' && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<FlagOutlined />}
                                                    onClick={async () => {
                                                        try {
                                                            const { error } = await supabase
                                                                .from('posts')
                                                                .update({ estado: 'Terminado', fechaactualizacion: new Date().toISOString() })
                                                                .eq('id', noticia.id);
                                                            if (error) throw error;
                                                            showAlert('Noticia marcada como terminada');
                                                            fetchNoticias();
                                                        } catch (err) {
                                                            showAlert('Error al marcar como terminada', 'error');
                                                        }
                                                    }}
                                                    sx={{
                                                        borderColor: '#2196F3',
                                                        color: '#2196F3',
                                                        fontWeight: 700,
                                                        '&:hover': {
                                                            borderColor: '#1976D2',
                                                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                                        }
                                                    }}
                                                >
                                                    Marcar como Terminado
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </Box>
                            </Box>
                        ))
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default PanelReportero;