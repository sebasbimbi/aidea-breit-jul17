# Rúbrica Quiz

## Historial en Supabase

1. Ejecuta `supabase-schema.sql` una vez en el SQL Editor del proyecto Supabase.
2. Configura `SUPABASE_URL` y `SUPABASE_SECRET_KEY` como variables de entorno del servidor o del proyecto Vercel.
3. Despliega esta carpeta como raíz del proyecto. La función `api/history.js` guarda, lista, restaura y elimina evaluaciones.

Para ejecutarla localmente con el mini backend incluido:

```bash
node server.js
```

Abre `http://127.0.0.1:8765`.

## Consolidador de registros

Abre `http://127.0.0.1:8765/consolidar.html` o usa el enlace **Consolidar registros Excel** desde el generador. La pantalla acepta uno o varios registros originales, procesa todas sus hojas y descarga `consolidado.xlsx` con un registro por estudiante y competencia.

El botón **Probar con los 3 archivos de ejemplo** procesa los archivos incluidos en `Data/`. Con los datos actuales genera 183 registros, el mismo total que `Data/consolidado.xlsx`.

La clave secreta no debe agregarse al HTML ni confirmarse en Git. El navegador solo se comunica con la función `/api/history` del mismo origen.
