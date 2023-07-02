"use client";

import { FormEvent, useEffect, useState } from "react";
import { FaUserAstronaut, FaRobot, FaInfoCircle } from "react-icons/fa";
import Image from "next/image";
import ImageIA from "../../public/robotIa.png";

interface Message {
  role: String;
  content: String;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  /**
   * Funcion que se comunica con la IA con ayuda de la API de HuggingFace
   */
  async function query(data: Object) {
    const url =
      "https://api-inference.huggingface.co/models/Grendar/blenderbot-400M-distill-Shiro";
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}` },
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log("Response => ", result);
    if (result.error) {
      console.log("HA OCURRIDO UN ERROR");
      setError(true);
    }
    return result;
  }

  /**
   * Funcion para enviar mensajes a la IA
   * @param e Parametro de eventos para evitar que la ventana se recargue al enviar el mensaje
   */
  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userInputMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((oldMessages) => [...oldMessages, userInputMessage]);

    let msgToSend = {
      inputs: {
        past_user_inputs: messages
          .filter((message) => message.role === "user")
          .map((message) => message.content),
        generated_responses: messages
          .filter((message) => message.role !== "user")
          .map((message) => message.content),
        text: input,
      },
    };

    setInput(""); // Limpiar input

    const response = await query(msgToSend);

    const aiResponseMessage: Message = {
      role: "ai",
      content: response.generated_text || "",
    };

    setMessages((oldMessages) => [...oldMessages, aiResponseMessage]);
  };

  useEffect(() => {
    if (error) {
      setMessages([]);
      setTimeout(() => {
        setError(false);
      }, 5000);
    }
  }, [error]);

  return (
    <div className="bg-slate-900 text-white min-h-screen flex justify-center">
      {error ? (
        <div className="absolute top-0 left-0 w-full flex items-center justify-center min-h-[100px] bg-red-950 text-lg sm:text-2xl font-bold z-50 p-10">
          <p className="text-xl sm:text-5xl mx-5">
            <FaInfoCircle />
          </p>
          <h2 className="max-w-[600px]">
            Ha habido un error al intentar conectar con la IA, intente de nuevo
            en unos minutos.
          </h2>
        </div>
      ) : (
        <></>
      )}

      <div className="flex flex-col justify-between w-[90%] items-center">
        {messages.length > 0 ? (
          <div className="mb-[150px]">
            <h1 className="text-3xl font-bold">Conversation:</h1>
            <div>
              {messages.map((msg: Message, i) => (
                <div
                  key={i}
                  className={`flex items-center my-4 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <p
                    className={`min-w-[50px] min-h-[50px] text-3xl mx-3 flex items-center justify-center text-black rounded-full
                      ${msg.role === "user" ? "bg-green-400" : "bg-purple-400"}
                    `}
                  >
                    {msg.role === "user" ? <FaUserAstronaut /> : <FaRobot />}
                  </p>
                  <p>{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-10">
            <h3 className="text-3xl font-bold">Advertencias: </h3>
            <ul>
              <li className="ml-5 list-disc my-3 sm:text-xl max-w-[700px]">
                Ninguna IA es perfecta, esta en particular esta entrenada con
                pocos datos por lo que no puede dar respuestas muy precisas.
              </li>
              <li className="ml-5 list-disc my-3 sm:text-xl max-w-[700px]">
                Este proyecto es gratuito por lo que tiene limitaciones, la IA
                no esta disponible todo el tiempo y ademas puede saturarse
                facilmente.
              </li>
              <li className="ml-5 list-disc my-3 sm:text-xl max-w-[700px]">
                Si aparece un mensaje de error, simplemente espera un minuto y
                reintenta, si despues de 3 intentos no funciona, hay un error
                con el servidor.
              </li>
            </ul>
            <figure>
              <Image
                src={ImageIA}
                alt="Imagen de robot ia"
                width={300}
                height={300}
                className="m-auto"
              />
            </figure>
          </div>
        )}
        <div className="fixed bottom-0 left-0 w-full bg-slate-950 flex flex-col items-center">
          <div className="flex justify-center w-full">
            <form
              onSubmit={sendMessage}
              className="flex my-10 w-[80%] md:w-[70%] lg:w-[60%]"
            >
              <input
                type="text"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                className="rounded-none rounded-l-lg border block flex-1 min-w-0 w-full text-lg lg:text-xl p-2.5  bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="Say something..."
              />
              <button
                type="submit"
                className="inline-flex cursor-pointer items-center px-3 text-md hover:text-xl duration-300 hover:bg-gray-700 border border-r-0 rounded-r-md bg-gray-600 text-gray-400 border-gray-600"
              >
                {"->"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
