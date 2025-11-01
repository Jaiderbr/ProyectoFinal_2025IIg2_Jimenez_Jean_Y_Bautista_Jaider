import React, { useState, useEffect } from "react";
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import Button from "@mui/material/Button";
import CardsNews from "../../Components/CardsNews/CardsNews";
import { Card, CardContent, CardActions, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Stack, Box, InputAdornment, OutlinedInput, Switch, FormControlLabel, } from "@mui/material";
import CategoryOutlined from "@mui/icons-material/CategoryOutlined";
import FlagOutlined from "@mui/icons-material/FlagOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { supabase } from "../../client";
import { useAuth } from "../../Context/AuthContext";
import "./MainPage.css";

const MainPage = () => {
    const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'news';
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        autor: "",
        subtitulo: "",
        categoria: "",
        contenido: "",
        imagen: "",
        estado: "",
        titulo: "",
        destacado: false,
    });
    const [error, setError] = useState("");
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [secciones, setSecciones] = useState([]);
    const [filter, setFilter] = useState({ type: "all", value: null });
    const [showScrollTop, setShowScrollTop] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('estado', 'Publicado')
                    .order('fechacreacion', { ascending: false });

                if (error) throw error;
                setPosts(data || []);
            } catch (err) {
                console.error("Error al obtener posts:", err);
            }
        };

        const fetchSecciones = async () => {
            try {
                const { data, error } = await supabase
                    .from('secciones')
                    .select('*');

                if (error) throw error;
                setSecciones((data || []).filter(s => s.estado !== false));
            } catch (err) {
                console.error("Error al obtener secciones:", err);
            }
        };

        fetchPosts();
        fetchSecciones();

        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const url = URL.createObjectURL(file);
        setImagePreview(url);
        setForm((f) => ({ ...f, imagen: "" }));
    };

    const validate = () => {
        const errs = {};
        if (!form.titulo.trim()) errs.Title = "El título es obligatorio";
        if (!form.contenido.trim()) errs.Content = "El contenido es obligatorio";
        return errs;
    };

    const withTimeout = async (promise, ms = 25000, label = "operación") => {
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
        setError("");
        setFieldErrors({});

        const errs = validate();
        if (Object.keys(errs).length) {
            setFieldErrors(errs);
            setError("Por favor corrige los campos marcados.");
            return;
        }

        try {
            setLoading(true);
            let imageUrl = form.imagen;

            if (imageFile) {
                console.log("[upload] iniciando subida a Supabase Storage", { bucket: BUCKET });
                const filePath = `posts/${Date.now()}_${imageFile.name}`;
                await withTimeout(
                    supabase.storage.from(BUCKET).upload(filePath, imageFile, {
                        cacheControl: '3600',
                        upsert: false,
                    }),
                    25000,
                    "subida de imagen"
                );
                const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
                imageUrl = pub?.publicUrl || "";
                setUploadProgress(100);
                console.log("[upload] subida completa, url:", imageUrl);
            }

            console.log("[supabase] creando registro en posts...");
            const nowIso = new Date().toISOString();
            const seccion = secciones.find(s => s.nombre === form.categoria);
            const payload = {
                autor: form.autor || user?.nombre || "Anónimo",
                titulo: form.titulo,
                subtitulo: form.subtitulo || "",
                categoria: seccion?.idseccion || null,
                contenido: form.contenido,
                imagen: imageUrl || "",
                estado: form.estado === "publicado",
                destacado: Boolean(form.destacado),
                fechacreacion: nowIso,
                fechaactualizacion: nowIso,
            };


            const { data: created, error: insertErr } = await withTimeout(
                supabase.from('posts').insert([payload]).select().single(),
                20000,
                "registro de la noticia"
            );
            if (insertErr) throw insertErr;
            console.log("Post guardado:", created?.id);

            setForm({
                autor: "",
                subtitulo: "",
                categoria: "",
                contenido: "",
                imagen: "",
                estado: "",
                titulo: "",
                destacado: false,
            });
            setImageFile(null);
            setImagePreview("");
            setUploadProgress(0);

            setShowForm(false);
            setPosts((prev) => [
                ...prev,
                created || { ...payload },
            ]);
        } catch (error) {
            console.error("[submit] Error:", error);
            setError(error?.message || "Error inesperado durante el guardado.");
        } finally {
            setLoading(false);
        }
    };

    const handleSectionClick = (seccionNombre) => {
        setFilter({ type: "section", value: seccionNombre });
        setTimeout(() => {
            const mainContent = document.querySelector('.container');
            if (!mainContent) return;

            const header = document.querySelector('.header');
            const headerHeight = header ? header.getBoundingClientRect().height : 0;
            const extraOffset = 16;
            const y = mainContent.getBoundingClientRect().top + window.pageYOffset - headerHeight - extraOffset;
            window.scrollTo({ top: y < 0 ? 0 : y, behavior: 'smooth' });
        }, 60);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="mainmain">
            <Header onSectionClick={handleSectionClick} />
            <main>
                {showForm && (
                    <Box className="form-card-wrapper">
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
                                        Nueva noticia
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#c0c0c0' }}>
                                        Completa los campos para publicar o guardar como borrador.
                                    </Typography>
                                    {error && (
                                        <Typography variant="body2" color="error">
                                            {error}
                                        </Typography>
                                    )}
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
                                        label="Autor"
                                        name="autor"
                                        value={form.autor}
                                        onChange={handleChange}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Título"
                                        name="titulo"
                                        value={form.titulo}
                                        onChange={handleChange}
                                        error={Boolean(fieldErrors.Title)}
                                        helperText={fieldErrors.Title}
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

                                    <FormControl fullWidth size="medium" sx={{
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
                                        <InputLabel id="section-label">Sección</InputLabel>
                                        <Select
                                            labelId="section-label"
                                            label="Sección"
                                            name="categoria"
                                            value={form.categoria}
                                            onChange={handleChange}
                                            input={
                                                <OutlinedInput
                                                    label="Sección"
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
                                                <MenuItem key={s.id} value={s.nombre}>
                                                    {s.nombre}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth size="medium" sx={{
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
                                        <InputLabel id="state-label">Estado</InputLabel>
                                        <Select
                                            labelId="state-label"
                                            label="Estado"
                                            name="estado"
                                            value={form.estado}
                                            onChange={handleChange}
                                            input={
                                                <OutlinedInput
                                                    label="Estado"
                                                    startAdornment={
                                                        <InputAdornment position="start">
                                                            <FlagOutlined fontSize="small" />
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
                                                <em>Seleccionar estado</em>
                                            </MenuItem>
                                            <MenuItem value="publicado">Publicado</MenuItem>
                                            <MenuItem value="borrador">Borrador</MenuItem>
                                        </Select>
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
                                        error={Boolean(fieldErrors.Content)}
                                        helperText={fieldErrors.Content}
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
                                            {imageFile ? imageFile.name : "No hay archivo seleccionado"}
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
                                                    onError={(e) => (e.currentTarget.style.display = "none")}
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
                            <CardActions sx={{ justifyContent: "flex-end" }}>
                                <Button
                                    variant="text"
                                    onClick={() => {
                                        setShowForm(false);
                                        setError("");
                                        setFieldErrors({});
                                        setImageFile(null);
                                        setImagePreview("");
                                        setUploadProgress(0);
                                    }}
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
                                    {loading ? "Guardando..." : "Guardar noticia"}
                                </Button>
                            </CardActions>
                        </Card>
                    </Box>
                )}

                <div className="container">
                    {(() => {
                        const normalized = (str) => (str || "").toString().toLowerCase();
                        const activeSectionIds = new Set((secciones || []).filter(s => s.estado !== false).map(s => s.idseccion));
                        const filtered = (posts || [])
                            .filter((p) => p && p.estado === 'Publicado' && activeSectionIds.has(p.categoria))
                            .filter((p) => {
                                if (filter.type === "section") {
                                    const sec = secciones.find(s => s.idseccion === p.categoria);
                                    const name = sec?.nombre;
                                    return normalized(name) === normalized(filter.value);
                                }
                                return true;
                            })
                            .sort((a, b) => {
                                const getTime = (x) => {
                                    const ts = x.fechacreacion || x.fechapublicacion || x.fechaPublicacion || x.creado_en || x.fechaCreacion || x.createdAt || x.created_at;
                                    if (!ts) return 0;
                                    if (typeof ts === 'object' && ts?.seconds) return ts.seconds * 1000;
                                    const t = Date.parse(ts);
                                    return Number.isNaN(t) ? 0 : t;
                                };
                                return getTime(b) - getTime(a);
                            });
                        if (!filtered.length) {
                            return (
                                <Typography variant="body2" color="text.secondary">
                                    No hay noticias para mostrar.
                                </Typography>
                            );
                        }
                        return filtered.map((post) => {
                            const sec = secciones.find(s => s.idseccion === post.categoria);
                            const joined = { ...post, seccion_nombre: sec?.nombre };
                            return <CardsNews key={post.id} post={joined} clickable />;
                        });
                    })()}
                </div>
            </main>
            <Footer />

            {showScrollTop && (
                <Button
                    onClick={scrollToTop}
                    variant="contained"
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        borderRadius: '50%',
                        minWidth: 56,
                        height: 56,
                        backgroundColor: '#ffd700',
                        color: '#0a0a0a',
                        boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
                        zIndex: 1000,
                        '&:hover': {
                            backgroundColor: '#ffaa00',
                            transform: 'scale(1.1)',
                            transition: 'transform 0.2s ease',
                            boxShadow: '0 6px 24px rgba(255, 215, 0, 0.6)',
                        },
                    }}
                    aria-label="Volver arriba"
                >
                    <ArrowUpwardIcon />
                </Button>
            )}
        </div>
    );
};

export default MainPage;
