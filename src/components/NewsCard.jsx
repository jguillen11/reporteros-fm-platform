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

        // 👉 Mandamos el ID de la noticia seleccionada
        navigate(categoryRoute + `?id=${noticia.id}`);
    };

    return (
        <div
            onClick={goToCategoryPage}
            className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition p-4 border border-gray-200"
        >
            <div className="h-40 w-full overflow-hidden rounded-lg mb-3">
                <img
                    src={noticia.imageUrl || noticia.imageURL}
                    alt={noticia.title}
                    className="w-full h-full object-cover"
                />
            </div>

            <span className="text-xs font-bold uppercase text-sky-600">
                {noticia.category}
            </span>

            <h3 className="text-lg font-bold text-gray-900 mt-2 line-clamp-2">
                {noticia.title}
            </h3>

            <p className="text-sm text-gray-700 mt-1 line-clamp-3">
                {noticia.content}
            </p>
        </div>
    );
}
