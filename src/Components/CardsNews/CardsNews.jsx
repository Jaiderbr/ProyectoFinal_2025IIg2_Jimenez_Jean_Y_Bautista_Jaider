import * as React from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { red, blue, green, purple } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LinkIcon from "@mui/icons-material/Link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ReportIcon from "@mui/icons-material/Report";

const StyledCard = styled(Card)(({ theme }) => ({
    width: "100%",
    maxWidth: 400,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRadius: 20,
    overflow: "hidden",
    background: "#1a1a1a",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    border: "2px solid #333",
    cursor: "pointer",
    "&:hover": {
        transform: "translateY(-8px) scale(1.02)",
        boxShadow: "0 20px 48px rgba(255, 215, 0, 0.3)",
        borderColor: "#ffd700",
    },
}));

const StyledCardMedia = styled(CardMedia)({
    height: 240,
    width: "100%",
    objectFit: "cover",
    position: "relative",
    "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%)",
    },
});

function CardsNews({ post, clickable = false }) {
    const navigate = useNavigate();
    const [expanded, setExpanded] = React.useState(false);
    const [liked, setLiked] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const openMenu = Boolean(anchorEl);

    const handleCardClick = () => {
        if (clickable && post.id) {
            navigate(`/noticia/${post.id}`);
        }
    };

    const handleExpandClick = (e) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };

    const handleLikeClick = (e) => {
        e.stopPropagation();
        setLiked(!liked);
    };

    const handleMenuOpen = (e) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };

    const handleMenuClose = (e) => {
        e?.stopPropagation();
        setAnchorEl(null);
    };

    const handleCopyLink = (e) => {
        e.stopPropagation();
        const url = `${window.location.origin}${window.location.pathname}#/noticia/${post.id}`;
        navigator.clipboard.writeText(url);
        alert('Enlace copiado al portapapeles');
        handleMenuClose();
    };

    const handleViewFull = (e) => {
        e.stopPropagation();
        if (post.id) {
            navigate(`/noticia/${post.id}`);
        }
        handleMenuClose();
    };

    const handleReport = (e) => {
        e.stopPropagation();
        alert('Gracias por contribuir. El equipo técnico revisará la publicación.');
        handleMenuClose();
    };

    const getChipColor = (cat) => {
        if (!cat) return "#808080";

        const normalized = cat
            .toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        let hash = 0;
        for (let i = 0; i < normalized.length; i++) {
            hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
        }

        const hue = Math.abs(hash % 360);
        const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
        const lightness = 50 + (Math.abs(hash >> 8) % 15); // 50-65%

        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    const getAvatarColor = (author) => {
        const colors = [red[500], blue[500], green[500], purple[500]];
        const index = (author?.charCodeAt(0) || 0) % colors.length;
        return colors[index];
    };

    const title = post.titulo || post.Title || post.title || "Sin título";
    const caption = post.subtitulo || post.descripcion || post.contenido || post.Caption || post.subtitle || "Sin descripción";
    const category = post.seccion_nombre || post.categoria || post.Category || post.category || "";
    const imageUrl = post.imagen || post.imagen_url || post.Img || post.image || "";
    const author = post.autor || post.Author || post.author || "Anónimo";
    const createdAtTS = post.fechacreacion || post.fechapublicacion || post.fechaPublicacion || post.fechaCreacion || post.createdAt || post.creado_en;
    const createdAt = createdAtTS
        ? (createdAtTS?.seconds
            ? new Date(createdAtTS.seconds * 1000)
            : new Date(createdAtTS)).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                year: "numeric",
            })
        : "";

    return (
        <StyledCard onClick={handleCardClick}>
            <CardHeader
                avatar={
                    <Avatar
                        sx={{
                            bgcolor: getAvatarColor(author),
                            fontWeight: 700,
                            width: 48,
                            height: 48,
                            fontSize: "1.2rem",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        }}
                    >
                        {author?.[0]?.toUpperCase() || "A"}
                    </Avatar>
                }
                action={
                    <>
                        <IconButton
                            aria-label="Opciones"
                            onClick={handleMenuOpen}
                            sx={{
                                color: "#999",
                                "&:hover": {
                                    backgroundColor: "#2a2a2a",
                                    color: "#ffd700",
                                    transform: "rotate(90deg)",
                                    transition: "transform 0.3s ease"
                                }
                            }}
                        >
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleMenuClose}
                            onClick={(e) => e.stopPropagation()}
                            PaperProps={{
                                sx: {
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid #333',
                                    color: '#fff',
                                    minWidth: 200
                                }
                            }}
                        >
                            <MenuItem onClick={handleCopyLink}>
                                <ListItemIcon>
                                    <LinkIcon sx={{ color: '#ffd700' }} />
                                </ListItemIcon>
                                <ListItemText>Copiar enlace</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={handleViewFull}>
                                <ListItemIcon>
                                    <OpenInNewIcon sx={{ color: '#4CAF50' }} />
                                </ListItemIcon>
                                <ListItemText>Ver completa</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={handleReport}>
                                <ListItemIcon>
                                    <ReportIcon sx={{ color: '#f44336' }} />
                                </ListItemIcon>
                                <ListItemText>Reportar</ListItemText>
                            </MenuItem>
                        </Menu>
                    </>
                }
                titleTypographyProps={{
                    variant: "h6",
                    sx: {
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        letterSpacing: "-0.01em",
                        color: "#ffd700",
                    },
                }}
                subheaderTypographyProps={{
                    sx: {
                        color: "#999",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mt: 0.5,
                    },
                }}
                title={title}
                subheader={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: "#ffd700" }} />
                        {createdAt}
                    </Box>
                }
                sx={{ pb: 1 }}
            />

            {imageUrl ? (
                <StyledCardMedia
                    component="img"
                    image={imageUrl}
                    alt={`Imagen de ${title}`}
                    loading="lazy"
                />
            ) : (
                <Box
                    sx={{
                        height: 240,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Typography variant="h4" sx={{ color: "white", opacity: 0.7 }}>
                        📰
                    </Typography>
                </Box>
            )}

            <CardContent sx={{ pt: 2.5, pb: 1, flexGrow: 1 }}>
                {(category) && (
                    <Chip
                        label={category}
                        size="small"
                        sx={{
                            mb: 1.5,
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            borderRadius: "8px",
                            letterSpacing: "0.02em",
                            textTransform: "uppercase",
                            backgroundColor: getChipColor(category),
                            color: "#fff",
                        }}
                    />
                )}
                <Typography
                    variant="body2"
                    sx={{
                        color: "#c0c0c0",
                        fontSize: "0.95rem",
                        lineHeight: 1.7,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: 70,
                    }}
                >
                    {caption}
                </Typography>
            </CardContent>

            <Divider sx={{ mx: 2, borderColor: "#333" }} />

            <CardActions disableSpacing sx={{ px: 2, py: 1.5, mt: "auto" }}>
                {(post.contenido || post.descripcion || post.Content) && String(post.contenido || post.descripcion || post.Content).trim().length > 0 && (
                    <Button
                        onClick={handleExpandClick}
                        endIcon={
                            <ExpandMoreIcon
                                sx={{
                                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "transform 0.3s ease",
                                    color: '#ffd700',
                                }}
                            />
                        }
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            px: 1.5,
                            color: '#ffd700',
                            '&:hover': {
                                backgroundColor: '#ffd70010',
                            },
                        }}
                        size="small"
                        aria-expanded={expanded}
                        aria-label={expanded ? "Mostrar menos" : "Mostrar más"}
                    >
                        {expanded ? "Ver menos" : "Ver más"}
                    </Button>
                )}
                <Box sx={{ marginLeft: "auto", display: "flex", gap: 0.5 }}>
                    <IconButton
                        aria-label="Añadir a favoritos"
                        onClick={handleLikeClick}
                        sx={{
                            color: liked ? "error.main" : "action.active",
                            transition: "all 0.2s ease",
                            "&:hover": {
                                transform: "scale(1.15)",
                            },
                        }}
                    >
                        <FavoriteIcon sx={{ fontSize: liked ? 24 : 22 }} />
                    </IconButton>
                    <IconButton
                        aria-label="Compartir"
                        onClick={(e) => {
                            e.stopPropagation();
                            const url = `${window.location.origin}${window.location.pathname}#/noticia/${post.id}`;
                            if (navigator.share) {
                                navigator.share({
                                    title: title,
                                    text: caption,
                                    url: url
                                }).catch(() => {
                                    navigator.clipboard.writeText(url);
                                    alert('Enlace copiado al portapapeles');
                                });
                            } else {
                                navigator.clipboard.writeText(url);
                                alert('Enlace copiado al portapapeles');
                            }
                        }}
                        sx={{
                            color: "#ffd700",
                            "&:hover": {
                                transform: "scale(1.15)",
                            },
                        }}
                    >
                        <ShareIcon />
                    </IconButton>
                </Box>
            </CardActions>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Divider sx={{ borderColor: "#333" }} />
                <CardContent sx={{ pt: 2, pb: 2, backgroundColor: "#0a0a0a" }}>
                    <Typography
                        variant="overline"
                        sx={{
                            mb: 1.5,
                            color: "#ffd700",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                        }}
                    >
                        Contenido completo
                    </Typography>
                    <Typography
                        sx={{
                            whiteSpace: "pre-line",
                            lineHeight: 1.8,
                            fontSize: "0.95rem",
                            color: "#e0e0e0",
                        }}
                    >
                        {post.contenido || post.descripcion || post.Content || "Sin contenido"}
                    </Typography>
                </CardContent>
            </Collapse>
        </StyledCard>
    );
}

export default CardsNews;
