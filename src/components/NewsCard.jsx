import { useNavigate } from "react-router-dom";

export default function NewsCard({ noticia }) {
    const navigate = useNavigate();

    const goToCategoryPage = () => {
        if (!noticia.category) return;
        const categoryRoute = {
            Informacion: "/info",
            Municipios: "/municipios",
            Estados: "/estados",
            Policiacas: "/policiacas",
            Espectaculos: "/espectaculos",
            Deportes: "/deportes",
            Finanzas: "/finanzas",
            SurSureste: "/sur-sureste",
            Nacionales: "/nacionales",
            Cultura: "/cultura",
        }[noticia.category] || "/";
        navigate(categoryRoute + `?id=${noticia.id}`);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div
            onClick={goToCategoryPage}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-gray-400 transition-colors duration-200 group"
        >
            {/* Imagen */}
            <div className="h-[110px] overflow-hidden bg-gray-100">
                {noticia.image_url ? (
                    <img
                        src={noticia.image_url}
                        alt={noticia.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100" />
                )}
            </div>

            {/* Texto */}
            <div className="p-4">
                <div className="w-5 h-[1.5px] bg-gray-300 mb-3" />
                <p className="text-[10px] font-medium tracking-widest uppercase text-gray-400 mb-1.5">
                    {noticia.category}
                </p>
                <h3 className="text-[13px] font-medium text-gray-900 leading-snug line-clamp-2 mb-3">
                    {noticia.title}
                </h3>
                <p className="text-[11px] text-gray-400">
                    {formatDate(noticia.created_at)}
                </p>
            </div>
        </div>
    );
}