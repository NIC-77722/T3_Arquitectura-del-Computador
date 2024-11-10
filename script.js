let client;

// Función para conectar al broker de HiveMQ Cloud
document.getElementById("connectButton").addEventListener("click", () => {
    const topic = document.getElementById("topicInput").value;
    const statusElement = document.getElementById("connectionStatus");

    if (!topic) {
        console.log("Por favor, ingresa un tópico.");
        return;
    }

    // Mostrar el estado de conexión
    statusElement.style.display = "block";
    statusElement.innerText = "Estado: Intentando conectar...";
    statusElement.classList.remove("connected-status", "failed-status");
    statusElement.classList.add("connecting-status");

    // Configuración de la conexión al broker de HiveMQ Cloud
    client = mqtt.connect("wss://77ecc510408b482b9819333eacd5dc66.s1.eu.hivemq.cloud:8884/mqtt", {
        username: "Nayeli_Iglesias",
        password: "nic2004__g"
    });

    client.on("connect", () => {
        statusElement.innerText = "Estado: Conectado";
        statusElement.classList.remove("connecting-status", "failed-status");
        statusElement.classList.add("connected-status");
        document.getElementById("connectButton").disabled = true;
        document.getElementById("publishButton").disabled = false;
        console.log("Conexión exitosa al broker.");

        // Suscribirse al tópico para recibir mensajes
        client.subscribe(topic, (err) => {
            if (!err) {
                console.log(`Suscripción exitosa al tópico: ${topic}`);
            } else {
                console.error("Error al suscribirse al tópico:", err);
            }
        });
    });

    client.on("error", (error) => {
        statusElement.innerText = "Estado: Error de conexión";
        statusElement.classList.remove("connecting-status", "connected-status");
        statusElement.classList.add("failed-status");
        console.error("Error de conexión:", error);
    });

    client.on("close", () => {
        const topicInput = document.getElementById("topicInput").value;
        if (topicInput.trim() === "") {
            statusElement.innerText = "Estado: Desconectado";
            statusElement.classList.remove("connecting-status", "connected-status");
            statusElement.classList.add("failed-status");
            document.getElementById("connectButton").disabled = false;
            document.getElementById("publishButton").disabled = true;
            console.log("Desconectado del broker automáticamente debido al borrado del tópico.");
        } else {
            console.log("Conexión cerrada.");
        }
    });

    // Manejar la recepción de mensajes
    client.on("message", (topic, message) => {
        const messageContent = message.toString();
        console.log(`Mensaje recibido en el tópico ${topic}: ${messageContent}`);

        // Verificar si el mensaje es enviado desde la web o recibido
        if (!messageContent.startsWith("ClienteWeb:")) { // Solo mostrar mensajes que no comiencen con "web:"
            const messageList = document.getElementById("messageList");
            const newMessage = document.createElement("li");
            newMessage.classList.add("message-item");
            newMessage.innerText = `Recibido del topico (${topic}): ${messageContent}`;
            messageList.appendChild(newMessage);

            // Desplazar automáticamente hacia el último mensaje
            messageList.scrollTop = messageList.scrollHeight;
        }
    });
});

// Desconectar automáticamente cuando el campo del tópico se borre
document.getElementById("topicInput").addEventListener("input", () => {
    const topicInput = document.getElementById("topicInput").value;
    const statusElement = document.getElementById("connectionStatus");

    if (client && client.connected && topicInput.trim() === "") {
        client.end();
        statusElement.innerText = "Estado: Desconectado";
        statusElement.classList.remove("connected-status", "connecting-status");
        statusElement.classList.add("failed-status");
        document.getElementById("connectButton").disabled = false;
        document.getElementById("publishButton").disabled = true;
        console.log("Desconectado automáticamente debido al borrado del tópico.");
    }
});

// Función para publicar mensaje
document.getElementById("publishButton").addEventListener("click", () => {
    const topic = document.getElementById("topicInput").value;
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value;

    if (client && client.connected) {
        // Agregar un prefijo al mensaje para identificarlo como enviado desde la web
        const prefixedMessage = `ClienteWeb: ${message}`;
        client.publish(topic, prefixedMessage, (err) => {
            if (!err) {
                console.log("Mensaje publicado:", message);

                // Mostrar mensaje enviado en la sección de mensajes
                const messageList = document.getElementById("messageList");
                const newMessage = document.createElement("li");
                newMessage.classList.add("message-item");
                newMessage.innerText = `Enviado: ${message}`;
                messageList.appendChild(newMessage);

                // Desplazar automáticamente hacia el último mensaje
                messageList.scrollTop = messageList.scrollHeight;

                // Limpiar el campo de entrada de mensaje
                messageInput.value = "";
            } else {
                console.error("Error al publicar mensaje:", err);
            }
        });
    } else {
        console.log("No estás conectado a un broker. Conéctate primero.");
    }
});

// Función para limpiar los mensajes
document.getElementById("clearMessagesButton").addEventListener("click", () => {
    const messageList = document.getElementById("messageList");
    messageList.innerHTML = ""; // Limpia el contenido de la lista de mensajes
    console.log("Mensajes limpiados");
});
