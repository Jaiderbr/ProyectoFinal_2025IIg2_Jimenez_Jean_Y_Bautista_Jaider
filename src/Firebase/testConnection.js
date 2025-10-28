import { db } from "./config";
import { collection, getDocs } from "firebase/firestore";

export async function testFirestore() {
  try {
    const snapshot = await getDocs(collection(db, "Usuarios"));
    console.log("Conexión a Firestore exitosa ✅", snapshot.size, "documentos encontrados");
  } catch (error) {
    console.error("Error al conectar con Firestore ❌", error);
  }
}
