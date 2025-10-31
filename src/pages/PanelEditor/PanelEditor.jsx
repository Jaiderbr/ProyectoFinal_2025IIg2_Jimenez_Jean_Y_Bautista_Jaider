import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { supabase } from '../../client';
import {
    Box, Button, Card, CardContent, CardActions, Typography, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab,
    Chip, Grid, Alert, Select, MenuItem, InputLabel, FormControl,
    Switch, FormControlLabel
} from '@mui/material';
import {
    Edit, Logout, CheckCircle, Cancel, Visibility, VerifiedUser, Delete, Add
} from '@mui/icons-material';
import './PanelEditor.css';

const PanelEditor = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [noticias, setNoticias] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedNoticia, setSelectedNoticia] = useState(null);
    const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
    const [form, setForm] = useState({
        titulo: '',
        subtitulo: '',
        contenido: '',
        imagen: '',
        categoria: ''
    });


    const [seccionesAdmin, setSeccionesAdmin] = useState([]);
    const [openSeccionDialog, setOpenSeccionDialog] = useState(false);
    const [editingSeccion, setEditingSeccion] = useState(null);
    const [seccionForm, setSeccionForm] = useState({
        nombre: '',
        descripcion: '',
        estado: true
    });

    useEffect(() => {
        if (!user || user.role !== 'editor') {
            navigate('/login');
            return;
        }
        fetchNoticias();
        fetchSecciones();
        fetchSeccionesAdmin();
    }, [user, navigate]);

    const fetchNoticias = async () => {
        try {

            const { data: postsData, error: postsError } = await supabase
                .from('posts')
                .select('*')
                .in('estado', ['Terminado', 'Publicado', 'Desactivado'])
                .order('fechacreacion', { ascending: false });

            if (postsError) throw postsError;


            if (postsData && postsData.length > 0) {
                const { data: seccionesData } = await supabase
                    .from('secciones')
                    .select('*');


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

    const fetchSeccionesAdmin = async () => {
        try {
            const { data, error } = await supabase
                .from('secciones')
                .select('*')
                .order('nombre', { ascending: true });
            if (error) throw error;
            setSeccionesAdmin(data || []);
        } catch (error) {
            console.error('Error al cargar secciones (admin):', error);
        }
    };

    const showAlert = (message, type = 'success') => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 4000);
    };


    const handleOpenSeccionDialog = (seccion = null) => {
        if (seccion) {
            setEditingSeccion(seccion);
            setSeccionForm({
                nombre: seccion.nombre || '',
                descripcion: seccion.descripcion || '',
                estado: seccion.estado !== false
            });
        } else {
            setEditingSeccion(null);
            setSeccionForm({ nombre: '', descripcion: '', estado: true });
        }
        setOpenSeccionDialog(true);
    };

    const handleCloseSeccionDialog = () => {
        setOpenSeccionDialog(false);
        setEditingSeccion(null);
        setSeccionForm({ nombre: '', descripcion: '', estado: true });
    };

    const handleSaveSeccion = async () => {
        if (!seccionForm.nombre.trim()) {
            showAlert('El nombre de la sección es obligatorio', 'error');
            return;
        }
        try {
            if (editingSeccion) {
                const { error } = await supabase
                    .from('secciones')
                    .update({
                        nombre: seccionForm.nombre.trim(),
                        descripcion: seccionForm.descripcion.trim(),
                        estado: Boolean(seccionForm.estado)
                    })
                    .eq('idseccion', editingSeccion.idseccion);
                if (error) throw error;
                showAlert('Sección actualizada correctamente');
            } else {
                const { error } = await supabase
                    .from('secciones')
                    .insert([{
                        nombre: seccionForm.nombre.trim(),
                        descripcion: seccionForm.descripcion.trim(),
                        estado: Boolean(seccionForm.estado)
                    }]);
                if (error) throw error;
                showAlert('Sección creada correctamente');
            }
            handleCloseSeccionDialog();
            fetchSeccionesAdmin();
            fetchSecciones();
        } catch (error) {
            console.error('Error guardando sección:', error);
            showAlert('Error guardando la sección', 'error');
        }
    };

    const handleToggleSeccion = async (seccion) => {
        try {
            const { error } = await supabase
                .from('secciones')
                .update({ estado: !seccion.estado })
                .eq('idseccion', seccion.idseccion);
            if (error) throw error;
            fetchSeccionesAdmin();
            fetchSecciones();
        } catch (error) {
            showAlert('Error al cambiar estado de la sección', 'error');
        }
    };

    const handleDeleteSeccion = async (seccion) => {
        if (!window.confirm(`¿Eliminar la sección "${seccion.nombre}"?`)) return;
        try {

            const { count, error: countError } = await supabase
                .from('posts')
                .select('id', { count: 'exact' })
                .eq('categoria', seccion.idseccion);
            if (countError) throw countError;
            if ((count || 0) > 0) {
                showAlert('No se puede eliminar: hay noticias asociadas a esta sección', 'error');
                return;
            }

            const { error } = await supabase
                .from('secciones')
                .delete()
                .eq('idseccion', seccion.idseccion);
            if (error) throw error;
            showAlert('Sección eliminada');
            fetchSeccionesAdmin();
            fetchSecciones();
        } catch (error) {
            console.error('Error eliminando sección:', error);
            showAlert('Error eliminando la sección', 'error');
        }
    };

    const handleOpenDialog = (noticia, mode = 'view') => {
        setSelectedNoticia({ ...noticia, mode });
        if (mode === 'edit') {
            const sec = secciones.find(s => s.idseccion === noticia.categoria);
            setForm({
                titulo: noticia.titulo,
                subtitulo: noticia.subtitulo || '',
                contenido: noticia.contenido,
                imagen: noticia.imagen || '',
                categoria: sec?.nombre || ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedNoticia(null);
        setForm({ titulo: '', subtitulo: '', contenido: '', imagen: '', categoria: '' });
    };

    const handlePublicar = async (noticiaId) => {
        try {
            const { error } = await supabase
                .from('posts')
                .update({
                    estado: 'Publicado',
                    fechaactualizacion: new Date().toISOString()
                })
                .eq('id', noticiaId);
            if (error) {
                console.error('Error detallado:', error);
                throw error;
            }
            showAlert('Noticia publicada correctamente');
            fetchNoticias();
        } catch (error) {
            console.error('Error al publicar:', error);
            showAlert('Error al publicar noticia: ' + (error.message || 'Error desconocido'), 'error');
        }
    };

    const handleDesactivar = async (noticiaId) => {
        try {
            const { error } = await supabase
                .from('posts')
                .update({ estado: 'Desactivado' })
                .eq('id', noticiaId);
            if (error) throw error;
            showAlert('Noticia desactivada correctamente');
            fetchNoticias();
        } catch (error) {
            console.error('Error al desactivar:', error);
            showAlert('Error al desactivar noticia', 'error');
        }
    };

    const handleEliminar = async (noticiaId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta noticia? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', noticiaId);
            if (error) throw error;
            showAlert('Noticia eliminada correctamente');
            fetchNoticias();
        } catch (error) {
            console.error('Error al eliminar:', error);
            showAlert('Error al eliminar noticia', 'error');
        }
    };

    const handleEdit = async () => {
        if (!form.titulo || !form.contenido || !form.categoria) {
            showAlert('Por favor completa los campos requeridos', 'error');
            return;
        }

        try {
            const seccion = secciones.find(s => s.nombre === form.categoria);
            const { error } = await supabase
                .from('posts')
                .update({
                    titulo: form.titulo,
                    subtitulo: form.subtitulo,
                    contenido: form.contenido,
                    imagen: form.imagen,
                    categoria: seccion?.idseccion || null,
                    fechaactualizacion: new Date().toISOString()
                })
                .eq('id', selectedNoticia.id);
            if (error) throw error;
            showAlert('Noticia actualizada correctamente');
            handleCloseDialog();
            fetchNoticias();
        } catch (error) {
            console.error('Error al actualizar:', error);
            showAlert('Error al actualizar noticia', 'error');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getEstadoChip = (estado) => {
        const estados = {
            'Edicion': { label: 'En Edición', color: 'default', icon: null },
            'Terminado': { label: 'Terminado', color: 'info', icon: null },
            'Publicado': { label: 'Publicado', color: 'success', icon: <CheckCircle /> },
            'Desactivado': { label: 'Desactivado', color: 'error', icon: <Cancel /> }
        };
        const config = estados[estado] || { label: 'Desconocido', color: 'default', icon: null };
        return <Chip label={config.label} color={config.color} size="small" icon={config.icon} />;
    };

    const noticiasPendientes = noticias.filter(n => n.estado === 'Terminado' || n.estado === 'Desactivado');
    const noticiasPublicadas = noticias.filter(n => n.estado === 'Publicado');
    const noticiasActuales = tabValue === 0 ? noticiasPendientes : noticiasPublicadas;

    return (
        <Box className="panel-editor">
            <Box className="panel-header">
                <Box className="header-content">
                    <VerifiedUser sx={{ fontSize: 40, color: '#ffd700' }} />
                    <Box>
                        <Typography variant="h4" sx={{ color: '#ffd700', fontWeight: 700 }}>
                            Panel de Editor
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
                <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    sx={{
                        mb: 3,
                        '& .MuiTab-root': { color: '#999', fontWeight: 600 },
                        '& .Mui-selected': { color: '#ffd700' },
                        '& .MuiTabs-indicator': { backgroundColor: '#ffd700' }
                    }}
                >
                    <Tab label={`Pendientes (${noticiasPendientes.length})`} />
                    <Tab label={`Publicadas (${noticiasPublicadas.length})`} />
                    <Tab label={`Secciones (${seccionesAdmin.length})`} />
                </Tabs>

                {tabValue !== 2 ? (
                    <Grid container spacing={3}>
                        {noticiasActuales.length === 0 ? (
                            <Grid item xs={12}>
                                <Typography sx={{ color: '#999', textAlign: 'center', py: 4 }}>
                                    {tabValue === 0 ? 'No hay noticias pendientes' : 'No hay noticias publicadas'}
                                </Typography>
                            </Grid>
                        ) : (
                            noticiasActuales.map((noticia) => (
                                <Grid item xs={12} md={6} lg={4} key={noticia.id}>
                                    <Card className="noticia-card">
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                {getEstadoChip(noticia.estado)}
                                                <Chip
                                                    label={noticia.secciones?.nombre || 'Sin sección'}
                                                    size="small"
                                                    sx={{ backgroundColor: '#333', color: '#ffd700' }}
                                                />
                                            </Box>
                                            <Typography variant="h6" sx={{ color: '#ffd700', fontWeight: 700, mb: 1 }}>
                                                {noticia.titulo}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
                                                {noticia.subtitulo}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                                Autor: {noticia.autor}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#666' }}>
                                                Creada: {new Date(noticia.fechacreacion).toLocaleDateString()}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ gap: 1, flexWrap: 'wrap' }}>
                                            <Button
                                                size="small"
                                                startIcon={<Visibility />}
                                                onClick={() => handleOpenDialog(noticia, 'view')}
                                                sx={{
                                                    color: '#ffd700',
                                                    '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.1)' }
                                                }}
                                            >
                                                Ver
                                            </Button>
                                            <Button
                                                size="small"
                                                startIcon={<Edit />}
                                                onClick={() => handleOpenDialog(noticia, 'edit')}
                                                sx={{
                                                    color: '#4CAF50',
                                                    '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                                                }}
                                            >
                                                Editar
                                            </Button>
                                            {noticia.estado === 'Publicado' ? (
                                                <Button
                                                    size="small"
                                                    startIcon={<Cancel />}
                                                    onClick={() => handleDesactivar(noticia.id)}
                                                    sx={{
                                                        color: '#f44336',
                                                        '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                                                    }}
                                                >
                                                    Desactivar
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="small"
                                                    startIcon={<CheckCircle />}
                                                    onClick={() => handlePublicar(noticia.id)}
                                                    sx={{
                                                        color: '#4CAF50',
                                                        '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                                                    }}
                                                >
                                                    Publicar
                                                </Button>
                                            )}
                                            <Button
                                                size="small"
                                                startIcon={<Delete />}
                                                onClick={() => handleEliminar(noticia.id)}
                                                sx={{
                                                    color: '#ff6b6b',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                                                        color: '#ff5252'
                                                    }
                                                }}
                                            >
                                                Eliminar
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))
                        )}
                    </Grid>
                ) : (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ color: '#ffd700', fontWeight: 700 }}>Administrar Secciones</Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => handleOpenSeccionDialog(null)}
                                sx={{
                                    background: 'linear-gradient(90deg, #ffd700, #ffb200)',
                                    color: '#000',
                                    fontWeight: 700,
                                    '&:hover': { background: 'linear-gradient(90deg, #ffed4e, #ffd700)' }
                                }}
                            >
                                Nueva sección
                            </Button>
                        </Box>

                        {seccionesAdmin.length === 0 ? (
                            <Typography sx={{ color: '#999', textAlign: 'center', py: 4 }}>
                                No hay secciones registradas
                            </Typography>
                        ) : (
                            <Grid container spacing={3}>
                                {seccionesAdmin.map((sec) => (
                                    <Grid item xs={12} md={6} lg={4} key={sec.idseccion}>
                                        <Card className="noticia-card">
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                    <Chip
                                                        label={sec.estado ? 'Activa' : 'Inactiva'}
                                                        color={sec.estado ? 'success' : 'default'}
                                                        size="small"
                                                    />
                                                </Box>
                                                <Typography variant="h6" sx={{ color: '#ffd700', fontWeight: 700, mb: 1 }}>
                                                    {sec.nombre}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
                                                    {sec.descripcion || 'Sin descripción'}
                                                </Typography>
                                            </CardContent>
                                            <CardActions sx={{ gap: 1, flexWrap: 'wrap' }}>
                                                <Button
                                                    size="small"
                                                    startIcon={<Edit />}
                                                    onClick={() => handleOpenSeccionDialog(sec)}
                                                    sx={{ color: '#4CAF50', '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' } }}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    size="small"
                                                    startIcon={sec.estado ? <Cancel /> : <CheckCircle />}
                                                    onClick={() => handleToggleSeccion(sec)}
                                                    sx={{ color: sec.estado ? '#f44336' : '#4CAF50', '&:hover': { backgroundColor: sec.estado ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)' } }}
                                                >
                                                    {sec.estado ? 'Desactivar' : 'Activar'}
                                                </Button>
                                                <Button
                                                    size="small"
                                                    startIcon={<Delete />}
                                                    onClick={() => handleDeleteSeccion(sec)}
                                                    sx={{ color: '#ff6b6b', '&:hover': { backgroundColor: 'rgba(255, 107, 107, 0.1)', color: '#ff5252' } }}
                                                >
                                                    Eliminar
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}
            </Box>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle sx={{ backgroundColor: '#1a1a1a', color: '#ffd700' }}>
                    {selectedNoticia?.mode === 'edit' ? 'Editar Noticia' : 'Ver Noticia'}
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: '#0a0a0a', pt: 3 }}>
                    {selectedNoticia?.mode === 'view' ? (
                        <Box>
                            <Typography variant="h5" sx={{ color: '#ffd700', mb: 2, fontWeight: 700 }}>
                                {selectedNoticia.titulo}
                            </Typography>
                            {selectedNoticia.subtitulo && (
                                <Typography variant="h6" sx={{ color: '#999', mb: 2 }}>
                                    {selectedNoticia.subtitulo}
                                </Typography>
                            )}
                            {selectedNoticia.imagen && (
                                <Box
                                    component="img"
                                    src={selectedNoticia.imagen}
                                    alt={selectedNoticia.titulo}
                                    sx={{ width: '100%', borderRadius: 2, mb: 2 }}
                                />
                            )}
                            <Typography sx={{ color: '#e0e0e0', whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                                {selectedNoticia.contenido}
                            </Typography>
                            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #333' }}>
                                <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    Autor: {selectedNoticia.autor}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                    Sección: {selectedNoticia.secciones?.nombre}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#666' }}>
                                    Estado: {selectedNoticia.estado === 'Edicion' ? 'En Edición' :
                                        selectedNoticia.estado === 'Terminado' ? 'Terminado' :
                                            selectedNoticia.estado === 'Publicado' ? 'Publicado' : 'Desactivado'}
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <Box>
                            <TextField
                                fullWidth
                                label="Título"
                                value={form.titulo}
                                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                                margin="normal"
                                required
                                sx={{
                                    '& .MuiInputLabel-root': { color: '#999' },
                                    '& .MuiOutlinedInput-root': {
                                        color: '#fff',
                                        '& fieldset': { borderColor: '#333' },
                                        '&:hover fieldset': { borderColor: '#ffd700' },
                                    }
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Subtítulo"
                                value={form.subtitulo}
                                onChange={(e) => setForm({ ...form, subtitulo: e.target.value })}
                                margin="normal"
                                sx={{
                                    '& .MuiInputLabel-root': { color: '#999' },
                                    '& .MuiOutlinedInput-root': {
                                        color: '#fff',
                                        '& fieldset': { borderColor: '#333' },
                                        '&:hover fieldset': { borderColor: '#ffd700' },
                                    }
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Contenido"
                                value={form.contenido}
                                onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                                margin="normal"
                                multiline
                                rows={6}
                                required
                                sx={{
                                    '& .MuiInputLabel-root': { color: '#999' },
                                    '& .MuiOutlinedInput-root': {
                                        color: '#fff',
                                        '& fieldset': { borderColor: '#333' },
                                        '&:hover fieldset': { borderColor: '#ffd700' },
                                    }
                                }}
                            />
                            <TextField
                                fullWidth
                                label="URL de Imagen"
                                value={form.imagen}
                                onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                                margin="normal"
                                sx={{
                                    '& .MuiInputLabel-root': { color: '#999' },
                                    '& .MuiOutlinedInput-root': {
                                        color: '#fff',
                                        '& fieldset': { borderColor: '#333' },
                                        '&:hover fieldset': { borderColor: '#ffd700' },
                                    }
                                }}
                            />
                            <FormControl fullWidth margin="normal" required>
                                <InputLabel sx={{ color: '#999' }}>Sección</InputLabel>
                                <Select
                                    value={form.categoria}
                                    label="Sección"
                                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                                    sx={{
                                        color: '#fff',
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ffd700' },
                                    }}
                                >
                                    {secciones.map((sec) => (
                                        <MenuItem key={sec.idseccion} value={sec.nombre}>
                                            {sec.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: '#1a1a1a', p: 2 }}>
                    <Button onClick={handleCloseDialog} sx={{ color: '#999' }}>
                        Cerrar
                    </Button>
                    {selectedNoticia?.mode === 'edit' && (
                        <Button
                            onClick={handleEdit}
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(90deg, #ffd700, #ffb200)',
                                color: '#000',
                                fontWeight: 700
                            }}
                        >
                            Guardar Cambios
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PanelEditor;