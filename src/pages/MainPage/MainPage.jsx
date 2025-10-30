import React, { useState, useEffect } from "react";
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import Button from "@mui/material/Button";
import CardsNews from "../../Components/CardsNews/CardsNews";
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Box,
    InputAdornment,
    OutlinedInput,
    Switch,
    FormControlLabel,
} from "@mui/material";
import CategoryOutlined from "@mui/icons-material/CategoryOutlined";
import FlagOutlined from "@mui/icons-material/FlagOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../Firebase/config";
import "./MainPage.css";

const MainPage = () => {
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
    const [filter, setFilter] = useState({ type: "featured", value: null });
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const snapshot = await getDocs(collection(db, "Posts"));
                const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setPosts(data);
            } catch (err) {
                console.error("Error al obtener posts:", err);
            }
        };

        const fetchSecciones = async () => {
            try {
                const snap = await getDocs(collection(db, "Secciones"));
                const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                setSecciones(data.filter((s) => s.estado === true || s.estado === undefined));
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
                console.log("[upload] iniciando subida a Storage", { bucket: storage.app?.options?.storageBucket });
                const storageRef = ref(storage, `posts/${Date.now()}_${imageFile.name}`);
                const snapshot = await withTimeout(uploadBytes(storageRef, imageFile), 25000, "subida de imagen");
                imageUrl = await withTimeout(getDownloadURL(snapshot.ref), 15000, "obtención de URL de imagen");
                setUploadProgress(100);
                console.log("[upload] subida completa, url:", imageUrl);
            }

            console.log("[firestore] creando documento en Posts...");
            const newDoc = await withTimeout(addDoc(collection(db, "Posts"), {
                autor: form.autor || "Anónimo",
                subtitulo: form.subtitulo,
                categoria: form.categoria,
                contenido: form.contenido,
                imagen: imageUrl || "",
                estado: form.estado || "borrador",
                titulo: form.titulo,
                destacado: Boolean(form.destacado),
                fechaCreacion: serverTimestamp(),
                fechaActualizacion: serverTimestamp(),
            }), 20000, "registro de la noticia");

            console.log("Post guardado:", newDoc.id);

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
                { id: newDoc.id, ...form, imagen: imageUrl || "", fechaCreacion: new Date() },
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
                <Button
                    variant="contained"
                    onClick={() => setShowForm(true)}
                    sx={{
                        backgroundColor: '#ffd700',
                        color: '#0a0a0a',
                        fontWeight: 700,
                        '&:hover': {
                            backgroundColor: '#ffaa00',
                        },
                    }}
                >
                    Añadir noticia
                </Button>

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
                        const filtered = (posts || [])
                            .filter((p) => {
                                const isFeatured = p.destacado === true;
                                const cat = p.categoria || p.Category || p.category;
                                if (filter.type === "featured") return isFeatured;
                                if (filter.type === "section") return normalized(cat) === normalized(filter.value);
                                return true;
                            })
                            .sort((a, b) => {
                                const getTime = (x) => {
                                    const ts = x.fechaCreacion || x.createdAt;
                                    return ts?.seconds ? ts.seconds : 0;
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
                        return filtered.map((post) => <CardsNews key={post.id} post={post} />);
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
