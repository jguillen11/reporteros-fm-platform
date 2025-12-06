import { supabase } from "../supabaseClient";

export async function uploadImage(file) {
    if (!file) return { url: null, path: null };

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `noticias/${fileName}`;

    const { error } = await supabase.storage
        .from("noticias")
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        console.error("❌ Error subiendo imagen:", error);
        throw error;
    }

    const { data } = supabase.storage.from("noticias").getPublicUrl(filePath);

    return {
        url: data.publicUrl,
        path: filePath
    };
}
