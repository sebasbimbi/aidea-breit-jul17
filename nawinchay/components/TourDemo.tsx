"use client";

// Tour guiado del demo. Principio de diseno: ADITIVO Y APAGADO POR DEFECTO.
//
// Este componente no renderiza NADA hasta que alguien lo enciende a proposito
// (?tour=1 en la URL, o la tecla "t"). driver.js se carga con import dinamico
// dentro de un try/catch: si el chunk falla, no existe o explota, la vista de
// /items renderiza exactamente igual que sin este componente. El pitch nunca
// depende de que la libreria cargue.
//
// El CSS si se importa estatico: todas las reglas de driver.css estan scopeadas
// bajo .driver-active / .driver-popover / .driver-no-interaction, clases que
// solo existen mientras el tour corre. Con el tour apagado no toca un pixel.
import "driver.js/dist/driver.css";
import { useEffect, useRef } from "react";

type DriverObj = {
  drive: () => void;
  moveNext: () => void;
  destroy: () => void;
  isActive: () => boolean;
};

// Los pasos solo SENALAN lo que ya esta en pantalla. Regla dura: ninguna cifra
// que el asistente no pueda leer con sus propios ojos en la vista.
const PASOS = [
  {
    element: '[data-tour="dotplot"]',
    popover: {
      title: "Veinte items, uno por fila",
      description:
        "La linea vertical es el azar. Con cuatro alternativas, marcar al voleo ya rinde 25 por ciento. Todo lo que cae a la izquierda de esa linea rinde menos que responder sin leer la pregunta.",
    },
  },
  {
    element: '[data-tour="fila-3"]',
    popover: {
      title: "El item 3 esta del lado imposible",
      description:
        "Es el punto rojo, y esta a la izquierda de la linea del azar. Eso no se lee como les fue mal. Un grupo que responde al azar sacaria mas. Lo que falla es la medicion, no el estudiante.",
    },
  },
  {
    element: '[data-tour="card-3"]',
    popover: {
      title: "La replica en poblaciones disjuntas",
      description:
        "Huaytara y el resto de la region no comparten una sola persona, y el item se hunde igual en las dos. Un z de -30.42 contra el azar en el resto de la region no es ruido de base chica: es el mismo defecto reproducido en dos poblaciones separadas.",
    },
  },
  {
    element: '[data-tour="card-9"]',
    popover: {
      title: "El item 9 es otra categoria",
      description:
        "Tambien cae, pero en ambar y no en rojo. La lectura no es item defectuoso sino concepcion errada, y por eso la accion recomendada al pie de la tarjeta es distinta a la del item 3. La alerta distingue casos, no solo marca bajos.",
    },
  },
  {
    element: '[data-tour="badge"]',
    popover: {
      title: "Servido sin red",
      description:
        "Los diagnosticos vienen precomputados y se sirven desde un import estatico. Mismo texto en pantalla, cero latencia, cero dependencia del wifi del local durante la demostracion.",
    },
  },
  {
    element: '[data-tour="debil"]',
    popover: {
      title: "La consecuencia sobre la capacidad",
      description:
        "La capacidad mas debil queda en 47.7 por ciento, calculada excluyendo el item marcado como anomalo. Un item cuya medicion esta en duda no puede bajar el promedio de una capacidad: mezclaria no sabemos con les fue mal.",
    },
  },
];

export default function TourDemo() {
  const driverRef = useRef<DriverObj | null>(null);
  const arrancandoRef = useRef(false);
  const avanzandoRef = useRef(false);

  useEffect(() => {
    let vivo = true;

    const limpiar = () => {
      try {
        driverRef.current?.destroy();
      } catch {
        /* si destroy falla, no hay nada que salvar y no debe propagarse */
      }
      driverRef.current = null;
      arrancandoRef.current = false;
      avanzandoRef.current = false;
    };

    const arrancar = async () => {
      // reentrada: ya corriendo o ya cargando
      if (arrancandoRef.current || driverRef.current) return;
      arrancandoRef.current = true;
      try {
        const { driver } = await import("driver.js");
        if (!vivo) return;
        const obj = driver({
          showProgress: true,
          allowClose: true,
          overlayColor: "#000",
          overlayOpacity: 0.72,
          nextBtnText: "Siguiente",
          prevBtnText: "Atras",
          doneBtnText: "Cerrar",
          progressText: "{{current}} de {{total}}",
          steps: PASOS,
          onDestroyed: () => {
            driverRef.current = null;
            arrancandoRef.current = false;
            avanzandoRef.current = false;
          },
        }) as unknown as DriverObj;
        driverRef.current = obj;
        obj.drive();
      } catch {
        // driver.js no cargo. La vista queda intacta y el tour simplemente no existe.
        limpiar();
      } finally {
        arrancandoRef.current = false;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const escribiendo =
        !!t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable);
      if (escribiendo || e.ctrlKey || e.metaKey || e.altKey) return;

      const activo = !!driverRef.current;

      // Enter avanza SOLO con el tour encendido. Con el tour apagado no se
      // captura la tecla: la pagina se comporta como siempre.
      if (e.key === "Enter") {
        if (!activo) return;
        e.preventDefault();
        e.stopPropagation();
        // driver.js tambien liga Enter al boton enfocado del popover. Sin este
        // candado, un Enter avanzaria dos pasos de golpe.
        if (avanzandoRef.current) return;
        avanzandoRef.current = true;
        try {
          driverRef.current?.moveNext();
        } catch {
          limpiar();
        }
        // se libera en el siguiente frame, despues de que driver procese su handler
        requestAnimationFrame(() => {
          avanzandoRef.current = false;
        });
        return;
      }

      if (e.key === "Escape" && activo) {
        limpiar();
        return;
      }

      // tecla dedicada de arranque, solo con el tour apagado
      if (!activo && (e.key === "t" || e.key === "T")) {
        e.preventDefault();
        void arrancar();
      }
    };

    window.addEventListener("keydown", onKeyDown, true);

    // arranque explicito por URL: /items?tour=1
    try {
      if (new URLSearchParams(window.location.search).get("tour") === "1") {
        void arrancar();
      }
    } catch {
      /* URL rara: no arrancamos y ya */
    }

    return () => {
      vivo = false;
      window.removeEventListener("keydown", onKeyDown, true);
      limpiar();
    };
  }, []);

  return null;
}
