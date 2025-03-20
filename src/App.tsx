import { useState, useEffect } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import Kanban from "./components/Kanban";

const App = () => {
  const { messages } = useWebSocket();
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [contactName, setContactName] = useState<string | null>(null);
  const [contactPic, setContactPic] = useState<string | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);

  // Função para salvar contatos no localStorage
  const saveContactsToLocalStorage = (newContacts: any[]) => {
    localStorage.setItem("contacts", JSON.stringify(newContacts));
  };

  // Função para carregar contatos do localStorage
  const loadContactsFromLocalStorage = () => {
    const savedContacts = localStorage.getItem("contacts");
    if (savedContacts) {
      return JSON.parse(savedContacts);
    }
    return [];
  };

  // Carrega os contatos quando a página é carregada
  useEffect(() => {
    const loadedContacts = loadContactsFromLocalStorage();
    setContacts(loadedContacts);
  }, []);

  // Atualiza a lista de contatos com base nas mensagens recebidas
  useEffect(() => {
    const newContacts = messages.reduce((acc: any[], msg) => {
      // Verifica se a mensagem é de um grupo (verifica se o campo `from` tem '@g.us' - formato de grupo)
      const isGroupMessage = msg.from.includes("@g.us");

      if (isGroupMessage) {
        // Se for de grupo, extraímos as mensagens dos participantes individuais
        const participants = msg.participants || []; 

        participants.forEach((participant: any) => {
          const contactExists = acc.some(contact => contact.from === participant.from);
          if (!contactExists) {
            acc.push({
              from: participant.from,
              name: participant.name || participant.from,
              profilePic: participant.profilePic || "",
              phoneNumber: participant.from.replace(/[^0-9]/g, "")
            });
          }
        });
      } else {
        // Se for uma mensagem de um contato individual, trata como antes
        const contactExists = acc.some(contact => contact.from === msg.from);
        if (!contactExists) {
          acc.push({
            from: msg.from,
            name: msg.name || msg.from, // Usando o nome do contato ou o ID como fallback
            profilePic: msg.profilePic || "", // Imagem do perfil, se houver
            phoneNumber: msg.from.replace(/[^0-9]/g, "") // Extraindo número do 'from' (apenas números)
          });
        }
      }

      return acc;
    }, []);

    // Atualiza a lista de contatos com os novos contatos
    setContacts(prevContacts => {
      const updatedContacts = [
        ...prevContacts,
        ...newContacts.filter(newContact => !prevContacts.some(contact => contact.from === newContact.from))
      ];

      // Salva os contatos no localStorage
      saveContactsToLocalStorage(updatedContacts);

      return updatedContacts;
    });
  }, [messages]);

  const handleContactClick = (contactId: string, name: string, pic: string | null) => {
    setSelectedContact(contactId);
    setContactName(name);
    setContactPic(pic);
  };

  return (
    <div className="flex h-screen bg-gray-200">
      {/* Contatos */}
      <div className="w-1/4 bg-gray-100 p-4 border-r">
        <h2 className="text-xl font-semibold text-black">Contatos</h2>
        <ul className="space-y-2 mt-4 text-black">
          {contacts.map((contact, index) => (
            <li
              key={index}
              className="cursor-pointer p-2 hover:bg-gray-200 rounded flex items-center space-x-3"
              onClick={() => handleContactClick(contact.from, contact.name, contact.profilePic)}
            >
              {contact.profilePic ? (
                <img
                  src={contact.profilePic}
                  alt={contact.name || "Imagem de perfil não disponível"}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
              )}
              <div>
                <h3 className="text-sm font-semibold">{contact.name}</h3>
                <p className="text-xs text-gray-500">{contact.phoneNumber}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Mensagens */}
      <div className="w-1/2 flex flex-col p-4">
        <h2 className="text-xl font-semibold text-black">Conversas</h2>
        <div className="flex flex-col h-full mt-4 bg-white shadow-lg rounded">
          {selectedContact ? (
            <>
              {/* Exibe o nome e a foto do perfil do contato selecionado */}
              <div className="flex items-center space-x-2 p-4 border-b">
                {contactPic ? (
                  <img
                    src={contactPic}
                    alt={contactName || "Imagem de perfil não disponível"}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full" />
                )}
                <h3 className="text-lg font-semibold">{contactName || "Contato sem nome"}</h3>
              </div>
              <div className="flex-grow p-4 bg-gray-50 overflow-y-scroll">
                <ul>
                  {messages.map((msg, index) => (
                    <li key={index} className="p-2 bg-white rounded-md shadow-md max-w-sm text-black">
                      <div className="flex items-center space-x-2">
                        {msg.profilePic ? (
                          <img
                            src={msg.profilePic}
                            alt={msg.name || msg.from || "Imagem de perfil"}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full" />
                        )}
                        <div>
                          <h3 className="text-sm font-semibold">{msg.name || msg.from}</h3>
                          <p>{msg.content}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex p-4 bg-gray-800 rounded-b">
                <input
                  type="text"
                  className="flex-grow p-2 bg-white rounded-l-md"
                  placeholder="Digite uma mensagem..."
                />
                <button className="bg-blue-500 text-white p-2 rounded-r-md">
                  Enviar
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Selecione um contato para iniciar a conversa.
            </div>
          )}
        </div>
      </div>

      {/* Kanban */}
      <Kanban />
    </div>
  );
};

export default App;
