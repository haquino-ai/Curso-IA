# Mi asistente con IA · Taller de IA Generativa Aplicada

Plantilla del taller. Un asistente web que responde con los documentos de una empresa, dice de dónde sacó cada dato y no inventa. Usted lo adapta a SU caso pidiéndole los cambios a Claude Code, en español.

No necesita instalar nada: todo se hace en el navegador.

## 1. Cree su propio repositorio a partir de esta plantilla

1. En esta página, botón verde **Use this template → Create a new repository**.
2. Nombre: el que quiera (por ejemplo, `mi-asistente`). Marque **Private** (privado). Pulse **Create repository**.

## 2. Abra el entorno

1. En SU repositorio nuevo: botón verde **Code → Codespaces → Create codespace on main**.
2. Espere 2 a 4 minutos la primera vez. Se instala todo solo.

## 3. Encienda la plataforma (copiar y pegar)

Terminal → **New Terminal**. Pegue, una línea por vez, cambiando `LA-CLAVE` por la que le dio el instructor:

```bash
export ANTHROPIC_API_KEY="LA-CLAVE"
npm run dev
```

Aparece un aviso de "puerto 3000": pulse **Open in Browser**. Debe verse **"Mi asistente"**. No cierre esa ventana.

## 4. Abra a su ayudante, Claude Code

En una **segunda** ventana de comandos (el signo `+`):

```bash
export ANTHROPIC_API_KEY="LA-CLAVE"
claude
```

Primer pedido, que solo lee: *Lee CLAUDE.md y explícame en 5 líneas cómo está organizado este proyecto.*

## 5. Guardar y publicar

- **Guardar:** en la barra de la izquierda, el ícono de ramas (control de código fuente) → escriba un nombre corto → **Confirmar** → **Sincronizar cambios**.
- **Publicar:** en [vercel.com](https://vercel.com) → **Add New → Project** → importe su repositorio → en **Environment Variables** agregue `ANTHROPIC_API_KEY` con la clave del instructor → **Deploy**. Desde ahí, cada vez que usted guarde y sincronice, Vercel publica de nuevo solo (uno o dos minutos).

## Reglas

1. La clave solo se escribe en la ventana de comandos y en Vercel. Nunca en un archivo ni en un chat.
2. La clave tiene saldo limitado y compartido: una pregunta a la vez.
3. Claude Code usa el modelo económico (Haiku). No lo cambie salvo que el instructor lo indique.
4. Si algo falla, copie el mensaje y péguelo a Claude Code, o pida: *Deshaz el último cambio*.
