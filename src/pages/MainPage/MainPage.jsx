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
} from "@mui/material";
import CategoryOutlined from "@mui/icons-material/CategoryOutlined";
import FlagOutlined from "@mui/icons-material/FlagOutlined";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../Firebase/config";
import "./MainPage.css";

const MainPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        Author: "",
        Caption: "",
        Category: "",
        Content: "",
        Img: "",
        State: "",
        Title: "",
    });
    const [error, setError] = useState("");
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const snapshot = await getDocs(collection(db, "Posts"));
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setPosts(data);
            } catch (err) {
                console.error("Error al obtener posts:", err);
            }
        };

        fetchPosts();
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
        setForm((f) => ({ ...f, Img: "" }));
    };

    const validate = () => {
        const errs = {};
        if (!form.Title.trim()) errs.Title = "El título es obligatorio";
        if (!form.Content.trim()) errs.Content = "El contenido es obligatorio";
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
            let imageUrl = form.Img;

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
                Author: form.Author || "Anónimo",
                Caption: form.Caption,
                Category: form.Category,
                Content: form.Content,
                Img: imageUrl || "",
                State: form.State || "borrador",
                Title: form.Title,
                createdAt: serverTimestamp(),
            }), 20000, "registro de la noticia");

            console.log("Post guardado:", newDoc.id);

            setForm({
                Author: "",
                Caption: "",
                Category: "",
                Content: "",
                Img: "",
                State: "",
                Title: "",
            });
            setImageFile(null);
            setImagePreview("");
            setUploadProgress(0);

            setShowForm(false);
            setPosts((prev) => [
                ...prev,
                { id: newDoc.id, ...form, Img: imageUrl || "", createdAt: new Date() },
            ]);
        } catch (error) {
            console.error("[submit] Error:", error);
            setError(error?.message || "Error inesperado durante el guardado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mainmain">
            <Header />
            <main>
                <Button variant="contained" color="success" onClick={() => setShowForm(true)}>
                    Añadir noticia
                </Button>

                {showForm && (
                    <Box className="form-card-wrapper">
                        <Card elevation={6} className="form-card">
                            <CardContent>
                                <Stack spacing={1} sx={{ mb: 2 }}>
                                    <Typography variant="h5" component="div">
                                        Nueva noticia
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Completa los campos para publicar o guardar como borrador.
                                    </Typography>
                                    {error && (
                                        <Typography variant="body2" color="error">
                                            {error}
                                        </Typography>
                                    )}
                                </Stack>

                                <Stack spacing={2} sx={{ '& > *': { width: '100%' } }}>
                                    <TextField
                                        label="Autor"
                                        name="Author"
                                        value={form.Author}
                                        onChange={handleChange}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Título"
                                        name="Title"
                                        value={form.Title}
                                        onChange={handleChange}
                                        error={Boolean(fieldErrors.Title)}
                                        helperText={fieldErrors.Title}
                                        required
                                        fullWidth
                                    />

                                    <TextField
                                        label="Subtítulo"
                                        name="Caption"
                                        value={form.Caption}
                                        onChange={handleChange}
                                        fullWidth
                                    />

                                    <FormControl fullWidth size="medium">
                                        <InputLabel id="category-label">Categoría</InputLabel>
                                        <Select
                                            labelId="category-label"
                                            label="Categoría"
                                            name="Category"
                                            value={form.Category}
                                            onChange={handleChange}
                                            input={
                                                <OutlinedInput
                                                    label="Categoría"
                                                    startAdornment={
                                                        <InputAdornment position="start">
                                                            <CategoryOutlined fontSize="small" />
                                                        </InputAdornment>
                                                    }
                                                />
                                            }
                                        >
                                            <MenuItem value="">
                                                <em>Sin categoría</em>
                                            </MenuItem>
                                            <MenuItem value="Deportes">Deportes</MenuItem>
                                            <MenuItem value="Tecnología">Tecnología</MenuItem>
                                            <MenuItem value="Política">Política</MenuItem>
                                            <MenuItem value="Entretenimiento">Entretenimiento</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth size="medium">
                                        <InputLabel id="state-label">Estado</InputLabel>
                                        <Select
                                            labelId="state-label"
                                            label="Estado"
                                            name="State"
                                            value={form.State}
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
                                        >
                                            <MenuItem value="">
                                                <em>Seleccionar estado</em>
                                            </MenuItem>
                                            <MenuItem value="publicado">Publicado</MenuItem>
                                            <MenuItem value="borrador">Borrador</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        label="Contenido"
                                        name="Content"
                                        value={form.Content}
                                        onChange={handleChange}
                                        error={Boolean(fieldErrors.Content)}
                                        helperText={fieldErrors.Content}
                                        required
                                        fullWidth
                                        multiline
                                        minRows={4}
                                    />

                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                        <Button variant="outlined" component="label" disabled={loading}>
                                            Seleccionar imagen
                                            <input
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                onChange={handleFileChange}
                                            />
                                        </Button>
                                        <Typography variant="body2" color="text.secondary">
                                            {imageFile ? imageFile.name : "No hay archivo seleccionado"}
                                        </Typography>
                                        {uploadProgress > 0 && uploadProgress < 100 && (
                                            <Typography variant="caption" color="text.secondary">
                                                Subiendo: {uploadProgress}%
                                            </Typography>
                                        )}
                                    </Stack>
                                    <Box>
                                        {imagePreview || form.Img ? (
                                            <Box className="img-preview-wrapper">
                                                <img
                                                    src={imagePreview || form.Img}
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
                                    color="inherit"
                                    onClick={() => {
                                        setShowForm(false);
                                        setError("");
                                        setFieldErrors({});
                                        setImageFile(null);
                                        setImagePreview("");
                                        setUploadProgress(0);
                                    }}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? "Guardando..." : "Guardar noticia"}
                                </Button>
                            </CardActions>
                        </Card>
                    </Box>
                )}

                <div className="container">
                    {posts.map((post) => (
                        <CardsNews key={post.id} post={post} />
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default MainPage;
